const core = require('@actions/core');
const { Corellium } = require('@corellium/corellium-api');
const fs = require('fs');

async function run() {
  let agent = null;
  try {
    const corellium = new Corellium({
      endpoint: core.getInput('endpoint'),
      username: core.getInput('username'),
      password: core.getInput('password'),
    });

    await corellium.login();

    const projectName = core.getInput('project');
    const project = await corellium.projectNamed(projectName);
    if (project === undefined)
      throw new Error(`Project '${projectName}' not found`);

    const instanceName = core.getInput('instance');
    const instance = (await project.instances()).find(candidate => candidate.name == instanceName);
    if (instance === undefined)
      throw new Error(`Instance '${instanceName}' not found`);

    const snapshotName = core.getInput('snapshot');
    if (snapshotName !== '') {
      const snapshot = (await instance.snapshots()).find(candidate => candidate.name == snapshotName);
      if (snapshot === undefined)
        throw new Error(`Snapshot '${snapshotName}' not found`);
      core.info('[*] Restoring snapshot');
      await snapshot.restore();
    }

    if (instance.state !== 'on') {
      core.info('[*] Starting instance');
      await instance.start();
      await instance.waitForState('on');
    }

    core.info('[*] Starting agent');
    agent = await instance.agent();
    await agent.ready();

    core.info('[*] Uploading');
    const assetPath = await agent.tempFile();
    await agent.upload(assetPath, fs.createReadStream(core.getInput('upload')));

    core.info('[*] Running');
    const result = await agent.shellExec([
      `export ASSET_PATH='${assetPath}'`,
      '(' + core.getInput('run') + ') 2>&1',
      'echo -e "\\n$?"',
      'rm -f "$ASSET_PATH"'
    ].join('; '));

    const lines = result.output.split('\n');
    const n = lines.length;

    const output = lines.slice(0, n - 3).join('\n');
    core.info(output);

    const exitStatus = parseInt(lines[n - 2]);
    if (exitStatus !== 0) {
      core.setFailed(`Command exited with error ${exitStatus}`);
    }
  } catch (error) {
    core.setFailed(error.message);
  } finally {
    if (agent !== null)
      agent.disconnect();
  }
}

run();

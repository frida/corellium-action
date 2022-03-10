import core from '@actions/core';
import crypto from 'crypto';
import fetch, { FormData, fileFrom } from 'node-fetch';
import split from 'split';

async function run() {
  try {
    const marker = crypto.randomBytes(16).toString('hex');

    const form = new FormData();
    form.append('token', core.getInput('token'));
    form.append('asset', await fileFrom(core.getInput('upload')));
    form.append('script', core.getInput('run'));
    form.append('marker', marker);

    const response = await fetch(`https://${core.getInput('gateway')}/devices/${encodeURIComponent(core.getInput('device'))}`, {
      method: 'POST',
      body: form
    });
    if (response.status !== 200) {
      core.setFailed(`Request failed: ${response.statusText}`);
      return;
    }

    let onSuccess = null;
    let onFailure = null;
    const result = new Promise((resolve, reject) => {
      onSuccess = resolve;
      onFailure = reject;
    });

    let exitStatus = null;
    response.body.pipe(split())
      .on('close', () => {
        if (exitStatus === 0)
          onSuccess?.();
        else if (exitStatus !== null)
          onFailure?.(new Error(`Command exited with error: ${exitStatus}`));
        else
          onFailure?.(new Error('Timed out'));
        onSuccess = null;
        onFailure = null;
      })
      .on('data', line => {
        if (line.startsWith(marker)) {
          exitStatus = parseInt(line.substring(marker.length));
          return;
        }

        core.info(line);
      })
      .on('error', e => {
        onSuccess = null;
        onFailure?.(e);
        onFailure = null;
      });

    await result;
  } catch (e) {
    core.setFailed(e.message);
  }
}

run();

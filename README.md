# Corellium Action

This uploads and executes code on a Corellium instance.

# Usage

```yaml
steps:
- uses: frida/corellium-action@v4
- with:
    token: ${{ secrets.GITHUB_TOKEN }}
    gateway: corellium.frida.re
    device: android-arm64
    upload: runner.tar.gz
    run: |
      cd /data/local/tmp
      tar xf $ASSET_PATH
      ./gum-tests
```

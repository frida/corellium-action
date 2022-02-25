# Corellium Action

This uploads and executes code on a Corellium instance.

# Usage

```yaml
steps:
- uses: frida/corellium-action@v2
- with:
    endpoint: ${{ secrets.CORELLIUM_ENDPOINT }}
    username: ${{ secrets.CORELLIUM_USERNAME }}
    password: ${{ secrets.CORELLIUM_PASSWORD }}
    project: Frida
    instance: android-arm64
    upload: runner.tar.gz
    run: |
      cd /data/local/tmp
      tar xf "$ASSET_PATH"
      ./gum-tests
```

# Corellium Action

This uploads and executes code on a Corellium instance.

# Usage

```yaml
steps:
- uses: frida/corellium-action@v1
- with:
    endpoint: ${{ secrets.CORELLIUM_ENDPOINT }}
    username: ${{ secrets.CORELLIUM_USERNAME }}
    password: ${{ secrets.CORELLIUM_PASSWORD }}
    project: Frida
    instance: android-arm64
    upload_source: build/tests/gum-tests
    upload_target: /data/local/tmp/gum-tests
    upload_mode: '0755'
    run: /data/local/tmp/gum-tests
```

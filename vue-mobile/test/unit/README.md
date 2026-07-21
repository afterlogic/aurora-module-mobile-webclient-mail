# Mail mobile unit tests (Vitest)

Tests live next to Mail utils (`vue-mobile/utils/`). They do not duplicate E2E.

```bash
cd modules/MailMobileWebclient/vue-mobile
yarn
yarn test:unit
```

Module pre-commit (when `core.hooksPath=.githooks/`): if staged files are under `vue-mobile/` and `test/unit` exists → `yarn test:unit`.

Full install run: `./dev/run-mobile-unit-tests.sh` from the Aurora root.

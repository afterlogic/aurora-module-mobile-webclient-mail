# Mail mobile unit tests (Vitest)

Tests live next to Mail utils (`vue-mobile/utils/`). They do not duplicate E2E.

```bash
cd modules/MailMobileWebclient/vue-mobile
npm install
npm run test:unit
```

Module pre-commit (when `core.hooksPath=.githooks/`): if staged files are under `vue-mobile/` and `test/unit` exists → `npm run test:unit`.

Full install run: `./dev/run-mobile-unit-tests.sh` from the Aurora root.

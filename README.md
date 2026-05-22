# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Environment for Rent History OTP auth

The post-OTP routes are protected and require a valid session token produced by the auth provider's `verify-otp-token` endpoint. Set these env vars for local development:

- `VITE_AUTH_PROVIDER_BASE_URL` - auth-provider base URL (for example `http://127.0.0.1:8080`)
- `VITE_RH_OAUTH_CLIENT_ID` - OAuth client id used for OTP token exchange
- `VITE_RH_OAUTH_CLIENT_SECRET` - optional secret for confidential clients

## API contract tracking

- Runtime contract endpoint is `GET /rh/schema` from `auth-provider`.
- Canonical committed contract artifact is `auth-provider/rh/openapi/openapi.json`.
- Generated account API types live at `src/api/generated/account-openapi.d.ts` (committed; not gitignored).
- When backend `rh/` API contract changes, export and commit `openapi.json` in auth-provider, then regenerate and commit frontend types:

```bash
# From rent-history, with auth-provider checked out as a sibling directory:
yarn generate:api:account
```

- `yarn generate:api` is an alias for `generate:api:account` (data-api codegen is deferred).
- Input path default: `../auth-provider/rh/openapi/openapi.json` (see `package.json` scripts).
- **CI:** GitHub Actions (`.github/workflows/account-openapi-contract.yml`) checks out private `JustFixNYC/auth-provider` at `codegen` as a sibling repo and fails if `yarn generate:api:account` would change the committed `.d.ts`. This requires an org admin to enable cross-repo Actions access on **auth-provider** (Settings → Actions → General → allow workflows from other repositories in the `JustFixNYC` organization). Fork PRs from outside the org cannot use that access and may fail this job.
- **Netlify / no sibling repo:** Builds use the committed `account-openapi.d.ts`; copy `auth-provider/rh/openapi/openapi.json` locally (or clone auth-provider beside rent-history) before running `yarn generate:api:account` when the contract changes.
- When backend `rh/` API contract changes, update frontend typed client/request handling in the same PR or in a linked PR (hook migrations follow the Tier 1 codegen plan).

## `src/api/` layout

| Path | Role |
|------|------|
| `generated/account-openapi.d.ts` | Committed OpenAPI types (`yarn generate:api:account`) |
| `account/` | Typed openapi-fetch client, imperative `/rh/*` API (`api.ts`), errors, types, TanStack Query hooks (`index.ts` barrel) |
| `data/README.md` | Placeholder for a future read-only data API (not used in v1) |
| `thirdParty/` | Hand-written modules for external hosts (GeoSearch, S3 presign) |

Architecture reference: [frontend-api-architecture.md](https://github.com/JustFixNYC/cursor-workspaces/blob/main/rent-history-analyzer/codegen/docs/frontend-api-architecture.md) in `cursor-workspaces/rent-history-analyzer/codegen/docs/`.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```

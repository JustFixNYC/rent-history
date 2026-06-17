# Data API (not used in rent-history v1)

rent-history does not call a separate read-only **data API** today. All workflow mutations and polling go through the auth-provider **account API** (`/rh/*`) under `src/api/account/`.

When a product adds a data service with OpenAPI:

1. Commit generated types at `src/api/generated/data-openapi.d.ts`.
2. Add `src/api/data/client.ts` with `createDataClient()` (openapi-fetch).
3. Add `yarn generate:api:data` and include it in CI drift checks alongside `generate:api:account`.

See [frontend-api-architecture.md](https://github.com/JustFixNYC/cursor-workspaces/blob/main/rent-history-analyzer/codegen/docs/frontend-api-architecture.md) in `cursor-workspaces/rent-history-analyzer/codegen/docs/`.

---
name: vastriq-fullstack
description: Full-stack feature development guide for the VASTRIQ CLOSET monorepo (NestJS + Prisma/Mongo API, Next.js web, Vite admin). Use whenever adding or changing a feature that touches the backend and/or the web/admin frontends — it encodes the module structure, data-layer pattern, Mantine+Tailwind theme/reusable-components, auth, and the project's known gotchas so new code matches existing conventions.
---

# VASTRIQ CLOSET — Full-Stack Feature Playbook

Monorepo (pnpm + turbo): `apps/api` (NestJS + Prisma + MongoDB), `apps/web` (Next.js **Pages Router** + Mantine 7 + Tailwind + React Query), `apps/admin` (Vite + React + react-router + Mantine). Shared: `packages/theme`, `packages/prettier`.

Product model: **P2P ethnic-wear rental noticeboard.** Single user type (no roles/KYC), phone-OTP auth, no cart/checkout/payments. Admin is email/password and separate.

When building a feature, do it as a vertical slice: **schema → API module → web data-layer → web pages → (admin screen if needed) → type-check → verify.**

---

## Backend — `apps/api` (NestJS + Prisma + MongoDB)

### Module layout (copy this shape)
Each feature is a folder `src/<feature>/` with:
- `<feature>.module.ts` — `@Module({ controllers, providers, exports })`; register it in `src/app.module.ts` `imports`.
- `<feature>.controller.ts` — routes, returns `UtilService.buildResponse({...})`.
- `<feature>.service.ts` — business logic, injects `PrismaService`.
- `<feature>.dto.ts` — Joi schemas + TS interfaces.

### Conventions (do exactly this)
- **Responses:** always `return UtilService.buildResponse({ key: value })` → `{ data, message }`. Frontends read `res.data`.
- **Validation:** Joi schema in the dto, applied with `@UsePipes(new JoiValidationPipe(schema, 'body'|'query'))` (import from `../joi-validation-pipe/joi-validation-pipe.interceptor`). Joi rejects unknown body keys — don't send extras from the client. For emails use `Joi.string().email({ tlds: { allow: false } })` (so `.local`/test domains pass).
- **Auth:** a global `AtGuard` (JWT) protects every route by default. Use `@Public()` to open one. Get the caller with `@GetCurrentUserId()` / `@GetCurrentUser()` (from `auth/decorators`). For admin-only routes add `@UseGuards(AdminGuard)` (from `admin/admin.guard`) + `@ApiBearerAuth()`.
- **Ownership:** for owner-scoped resources, load the record and throw `ForbiddenException` if `record.ownerId !== userId` (see `outfits.service.getOwned`).
- **Prisma:** `PrismaService` is `@Global` — inject it directly (no module import). To make one service depend on another (e.g. read settings in outfits), mark the providing module `@Global` and inject its service.

### ⚠️ MongoDB + Prisma gotchas (these bit us — follow them)
- **Optional fields are *unset*, not `null`.** To query "not yet set" use `{ field: { isSet: false } }`, NOT `{ field: null }` (the latter won't match freshly-created docs). Example: OTP `consumedAt`, soft-delete `deletedAt: { isSet: false }`.
- **Soft-delete middleware** (`prisma.service.ts`) rewrites every `delete`/`deleteMany` into an update that sets `deletedAt`. Models **without** a `deletedAt` column must be added to the exclusion list (currently `['Upload', 'WishlistItem', 'Banner']`) or `delete` will 500. Reads should filter `deletedAt: { isSet: false }`.
- **Unique + null:** `@unique` optional fields (e.g. `User.phone`) reject a second null/unset row — give distinct values or rethink.

### Schema changes
Edit `apps/api/prisma/schema.prisma`, then (the API holds the engine DLL lock, so):
1. Stop the API process. 2. `pnpm --filter api prisma db push` (also regenerates the client). 3. Restart the API.

### Settings that drive behavior
Platform settings are a singleton (`Setting`, key `"global"`), edited from Admin → Settings. Wire flags into logic where relevant (e.g. `autoApproveListings` sets new outfit status ACTIVE vs PENDING in `outfits.service.create`).

---

## Frontend data layer (web + admin share this pattern)

Two files per domain — keep them thin and typed:
- `src/apis/requests/<x>.requests.ts` — typed wrappers over `http`:
  ```ts
  export const fetchThings = () => http.get<ItemsResponse<Thing>>('/things');
  export const createThing = (b: CreatePayload) => http.post<One<{ thing: Thing }>>('/things', b);
  ```
  Response envelope is always `{ data, message }`. File upload: `http.post('/files/upload', formData, { hasFiles: true })` → returns `[{ fileKey, url }]`; build URL as `url || \`${API_URL}/files/${fileKey}\``.
- `src/apis/queries/<x>.queries.ts` — React Query hooks:
  ```ts
  export const useThings = () => useQuery({ queryKey: ['things'], queryFn: async () => (await fetchThings()).data.items });
  export const useCreateThing = () => { const qc = useQueryClient();
    return useMutation({ mutationFn: createThing, onSuccess: () => qc.invalidateQueries({ queryKey: ['things'] }) }); };
  ```

Auth: the `http` client attaches the JWT from the cookie. Cookies are `auth-token` / `auth-refresh-token` (`ACCESS_TOKEN`/`REFRESH_TOKEN` in `utils/constants`). Read the current user with `useMe()` (`/auth/me`); gate UI on it (`HeaderAuth`).

---

## Web — `apps/web` (Next.js Pages Router)

- Pages live in `src/pages` (file = route). Wrap page bodies in `<StoreShell>` (header with auth-aware `HeaderAuth`, footer). Add `<NextSeo title=... />`.
- **Reuse the shared components** in `src/components/shared` before writing new markup: `OutfitCard` (grid item), `OutfitForm` (create/edit listing form — pass `initial`, `existingImageUrls`, `onSubmit`), `OutfitImage` (placeholder art), `BannerHero`, `HeaderAuth`. Layout: `src/components/layouts/StoreShell`.
- New listing grids = mirror `pages/c/[slug].tsx` (uses `useOutfits({ category|occasion|q })` + `OutfitCard`).
- Mantine package styles are imported once in `_app.tsx`. **When you use a new Mantine package** (e.g. `@mantine/dates`), add its `@mantine/<pkg>/styles.css` import there.
- Image preview pattern: `URL.createObjectURL(file)` in a `useEffect`, revoke on cleanup (see `OutfitForm`).

## Admin — `apps/admin` (Vite + react-router)

- Routes in `src/Router.tsx` (under `/dashboard`), pages in `src/pages/dashboard/*`, nav items in `components/layouts/DashboardLayout.tsx`.
- Data layer: `apis/requests/admin.requests.ts` + `apis/queries/admin.queries.ts`.
- Tables via Mantine `Table`; detail/edit via `Drawer`/`Modal`; feedback via `notifications.show(...)`.
- **Admin must run with `VITE_ENABLE_API_MOCKING=false`** (the MSW mock fakes `/auth/login`, so with mocking on the panel never gets a real admin JWT).

---

## Theme — "Royal Emerald & Champagne" (Tailwind tokens)

Use these tokens/utility classes for visual consistency (don't hardcode hexes):
- **Colors:** `primary-900/800/700/...` (deep emerald — buttons, headings, footer), `gold-700/500/300/200/100` (accents, borders, dividers), `cream-25/50/100` (backgrounds/cards), `gray-400/500` (muted text), `red`/`danger` (destructive).
- **Cards:** `rounded-lg border border-gold-200 bg-cream-25 p-6 shadow-sm`.
- **Headings:** `font-serif text-primary-900`; **eyebrow labels:** `vc-wordmark text-xs text-gold-700`; helpers `vc-card-shadow`, `vc-hairline`.
- **Buttons:** Mantine `<Button color="primary" radius="md">` (or `color="gold"` / `variant="outline"`); destructive `color="red"`.
- **Grids:** `grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4`.

---

## Verify before finishing
1. **Type-check** every app you touched: `pnpm --filter api|web|admin check-types` → expect 0 errors.
2. **Backend:** curl the new endpoints (auth/validation/ownership/happy-path). API base `http://localhost:5000`, routes at root (no `/api` prefix).
3. **Frontend:** the pages render and hit the real API (web mocks pass through everything except `userHandlers`).
4. Optional **browser E2E** with Playwright (already installed): drive the flow headless and screenshot. Mantine selector tips: `getByRole('textbox', { name })` for inputs; click `.mantine-Switch-track` (the input is visually hidden); `DatePickerInput` placeholder is text, not an `<input>` placeholder.

## Local environment
- Datastores: Docker Mongo (replica set **`rs0`**, `:27017`) + Redis (`:6379`). `DATABASE_URL="mongodb://127.0.0.1:27017/vastriq?replicaSet=rs0"`.
- Start: `docker start <mongo> <redis>` then `pnpm --filter api dev`, `--filter web dev`, `--filter admin dev` (api `:5000`, web `:3000`, admin `:5173`).
- Dev login: admin `admin@test.local` / `Admin@12345`; consumer = phone + OTP, and the **generated OTP is shown on the login screen** (no SMS sent while `AUTH_DEV_BYPASS_ENABLED=true`). New phone numbers auto-create an account.

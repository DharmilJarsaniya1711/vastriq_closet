# VASTRIQ CLOSET — Implementation Task Breakdown

> Executable task list derived from [PLAN_ETHNIC_RENTAL.md](PLAN_ETHNIC_RENTAL.md). Built for a coding agent to implement task-by-task.
> **Read the plan section in parentheses for full context before doing a task.**

## How to use this doc
- Tasks are grouped by phase and ordered. **Do them top-to-bottom**; later tasks assume earlier ones are done.
- Each task has: **ID · what to do · files/paths · Done-when (acceptance) · Depends-on**.
- `[ ]` = todo, `[x]` = done. Update the box as you go.
- Conventions: every NestJS module = `*.module.ts`, `*.controller.ts`, `*.service.ts`, `*.dto.ts`, `schemas/*.schema.ts`; Joi validation via existing `joi-validation-pipe/`. Web = Next.js **Pages Router** (`apps/web/src/pages`). Admin = Vite React (`apps/admin/src/pages`).
- After each phase, run the **Phase gate** checks at the end of that phase.

## Global Definition of Done (every task)
- TypeScript compiles: `pnpm --filter @mejjos/api check-types` and `pnpm --filter @mejjos/web check-types`.
- Lint passes for touched files.
- No reference to retired commerce/KYC/role/S3/Prisma concepts is reintroduced.
- New endpoints have a DTO + Joi validation + correct auth guard.

## Prerequisites / accounts needed (gather before Phase 0)
- [ ] **ImageKit.io** account → `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_URL_ENDPOINT`.
- [ ] MongoDB running (dev `dev:mongo` memory-server, or Docker) + Redis (`dev:redis`).
- [ ] Confirm open questions (plan §17): WhatsApp fallback (no), real OTP provider (later), review gating, launch city scope, listing cap, enquiry auto-close days, theme. Defaults assumed below where unanswered.

---

# Phase 0 — Refactor & Foundations (plan §14 Phase 0, §4, §3)

Goal: **Prisma kept** (no migration). Commerce/KYC/role code removed from the schema, **ImageKit** in, theme wired, admin shell stubbed. App boots; no rental features yet.

### 0.A — Data layer: keep Prisma, edit the schema
> Decision: **stay on Prisma** (it works with MongoDB). A Mongoose migration was rejected — `util.service.ts` generic validation depends on `Prisma.dmmf` runtime metadata, so migrating is a large, risky rewrite for little benefit. Keep `PrismaService`, `schema.prisma`, the soft-delete middleware, and the seeders. Use `prisma db push` + `prisma generate` after schema edits. (plan §4)
- [ ] **0.1** Run `pnpm --filter @mejjos/api prisma generate` once to confirm the existing Prisma client builds. Keep `@prisma/client` + `prisma` deps. (No `@nestjs/mongoose`.)
- [ ] **0.2** Make schema edits in 0.6–0.9 + 0.12, then `prisma db push` (dev) and `prisma generate`. Done-when: client regenerates with no `Order/Cart/Coupon/Dispute` types and with `Report/Enquiry/Conversation/Message`.
- [ ] **0.3** After schema edits, fix any now-broken `Prisma.ModelName` / generated-type references (notably `util.service.ts` `validateExists`/`validateUnique`, `catalog.service.ts`, `admin.service.ts`). Done-when: `pnpm --filter @mejjos/api check-types` passes.

### 0.B — Remove commerce / KYC / roles
- [ ] **0.6** Delete models/enums: `Order`, `OrderItem`, `CartItem`, `Coupon`, `Dispute`, enums `OrderStatus`, `KycStatus`, `UserRole`. (plan §0 retire, §4.2)
- [ ] **0.7** Strip `User` of `roles`, `kycStatus`, `payoutAccount`, `cart`, `buyerOrders`, `ownerOrders`, KYC/ID fields. Keep `phone`, `phoneVerifiedAt`, `firstName/lastName`, `defaultCity`, `blockedIds`, `blockedByIds`, `banned*`. (plan §4.1)
- [ ] **0.8** Strip `OwnerProfile` to public display profile (drop `totalEarnings`, payout, GST, KYC). (plan §4.1)
- [ ] **0.9** Trim `Outfit`: remove `gender`(+`Gender` enum), `fabric`, `sizes`, `minRentalDays`, `maxRentalDays`, `cartItems`, `orderItems`. Add `viewsCount`, `enquiriesCount`, `availabilityNote?`, `blackoutDates: Date[]`. `color` = single value, `occasionSlugs: string[]`. (plan §4.1, §4.4)
- [ ] **0.10** Remove API modules/stubs: `orders/`, `cart/`, `payments/`, `payouts/`, `coupons/`. Delete boilerplate `book/` module. Done-when: app.module imports compile without them.
- [ ] **0.11** Web: delete `apps/web/src/pages/cart.tsx`, `checkout.tsx`, `checkout/success.tsx` and any cart/checkout components/queries. (plan §6)

### 0.C — Repurpose Dispute → Report
- [ ] **0.12** Repurpose `Dispute`→`Report` in `schema.prisma` per plan §4.2 (`ReportTargetType`, `ReportStatus`, fields); scaffold an empty `reports/` module (module registration only — endpoints built in Phase 4).

### 0.D — Media: S3 → ImageKit
- [ ] **0.13** Add `imagekit` SDK; remove `@aws-sdk/client-s3` and the `aws/` module. (plan §3, §5)
- [ ] **0.14** Create `imagekit/` provider wrapping the SDK (`upload`, `getAuthenticationParameters`). Config from env (3 keys above).
- [ ] **0.15** Add `GET /file/imagekit-auth` (JWT-guarded) → returns `{ token, signature, expire }`. (plan §5, §13)
- [ ] **0.16** Update `file/` upload flow: server-side upload via ImageKit SDK; persist `Upload { fileId, url, filePath, driver: IMAGEKIT }`. Add `IMAGEKIT` to `UploadDriver` (keep `LOCAL`). Remove S3 `previewKey` logic. Done-when: uploading a file returns an ImageKit URL that renders.

### 0.E — Theme + shells
- [ ] **0.17** Wire **Royal Emerald & Champagne** into `packages/theme` (`mantineTheme.ts`: palette + Cormorant/Inter/Cinzel fonts). (plan §15)
- [ ] **0.18** Mirror brand colors in `apps/web/tailwind.config.ts` and `apps/admin/tailwind.config.js`. Load fonts via `next/font/google` in web `_app.tsx`/`_document.tsx`.
- [ ] **0.19** Admin: install `@mantine/charts`; add sidebar nav with stubbed pages for Dashboard, Users, Listings moderation, Reports, Reviews, Catalog master, CMS, Exports, Settings. (plan §7)
- [ ] **0.20** Env/config: add ImageKit keys + dev OTP bypass vars (`AUTH_DEV_BYPASS_ENABLED`, `AUTH_DEV_MASTER_OTP`, `AUTH_DEV_PHONE_ALLOWLIST`) to `.env.example` and config service. (plan §16.2)

**Phase 0 gate:** API boots on Prisma + Redis, `prisma generate` clean, no Mongoose/S3/commerce refs remain, an ImageKit upload works, theme visibly applied on web + admin, admin shell navigable.

---

# Phase 1 — Catalogue & Landing (plan §14 Phase 1, §4.4, §7.7, §6)

Goal: admin-managed catalog (category/color/occasion/city) + public storefront landing & listing grid & PDP (read-only; chat CTAs stubbed).

### 1.A — Catalog backend (`catalog/`)
- [ ] **1.1** Schemas: ensure `Category {name,slug,icon,displayOrder,isActive}`, `Color {name,hex,isActive}`, `Occasion {name,slug,isActive}`, `City {name,slug,state,isServiceable}`. Add `Color` model. (plan §4.4)
- [ ] **1.2** Admin CRUD endpoints (ADMIN guard) for categories/colors/occasions/cities — **create / update / reorder / enable-disable only; NO delete**. (plan §7.7)
- [ ] **1.3** Public read endpoints: `GET /catalog/categories|colors|occasions|cities` return **only active/serviceable** items; cities grouped by `state`. Lookup-by-slug resolves **disabled** items too (for existing listings). (plan §5 disable-not-delete)
- [ ] **1.4** Seeder: seed the 8 categories, color list, occasion list, cities-by-state from plan §4.4 (idempotent). (plan §16.4)

### 1.B — Catalog admin UI (`apps/admin`)
- [ ] **1.5** Catalog master page with 4 sub-tabs (Categories, Colors, Occasions, Cities-by-state); table + create/edit drawer; **enable/disable toggle, no delete button**; Colors show hex swatch; Cities grouped by state. (plan §7.7)

### 1.C — Outfits read API (`outfits/`)
- [ ] **1.6** `Outfit` schema finalized (per 0.9). Public `GET /outfits` with filters: color, occasion, city, price range, category, status=ACTIVE only; pagination + sort. (plan §5, §6.2)
- [ ] **1.7** Public `GET /outfits/:slug` (resolve disabled catalog refs for display); increment `viewsCount`. (plan §5)
- [ ] **1.8** Seed 5 active + 2 pending listings (User A / User C) with ImageKit/`public/seed` images. (plan §16.4)

### 1.D — Storefront pages (`apps/web`)
- [ ] **1.9** Landing `index.tsx`/`home.tsx`: hero carousel (banners), Shop-by-Occasion tiles, Shop-by-Category tiles, city picker + featured listings, **"How it works"** 4-step (Browse → Chat → Arrange → Wear & return), trust strip, "List your outfit" CTA, footer. (plan §6.1)
- [ ] **1.10** Listing grid `c/[slug].tsx` (category) + `occasion/[slug].tsx` with filters (price, color, city, dates). (plan §6.2)
- [ ] **1.11** PDP `outfit/[slug].tsx`: gallery (ImageKit transforms), owner-declared rent/day + deposit with *"set & collected by owner, not the platform"* label, availability note, owner card, reviews placeholder, similar outfits. **Chat/Request-dates CTAs present but stubbed** (wired Phase 3). Wishlist heart, Report (stub), Share. (plan §6.3)
- [ ] **1.12** `search.tsx` global search.
- [ ] **1.13** CMS banners admin CRUD + landing consumes them. (plan §7.8)

**Phase 1 gate:** admin can add/disable a category/color/city and it instantly appears/disappears in web filters and the (Phase-2) listing form selectors; landing + grid + PDP render seeded data; disabled catalog item still renders on an existing listing.

---

# Phase 2 — Listing Creation & Moderation (plan §14 Phase 2, §2.1, §7.4)

Goal: any logged-in user creates/edits/archives listings; admin moderates.

### 2.A — Auth wiring (needed before create)
- [ ] **2.1** Confirm phone-OTP login works end-to-end with dev bypass: `POST /auth/otp/request`, `POST /auth/otp/verify` → JWT; upsert `User` by phone. (plan §8, §16.2)
- [ ] **2.2** Web `login.tsx` + `verify-otp.tsx`: phone entry → OTP `000000` (dev) → store tokens. Auth state in Zustand; protected-route guard. (plan §6.5)

### 2.B — Listing CRUD
- [ ] **2.3** `outfits/` owner endpoints (JWT): `POST /outfits` (status=PENDING), `PATCH /outfits/:id`, `POST /outfits/:id/archive`, `GET /outfits/mine`. Validate category/color/city/occasions against **active** catalog. (plan §5)
- [ ] **2.4** Web `owner/listings/new.tsx`: replace mock form — **Category** `Select` (DB), **Occasions** `MultiSelect` (DB), **Color** `Select` (DB), **Cities** state-grouped `MultiSelect` (DB), title/description, MRP, rent/day, deposit, availability note. **Remove gender/fabric/sizes inputs.** Image/video upload via ImageKit (client-side direct upload using `/file/imagekit-auth`). Success → "Sent for review" with **in-app** wording (not WhatsApp). (plan §2.1, §6.8, §5)
- [ ] **2.5** Web `owner/listings.tsx` (list mine, status badges) + `owner/listings/[id]/edit.tsx`.

### 2.C — Moderation
- [ ] **2.6** Admin endpoints: `GET /outfits?status=PENDING|ACTIVE|REJECTED`, `PATCH /outfits/:id/status {status, reason?}`. On approve→ACTIVE, on reject→REJECTED + reason; notify owner (in-app). (plan §7.4, §11)
- [ ] **2.7** Admin **Listings moderation** page: pending/live/rejected tabs, preview, approve/reject with reason. (plan §7.4)

**Phase 2 gate:** User A creates a listing → PENDING → admin approves → it appears in storefront; rejected shows reason to owner; disabled catalog values are absent from the new-listing selectors.

---

# Phase 3 — Chat + Enquiry (plan §14 Phase 3, §9, §10, §4.3) — the core

Goal: real-time in-app chat + structured enquiries connecting renter and owner.

### 3.A — Schemas
- [ ] **3.1** Add `Enquiry`, `Conversation`, `Message` schemas + indexes per plan §4.3/§13.

### 3.B — Enquiry module
- [ ] **3.2** `enquiries/`: `POST /enquiries {outfitId, fromDate?, toDate?, message?}` → create `Enquiry(OPEN, ownerId)` + find-or-create `Conversation` + seed first `Message`; notify owner. `GET /enquiries/mine?role=requester|owner`; `PATCH /enquiries/:id/status`. (plan §9, §5)

### 3.C — Chat module (gateway + REST)
- [ ] **3.3** `chat/` WebSocket gateway, namespace `/chat`; JWT verified in `handleConnection`; room per `conversationId`; auto-join user's conversations. (plan §10)
- [ ] **3.4** Events: `message:send`→persist `Message`, update `Conversation.lastMessage/At` + per-user `unread`, emit `message:new`; `typing`, `read`, `presence`. (plan §10)
- [ ] **3.5** REST: `POST /chat/conversations {outfitId, ownerId}` (find-or-create), `GET /chat/conversations`, `GET /chat/conversations/:id/messages?cursor=`, `POST /chat/conversations/:id/read`. (plan §10)
- [ ] **3.6** **Block/ban enforcement** server-side: reject send if sender blocked by recipient or either banned (gateway + REST). (plan §10, §12)
- [ ] **3.7** `socket.io-redis-adapter` over Redis; message rate-limit (`@nestjs/throttler`). (plan §10)
- [ ] **3.8** Chat image attachments via ImageKit `file/` upload. (plan §10)

### 3.D — Web chat UI
- [ ] **3.9** `chat/index.tsx` inbox: conversation list + unread badges. `chat/[conversationId].tsx`: real-time thread (message list + composer), attachments, typing/read indicators, block/report in header. `socket.io-client` in Zustand; optimistic send; React Query for history. (plan §6.6, §10)
- [ ] **3.10** Wire PDP CTAs (un-stub): **"Chat with owner"** → create conversation → open thread; **"Request dates"** → enquiry form (date range + message) → creates enquiry + opens chat. (plan §6.3, §9)
- [ ] **3.11** `owner/enquiries.tsx`: received-enquiries inbox (OPEN/RESPONDED/CLOSED) → jump to chat. (plan §6.9)
- [ ] **3.12** In-app notifications for new enquiry + new message (offline recipient). Header unread badge. (plan §11)
- [ ] **3.13** (Optional) cron to auto-close idle OPEN enquiries after N days (confirm N — plan §17 Q6).

**Phase 3 gate:** plan §16.5 flow works: User B sends enquiry/chat on User A's listing → User A replies in real time → enquiry status moves OPEN→RESPONDED → block prevents messaging.

---

# Phase 4 — Trust Layer (plan §14 Phase 4, §12)

Goal: reviews, reports, block, and safety pages.

- [ ] **4.1** `reviews/`: `POST /reviews` gated on **prior conversation** with that owner about that outfit (default gate — confirm plan §17 Q3); `GET /reviews?outfitId|ownerId`; admin moderation (`approvedAt`). Surface on PDP + owner card. (plan §4.1, §6.3)
- [ ] **4.2** `reports/` endpoints: `POST /reports {targetType, targetId, reason, details?, evidence[]}`; admin `GET /reports?status=`, `PATCH /reports/:id` (warn/remove-listing/ban). (plan §5, §7.5)
- [ ] **4.3** Block/unblock endpoints + UI (uses `User.blockedIds/blockedByIds`); enforced in chat (already 3.6). (plan §12)
- [ ] **4.4** Admin **Reports queue** + **Reviews moderation** pages; a flagged conversation is viewable to admin **only** when a Report references it (logged access). (plan §7.5, §7.6, §12)
- [ ] **4.5** Web safety: `/legal/safety`, `/legal/terms`, `/legal/privacy`; safety strip/copy on PDP + chat ("never pay in advance…"). (plan §6.10, §12)
- [ ] **4.6** Notifications: reported/action-taken (in-app + email), report filed (admin). (plan §11)

**Phase 4 gate:** a renter who chatted can review; reports reach the admin queue and actions (remove/ban) work; safety copy visible.

---

# Phase 5 — Admin Analytics & Polish (plan §14 Phase 5, §7.2)

- [ ] **5.1** Aggregation endpoints (Mongo pipelines): listings created over time, listings by status, top categories/cities, enquiries vs responses, signups, owner response-rate, open reports. **No GMV.** (plan §7.2)
- [ ] **5.2** Admin Dashboard with `@mantine/charts` (line/donut/bar/stacked/area) + KPI cards. (plan §7.2)
- [ ] **5.3** Admin Users page: filters (banned, city, has-listings, signup date), profile drawer (listings/enquiries/reports), CSV export. (plan §7.3)
- [ ] **5.4** Exports (CSV: listings, users, enquiries) + Settings (OTP template, moderation rules, featured-city). (plan §7.9, §7.10)

**Phase 5 gate:** dashboard shows real seeded metrics; no financial/GMV anywhere.

---

# Phase 6 — Hardening (plan §14 Phase 6)

- [ ] **6.1** E2E happy path: list → moderate → discover → enquiry/chat → review.
- [ ] **6.2** Chat load/concurrency + socket reconnection test; multi-instance via Redis adapter.
- [ ] **6.3** Lighthouse + SEO pass on landing/PDP (`next-seo`).
- [ ] **6.4** Index audit (plan §13); rate-limit audit (OTP, messages, listing creation).
- [ ] **6.5** Production build: ImageKit prod keys, Mongo, Redis; deploy + basic monitoring/logging.

---

## Cross-cutting checklist (verify at the end)
- [ ] No `@nestjs/mongoose`/`mongoose`, `@aws-sdk`, `Order/Cart/Payment/Payout/Coupon`, `KycStatus`, `UserRole`, `gender/fabric/sizes` anywhere in `apps/`. (Prisma is kept.)
- [ ] Single user type; any logged-in user can list and rent; admin separate (email/password).
- [ ] Catalog is admin-managed; **disable-not-delete** honored; disabled items still resolve on existing listings.
- [ ] All media on ImageKit; private key server-side only.
- [ ] Chat enforces block/ban; admin reads conversations only via a Report.
- [ ] Dev OTP bypass works and is env-gated with a loud startup warning.

## Open items to confirm before/within relevant phase (plan §17)
- [ ] Exact cities per state (Phase 1 seeder).
- [ ] "Sider Choli" spelling (Phase 1).
- [ ] Review gating strictness (Phase 4).
- [ ] Enquiry auto-close days (Phase 3.13).
- [ ] Launch city scope; per-user listing cap (anti-spam).

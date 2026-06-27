# VASTRIQ CLOSET — Peer-to-Peer Ethnic Wear Rental Marketplace — Implementation Plan

> Brand: **VASTRIQ CLOSET**
> Reference (functional model only, NOT visual): https://anokhireet.in/ — *"Rent & List Traditional Indian Outfits."*
> Monorepo apps reused: [apps/api](apps/api) (NestJS + **Prisma** + MongoDB), [apps/web](apps/web) (**Next.js 14 — Pages Router**, Mantine + Tailwind), [apps/admin](apps/admin) (Vite + React + Mantine).

---

## 0. What changed in this revision (the pivot)

This plan supersedes the earlier transactional-marketplace draft. The product is now a **pure peer-to-peer (P2P) listing + connection platform**. The platform is a **classifieds-style noticeboard for ethnic wear**, not a shop.

**The platform does NOT handle any transaction.** No cart, no checkout, no payment gateway, no security-deposit handling, no delivery/courier, no payouts, no commission, no order lifecycle. We only:
1. Let any user **list** an outfit for rent.
2. Let any user **discover** outfits (browse / search / filter).
3. **Connect** a renter directly to the owner via **in-app real-time chat** to discuss availability, price, deposit, pickup, and to arrange everything between themselves, off-platform.

All money, deposits, hand-over, and returns are arranged **directly between the two users**. We are the introduction layer only — like OLX/Facebook Marketplace, scoped to ethnic-wear rental.

### Decisions locked (2026-06-20)
- **Model:** P2P. The platform never books, charges, or holds anything.
- **Connection mechanism:** **In-app real-time chat** (we build it — Socket.io/WebSocket). A WhatsApp/phone fallback is *out of scope* for v1 but noted in §17.
- **Enquiry tracking:** A **light "Enquiry" record** is created when a renter opens a chat about an outfit (outfit, requester, desired dates, status). It gives owners a structured inbox and us analytics — but the platform never confirms, holds, or guarantees anything.
- **Reviews:** **Kept and moderated** — critical trust signal in a no-escrow P2P model.
- **One user type, no roles.** There is a single consumer account. The *same* user can list their own outfits **and** rent other people's — "owner" and "renter" are just what a user is doing at a given moment, never separate account types or role flags (see §2). The `UserRole` enum and `roles` field are removed entirely.
- **No KYC, ever.** No ID upload, no document review, no verification queue, no "verified" badge. Trust comes from phone-verified login + reviews + moderation + reporting only (§12).
- **Auth = mobile number only.** Login/signup is **phone + OTP** and nothing else. No email/password for consumers, no social login, no KYC step. Uses the existing `otp/` module with the dev-bypass (§16) for testing; no real WhatsApp/SMS provider wired in this phase. (Admin keeps its own email/password login, separate.)
- **Data layer:** **Prisma** (already wired in the API, MongoDB connector). Kept as-is — a Mongoose migration was considered but rejected: the codebase's generic validation is built on Prisma's runtime metadata (`Prisma.dmmf`), so migrating would be a large, risky rewrite for little benefit. Prisma supports MongoDB (incl. our chat/embedded models) fine.
- **Redis: used in v1.** It's already wired into the API, so we keep it from day one — **Bull queues** (notifications, file processing, OTP send), the **cache** layer, and the **`socket.io-redis-adapter`** for chat (so the realtime backend is multi-instance-ready out of the box).
- **Theme:** Royal Emerald & Champagne (§15) — unchanged.

### Old-plan modules/models to RETIRE (commerce layer)
The current `schema.prisma` and API already contain the old transactional design. These are **deprecated** and must be removed or left dormant:
- **Models:** `Order`, `OrderItem`, `CartItem`, `Coupon`. Payment/Payout/delivery fields on any model.
- **Enums:** `OrderStatus`, **`KycStatus`** (KYC removed entirely), **`UserRole`** (no buyer/owner split).
- **User fields:** `payoutAccount`, `buyerOrders`, `ownerOrders`, `cart`, `roles`, `kycStatus`, and any KYC/ID-proof fields — all dropped. One user type; everyone can both list and rent (see §4.1).
- **API modules:** any `orders/`, `cart/`, `payments/`, `payouts/`, `coupons/` work. The boilerplate `book/` module (generic sample CRUD) is unrelated to rentals and can be left or deleted.
- **`Dispute`** model is **repurposed** into a lighter **`Report`** (trust & safety flag) — see §4.2.

### NEW capabilities this revision adds
- **In-app chat:** `Conversation` + `Message` models, a NestJS WebSocket gateway, an inbox UI on web.
- **Enquiry:** `Enquiry` model — structured "someone wants to rent this for these dates" request that seeds a conversation.
- **Trust & Safety:** `Report`, block/unblock (the `blockedIds`/`blockedByIds` arrays already exist on `User`), listing moderation, and prominent "transact at your own risk / never pay before you receive" safety messaging (§12).

---

## 1. Product Vision

A two-sided **noticeboard** where anyone can **list** ethnic-wear outfits (lehenga, choli, sherwani, sarees, jewellery, etc.) they own, and anyone can **browse** and **directly chat** with the owner to arrange a rental for an occasion. The platform's only job is **discovery + a safe, real-time chat channel**. Everything transactional happens between the two people.

### Functional cues taken from anokhireet.in
- Two-way: every user can both **Rent** and **List**.
- City-scoped discovery ("Available in: Ahmedabad, Surat, …").
- Category-rich catalogue — women's wear in v1 (Bridal Lehenga, Indo Western, Sider Choli, Pre Wedding Special, Navratri Special, Party Wear, Traditional Wear, Saree). See §4.4.
- Owner-declared rent/day and (informational) security deposit shown on the listing — **the platform does not collect either**.
- A **Contact / Chat with owner** action as the primary CTA on every listing (replaces "Add to cart / Buy").

> Note: anokhireet.in is a client-rendered SPA, so its page body could not be machine-crawled. The functional model above is derived from its own page title and your description; if specific flows need to match it exactly, share screenshots and we'll align.

---

## 2. Personas & Capabilities

There is **one user account type** for consumers. A user is a "Lister" or "Renter" only by *what they're doing at the moment*, not by account type. Admin is separate.

### 2.1 Any User (Renter + Lister, same account)
**As a renter:**
- Sign up / log in via mobile + OTP.
- Browse landing, categories, occasions, search, filter (color, occasion, city, price, dates).
- View listing detail (gallery, owner-declared rent/day & deposit, availability notes, owner card, reviews).
- Add to wishlist.
- **Start a chat / send an enquiry** with the owner (optionally attaching desired dates) — this is the core action.
- Chat in real time, negotiate, arrange pickup/return privately.
- After renting, **rate & review** the outfit and the owner.
- **Report** a listing or user; **block** a user.

**As a lister:**
- From the same account, open **"List an outfit."** No separate onboarding gate, no role switch, no KYC — a logged-in (phone-verified) user can list immediately.
- Create / edit / archive listings: title, description, images, video, **category** (single, §4.4), **occasion(s)** (multi-select, §4.4), **color** (single, §4.4), MRP (optional), **rent/day**, **security deposit (informational)**, **available cities** (state-wise, §4.4), availability notes / blackout dates (free-form, owner-managed). *No gender / fabric / sizes in v1.*
- Receive **enquiries** in a structured inbox; reply via chat.
- See listing views, enquiry count, wishlist count, and their reviews.

### 2.2 Admin (separate, email + password — existing flow)
- Dashboard: platform-health metrics — **not** GMV (there are no transactions). See §7.
- User management: search, ban/unban, view a user's listings/enquiries/reports.
- **Listing moderation:** approve / reject listings before they go live (quality + safety).
- **Reports queue:** review reported listings/users, take action (warn, remove listing, ban).
- **Chat oversight (light):** view flagged conversations only (not blanket surveillance) — see §12 privacy note.
- Master data: categories, occasions, cities (state-wise), colors, banner/landing CMS.
- Reports & charts: listings created, active listings, enquiries, chats started, signups, top categories/cities, response-rate of owners.

---

## 3. Tech Stack (actual, as in repo)

| Layer | Choice | Notes |
|---|---|---|
| API | NestJS + **Prisma** + MongoDB | [apps/api](apps/api). Existing modules: `auth`, `otp`, `catalog`, `notification`, `file`, `email`, `admin` (+ boilerplate `book`). Prisma kept (§4). |
| Auth | JWT (existing) + phone OTP (`otp/`) | Dev-bypass for testing (§16). |
| **Realtime chat** | **`@nestjs/websockets` + Socket.io** | NEW. Plus REST fallback for history. **`socket.io-redis-adapter` from v1** (Redis already present) → multi-instance-ready. |
| Storefront | **Next.js 14 — Pages Router** (`src/pages`) + Mantine 7 + Tailwind | [apps/web](apps/web). Pages already scaffolded: `home`, `login`, `c/[slug]`, `outfit/[slug]`, `owner/*`. SEO via `next-seo` (installed). |
| Admin panel | Vite + React + Mantine + react-router | [apps/admin](apps/admin). Add charts. |
| State | Zustand + React Query | Already in both FE apps. |
| File storage + media | **ImageKit.io** (`imagekit` Node SDK) | **Replaces AWS S3.** Media storage + CDN + on-the-fly image/video transforms (resize, crop, format, quality) via URL params. Removes `@aws-sdk/client-s3` and the `aws/` module. `Upload` model stores ImageKit `fileId` + `url`. |
| Queues | Bull + Redis | OTP, notifications, chat fan-out / presence. |
| Charts (Admin) | `@mantine/charts` (preferred) or `recharts` | Add. |
| ~~Payments~~ | **Removed** | No gateway. |
| ~~Delivery/Payouts~~ | **Removed** | P2P, off-platform. |

> The earlier plan said "App Router"; the repo is actually **Pages Router** under [apps/web/src/pages](apps/web/src/pages). All web page paths below use the Pages Router convention.

---

## 4. Data Model (Prisma — [apps/api/prisma/schema.prisma](apps/api/prisma/schema.prisma))

> **Data layer = Prisma (kept).** All models live in `schema.prisma` and are accessed via the existing `PrismaService`. Phase 0 **edits** the schema (remove commerce/KYC/role models + fields, repurpose `Dispute`→`Report`, add `Enquiry`/`Conversation`/`Message`) and runs `prisma db push` + `prisma generate`. The snippets below are Prisma model definitions to add/change. Mongo `ObjectId` ids use `@db.ObjectId`; relations use `@relation`; the soft-delete middleware in `prisma.service.ts` stays.

### 4.1 Keep / simplify (existing models)
- **`User`** — keep, but it becomes a single flat account type. Login is **phone only**. Keep `phone`, `phoneVerifiedAt`, `firstName`/`lastName` (display), `defaultCity`, `wishlist`, `listings`, `reviewsAuthored`, `banned*`, `blockedIds`, `blockedByIds`. **Remove:** `roles`, `kycStatus`, `payoutAccount`, `cart`, `buyerOrders`, `ownerOrders`, and any KYC/ID fields. Add chat relations (below). No `isVerified`/KYC badge — phone-verification is implicit for every account.
- **`OwnerProfile`** — keep only as an optional **public display profile** for any user who lists (display name, bio, default city, computed rating, response rate). It is *not* a separate role/account — it's just the public face of a normal user when viewing their listings. Drop `totalEarnings`, payout, GST, and any KYC fields.
- **`Category`, `Occasion`, `City`** — keep as the catalog backbone, but seed them from the **fixed reference lists in §4.4**. `City` gains a `state` field (cities are grouped by state). `Category` is a fixed curated list (admin-managed). `Occasion` stays optional/free for now.
- **`Outfit`** — keep, but **remove `gender`, `fabric`, `sizes`** (and the `Gender` enum) — v1 is **women's outfits only**; other genders return later. `color` becomes a value picked from the fixed **color list (§4.4)**, not free text. `categoryId` points at one of the fixed categories (§4.4); `citySlugs[]` reference the state-wise city list (§4.4). `rentPerDay` and `securityDeposit` remain but are **owner-declared / informational only**. `status (DRAFT|PENDING|ACTIVE|REJECTED|ARCHIVED)` stays (moderation). Drop `minRentalDays`/`maxRentalDays` and the `cartItems`/`orderItems` relations (commerce leftovers). Add `viewsCount`, `enquiriesCount`. Availability becomes free-form `availabilityNote String?` + `blackoutDates DateTime[]` (no system-enforced holds).
- **`WishlistItem`** — keep.
- **`Review`** — keep; gate creation on "had at least one conversation with this owner about this outfit" instead of "delivered order." Admin-moderated (`approvedAt`).
- **`Banner`** — keep (landing CMS).
- **`Upload`** — keep, but reorient to **ImageKit**: store `fileId`, `url`, `filePath` (and `thumbnailUrl` if cached); `driver` becomes `IMAGEKIT` (or `LOCAL` in dev). Drop the S3 `previewKey` workflow — transforms are URL-based.
- **`Notification`, `OtpRequest`, `DeleteAccountLog`** — keep.

### 4.2 RETIRE / repurpose
- **Remove:** `Order`, `OrderItem`, `CartItem`, `Coupon`, and enums `OrderStatus`, `KycStatus`, `UserRole`.
- **Repurpose `Dispute` → `Report`** (Prisma):
  ```prisma
  enum ReportTargetType { LISTING USER MESSAGE }
  enum ReportStatus { OPEN REVIEWING ACTIONED DISMISSED }

  model Report {
    id           String           @id @default(auto()) @map("_id") @db.ObjectId
    targetType   ReportTargetType
    targetId     String           @db.ObjectId      // listing/user/message id
    reporterId   String           @db.ObjectId
    reason       String
    details      String?
    evidence     Upload[]
    status       ReportStatus     @default(OPEN)
    handledById  String?          @db.ObjectId
    resolution   String?
    createdAt    DateTime         @default(now())
    resolvedAt   DateTime?
  }
  ```

### 4.3 NEW models — Chat + Enquiry (Prisma)
```prisma
enum EnquiryStatus { OPEN RESPONDED CLOSED }

// A renter's structured request about a listing. Seeds a conversation.
model Enquiry {
  id             String        @id @default(auto()) @map("_id") @db.ObjectId
  outfitId       String        @db.ObjectId
  outfit         Outfit        @relation(fields: [outfitId], references: [id])
  requesterId    String        @db.ObjectId          // the renter
  ownerId        String        @db.ObjectId          // listing owner (denormalized)
  fromDate       DateTime?                            // desired rental window (optional)
  toDate         DateTime?
  message        String?
  status         EnquiryStatus @default(OPEN)
  conversationId String?       @db.ObjectId
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  @@index([ownerId, status])
}

// 1:1 thread between two users, optionally anchored to an outfit.
model Conversation {
  id             String     @id @default(auto()) @map("_id") @db.ObjectId
  participantIds String[]   @db.ObjectId             // exactly two
  outfitId       String?    @db.ObjectId             // context listing
  enquiryId      String?    @db.ObjectId
  lastMessage    String?
  lastMessageAt  DateTime?
  unread         Json?                               // per-user unread counts, keyed by userId
  messages       Message[]
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt

  @@index([participantIds])
  @@index([lastMessageAt])
}

model Message {
  id             String       @id @default(auto()) @map("_id") @db.ObjectId
  conversationId String       @db.ObjectId
  conversation   Conversation @relation(fields: [conversationId], references: [id])
  senderId       String       @db.ObjectId
  body           String
  attachments    Upload[]
  readAt         DateTime?
  createdAt      DateTime     @default(now())

  @@index([conversationId, createdAt])
}
```
Add the matching `@@index` entries on `Outfit` (`[status, categoryId]` already exists) and the indexes above (§13).

### 4.4 Catalog reference data (fixed lists)

These drive the dropdowns on the listing form and the catalogue filters. They are **seeded as defaults but fully managed from the Admin → Catalog master screen (§7.7)** — categories, colors, occasions, and cities are all add/edit/enable-disable-able from admin, not hardcoded in the app. A `Color` model is added alongside `Category`/`Occasion`/`City`.

**Categories (8, women's wear — v1):**
`Bridal Lehenga`, `Indo Western`, `Sider Choli`, `Pre Wedding Special`, `Navratri Special`, `Party Wear`, `Traditional Wear`, `Saree`.

**Gender:** fixed to **Women** for v1 (no gender field/selector). Men's/Kids/Unisex return in a later phase.

**Colors (curated common list — single-select on the form, used for filtering):**
`Red`, `Maroon`, `Pink`, `Rani Pink`, `Peach`, `Orange`, `Yellow`, `Green`, `Emerald`, `Teal`, `Blue`, `Navy`, `Purple`, `Wine`, `Black`, `White`, `Off-White / Cream`, `Grey`, `Gold`, `Silver`, `Beige`, `Multicolor`.
*(Adjust freely — this is a starting set.)*

**Occasions (multi-select on the form — an outfit can suit several):** maps to `Outfit.occasionSlugs[]`. Curated list:
`Wedding`, `Reception`, `Engagement`, `Pre-Wedding Shoot`, `Sangeet`, `Mehendi`, `Haldi`, `Navratri / Garba`, `Festival (Diwali etc.)`, `Party / Cocktail`, `Religious / Pooja`, `Baby Shower (Godh Bharai)`, `Anniversary`, `Birthday`, `Casual / Day Event`.
*(Adjust freely — this is a starting set; admin-managed like the rest.)*

**Cities (grouped by state — 3 states):** `City` model carries `{ name, slug, state, isServiceable }`; the picker shows them grouped by state.
| State | Cities (proposed) |
|---|---|
| Gujarat | Ahmedabad, Surat, Vadodara, Rajkot |
| Maharashtra | Mumbai, Pune, Nagpur |
| Rajasthan | Jaipur, Udaipur, Jodhpur |
*(City list is a proposal — tell me the exact cities per state and I'll lock them into the seeder.)*

---

## 5. API Modules (NestJS, under [apps/api/src](apps/api/src))

**Keep / extend:** `auth/`, `otp/`, `catalog/` (admin CRUD + public read for **categories, colors, occasions, cities/states** — §7.7), `file/` (**ImageKit uploads** — see below), `notification/`, `email/`, `admin/`.
  - **Media via ImageKit.io (replaces S3):** retire the `aws/` module. Add an `imagekit/` provider wrapping the `imagekit` SDK. Two flows: **(a) client-side direct upload** (preferred for listing images/video) — `GET /file/imagekit-auth` returns `{ token, signature, expire }` from the private key, the browser uploads straight to ImageKit with the public key, then posts the returned `fileId`/`url` to our API to persist an `Upload`; **(b) server-side upload** (multipart → our API → ImageKit SDK) for smaller files. **No self-generated thumbnails** — request sizes on the fly via URL transforms (e.g. `?tr=w-400,h-500,q-80`). `UploadDriver` gains `IMAGEKIT` (keep `LOCAL` for dev).
  - **Disable, not delete:** catalog items are toggled via `isActive`/`isServiceable`, never removed. The **public "list for selectors/filters" endpoints return only active items**; **lookups by id/slug still resolve disabled items** so existing outfits referencing a disabled category/occasion/color/city render normally. No admin delete endpoint for catalog items.

**Build new:**
1. `outfits/` — owner CRUD; public list/search/filter; admin moderation (approve/reject); view-count increment.
2. `enquiries/` — create enquiry (renter), list my enquiries (as requester / as owner), update status. Creates/links a `Conversation`.
3. `chat/` — **WebSocket gateway** (`@WebSocketGateway`) for real-time send/receive, typing, read receipts, presence; **REST** endpoints for conversation list, message history (paginated), mark-read. Auth via JWT on the socket handshake. Block-list enforced server-side (a blocked user cannot message).
4. `reviews/` — create (gated on prior conversation), list per outfit/owner, admin moderation.
5. `reports/` — file a report (listing/user/message), admin queue + actions.
6. `wishlist/` — add/remove/list.
7. `cms/` — banners + landing sections.

**Retire:** `orders/`, `cart/`, `payments/`, `payouts/`, `coupons/` (never build / remove stubs). The boilerplate `book/` module is unrelated and may be deleted.

Each module follows the repo convention: `*.controller.ts`, `*.service.ts`, `*.module.ts`, `*.dto.ts`, Joi validation pipe (`joi-validation-pipe/` already exists).

---

## 6. Web Storefront — Pages ([apps/web/src/pages](apps/web/src/pages), Pages Router)

> Existing files to reuse/adapt: `home.tsx`/`index.tsx`, `login.tsx`, `c/[slug].tsx`, `outfit/[slug].tsx`, `owner/*`. **Delete** `cart.tsx`, `checkout.tsx`, `checkout/success.tsx` (commerce).

1. `index.tsx` / `home.tsx` — **Landing**
   - Hero carousel (CMS banners).
   - "Shop by Occasion" tiles (Bridal, Sangeet, Haldi, Mehendi, Reception).
   - "Shop by Category" (Bridal Lehenga, Indo Western, Sider Choli, Pre Wedding Special, Navratri Special, Party Wear, Traditional Wear, Saree — §4.4).
   - City picker + featured listings in selected city.
   - **"How it works"** 4-step strip: **Browse → Chat with owner → Arrange privately → Wear & return.**
   - Trust strip: *"Deal directly with owners. Never pay before you verify — see our safety tips."*
   - Testimonials, "List your outfit" CTA, footer.
2. `c/[slug].tsx` (category) + `occasion/[slug].tsx` — listing grid with filters (price, color, city, dates).
3. `outfit/[slug].tsx` — **PDP**: gallery, owner-declared rent/day + deposit (clearly labelled *"set & collected by owner, not the platform"*), availability note, owner card (rating, response rate), reviews, similar outfits.
   - **Primary CTA: "Chat with owner"** → opens chat (creates `Conversation`).
   - **Secondary CTA: "Request dates"** → enquiry form (date range + message) → creates `Enquiry` + seeds chat.
   - Wishlist heart, **Report listing**, Share.
4. `search.tsx` — global search.
5. `login.tsx` + `verify-otp.tsx` — phone OTP.
6. **`chat/index.tsx` (inbox)** and **`chat/[conversationId].tsx`** — NEW. Conversation list with unread badges; thread view with real-time messages, image attachments, typing/read indicators; block/report from thread header.
7. `account/index.tsx` — profile (display name, phone, default city), my reviews, **my enquiries (sent)**, blocked users.
8. `owner/listings.tsx`, `owner/listings/new.tsx`, `owner/listings/[id]/edit.tsx` — manage listings.
9. `owner/enquiries.tsx` — NEW. Structured inbox of received enquiries (status: open/responded/closed) → jump to chat.
10. `legal/terms.tsx`, `legal/privacy.tsx`, `legal/safety.tsx` (P2P safety guidelines).

Components: Mantine + Tailwind; `@mantine/dates` for date range; `@mantine/carousel` for galleries; a small chat UI (message list + composer) using the Socket.io client.

---

## 7. Admin Panel — Pages ([apps/admin/src/pages](apps/admin/src/pages))

> **Removed from the old admin (commerce layer):** no **Payments/Stripe/Razorpay** screen, no **Payouts/owner-ledger**, no **Coupons**, no **Order operations / refunds / force-status**, no **GMV/revenue** metrics, and no commerce **Disputes** (replaced by the lighter **Reports** queue). The platform handles no money, so none of these exist. Admin is purely **moderation + catalog + analytics**.

1. **Login** (email/password — existing).
2. **Dashboard** — platform-health KPIs (no GMV): total/active listings, listings pending moderation, signups (line), enquiries created, conversations started, messages/day, owner **response rate**, open reports. Charts:
   - Listings created over time (line).
   - Listings by status (donut).
   - Top 10 categories / top cities (bar).
   - Enquiries vs responses (stacked).
   - New signups (area).
3. **Users** — table (filters: banned, city, has-listings, signup date), drawer with profile + listings + enquiries + reports. CSV export.
4. **Listings moderation** — pending / live / rejected tabs; preview; approve / reject with reason.
5. **Reports queue** — reported listings/users/messages; evidence; actions (warn / remove listing / ban). View a flagged conversation only when a report references it.
6. **Reviews moderation** — approve / hide.
7. **Catalog master** — the admin **owns the reference lists (§4.4)**; these are not hardcoded in the app. The listing-form dropdowns and catalogue filters read whatever the admin configures here.

   **Disable, never delete (important rule for the whole catalog):** admin **cannot hard-delete** a category, color, or city — only **enable / disable** it (a soft `isActive` / `isServiceable` toggle). Effect of disabling:
   - It **disappears from the dropdowns** when a user **adds a *new* outfit**, and from the catalogue **filters**.
   - **Existing outfits already using it are left completely unchanged** — they keep that category/color/city, stay visible, and are still searchable directly. No retroactive edits, no cascade.
   - Re-enabling brings it back into the selectors. (No destructive action means no orphaned listings.)

   Four sub-tabs (each a table + create/edit drawer; changes go live immediately, cache-busted):
   - **Categories** — add / rename / reorder / **enable-disable**. Fields: `name`, `slug` (auto), `icon`, `displayOrder`, `isActive`. Seeded with the 8 women's categories (§4.4); admin can add more (and future gender categories) without a code change.
   - **Colors** — add / rename / **enable-disable**, each with `name` + `hex` swatch + `isActive`. Drives the single-select color picker on the listing form and the color filter.
   - **Cities (state-wise)** — grouped by **State** (Gujarat / Maharashtra / Rajasthan, extensible). Add a state, add cities under it. Fields: `name`, `slug`, `state`, `isServiceable`. Disabling (`isServiceable = false`) drops the city from the new-listing picker and filters; existing listings in that city are untouched.
   - **Occasions** — add / rename / **enable-disable**. Fields: `name`, `slug` (auto), `isActive`. Seeded from the §4.4 list. Shown as the **multi-select occasion picker** on the listing form and as an occasion filter/landing tiles on web. Same disable rule: disabling hides it from new-listing selection and filters; existing outfits tagged with it are untouched.
8. **CMS** — banners + landing sections (drag-to-reorder).
9. **Reports/Exports** — CSVs (listings, users, enquiries). *(No financial/GMV exports — there are none.)*
10. **Settings** — OTP template, moderation rules, featured-city config. *(No commission %, delivery, or payout settings — removed.)*

Charts: `@mantine/charts` (visual consistency) or `recharts`.

---

## 8. Authentication Flow (phone OTP)

```
Client → POST /auth/otp/request { phone, intent: 'LOGIN' | 'SIGNUP' }
   ↳ API generates 6-digit OTP, hashes (argon2), stores OtpRequest (TTL 5 min, max 3/hour/phone).
   ↳ (Phase 1: dev-bypass / logged; real WhatsApp/SMS provider deferred — §17.)
Client → POST /auth/otp/verify { phone, code }
   ↳ Validate (or accept dev master OTP, §16.2). Upsert User by phone.
   ↳ Issue access JWT (15 min) + refresh JWT (30 days).
Socket handshake passes the access JWT → chat gateway authenticates the connection.
```
No "owner upgrade" step — any logged-in user can immediately list. Admin keeps the existing email/password flow (separate controller).

---

## 9. The Connection Flow (replaces booking/checkout)

This is the heart of the P2P model — there is **no order, no payment, no platform-held state**.

```
Renter on PDP
  ├─ "Chat with owner"  → POST /chat/conversations { outfitId, ownerId }
  │      ↳ find-or-create Conversation(participants=[renter,owner], outfitId)
  │      ↳ open chat/[id]; messages flow over Socket.io
  └─ "Request dates"    → POST /enquiries { outfitId, fromDate, toDate, message }
         ↳ create Enquiry(status=OPEN, ownerId) + find-or-create Conversation
         ↳ seed first message ("Hi, is this available 12–15 Aug?")
         ↳ notify owner (in-app; WA/email later)

Owner
  ├─ sees Enquiry in /owner/enquiries (OPEN) and the message in chat
  ├─ replies in chat → Enquiry → RESPONDED
  └─ marks CLOSED when settled (or auto-close after N days idle, cron)

Both parties arrange price, deposit, pickup, and return ENTIRELY between themselves.
Platform records nothing financial and confirms nothing. After the rental, the
renter may leave a moderated Review.
```
Availability shown on a listing is **owner-declared text + blackout dates**; the platform does not enforce holds or prevent "double booking" — that's the owners' responsibility (made explicit in UI copy).

---

## 10. Real-time Chat Architecture

- **Gateway:** `@nestjs/websockets` + `socket.io`. Namespace `/chat`. JWT verified in `handleConnection`.
- **Rooms:** one room per `conversationId`; users auto-join rooms for their active conversations.
- **Events:** `message:send`, `message:new`, `typing`, `read`, `presence`. Server persists each message (`Message`), updates `Conversation.lastMessage/At` and per-user `unread`.
- **Scale:** `socket.io-redis-adapter` over Redis (in from v1) so multiple API instances share rooms. Bull queue for push/email fan-out on offline recipients.
- **History/fallback:** REST `GET /chat/conversations`, `GET /chat/conversations/:id/messages?cursor=` (paginated), `POST /chat/conversations/:id/read`.
- **Safety enforcement:** server rejects messages if sender is blocked by recipient or either is banned; rate-limit messages (`@nestjs/throttler`); attachments go through the `file/` upload to **ImageKit** (served via CDN with transforms).
- **Web client:** `socket.io-client` in a Zustand store; optimistic send; React Query for history; unread badges in the header.

---

## 11. Notifications

Trigger matrix (channels: in-app now; WhatsApp/email deferred to §17):
| Event | Recipient | Channel (Phase 1) |
|---|---|---|
| New enquiry on your listing | Owner | in-app |
| New chat message (recipient offline) | Recipient | in-app (+ email/WA later) |
| Listing approved / rejected | Owner | in-app |
| New review on your listing/profile | Owner | in-app |
| You were reported / action taken | User | in-app + email |
| Report filed | Admin | in-app |

---

## 12. Trust & Safety (critical — no escrow)

Because the platform holds **no money and no order**, trust must come from product design:
- **Phone-verified accounts** (OTP) for everyone — this is the only identity check. **No KYC, no ID upload, no verification badge.**
- **Listing moderation** before going live (admin approves).
- **Report + Block:** report listings/users/messages; block enforced in chat (arrays already on `User`).
- **Prominent safety messaging** on PDP, chat, and a `/legal/safety` page: *"VASTRIQ CLOSET only connects you. Never pay in advance, meet/verify the outfit, use your own judgement. We do not mediate payments, deposits, damage, or disputes."*
- **Chat privacy:** admins do **not** read conversations by default. A conversation is only surfaced to admins when a `Report` references it (logged access).
- **Abuse controls:** OTP rate-limit (argon2-hashed codes), message rate-limit, spam heuristics on rapid listing creation.
- **Liability:** Terms make clear the platform is an intermediary noticeboard and not party to any rental agreement.

---

## 13. Security & Ops

- Hash OTP with argon2; rate-limit via `@nestjs/throttler`.
- JWT guards: consumer (`USER`) vs `ADMIN`.
- **ImageKit** for image/message uploads (`file/`): private key stays server-side; browser uploads use short-lived signed tokens from `GET /file/imagekit-auth`. CDN-delivered with URL transforms.
- Mongo indexes: `Outfit.status + cities + categoryId`, `Conversation.participantIds`, `Conversation.lastMessageAt`, `Message.conversationId + createdAt`, `Enquiry.ownerId + status`, `Report.status + createdAt`.
- Socket auth on handshake; reject banned/blocked.
- Logging per existing pattern; Sentry optional later.
- Daily Mongo backup (documented, out of code scope).

---

## 14. Phased Delivery (revised)

### Phase 0 — Refactor & foundations (week 1)
- **Edit `schema.prisma`** (Prisma kept): **drop** `Order`, `OrderItem`, `CartItem`, `Coupon`, `OrderStatus`, `KycStatus`, `UserRole`, `Gender`; **repurpose** `Dispute`→`Report`; **add** `Enquiry`, `Conversation`, `Message`; strip `User`/`OwnerProfile` of all commerce/KYC/role fields; trim `Outfit` (remove gender/fabric/sizes/min-max days/cart-order relations, add counters + availability). Then `prisma db push` + `prisma generate`. Update `Prisma.ModelName`-driven code in `util.service.ts` accordingly.
- Delete/disable `cart.tsx`, `checkout*.tsx`, and any orders/cart/payments/payouts/coupons API stubs.
- **Swap media storage AWS S3 → ImageKit.io:** remove the `aws/` module + `@aws-sdk/client-s3`, add the `imagekit/` provider + `GET /file/imagekit-auth`, switch `file/` uploads to ImageKit, set `UploadDriver = IMAGEKIT` (LOCAL in dev).
- Wire **Royal Emerald & Champagne** theme (§15) into [packages/theme](packages/theme), web, admin.
- Admin: add charts lib + sidebar entries (stubbed pages).

### Phase 1 — Catalogue & Landing (week 2)
- `catalog/` (categories, **colors**, occasions, **cities + states**) admin CRUD + public read + seed (§4.4).
- `outfits/` public list/search/filter + PDP (no chat yet — CTA stubbed).
- Landing page (banners, occasion/category tiles, city picker, "How it works", safety strip).
- CMS banners in admin.

### Phase 2 — Listing creation & moderation (week 3)
- Owner listing CRUD (web): create/edit/archive, image/video upload, price/deposit/cities/availability note.
- Admin listings-moderation queue (approve/reject).

### Phase 3 — Chat + Enquiry (week 4–5) — the core
- `chat/` WebSocket gateway + REST history; `enquiries/` module.
- Web: PDP "Chat with owner" + "Request dates"; chat inbox + thread UI; owner enquiries inbox.
- In-app notifications for enquiries/messages.
- Block enforcement.

### Phase 4 — Trust layer (week 6)
- `reviews/` (gated on prior conversation) + admin moderation.
- `reports/` + admin reports queue + actions (warn/remove/ban).
- `/legal/safety`, terms, privacy.

### Phase 5 — Admin analytics & polish (week 7)
- Dashboard charts wired to Mongo aggregations (listings, enquiries, response rate, signups).
- CSV exports; settings.

### Phase 6 — Hardening (week 8)
- E2E on critical paths (list → discover → chat → review).
- Chat load/concurrency test; socket reconnection.
- Lighthouse + SEO on landing/PDP.
- Deploy + monitoring.

---

## 15. Premium Theme — "Royal Emerald & Champagne"

Deliberately distinct from anokhireet.in. Modern-luxury: deep jewel-tones, generous whitespace, serif headings, gold accents on ivory.

### 15.1 Color tokens (Mantine + Tailwind)
| Token | Hex | Usage |
|---|---|---|
| `brand.emerald.900` | `#0F4C3A` | Primary buttons, headers, footer |
| `brand.emerald.700` | `#1B6B53` | Hover, active links |
| `brand.emerald.500` | `#2E8B6F` | Accent badges |
| `brand.emerald.50`  | `#E8F2EE` | Section tints |
| `brand.gold.600`    | `#B8860B` | Underlines, dividers |
| `brand.gold.500`    | `#D4AF37` | CTA highlight, price tag |
| `brand.gold.200`    | `#F2E6B6` | Hover wash |
| `brand.cream.50`    | `#FAF7F0` | Page background |
| `brand.bone.100`    | `#F2EDE2` | Card background |
| `ink.900`           | `#1A1A1A` | Body text |
| `ink.600`           | `#4A4A4A` | Secondary text |
| `blush.500`         | `#C97B6B` | Hot / "popular" tag |

### 15.2 Typography
- Headings: **Cormorant Garamond** (serif). Body: **Inter**. Wordmark/labels: **Cinzel** (all-caps, letter-spaced).
- Load via `next/font/google` in the web app `_app.tsx` / `_document.tsx`.

### 15.3 Visual language
- 12–16 px spacing grid; large full-bleed hero photography.
- Gold hairline dividers (1 px `#D4AF37` @ 40%).
- Cards: cream bg, 1 px gold border, subtle shadow `0 1 2 rgba(0,0,0,0.05)`.
- Buttons: emerald fill / cream text, gold underline on hover; secondary = transparent + gold border.
- Thin-line icons (Iconify `solar`/`tabler`, via `@iconify-icon/react`, already installed).
- Outfit cards portrait 4:5, warm grading.F
- **Chat UI:** owner bubbles emerald-tinted, renter bubbles bone; gold unread dot.

### 15.4 Where to wire it
- [packages/theme](packages/theme) — export `mantineTheme.ts` (palette + fonts) consumed by web + admin.
- [apps/web/tailwind.config.ts](apps/web/tailwind.config.ts) and [apps/admin/tailwind.config.js](apps/admin/tailwind.config.js) — mirror `theme.colors.brand`.

---

## 16. Dummy Accounts & Dev-Bypass for Testing

Goal: log in as test users without waiting for a real OTP.

### 16.1 Seed users (`pnpm dev:seeders`)
| Who | Phone (login) | Notes |
|---|---|---|
| User A (lists + rents) | `+919999900001` | has 5 active listings; also used to send enquiries |
| User B | `+919999900002` | no listings; used to start chats/enquiries |
| User C (pending listings) | `+919999900003` | 2 listings in `PENDING` for moderation |
| Admin | — (email `admin@test.local` / `Admin@12345`) | `type: ADMIN`; email/password login, separate from OTP |

> Consumer accounts have **no email/password** — phone + OTP is the only credential. Admin is the sole exception.

### 16.2 Dev OTP bypass (env-gated, never in prod)
`apps/api/.env`:
```
AUTH_DEV_BYPASS_ENABLED=true
AUTH_DEV_MASTER_OTP=000000
AUTH_DEV_PHONE_ALLOWLIST=+919999900001,+919999900002,+919999900003
```
In `otp.service.ts`: if bypass enabled **and** `code === master` **and** phone in allowlist, accept without DB lookup. Guarded by `ConfigService`; red startup log when active.

### 16.3 Admin login (no OTP)
Existing email/password under `POST /auth/admin/login`; seeder argon2-hashes `Admin@12345`.

### 16.4 Seeded sample data
- 8 categories (Bridal Lehenga, Indo Western, Sider Choli, Pre Wedding Special, Navratri Special, Party Wear, Traditional Wear, Saree — §4.4).
- Curated color list (§4.4).
- Cities grouped by state — Gujarat, Maharashtra, Rajasthan (§4.4).
- 5 active listings (User A) + 2 pending (User C), images from `public/seed/`.
- 1 sample **Enquiry** (User B → a User A listing) + its seeded **Conversation** with 2 messages, to exercise the chat/enquiry/review flow.
- 1 approved review; 2 banners.

### 16.5 How you'll test (after Phase 3)
1. `pnpm --filter @mejjos/api dev:seeders`
2. Web `/login` → `+919999900002` → OTP `000000` → browse a listing → **Chat with owner** / **Request dates**.
3. Log in as `+919999900001` → `/owner/enquiries` → reply in chat in real time.
4. Admin `admin@test.local` / `Admin@12345` → moderate User C's pending listings, view dashboard.

---

## 17. Open Questions (please confirm)

1. **WhatsApp/SMS fallback** — keep chat in-app only (current plan), or add a "Contact on WhatsApp" deep-link per listing in a later phase?
2. **Real OTP provider** — when we leave dev-bypass, Meta WhatsApp Cloud API vs MSG91/Gupshup for OTP?
3. **Review gating** — gate reviews on "had a conversation about this outfit," or allow any logged-in user to review (with moderation)? Risk of fake reviews differs.
4. **City scope at launch** — single-city pilot or multi-city day-one?
5. **Listing limits** — cap free listings per user (anti-spam), or unlimited?
6. **Enquiry auto-close** — after how many idle days should an OPEN enquiry auto-close?
7. **Theme confirmation** — keep "Royal Emerald & Champagne," or want alternates?

---

## 18. Next Steps

On approval, I will:
1. Edit **`schema.prisma`** (Prisma kept): remove commerce models, repurpose `Dispute`→`Report`, add `Enquiry`/`Conversation`/`Message`, trim `User`/`Outfit`.
2. Remove cart/checkout/payments/payouts/coupons code (web + api).
3. Scaffold new modules: `outfits/`, `enquiries/`, `chat/` (WS gateway), `reviews/`, `reports/`, `wishlist/`, `cms/`.
4. Wire the **Royal Emerald & Champagne** theme into [packages/theme](packages/theme), web, admin.
5. Build landing + PDP with the **"Chat with owner" / "Request dates"** CTAs.
6. Build the chat inbox + real-time thread UI and the owner enquiries inbox.
7. Write the seeder (§16) with the dev OTP bypass + sample chat/enquiry data.
8. Add admin moderation + dashboard charts (no GMV).

End of plan.

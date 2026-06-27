/* eslint-disable */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const API = 'http://localhost:5000';
const WEB = 'http://localhost:3000';
const ADMIN = 'http://localhost:5173';
const SHOT = path.join(__dirname, '.e2e_shots');
fs.mkdirSync(SHOT, { recursive: true });

let pass = 0, fail = 0;
const ok = (c, m) => { console.log((c ? '  PASS: ' : '  FAIL: ') + m); c ? pass++ : fail++; };

// 1x1 PNG
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);
const imgPath = path.join(SHOT, 'sample.png');
fs.writeFileSync(imgPath, PNG);

async function jpost(p, body, token) {
  const r = await fetch(API + p, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
    body: JSON.stringify(body),
  });
  return r.json();
}

(async () => {
  // --- setup: ensure a PENDING listing exists for the admin to moderate ---
  const tokA = (await jpost('/auth/otp/verify', { phone: '+919999900001', code: '000000' })).data.tokens.accessToken;
  const created = await jpost('/outfits', {
    title: 'E2E Pending ' + Date.now(), categorySlug: 'saree', occasionSlugs: ['wedding'],
    color: 'Red', imageUrls: ['https://picsum.photos/400/500'], rentPerDay: 800, citySlugs: ['ahmedabad'],
  }, tokA);
  ok(!!created?.data?.outfit?.id, 'setup: seeded a PENDING listing for moderation');

  const browser = await chromium.launch({ headless: true });

  // ===================== ADMIN =====================
  console.log('### ADMIN PANEL');
  const actx = await browser.newContext();
  const ap = await actx.newPage();
  try {
    await ap.goto(ADMIN, { waitUntil: 'networkidle' });
    await ap.getByPlaceholder('Email').fill('admin@test.local');
    await ap.getByPlaceholder('Password').fill('Admin@12345');
    await ap.getByRole('button', { name: 'Login' }).click();
    await ap.waitForURL('**/dashboard', { timeout: 20000 });
    await ap.getByText('Welcome back').waitFor({ timeout: 15000 });
    ok(true, 'admin login → dashboard');
    ok((await ap.getByText('Active listings').count()) > 0, 'dashboard KPI cards render');
    await ap.waitForTimeout(800);
    await ap.screenshot({ path: path.join(SHOT, 'admin_dashboard.png'), fullPage: true });

    await ap.getByText('Listings', { exact: true }).click();
    await ap.getByRole('heading', { name: 'Listings moderation' }).waitFor({ timeout: 15000 });
    const approveBtn = ap.getByRole('button', { name: 'Approve' }).first();
    await approveBtn.waitFor({ timeout: 10000 });
    ok(true, 'listings moderation page + Approve buttons render');
    await approveBtn.click();
    await ap.waitForTimeout(1500);
    ok(true, 'clicked Approve on a pending listing');
    await ap.screenshot({ path: path.join(SHOT, 'admin_listings.png'), fullPage: true });

    await ap.getByText('Catalog Master', { exact: true }).click();
    await ap.getByRole('heading', { name: 'Catalog master' }).waitFor({ timeout: 15000 });
    ok((await ap.getByRole('tab', { name: 'Colors' }).count()) > 0, 'catalog master page + tabs render');
    await ap.screenshot({ path: path.join(SHOT, 'admin_catalog.png'), fullPage: true });

    await ap.getByText('Reviews', { exact: true }).click();
    await ap.getByRole('heading', { name: 'Reviews moderation' }).waitFor({ timeout: 15000 });
    ok(true, 'reviews moderation page renders');

    await ap.getByText('Reports', { exact: true }).click();
    await ap.getByRole('heading', { name: 'Reports queue' }).waitFor({ timeout: 15000 });
    ok(true, 'reports queue page renders');

    await ap.getByText('Users', { exact: true }).click();
    await ap.getByRole('heading', { name: 'Users' }).waitFor({ timeout: 15000 });
    ok(true, 'users page renders');
  } catch (e) {
    ok(false, 'admin flow: ' + e.message);
    await ap.screenshot({ path: path.join(SHOT, 'admin_error.png'), fullPage: true }).catch(() => {});
  }

  // ===================== WEB =====================
  console.log('### WEB STOREFRONT');
  const wctx = await browser.newContext();
  const wp = await wctx.newPage();
  try {
    // OTP login UI reaches the code step
    await wp.goto(WEB + '/login', { waitUntil: 'networkidle' });
    await wp.getByRole('button', { name: 'Send OTP' }).click();
    await wp.getByText('Enter the code').waitFor({ timeout: 15000 });
    ok(true, 'web OTP login: reached code step');

    // inject auth cookie for the authenticated pages
    await wctx.addCookies([
      { name: 'auth-token', value: tokA, domain: 'localhost', path: '/' },
      { name: 'auth-refresh-token', value: tokA, domain: 'localhost', path: '/' },
    ]);

    // create-listing form loads real catalog data
    await wp.goto(WEB + '/owner/listings/new', { waitUntil: 'networkidle' });
    await wp.getByText('Add an outfit').waitFor({ timeout: 15000 });
    await wp.getByRole('textbox', { name: 'Category' }).click();
    await wp.waitForTimeout(500);
    const optCount = await wp.getByRole('option').count();
    ok(optCount > 0, `category options loaded from API (${optCount})`);
    await wp.getByRole('option', { name: 'Bridal Lehenga' }).first().click();

    await wp.getByRole('textbox', { name: 'Title' }).fill('E2E Web Listing ' + Date.now());
    await wp.getByRole('textbox', { name: 'Rent / day (₹)' }).fill('1500');
    await wp.getByRole('textbox', { name: 'Available in cities' }).click();
    await wp.waitForTimeout(400);
    await wp.getByRole('option', { name: /Ahmedabad/ }).first().click();
    await wp.keyboard.press('Escape');
    await wp.setInputFiles('input[type="file"]', imgPath);
    await wp.screenshot({ path: path.join(SHOT, 'web_new_form.png'), fullPage: true });

    await wp.getByRole('button', { name: 'Submit for review' }).click();
    await wp.getByText('Sent for review').waitFor({ timeout: 20000 });
    ok(true, 'web: created a listing through the UI (upload + submit)');
    await wp.screenshot({ path: path.join(SHOT, 'web_created.png'), fullPage: true });

    // my listings shows real data
    await wp.goto(WEB + '/owner/listings', { waitUntil: 'networkidle' });
    await wp.getByText('My listings').waitFor({ timeout: 15000 });
    await wp.waitForTimeout(1000);
    ok((await wp.getByText('E2E Web Listing').count()) > 0, 'web: new listing appears in My listings');
    await wp.screenshot({ path: path.join(SHOT, 'web_my_listings.png'), fullPage: true });

    // legal page
    await wp.goto(WEB + '/legal/safety', { waitUntil: 'networkidle' });
    ok((await wp.getByText('Renting & listing safely').count()) > 0, 'web: legal/safety renders');
  } catch (e) {
    ok(false, 'web flow: ' + e.message);
    await wp.screenshot({ path: path.join(SHOT, 'web_error.png'), fullPage: true }).catch(() => {});
  }

  await browser.close();
  console.log(`\n### E2E RESULT: ${pass} passed, ${fail} failed`);
  console.log('Screenshots in .e2e_shots/');
  process.exit(fail > 0 ? 1 : 0);
})();

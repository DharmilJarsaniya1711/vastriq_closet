/* eslint-disable */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const API = 'http://localhost:5000', WEB = 'http://localhost:3000', ADMIN = 'http://localhost:5173';
const SHOT = path.join(__dirname, '.e2e_shots');
fs.mkdirSync(SHOT, { recursive: true });
const imgPath = path.join(SHOT, 'sample.png');
if (!fs.existsSync(imgPath)) fs.writeFileSync(imgPath, Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64'));

let pass = 0, fail = 0;
const ok = (c, m) => { console.log((c ? '  PASS: ' : '  FAIL: ') + m); c ? pass++ : fail++; };
const email = `feat${Math.floor(Math.random() * 100000)}@test.local`;

(async () => {
  const tok = (await (await fetch(API + '/auth/otp/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: '+919999900002', code: '000000' }) })).json()).data.tokens.accessToken;
  const browser = await chromium.launch({ headless: true });

  // ---- WEB (cookie auth) ----
  const wctx = await browser.newContext();
  await wctx.addCookies([
    { name: 'auth-token', value: tok, domain: 'localhost', path: '/' },
    { name: 'auth-refresh-token', value: tok, domain: 'localhost', path: '/' },
  ]);
  const wp = await wctx.newPage();

  // Feature 1: image preview on new-listing
  try {
    await wp.goto(WEB + '/owner/listings/new', { waitUntil: 'networkidle' });
    await wp.getByText('Add an outfit').waitFor({ timeout: 15000 });
    await wp.setInputFiles('input[type="file"]', [imgPath, imgPath]);
    await wp.waitForTimeout(800);
    const previews = await wp.locator('img[src^="blob:"]').count();
    ok(previews >= 1, `F1: image preview thumbnails render after upload (${previews})`);
    await wp.screenshot({ path: path.join(SHOT, 'feat_preview.png') });
  } catch (e) { ok(false, 'F1 preview: ' + e.message); }

  // Feature 3: profile update
  try {
    await wp.goto(WEB + '/account', { waitUntil: 'networkidle' });
    await wp.getByRole('textbox', { name: 'Full name' }).waitFor({ timeout: 15000 });
    await wp.getByRole('textbox', { name: 'Full name' }).fill('Owner Two');
    await wp.getByRole('textbox', { name: 'Email' }).fill(email);
    await wp.getByRole('button', { name: 'Save profile' }).click();
    await wp.getByText('Profile updated').waitFor({ timeout: 15000 });
    ok(true, 'F3: profile (full name + email) saved via UI');
  } catch (e) { ok(false, 'F3 profile: ' + e.message); }

  // Feature 4: PDP date-range picker (on an ACTIVE outfit)
  try {
    await wp.goto(WEB + '/outfit/yellow-choli', { waitUntil: 'networkidle' });
    await wp.getByText('Rental dates').waitFor({ timeout: 15000 });
    const hasPicker = (await wp.getByText('Pick your rental start & end dates').count()) > 0;
    const oldButtonsGone = (await wp.getByRole('button', { name: '3 days' }).count()) === 0;
    ok(hasPicker && oldButtonsGone, 'F4: date-range picker replaces day buttons');
    await wp.screenshot({ path: path.join(SHOT, 'feat_daterange.png') });
  } catch (e) { ok(false, 'F4 date range: ' + e.message); }

  // ---- ADMIN ----
  const actx = await browser.newContext();
  const ap = await actx.newPage();
  try {
    await ap.goto(ADMIN, { waitUntil: 'networkidle' });
    await ap.getByPlaceholder('Email').fill('admin@test.local');
    await ap.getByPlaceholder('Password').fill('Admin@12345');
    await ap.getByRole('button', { name: 'Login' }).click();
    await ap.waitForURL('**/dashboard', { timeout: 20000 });

    // Feature 2: review drawer
    await ap.getByText('Listings', { exact: true }).click();
    await ap.getByRole('button', { name: 'Review' }).first().click();
    await ap.getByText('Review listing').waitFor({ timeout: 15000 });
    const drawerHasDetail =
      (await ap.getByText('Description').count()) > 0 &&
      (await ap.getByText('Available cities').count()) > 0 &&
      (await ap.getByText('Occasions').count()) > 0;
    ok(drawerHasDetail, 'F2: admin review drawer shows full outfit details');
    await ap.screenshot({ path: path.join(SHOT, 'feat_review_drawer.png') });
    await ap.keyboard.press('Escape');

    // Feature 3 (cont.): admin user list shows the updated profile
    await ap.getByText('Users', { exact: true }).click();
    await ap.getByRole('textbox', { name: 'Search' }).fill(email);
    await ap.waitForTimeout(1500);
    ok((await ap.getByText(email).count()) > 0, 'F3: updated name/email visible in admin Users list');
  } catch (e) { ok(false, 'admin flow: ' + e.message); await ap.screenshot({ path: path.join(SHOT, 'feat_admin_error.png') }).catch(()=>{}); }

  await browser.close();
  console.log(`\n### FEATURES E2E: ${pass} passed, ${fail} failed`);
  process.exit(fail > 0 ? 1 : 0);
})();

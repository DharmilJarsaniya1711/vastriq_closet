/* eslint-disable */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const API = 'http://localhost:5000', WEB = 'http://localhost:3000', ADMIN = 'http://localhost:5173';
const SHOT = path.join(__dirname, '.e2e_shots');
fs.mkdirSync(SHOT, { recursive: true });
const imgPath = path.join(SHOT, 'sample.png');
if (!fs.existsSync(imgPath)) {
  fs.writeFileSync(imgPath, Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64'));
}

let pass = 0, fail = 0;
const ok = (c, m) => { console.log((c ? '  PASS: ' : '  FAIL: ') + m); c ? pass++ : fail++; };
const BANNER_TITLE = 'E2E Banner ' + Date.now();

(async () => {
  const atok = (await (await fetch(API + '/auth/login/email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'admin@test.local', password: 'Admin@12345' }) })).json()).data.tokens.accessToken;

  const browser = await chromium.launch({ headless: true });
  // ADMIN: create a banner through the CMS screen
  const actx = await browser.newContext();
  const ap = await actx.newPage();
  try {
    await ap.goto(ADMIN, { waitUntil: 'networkidle' });
    await ap.getByPlaceholder('Email').fill('admin@test.local');
    await ap.getByPlaceholder('Password').fill('Admin@12345');
    await ap.getByRole('button', { name: 'Login' }).click();
    await ap.waitForURL('**/dashboard', { timeout: 20000 });
    await ap.getByText('CMS / Banners', { exact: true }).click();
    await ap.getByRole('heading', { name: 'CMS / Banners' }).waitFor({ timeout: 15000 });
    ok(true, 'admin CMS page renders');
    await ap.getByRole('textbox', { name: 'Title' }).fill(BANNER_TITLE);
    await ap.setInputFiles('input[type="file"]', imgPath);
    await ap.getByRole('button', { name: 'Add banner' }).click();
    await ap.getByText(BANNER_TITLE).waitFor({ timeout: 20000 });
    ok(true, 'admin: created banner via UI (upload + submit), appears in table');
    await ap.screenshot({ path: path.join(SHOT, 'admin_cms.png'), fullPage: true });
  } catch (e) {
    ok(false, 'admin CMS: ' + e.message);
    await ap.screenshot({ path: path.join(SHOT, 'admin_cms_error.png'), fullPage: true }).catch(() => {});
  }

  // WEB: banner shows on the landing
  const wctx = await browser.newContext();
  const wp = await wctx.newPage();
  try {
    await wp.goto(WEB, { waitUntil: 'networkidle' });
    await wp.getByText(BANNER_TITLE).waitFor({ timeout: 20000 });
    ok(true, 'web: banner renders on landing (BannerHero)');
    await wp.screenshot({ path: path.join(SHOT, 'web_banner.png'), fullPage: false });
  } catch (e) {
    ok(false, 'web banner: ' + e.message);
    await wp.screenshot({ path: path.join(SHOT, 'web_banner_error.png'), fullPage: true }).catch(() => {});
  }

  await browser.close();

  // cleanup: delete the test banner
  try {
    const list = (await (await fetch(API + '/admin/cms/banners', { headers: { Authorization: 'Bearer ' + atok } })).json()).data.items;
    for (const b of list.filter((x) => x.title === BANNER_TITLE)) {
      await fetch(API + '/admin/cms/banners/' + b.id, { method: 'DELETE', headers: { Authorization: 'Bearer ' + atok } });
    }
    console.log('  (cleaned up test banner)');
  } catch (e) { /* ignore */ }

  console.log(`\n### CMS E2E: ${pass} passed, ${fail} failed`);
  process.exit(fail > 0 ? 1 : 0);
})();

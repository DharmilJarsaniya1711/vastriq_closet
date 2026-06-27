/* eslint-disable */
const { chromium } = require('playwright');
const API = 'http://localhost:5000', WEB = 'http://localhost:3000', ADMIN = 'http://localhost:5173';
let pass = 0, fail = 0;
const ok = (c, m) => { console.log((c ? '  PASS: ' : '  FAIL: ') + m); c ? pass++ : fail++; };

(async () => {
  const tokA = (await (await fetch(API + '/auth/otp/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: '+919999900001', code: '000000' }) })).json()).data.tokens.accessToken;
  const browser = await chromium.launch({ headless: true });

  // ADMIN: Settings save
  const actx = await browser.newContext(); const ap = await actx.newPage();
  try {
    await ap.goto(ADMIN, { waitUntil: 'networkidle' });
    await ap.getByPlaceholder('Email').fill('admin@test.local');
    await ap.getByPlaceholder('Password').fill('Admin@12345');
    await ap.getByRole('button', { name: 'Login' }).click();
    await ap.waitForURL('**/dashboard', { timeout: 20000 });
    await ap.getByText('Settings', { exact: true }).click();
    await ap.getByRole('heading', { name: 'Settings' }).waitFor({ timeout: 15000 });
    ok(true, 'admin Settings page renders');
    await ap.locator('.mantine-Switch-track').first().click();
    await ap.getByRole('button', { name: 'Save settings' }).click();
    await ap.getByText('Settings updated').waitFor({ timeout: 15000 });
    ok(true, 'admin: toggled auto-approve + saved settings');
    // revert
    await ap.locator('.mantine-Switch-track').first().click();
    await ap.getByRole('button', { name: 'Save settings' }).click();
    await ap.waitForTimeout(1000);
  } catch (e) { ok(false, 'admin settings: ' + e.message); }

  // WEB: edit listing + account + search
  const wctx = await browser.newContext();
  await wctx.addCookies([
    { name: 'auth-token', value: tokA, domain: 'localhost', path: '/' },
    { name: 'auth-refresh-token', value: tokA, domain: 'localhost', path: '/' },
  ]);
  const wp = await wctx.newPage();
  try {
    await wp.goto(WEB + '/owner/listings', { waitUntil: 'networkidle' });
    await wp.getByText('My listings').waitFor({ timeout: 15000 });
    await wp.getByRole('link', { name: 'Edit' }).first().click();
    await wp.getByRole('heading', { name: 'Edit listing' }).waitFor({ timeout: 15000 });
    // form prefilled: Title should have a value
    const titleVal = await wp.getByRole('textbox', { name: 'Title' }).inputValue();
    ok(titleVal.length > 0, `edit form prefilled (title="${titleVal.slice(0, 24)}")`);
    await wp.getByRole('textbox', { name: 'Rent / day (₹)' }).fill('1234');
    await wp.getByRole('button', { name: 'Save changes' }).click();
    await wp.getByText('Changes saved').waitFor({ timeout: 20000 });
    ok(true, 'web: edited a listing via UI and saved');
  } catch (e) { ok(false, 'web edit: ' + e.message); await wp.screenshot({ path: '.e2e_shots/web_edit_error.png' }).catch(()=>{}); }

  try {
    await wp.goto(WEB + '/account', { waitUntil: 'networkidle' });
    await wp.getByText('My listings').waitFor({ timeout: 15000 }); // quick-link card
    ok(true, 'web account page loads with profile + quick links');
  } catch (e) { ok(false, 'web account: ' + e.message); }

  try {
    await wp.goto(WEB + '/search?q=lehenga', { waitUntil: 'networkidle' });
    await wp.waitForTimeout(1500);
    const hasResultsOrEmpty = (await wp.getByText(/result|No matches/).count()) > 0;
    ok(hasResultsOrEmpty, 'web search executes and shows results/empty state');
  } catch (e) { ok(false, 'web search: ' + e.message); }

  await browser.close();
  console.log(`\n### PHASE E2E: ${pass} passed, ${fail} failed`);
  process.exit(fail > 0 ? 1 : 0);
})();

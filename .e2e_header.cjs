/* eslint-disable */
const { chromium } = require('playwright');
const WEB = 'http://localhost:3000';
let pass = 0, fail = 0;
const ok = (c, m) => { console.log((c ? '  PASS: ' : '  FAIL: ') + m); c ? pass++ : fail++; };

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  const p = await ctx.newPage();
  const phone = '+9193' + String(Math.floor(10000000 + Math.random() * 80000000));
  try {
    // Logged out → Login visible on landing
    await p.goto(WEB, { waitUntil: 'networkidle' });
    await p.waitForTimeout(1200);
    ok((await p.getByRole('link', { name: 'Login' }).count()) > 0, 'logged-out header shows Login');

    // Log in via OTP
    await p.goto(WEB + '/login', { waitUntil: 'networkidle' });
    await p.getByRole('textbox').first().fill(phone);
    await p.getByRole('button', { name: 'Send OTP' }).click();
    const hint = await p.getByText(/Your OTP \(dev\)/).textContent();
    const code = (hint || '').match(/\d{6}/)[0];
    await p.locator('input').first().click();
    await p.keyboard.type(code);
    await p.getByRole('button', { name: 'Verify & continue' }).click();
    await p.waitForURL((u) => !u.toString().includes('/login'), { timeout: 20000 });

    // Landing now shows profile (name=phone) and NO Login link
    await p.goto(WEB, { waitUntil: 'networkidle' });
    await p.getByText(phone).first().waitFor({ timeout: 15000 });
    ok(true, 'logged-in header shows profile (phone) instead of Login');
    ok((await p.getByRole('link', { name: 'Login' }).count()) === 0, 'Login link is gone when logged in');

    // Profile menu → Log out → Login returns
    await p.getByText(phone).first().click();
    await p.getByText('Log out').click();
    await p.waitForTimeout(2000);
    ok((await p.getByRole('link', { name: 'Login' }).count()) > 0, 'after logout, Login returns');
  } catch (e) {
    ok(false, 'header flow: ' + e.message);
    await p.screenshot({ path: '.e2e_shots/header_error.png' }).catch(() => {});
  }
  await browser.close();
  console.log(`\n### HEADER E2E: ${pass} passed, ${fail} failed`);
  process.exit(fail > 0 ? 1 : 0);
})();

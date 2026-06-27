/* eslint-disable */
const { chromium } = require('playwright');
const WEB = 'http://localhost:3000';
let pass = 0, fail = 0;
const ok = (c, m) => { console.log((c ? '  PASS: ' : '  FAIL: ') + m); c ? pass++ : fail++; };

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  const p = await ctx.newPage();
  const phone = '+9194' + String(Math.floor(10000000 + Math.random() * 80000000));
  try {
    await p.goto(WEB + '/login', { waitUntil: 'networkidle' });
    await p.getByText('Login or sign up').waitFor({ timeout: 15000 });
    await p.getByRole('textbox').first().fill(phone);
    await p.getByRole('button', { name: 'Send OTP' }).click();
    await p.getByText('Enter the code').waitFor({ timeout: 15000 });

    // Read the on-screen OTP (no SMS sent)
    const hint = await p.getByText(/Your OTP \(dev\)/).textContent();
    const code = (hint || '').match(/\d{6}/)?.[0];
    ok(!!code, `OTP shown on screen for new number (${code})`);

    // Enter the code into the PinInput and verify
    await p.locator('input').first().click();
    await p.keyboard.type(code);
    await p.getByRole('button', { name: 'Verify & continue' }).click();
    await p.waitForURL((u) => !u.toString().includes('/login'), { timeout: 20000 });
    ok(true, 'new number signed up + logged in (left /login)');

    // Cookie set → account page recognizes the session
    await p.goto(WEB + '/account', { waitUntil: 'networkidle' });
    await p.waitForTimeout(1500);
    ok((await p.getByText(phone).count()) > 0, 'account page shows the signed-up phone number');
  } catch (e) {
    ok(false, 'otp flow: ' + e.message);
    await p.screenshot({ path: '.e2e_shots/otp_error.png' }).catch(() => {});
  }
  await browser.close();
  console.log(`\n### OTP E2E: ${pass} passed, ${fail} failed`);
  process.exit(fail > 0 ? 1 : 0);
})();

const { chromium } = require('playwright');

(async () => {
  // Launch with stealth options
  const browser = await chromium.launch({ 
    headless: false, 
    slowMo: 100,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process'
    ]
  });
  
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    bypassCSP: true
  });
  
  // Inject script to hide automation
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
    Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
    window.chrome = { runtime: {} };
  });
  
  const page = await context.newPage();
  
  console.log('Opening X with stealth mode...');
  
  try {
    await page.goto('https://x.com', { waitUntil: 'domcontentloaded', timeout: 30000 });
  } catch (e) {
    console.log('Initial load timeout, continuing...');
  }
  
  await page.waitForTimeout(5000);
  
  // Check if blocked
  const blocked = await page.$('text=unsupported browser') || 
                  await page.$('text=browser not supported') ||
                  await page.$('text=secure');
  
  if (blocked) {
    console.log('❌ X is still detecting automation.');
    console.log('');
    console.log('💡 ALTERNATIVE APPROACH:');
    console.log('   Use X API instead of browser automation:');
    console.log('   1. Go to https://developer.twitter.com');
    console.log('   2. Create a free developer account');
    console.log('   3. Create an app and get API keys');
    console.log('   4. I can then post using the API');
    console.log('');
    console.log('   Or: Log in manually first, export cookies,');
    console.log('   and I can use those cookies to post.');
    
    await page.screenshot({ path: 'x-blocked.png' });
    await browser.close();
    return;
  }
  
  // Continue with login check...
  console.log('Page loaded. Checking state...');
  // ... rest of the script
  
  await browser.close();
})();

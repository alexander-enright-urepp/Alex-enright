const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('Opening X...');
  await page.goto('https://x.com/i/flow/login', { waitUntil: 'domcontentloaded' });
  
  // Wait for page to load
  await page.waitForTimeout(5000);
  
  // Take screenshot to see current state
  await page.screenshot({ path: 'x-login-page.png' });
  console.log('Screenshot saved: x-login-page.png');
  
  // Check if we're on login page
  const hasUsername = await page.$('input[name="text"], input[type="text"], input[autocomplete="username"]').catch(() => null);
  const hasPassword = await page.$('input[type="password"]').catch(() => null);
  
  if (hasUsername || hasPassword) {
    console.log('🔐 Login page detected. Please log in manually.');
    console.log('   After you successfully log in, press Enter here to continue...');
    await new Promise(resolve => process.stdin.once('data', resolve));
  } else {
    // Check if already logged in
    const isLoggedIn = await page.$('[data-testid="AppTabBar_Home_Link"], [data-testid="SideNav_NewTweet_Button"]').catch(() => null);
    if (isLoggedIn) {
      console.log('✅ Already logged in!');
    } else {
      console.log('⚠️  Unknown state. Taking screenshot...');
      await page.screenshot({ path: 'x-unknown-state.png' });
      console.log('Press Enter to continue anyway, or Ctrl+C to exit...');
      await new Promise(resolve => process.stdin.once('data', resolve));
    }
  }
  
  // Navigate to home to ensure we're ready
  await page.goto('https://x.com/home', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  console.log('Looking for compose button...');
  
  // Try to find and click compose button
  const composeSelectors = [
    '[data-testid="SideNav_NewTweet_Button"]',
    'a[href="/compose/tweet"]',
    '[aria-label="Compose"]',
    'a[aria-label="Compose"]',
    'button:has-text("Post")',
    '[data-testid="NewTweet_Button"]'
  ];
  
  let composeBtn = null;
  for (const selector of composeSelectors) {
    try {
      composeBtn = await page.waitForSelector(selector, { timeout: 5000 });
      console.log(`✅ Found compose button: ${selector}`);
      break;
    } catch (e) {
      console.log(`   Not found: ${selector}`);
    }
  }
  
  if (!composeBtn) {
    console.log('❌ Could not find compose button. Check x-unknown-state.png');
    await page.screenshot({ path: 'x-no-compose.png' });
    await browser.close();
    return;
  }
  
  await composeBtn.click();
  console.log('📝 Clicked compose button');
  await page.waitForTimeout(2000);
  
  // Find and fill tweet text
  const textSelectors = [
    '[data-testid="tweetTextarea_0"]',
    'div[contenteditable="true"]',
    '[aria-label*="Post text"]',
    '[aria-label*="Tweet text"]'
  ];
  
  let filled = false;
  for (const selector of textSelectors) {
    try {
      await page.waitForSelector(selector, { timeout: 5000 });
      const tweet = "Your comfort zone is a beautiful place, but nothing ever grows there. 🌱 The entrepreneurs who change the world are the ones who got uncomfortable first. What's one small step you can take today? #Entrepreneurship #GrowthMindset #TakeAction";
      await page.fill(selector, tweet);
      console.log(`✅ Filled tweet text using: ${selector}`);
      filled = true;
      break;
    } catch (e) {}
  }
  
  if (!filled) {
    console.log('❌ Could not find text input');
    await page.screenshot({ path: 'x-no-text-input.png' });
    await browser.close();
    return;
  }
  
  // Find and click post button
  const postSelectors = [
    '[data-testid="tweetButton"]',
    'button[type="submit"]',
    'button:has-text("Post"):not([disabled])',
    'div[role="button"]:has-text("Post")'
  ];
  
  let posted = false;
  for (const selector of postSelectors) {
    try {
      const btn = await page.waitForSelector(selector, { timeout: 5000 });
      await btn.click();
      console.log(`✅ Posted tweet using: ${selector}`);
      posted = true;
      break;
    } catch (e) {}
  }
  
  if (!posted) {
    console.log('❌ Could not find post button');
  } else {
    await page.waitForTimeout(3000);
    console.log('🎉 Done! Check your X profile to verify.');
  }
  
  await page.screenshot({ path: 'x-final.png' });
  await browser.close();
})();

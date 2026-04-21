const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Increase navigation timeout
  page.setDefaultTimeout(60000);
  
  console.log('Opening X...');
  
  try {
    // Use domcontentloaded instead of networkidle (faster)
    await page.goto('https://x.com', { waitUntil: 'domcontentloaded', timeout: 30000 });
  } catch (e) {
    console.log('Navigation timed out, continuing anyway...');
  }
  
  // Wait for content to appear
  await page.waitForTimeout(5000);
  
  // Take screenshot
  await page.screenshot({ path: 'x-state.png' });
  console.log('Screenshot: x-state.png');
  
  // Check current URL
  const url = page.url();
  console.log('Current URL:', url);
  
  // Check if we need to log in
  const needsLogin = await page.$('text="Sign in"') || 
                     await page.$('text="Log in"') ||
                     url.includes('login') ||
                     url.includes('flow');
  
  if (needsLogin) {
    console.log('🔐 Please log in to X manually...');
    console.log('   After logging in, press Enter here to continue');
    await new Promise(resolve => process.stdin.once('data', resolve));
    await page.waitForTimeout(3000);
  }
  
  // Now look for compose button
  console.log('Looking for compose button...');
  
  // Try to click the "Post" or compose button in the sidebar
  const composeFound = await page.evaluate(() => {
    // Look for various compose buttons
    const selectors = [
      '[data-testid="SideNav_NewTweet_Button"]',
      'a[href="/compose/tweet"]',
      'a[aria-label*="Compose"]',
      'a[aria-label*="Post"]',
      'button:contains("Post")'
    ];
    
    for (const sel of selectors) {
      const btn = document.querySelector(sel);
      if (btn) {
        btn.click();
        return true;
      }
    }
    return false;
  });
  
  if (!composeFound) {
    console.log('Trying alternative selectors...');
    // Try clicking with Playwright
    try {
      await page.click('[data-testid="SideNav_NewTweet_Button"]');
    } catch {
      try {
        await page.click('a[href="/compose/tweet"]');
      } catch {
        console.log('Could not find compose button. Check x-state.png');
        await browser.close();
        return;
      }
    }
  }
  
  console.log('Compose window opened');
  await page.waitForTimeout(2000);
  
  // Type the tweet
  const tweetText = "Your comfort zone is a beautiful place, but nothing ever grows there. 🌱 The entrepreneurs who change the world are the ones who got uncomfortable first. What's one small step you can take today? #Entrepreneurship #GrowthMindset #TakeAction";
  
  try {
    await page.fill('[data-testid="tweetTextarea_0"]', tweetText);
  } catch {
    await page.fill('div[contenteditable="true"]', tweetText);
  }
  
  console.log('Tweet text entered');
  await page.waitForTimeout(1000);
  
  // Click post
  try {
    await page.click('[data-testid="tweetButton"]');
    console.log('✅ Tweet posted!');
  } catch {
    console.log('❌ Could not find post button');
  }
  
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'x-final.png' });
  await browser.close();
})();

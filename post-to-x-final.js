const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false, 
    slowMo: 200,
    args: ['--disable-blink-features=AutomationControlled']
  });
  
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 }
  });
  
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    window.chrome = { runtime: {} };
  });
  
  const page = await context.newPage();
  
  console.log('Opening X...');
  await page.goto('https://x.com', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);
  
  const url = page.url();
  console.log('URL:', url);
  
  // Check if login needed
  const signIn = await page.$('a[href="/login"]') || await page.$('text="Sign in"');
  if (signIn || url.includes('login')) {
    console.log('🔐 Please log in to X manually');
    console.log('   After logging in, press Enter to continue...');
    await new Promise(resolve => process.stdin.once('data', resolve));
    await page.waitForTimeout(3000);
  }
  
  console.log('Ready to post...');
  
  // Click compose button
  const composeSelectors = [
    'a[href="/compose/tweet"]',
    '[data-testid="SideNav_NewTweet_Button"]',
    'button:has-text("Post"):first-of-type'
  ];
  
  let composeClicked = false;
  for (const sel of composeSelectors) {
    try {
      await page.click(sel, { timeout: 5000 });
      composeClicked = true;
      console.log('Opened compose window');
      break;
    } catch {}
  }
  
  if (!composeClicked) {
    // Try direct navigation
    await page.goto('https://x.com/compose/tweet');
    console.log('Navigated to compose page');
  }
  
  await page.waitForTimeout(3000);
  
  // Type tweet
  const tweet = "Your comfort zone is a beautiful place, but nothing ever grows there. 🌱 The entrepreneurs who change the world are the ones who got uncomfortable first. What's one small step you can take today? #Entrepreneurship #GrowthMindset #TakeAction";
  
  try {
    await page.fill('[data-testid="tweetTextarea_0"]', tweet);
  } catch {
    await page.fill('div[contenteditable="true"]', tweet);
  }
  
  console.log('Tweet entered');
  await page.waitForTimeout(1000);
  
  // Post it
  try {
    await page.click('[data-testid="tweetButton"]');
    console.log('✅ Tweet posted successfully!');
  } catch {
    await page.click('button[type="submit"]');
    console.log('✅ Tweet posted!');
  }
  
  await page.waitForTimeout(3000);
  await browser.close();
})();

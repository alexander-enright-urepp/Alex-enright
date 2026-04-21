const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('Opening X...');
  await page.goto('https://x.com');
  
  // Check if logged in
  const loginCheck = await page.$('text="Sign in"').catch(() => null);
  if (loginCheck) {
    console.log('Please log in to X manually, then press Enter in this terminal...');
    await new Promise(resolve => process.stdin.once('data', resolve));
  }
  
  // Wait for and click the post button
  await page.waitForSelector('[data-testid="tweetTextarea_0"], [aria-label="Post"]', { timeout: 10000 });
  await page.click('[data-testid="tweetTextarea_0"]').catch(() => page.click('[aria-label="Post"]'));
  
  // Type the tweet
  const tweet = "Your comfort zone is a beautiful place, but nothing ever grows there. 🌱 The entrepreneurs who change the world are the ones who got uncomfortable first. What's one small step you can take today? #Entrepreneurship #GrowthMindset #TakeAction";
  
  await page.fill('[data-testid="tweetTextarea_0"]', tweet);
  
  // Click post button
  await page.click('[data-testid="tweetButton"]');
  
  console.log('Tweet posted!');
  await page.waitForTimeout(3000);
  await browser.close();
})();

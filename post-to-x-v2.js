const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('Opening X...');
  await page.goto('https://x.com', { waitUntil: 'networkidle' });
  
  // Take screenshot to see current state
  await page.screenshot({ path: 'x-initial.png' });
  console.log('Screenshot saved: x-initial.png');
  
  // Wait a bit for any popups/modals
  await page.waitForTimeout(3000);
  
  // Check for login button
  const signInBtn = await page.$('text="Sign in"');
  if (signInBtn) {
    console.log('⚠️  Not logged in! Please log in manually, then press Enter here...');
    await new Promise(resolve => process.stdin.once('data', resolve));
    await page.waitForTimeout(2000);
  }
  
  console.log('Looking for compose button...');
  
  // Try multiple selectors for the compose button
  const composeSelectors = [
    '[data-testid="SideNav_NewTweet_Button"]',
    'a[href="/compose/tweet"]',
    'button[aria-label="Post"]',
    'a[aria-label="Compose"]',
    'button:has-text("Post")',
    '[aria-label="New post"]'
  ];
  
  let composeBtn = null;
  for (const selector of composeSelectors) {
    composeBtn = await page.$(selector);
    if (composeBtn) {
      console.log(`Found compose button with: ${selector}`);
      break;
    }
  }
  
  if (!composeBtn) {
    console.log('Could not find compose button. Taking screenshot...');
    await page.screenshot({ path: 'x-error.png' });
    console.log('Screenshot saved: x-error.png - Please check what X looks like');
    await browser.close();
    return;
  }
  
  await composeBtn.click();
  await page.waitForTimeout(2000);
  
  // Find the text input
  const textSelectors = [
    '[data-testid="tweetTextarea_0"]',
    'div[contenteditable="true"]',
    '[aria-label="Post text"]',
    '[aria-label="Tweet text"]'
  ];
  
  let textInput = null;
  for (const selector of textSelectors) {
    textInput = await page.$(selector);
    if (textInput) {
      console.log(`Found text input with: ${selector}`);
      break;
    }
  }
  
  if (!textInput) {
    console.log('Could not find text input. Taking screenshot...');
    await page.screenshot({ path: 'x-compose-error.png' });
    await browser.close();
    return;
  }
  
  // Type the tweet
  const tweet = "Your comfort zone is a beautiful place, but nothing ever grows there. 🌱 The entrepreneurs who change the world are the ones who got uncomfortable first. What's one small step you can take today? #Entrepreneurship #GrowthMindset #TakeAction";
  
  await textInput.fill(tweet);
  console.log('Tweet text entered');
  
  // Find and click post button
  const postSelectors = [
    '[data-testid="tweetButton"]',
    'button[type="submit"]',
    'button:has-text("Post")',
    'div[role="button"]:has-text("Post")'
  ];
  
  let postBtn = null;
  for (const selector of postSelectors) {
    postBtn = await page.$(selector);
    if (postBtn) {
      console.log(`Found post button with: ${selector}`);
      break;
    }
  }
  
  if (postBtn) {
    await postBtn.click();
    console.log('✅ Tweet posted!');
    await page.waitForTimeout(3000);
  } else {
    console.log('❌ Could not find post button');
  }
  
  await page.screenshot({ path: 'x-final.png' });
  await browser.close();
})();

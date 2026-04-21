from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)  # Not headless so you can see it
    page = browser.new_page()
    
    # Go to main page first
    print("Going to CalCareers homepage...")
    page.goto("https://calcareers.ca.gov/", timeout=30000)
    print(f"Title: {page.title()}")
    print(f"URL: {page.url}")
    
    # Look for search form
    search_box = page.query_selector("input[name*='location'], input[placeholder*='city'], #location")
    if search_box:
        print("✓ Found location search box")
        search_box.fill("Sacramento")
        submit = page.query_selector("button[type='submit'], input[type='submit']")
        if submit:
            print("Clicking search...")
            submit.click()
            page.wait_for_timeout(3000)
            print(f"After search URL: {page.url}")
            print(f"After search title: {page.title()}")
    else:
        print("No search box found")
        # Take screenshot to debug
        page.screenshot(path="calcareers.png")
        print("Screenshot saved to calcareers.png")
    
    input("Press Enter to close...")  # So you can see the page
    browser.close()

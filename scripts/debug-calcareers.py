from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()
    
    url = "https://calcareers.ca.gov/CalHRPublic/Search/Results?locationname=Sacramento&keywords=staff+service+analyst"
    page.goto(url, timeout=30000)
    page.wait_for_load_state("networkidle")
    
    print(f"Title: {page.title()}")
    print(f"URL: {page.url}")
    
    # Take screenshot
    page.screenshot(path="calcareers-search.png", full_page=True)
    print("Screenshot saved")
    
    # Check for common job listing elements
    selectors_to_try = [
        ".job-listing",
        "[data-job-id]",
        ".search-result",
        ".job-title",
        "a[href*='JobPosting']",
        "a[href*='job']",
        ".card",
        ".result-item",
        "h3 a",
        "h2 a"
    ]
    
    print("\nTrying different selectors:")
    for selector in selectors_to_try:
        elements = page.query_selector_all(selector)
        if len(elements) > 0:
            print(f"  ✓ {selector}: {len(elements)} found")
            if len(elements) > 0:
                text = elements[0].inner_text()[:100]
                print(f"      Example: {text}...")
        else:
            print(f"  ✗ {selector}: 0 found")
    
    # Look at page structure
    print("\nPage body first 500 chars:")
    body = page.inner_text("body")[:500]
    print(body)
    
    input("Press Enter to close...")
    browser.close()

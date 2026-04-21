from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()
    
    # Start at main search page
    print("Going to CalCareers search...")
    page.goto("https://calcareers.ca.gov/CalHRPublic/Search/", timeout=30000)
    page.wait_for_load_state("networkidle")
    
    print(f"Title: {page.title()}")
    print(f"URL: {page.url}")
    
    # Take screenshot
    page.screenshot(path="calcareers-main.png", full_page=True)
    print("Screenshot saved as calcareers-main.png")
    
    # Look for search form
    print("\nLooking for search form...")
    inputs = page.query_selector_all("input")
    print(f"Found {len(inputs)} input fields:")
    for i, inp in enumerate(inputs[:10]):
        name = inp.get_attribute("name") or ""
        placeholder = inp.get_attribute("placeholder") or ""
        type_attr = inp.get_attribute("type") or ""
        print(f"  {i}: name={name}, placeholder={placeholder}, type={type_attr}")
    
    # Look for buttons
    buttons = page.query_selector_all("button")
    print(f"\nFound {len(buttons)} buttons:")
    for i, btn in enumerate(buttons[:10]):
        text = btn.inner_text()[:50]
        print(f"  {i}: {text}")
    
    input("Press Enter to close...")
    browser.close()

#!/usr/bin/env python3
import requests
from bs4 import BeautifulSoup

# Search Indeed for your specific jobs in Sacramento
search_terms = [
    '"Staff Service Analyst" Sacramento',
    '"Office Technician" Sacramento',
    '"Office Assistant" Sacramento'
]

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}

for term in search_terms:
    print(f"\n{'='*60}")
    print(f"Searching: {term}")
    print('='*60)
    
    url = f"https://www.indeed.com/jobs?q={term.replace(' ', '+')}&l=Sacramento%2C+CA"
    
    try:
        response = requests.get(url, headers=headers, timeout=30)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Find job cards
        cards = soup.find_all('div', class_='job_seen_beacon') or soup.find_all('td', class_='resultContent')
        
        if not cards:
            # Try other selectors
            cards = soup.find_all('div', {'data-jk': True})
        
        print(f"Found {len(cards)} job cards")
        
        for card in cards[:5]:
            try:
                title_elem = card.find('h2') or card.find('a', {'data-jk': True})
                company_elem = card.find(['span', 'div'], {'class': lambda x: x and 'company' in x.lower() if x else False})
                loc_elem = card.find(['div', 'span'], {'class': lambda x: x and 'location' in x.lower() if x else False})
                
                if title_elem:
                    title = title_elem.get_text(strip=True)
                    company = company_elem.get_text(strip=True) if company_elem else "Unknown"
                    location = loc_elem.get_text(strip=True) if loc_elem else "Sacramento"
                    
                    print(f"\n  📋 {title}")
                    print(f"     {company} | {location}")
            except Exception as e:
                continue
                
    except Exception as e:
        print(f"Error: {e}")


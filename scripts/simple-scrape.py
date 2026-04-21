#!/usr/bin/env python3
import requests
from bs4 import BeautifulSoup

# Try the main jobs page
url = "https://calcareers.ca.gov/CalHRPublic/Jobs/"
headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
}

print(f"Fetching {url}...")
response = requests.get(url, headers=headers, timeout=30)
print(f"Status: {response.status_code}")
print(f"URL: {response.url}")
print(f"\nFirst 1000 chars of response:")
print(response.text[:1000])

# Try to parse
soup = BeautifulSoup(response.text, 'html.parser')
print(f"\nTitle: {soup.title.string if soup.title else 'No title'}")

# Look for job listings
jobs = soup.find_all('a', href=lambda x: x and 'job' in x.lower())
print(f"\nFound {len(jobs)} job links")
for job in jobs[:5]:
    print(f"  - {job.get_text(strip=True)[:50]}")

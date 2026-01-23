
import requests
from bs4 import BeautifulSoup
import json
import re
from datetime import datetime
import os
import time
import random

def fetch_google_scholar_stats(user_id):
    # Rotatable user agents to try and avoid detection
    user_agents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    ]
    
    url = f"https://scholar.google.com/citations?user={user_id}&hl=en"
    
    for attempt in range(3):
        try:
            headers = {
                "User-Agent": random.choice(user_agents),
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
                "Referer": "https://scholar.google.com/"
            }
            
            print(f"Attempt {attempt + 1}: Fetching {url}...")
            response = requests.get(url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Check for table
                stats_table = soup.find('div', id='gsc_rsb')
                if not stats_table:
                    print("Stats table not found (possible captcha or layout change).")
                    # Debug: print first 500 chars
                    print("Response start:", response.text[:500])
                    continue
                
                nums = stats_table.find_all('td', class_='gsc_rsb_std')
                if len(nums) >= 6:
                    citations = int(nums[0].text)
                    h_index = int(nums[2].text)
                    i10_index = int(nums[4].text)
                    
                    data = {
                        "citations": citations,
                        "h_index": h_index,
                        "i10_index": i10_index,
                        "last_updated": datetime.now().strftime("%Y-%m-%d")
                    }
                    print(f"Successfully fetched stats: {data}")
                    return data
            else:
                print(f"Status Code: {response.status_code}")
                
        except Exception as e:
            print(f"Error on attempt {attempt + 1}: {e}")
            
        # Wait before retry
        time.sleep(random.uniform(2, 5))
            
    return None

def update_json_file(stats, filepath="scholar_stats.json"):
    if not stats:
        return
        
    # Read existing to compare
    if os.path.exists(filepath):
        try:
            with open(filepath, 'r') as f:
                existing = json.load(f)
                if (existing.get('citations') == stats['citations'] and 
                    existing.get('h_index') == stats['h_index'] and 
                    existing.get('i10_index') == stats['i10_index']):
                    print("Stats unchanged, skipping write.")
                    return
        except:
            pass
            
    with open(filepath, 'w') as f:
        json.dump(stats, f, indent=4)
    print(f"Updated {filepath} with {stats}")

if __name__ == "__main__":
    USER_ID = "8ZmNWSwzS30C"
    stats = fetch_google_scholar_stats(USER_ID)
    
    if stats:
        root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        json_path = os.path.join(root_dir, "scholar_stats.json")
        update_json_file(stats, json_path)
    else:
        print("Failed to fetch stats after retries.")
        # Do not exit(1) to avoid failing the workflow completely if Google blocks us occasionally.
        # We just want to keep the old stats.
        exit(0)

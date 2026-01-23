
import requests
from bs4 import BeautifulSoup
import json
import re
from datetime import datetime
import os

def fetch_google_scholar_stats(user_id):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    url = f"https://scholar.google.com/citations?user={user_id}&hl=en"
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Google Scholar table structure:
        # <td class="gsc_rsb_std">123</td> ... (Citations, h-index, i10-index)
        # The first column is "All", second is "Since 20xx"
        
        stats_table = soup.find('div', id='gsc_rsb')
        if not stats_table:
            print("Could not find stats table.")
            return None
            
        # Extract numbers using regex or css selectors
        # The classes are gsc_rsb_std
        nums = stats_table.find_all('td', class_='gsc_rsb_std')
        
        if len(nums) < 6:
            print("Unexpected table format.")
            return None
            
        # Index 0: Citations (All)
        # Index 2: h-index (All)
        # Index 4: i10-index (All)
        
        citations = int(nums[0].text)
        h_index = int(nums[2].text)
        i10_index = int(nums[4].text)
        
        return {
            "citations": citations,
            "h_index": h_index,
            "i10_index": i10_index,
            "last_updated": datetime.now().strftime("%Y-%m-%d")
        }
        
    except Exception as e:
        print(f"Error fetching data: {e}")
        return None

def update_json_file(stats, filepath="scholar_stats.json"):
    if not stats:
        return
        
    with open(filepath, 'w') as f:
        json.dump(stats, f, indent=4)
    print(f"Updated {filepath} with {stats}")

if __name__ == "__main__":
    USER_ID = "8ZmNWSwzS30C" # Ahsan Gilman's ID from URL
    stats = fetch_google_scholar_stats(USER_ID)
    
    if stats:
        # Determine the path relative to this script or root
        # Assuming script is in /scripts and json is in root
        root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        json_path = os.path.join(root_dir, "scholar_stats.json")
        
        update_json_file(stats, json_path)
    else:
        # Fail the action if we can't get data, so we know something is wrong
        exit(1)

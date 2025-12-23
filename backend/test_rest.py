import requests
import os
from dotenv import load_dotenv

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

headers = {
    "apikey": key,
    "Authorization": f"Bearer {key}"
}

response = requests.get(f"{url}/rest/v1/profiles?select=*&limit=1", headers=headers)

print(f"Status: {response.status_code}")
print(f"Response: {response.text}")

if response.status_code == 200:
    print("✅ Connection successful!")
else:
    print("❌ Failed")

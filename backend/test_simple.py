from dotenv import load_dotenv
import os

load_dotenv()

try:
    from supabase import create_client, Client
    
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    
    print(f"URL: {url}")
    print(f"Key: {key[:20]}...")
    
    supabase: Client = create_client(url, key)
    
    response = supabase.table('profiles').select("*").execute()
    
    print("✅ Success!")
    print(f"Data: {response.data}")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()

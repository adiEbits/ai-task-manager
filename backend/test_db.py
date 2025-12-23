from supabase import create_client
from app.config import settings

# Test Supabase connection
try:
    supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    
    # Try to query profiles table
    response = supabase.table('profiles').select("*").limit(1).execute()
    
    print("✅ Supabase connection successful!")
    print(f"Response: {response}")
    print(f"\n📊 Database URL: {settings.DATABASE_URL[:50]}...")
    print(f"🔑 Supabase URL: {settings.SUPABASE_URL}")
    
except Exception as e:
    print(f"❌ Error connecting to Supabase: {e}")
    print("\n🔍 Troubleshooting:")
    print("1. Check if .env file exists and has correct values")
    print("2. Verify SUPABASE_URL is correct")
    print("3. Verify SUPABASE_KEY (anon public key) is correct")
    print("4. Make sure database tables are created in Supabase SQL Editor")

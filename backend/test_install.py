# Test all imports
try:
    import fastapi
    print("✅ FastAPI installed")
    
    import uvicorn
    print("✅ Uvicorn installed")
    
    from supabase import create_client
    print("✅ Supabase installed")
    
    import redis
    print("✅ Redis installed")
    
    import paho.mqtt.client as mqtt
    print("✅ MQTT installed")
    
    import anthropic
    print("✅ Anthropic installed")
    
    from sqlalchemy import create_engine
    print("✅ SQLAlchemy installed")
    
    print("\n🎉 All packages installed successfully!")
    
except ImportError as e:
    print(f"❌ Error: {e}")
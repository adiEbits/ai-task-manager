import httpx
from typing import Optional, Dict, Any, List
from app.config import settings
from app.utils.logger import logger, log_database

class DatabaseService:
    def __init__(self):
        self.base_url = settings.SUPABASE_URL
        self.headers = {
            "apikey": settings.SUPABASE_SERVICE_KEY,
            "Authorization": f"Bearer {settings.SUPABASE_SERVICE_KEY}",
            "Content-Type": "application/json"
        }
    
    async def query(
        self,
        table: str,
        select: str = "*",
        filters: Optional[Dict[str, Any]] = None,
        order_by: Optional[str] = None,
        limit: Optional[int] = None,
        offset: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """Query database table with filters"""
        try:
            url = f"{self.base_url}/rest/v1/{table}"
            params = {"select": select}
            
            if filters:
                for key, value in filters.items():
                    params[key] = f"eq.{value}"
            
            if order_by:
                params["order"] = order_by
            
            if limit:
                params["limit"] = limit
            
            if offset:
                params["offset"] = offset
            
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=self.headers, params=params)
                response.raise_for_status()
                
                log_database("QUERY", table, f"Filters: {filters}, Results: {len(response.json())}")
                return response.json()
                
        except Exception as e:
            logger.error(f"Database query failed: {table} | {str(e)}")
            raise
    
    async def insert(self, table: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Insert record into table"""
        try:
            url = f"{self.base_url}/rest/v1/{table}"
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    url,
                    headers={**self.headers, "Prefer": "return=representation"},
                    json=data
                )
                response.raise_for_status()
                
                result = response.json()
                log_database("INSERT", table, f"ID: {result[0].get('id') if result else 'N/A'}")
                return result[0] if result else {}
                
        except Exception as e:
            logger.error(f"Database insert failed: {table} | {str(e)}")
            raise
    
    async def update(
        self,
        table: str,
        filters: Dict[str, Any],
        data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Update record in table"""
        try:
            url = f"{self.base_url}/rest/v1/{table}"
            params = {"select": "*"}
            
            for key, value in filters.items():
                params[key] = f"eq.{value}"
            
            async with httpx.AsyncClient() as client:
                response = await client.patch(
                    url,
                    headers={**self.headers, "Prefer": "return=representation"},
                    json=data,
                    params=params
                )
                response.raise_for_status()
                
                result = response.json()
                log_database("UPDATE", table, f"Filters: {filters}, Updated: {len(result)}")
                return result[0] if result else {}
                
        except Exception as e:
            logger.error(f"Database update failed: {table} | {str(e)}")
            raise
    
    async def delete(self, table: str, filters: Dict[str, Any]) -> bool:
        """Delete record from table"""
        try:
            url = f"{self.base_url}/rest/v1/{table}"
            params = {}
            
            for key, value in filters.items():
                params[key] = f"eq.{value}"
            
            async with httpx.AsyncClient() as client:
                response = await client.delete(
                    url,
                    headers=self.headers,
                    params=params
                )
                response.raise_for_status()
                
                log_database("DELETE", table, f"Filters: {filters}")
                return True
                
        except Exception as e:
            logger.error(f"Database delete failed: {table} | {str(e)}")
            raise
    
    async def count(self, table: str, filters: Optional[Dict[str, Any]] = None) -> int:
        """Count records in table"""
        try:
            url = f"{self.base_url}/rest/v1/{table}"
            params = {"select": "count"}
            
            if filters:
                for key, value in filters.items():
                    params[key] = f"eq.{value}"
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    url,
                    headers={**self.headers, "Prefer": "count=exact"},
                    params=params
                )
                response.raise_for_status()
                
                count = int(response.headers.get("Content-Range", "0-0/0").split("/")[1])
                return count
                
        except Exception as e:
            logger.error(f"Database count failed: {table} | {str(e)}")
            raise

db_service = DatabaseService()
import asyncio
import json
from typing import Optional, Callable
import paho.mqtt.client as mqtt
from app.config import settings
from app.utils.logger import logger

class MQTTService:
    def __init__(self):
        self.client: Optional[mqtt.Client] = None
        self.connected = False
        self.topic_prefix = settings.MQTT_TOPIC_PREFIX
        
    def connect(self):
        """Connect to MQTT broker"""
        try:
            # Use CallbackAPIVersion for newer paho-mqtt
            self.client = mqtt.Client(
                callback_api_version=mqtt.CallbackAPIVersion.VERSION1,
                client_id=f"task-manager-backend-{id(self)}"
            )
            
            if settings.MQTT_USERNAME:
                self.client.username_pw_set(
                    settings.MQTT_USERNAME, 
                    settings.MQTT_PASSWORD
                )
            
            self.client.on_connect = self._on_connect
            self.client.on_disconnect = self._on_disconnect
            
            self.client.connect(settings.MQTT_BROKER, settings.MQTT_PORT, 60)
            self.client.loop_start()
            
            logger.info(f"MQTT client connecting to {settings.MQTT_BROKER}:{settings.MQTT_PORT}")
            
        except Exception as e:
            logger.error(f"Failed to connect to MQTT broker: {str(e)}")
    
    def _on_connect(self, client, userdata, flags, rc):
        """Callback when connected"""
        if rc == 0:
            self.connected = True
            logger.info("MQTT connected successfully")
        else:
            logger.error(f"MQTT connection failed with code: {rc}")
    
    def _on_disconnect(self, client, userdata, rc):
        """Callback when disconnected"""
        self.connected = False
        logger.warning(f"MQTT disconnected with code: {rc}")
    
    def publish_task_event(self, user_id: str, event_type: str, task_data: dict):
        """Publish task event to MQTT"""
        try:
            if not self.connected:
                logger.warning("MQTT not connected, skipping publish")
                return
            
            topic = f"{self.topic_prefix}/user/{user_id}/tasks"
            
            payload = {
                "event": event_type,  # created, updated, deleted
                "data": task_data,
                "timestamp": task_data.get("updated_at") or task_data.get("created_at")
            }
            
            result = self.client.publish(topic, json.dumps(payload), qos=1)
            
            if result.rc == mqtt.MQTT_ERR_SUCCESS:
                logger.info(f"Published {event_type} event for user {user_id}")
            else:
                logger.error(f"Failed to publish MQTT message: {result.rc}")
                
        except Exception as e:
            logger.error(f"MQTT publish error: {str(e)}")
    
    def disconnect(self):
        """Disconnect from MQTT broker"""
        if self.client:
            self.client.loop_stop()
            self.client.disconnect()
            logger.info("MQTT disconnected")

# Global MQTT service instance
mqtt_service = MQTTService()
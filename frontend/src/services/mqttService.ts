import mqtt, { MqttClient } from 'mqtt';
import type { Task } from '../types';

type MQTTEventType = 'created' | 'updated' | 'deleted';
type MQTTEventData = Task | { id: string };
type MQTTCallback = (event: MQTTEventType, data: MQTTEventData) => void;

class MQTTService {
  private client: MqttClient | null = null;
  private userId: string | null = null;
  private eventHandlers: MQTTCallback[] = [];

  connect(userId: string): void {
    if (this.client?.connected) {
      console.log('MQTT already connected');
      return;
    }

    this.userId = userId;
    const brokerUrl = import.meta.env.VITE_MQTT_BROKER_URL || 'ws://localhost:9001';

    try {
      this.client = mqtt.connect(brokerUrl, {
        clientId: `task-manager-${userId}-${Date.now()}`,
        clean: true,
        reconnectPeriod: 5000,
      });

      this.client.on('connect', () => {
        console.log('✅ MQTT Connected');
        if (this.userId) {
          this.client?.subscribe(`tasks/${this.userId}/#`, (err) => {
            if (err) {
              console.error('❌ MQTT subscription error:', err);
            } else {
              console.log('✅ MQTT subscribed to tasks');
            }
          });
        }
      });

      this.client.on('message', (topic: string, message: Buffer) => {
        try {
          const payload = JSON.parse(message.toString());
          const event = topic.split('/').pop() as MQTTEventType;
          
          this.eventHandlers.forEach((handler) => {
            handler(event, payload);
          });
        } catch (error) {
          console.error('❌ MQTT message parse error:', error);
        }
      });

      this.client.on('error', (error: Error) => {
        console.error('❌ MQTT error:', error);
      });

    } catch (error) {
      console.error('❌ MQTT connection error:', error);
    }
  }

  subscribe(callback: MQTTCallback): () => void {
    this.eventHandlers.push(callback);
    return () => {
      this.eventHandlers = this.eventHandlers.filter((h) => h !== callback);
    };
  }

  publish(event: MQTTEventType, data: MQTTEventData): void {
    if (!this.client?.connected || !this.userId) {
      console.warn('⚠️ MQTT not connected, cannot publish');
      return;
    }

    const topic = `tasks/${this.userId}/${event}`;
    this.client.publish(topic, JSON.stringify(data), { qos: 1 });
  }

  disconnect(): void {
    if (this.client?.connected) {
      this.client.end();
      console.log('👋 MQTT disconnected');
    }
  }

  isConnected(): boolean {
    return this.client?.connected || false;
  }
}

export const mqttService = new MQTTService();
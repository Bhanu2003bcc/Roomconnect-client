import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Conversation {
  id: string;
  listingId: string;
  ownerId: string;
  visitorId: string;
  createdAt: string;
  lastMessageAt?: string;
  listingTitle?: string;
  listingRent?: number;
  listingAddress?: string;
}

export interface Message {
  id?: string;
  conversationId: string;
  senderId: string;
  body: string;
  sentAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/chat';

  private ws: WebSocket | null = null;
  private connected = false;
  private subscriptions = new Map<string, (msg: any) => void>();
  private subCounter = 0;

  getConversations(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.apiUrl}/conversations`);
  }

  getMessages(conversationId: string, page = 0, size = 50): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/conversations/${conversationId}/messages`, {
      params: { page, size }
    });
  }

  startConversation(listingId: string): Observable<Conversation> {
    return this.http.post<Conversation>(`${this.apiUrl}/conversations`, null, {
      params: { listingId }
    });
  }

  /**
   * STOMP WebSocket client implementation using native WebSockets
   */
  connectWebSocket(token: string, onConnectCallback?: () => void): void {
    if (this.ws && this.connected) {
      if (onConnectCallback) onConnectCallback();
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    console.log('Connecting to WebSocket at:', wsUrl);

    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      // Send STOMP CONNECT frame
      const connectFrame = [
        'CONNECT',
        'accept-version:1.2',
        'host:' + window.location.hostname,
        'Authorization:Bearer ' + token,
        '',
        '\0'
      ].join('\n');
      this.ws?.send(connectFrame);
    };

    this.ws.onmessage = (event) => {
      const text = event.data as string;
      this.parseStompFrame(text, onConnectCallback);
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected.');
      this.connected = false;
      // auto reconnect logic
      setTimeout(() => this.connectWebSocket(token), 5000);
    };

    this.ws.onerror = (err) => {
      console.error('WebSocket connection error:', err);
    };
  }

  subscribeTopic(topic: string, callback: (msg: any) => void): string {
    const subId = `sub-${this.subCounter++}`;
    this.subscriptions.set(subId, callback);

    if (this.connected && this.ws) {
      this.sendSubscribeFrame(topic, subId);
    }
    return subId;
  }

  sendChatMessage(conversationId: string, body: string): void {
    if (!this.connected || !this.ws) {
      console.error('Cannot send message, WebSocket not connected');
      return;
    }

    const payload = JSON.stringify({ conversationId, body });
    const sendFrame = [
      'SEND',
      'destination:/app/chat/send',
      'content-type:application/json',
      'content-length:' + payload.length,
      '',
      payload,
      '\0'
    ].join('\n');

    this.ws.send(sendFrame);
  }

  private sendSubscribeFrame(topic: string, subId: string): void {
    const subFrame = [
      'SUBSCRIBE',
      'id:' + subId,
      'destination:' + topic,
      'ack:auto',
      '',
      '\0'
    ].join('\n');
    this.ws?.send(subFrame);
  }

  private parseStompFrame(raw: string, onConnectCallback?: () => void): void {
    const lines = raw.split('\n');
    const command = lines[0].trim();

    if (command === 'CONNECTED') {
      console.log('STOMP CONNECTED successfully');
      this.connected = true;
      if (onConnectCallback) onConnectCallback();

      // Re-subscribe to all active topics on reconnect
      this.subscriptions.forEach((callback, subId) => {
        // Here we map subId to its associated topic if needed, but for simplicity,
        // we'll assume conversations subscribe dynamically.
      });
    } else if (command === 'MESSAGE') {
      // Extract body (everything after the empty line)
      const emptyLineIndex = lines.indexOf('');
      if (emptyLineIndex !== -1) {
        const bodyText = lines.slice(emptyLineIndex + 1).join('\n').replace(/\0/g, '').trim();
        try {
          const jsonBody = JSON.parse(bodyText);
          // Find matching subscription callback
          // Stomp MESSAGE frame headers include 'subscription' matching sub ID
          const headers = this.parseHeaders(lines.slice(1, emptyLineIndex));
          const subId = headers['subscription'];
          const callback = this.subscriptions.get(subId);
          if (callback) {
            callback(jsonBody);
          } else {
            // fallback check: callback all if subscription is not tagged
            this.subscriptions.forEach(cb => cb(jsonBody));
          }
        } catch (e) {
          console.error('Error parsing STOMP message body:', e);
        }
      }
    }
  }

  private parseHeaders(headerLines: string[]): Record<string, string> {
    const headers: Record<string, string> = {};
    headerLines.forEach(line => {
      const parts = line.split(':');
      if (parts.length >= 2) {
        headers[parts[0].trim()] = parts.slice(1).join(':').trim();
      }
    });
    return headers;
  }
}

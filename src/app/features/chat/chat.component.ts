import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, Conversation, Message } from '../../core/services/chat.service';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chat-container">
      <div class="chat-card">
        <!-- Left Sidebar: Conversations list -->
        <aside class="conv-sidebar">
          <h3>Conversations</h3>
          <div class="conv-list">
            @for (c of conversations(); track c.id) {
              <div
                class="conv-item"
                [class.active]="selectedConversation()?.id === c.id"
                (click)="selectConversation(c)"
              >
                <div class="avatar">💬</div>
                <div class="info">
                  <span class="title">{{ c.listingTitle || 'Noida Room Chat' }}</span>
                  <span class="preview">Owner: {{ c.ownerId.slice(0, 8) }}...</span>
                </div>
              </div>
            } @empty {
              <div class="empty-state">No active chats. Start one from room detail sheets!</div>
            }
          </div>
        </aside>

        <!-- Right Content: Messages thread -->
        <main class="chat-main">
          @if (selectedConversation(); as activeConv) {
            <div class="chat-header">
              <div class="title-bar">
                <h4>{{ activeConv.listingTitle }}</h4>
                <p>📍 {{ activeConv.listingAddress }} • ₹{{ activeConv.listingRent }} / month</p>
              </div>
            </div>

            <div class="messages-wrapper">
              @for (msg of messages(); track msg.id) {
                <div class="message-row" [class.outgoing]="msg.senderId === currentUserId">
                  <div class="bubble">
                    <p class="body">{{ msg.body }}</p>
                    <span class="time">{{ msg.sentAt | date:'shortTime' }}</span>
                  </div>
                </div>
              } @empty {
                <div class="empty-messages">Send a message to start the conversation!</div>
              }
            </div>

            <form (ngSubmit)="sendMessage()" class="chat-input-bar">
              <input
                type="text"
                name="msgBody"
                [(ngModel)]="msgBody"
                placeholder="Type your message here..."
                required
                autocomplete="off"
                class="input-field"
              />
              <button type="submit" class="send-btn">Send ⚡</button>
            </form>
          } @else {
            <div class="welcome-chat">
              <span class="icon">💬</span>
              <h4>Select a Conversation</h4>
              <p>Pick a chat from the sidebar to coordinate room details, prices, and visits.</p>
            </div>
          }
        </main>
      </div>
    </div>
  `,
  styles: [`
    .chat-container {
      max-width: 1200px;
      margin: 2rem auto;
      padding: 0 1.5rem;
      height: calc(100vh - 180px);
    }
    .chat-card {
      background: rgba(255, 255, 255, 0.02);
      backdrop-filter: blur(15px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      height: 100%;
      display: grid;
      grid-template-columns: 280px 1fr;
      overflow: hidden;
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
    }
    @media (max-width: 768px) {
      .chat-card {
        grid-template-columns: 1fr;
      }
      .conv-sidebar {
        display: none; /* simple responsive fallback */
      }
    }
    /* Sidebar Styles */
    .conv-sidebar {
      background: rgba(0, 0, 0, 0.2);
      border-right: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      flex-direction: column;
    }
    .conv-sidebar h3 {
      color: #fff;
      margin: 0;
      font-size: 1.1rem;
      font-weight: 700;
      padding: 1.2rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    .conv-list {
      flex: 1;
      overflow-y: auto;
      padding: 0.5rem;
    }
    .conv-item {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      padding: 0.8rem;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-bottom: 0.3rem;
    }
    .conv-item:hover {
      background: rgba(255, 255, 255, 0.03);
    }
    .conv-item.active {
      background: rgba(0, 242, 254, 0.08);
      border-left: 3px solid #00f2fe;
    }
    .conv-item .avatar {
      font-size: 1.4rem;
      background: rgba(255, 255, 255, 0.05);
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .conv-item .info {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      overflow: hidden;
    }
    .conv-item .title {
      color: #fff;
      font-weight: 600;
      font-size: 0.85rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .conv-item .preview {
      color: rgba(255, 255, 255, 0.4);
      font-size: 0.75rem;
    }
    .empty-state {
      color: rgba(255, 255, 255, 0.4);
      font-size: 0.8rem;
      text-align: center;
      padding: 2rem 1rem;
    }

    /* Message Thread Styles */
    .chat-main {
      display: flex;
      flex-direction: column;
      background: rgba(18, 18, 24, 0.3);
      height: 100%;
    }
    .chat-header {
      background: rgba(0, 0, 0, 0.15);
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      padding: 1rem 1.5rem;
    }
    .title-bar h4 {
      color: #fff;
      margin: 0 0 0.2rem 0;
      font-size: 1.05rem;
      font-weight: 700;
    }
    .title-bar p {
      color: rgba(255, 255, 255, 0.5);
      margin: 0;
      font-size: 0.75rem;
    }
    .messages-wrapper {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .message-row {
      display: flex;
      justify-content: flex-start;
    }
    .message-row.outgoing {
      justify-content: flex-end;
    }
    .bubble {
      max-width: 60%;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 12px 12px 12px 2px;
      padding: 0.8rem 1rem;
      position: relative;
    }
    .message-row.outgoing .bubble {
      background: rgba(0, 242, 254, 0.1);
      border-color: rgba(0, 242, 254, 0.2);
      border-radius: 12px 12px 2px 12px;
    }
    .bubble .body {
      color: #fff;
      margin: 0;
      font-size: 0.9rem;
      line-height: 1.4;
      word-break: break-word;
    }
    .bubble .time {
      display: block;
      text-align: right;
      color: rgba(255, 255, 255, 0.35);
      font-size: 0.65rem;
      margin-top: 0.3rem;
      font-weight: 600;
    }
    .empty-messages {
      text-align: center;
      color: rgba(255, 255, 255, 0.3);
      font-size: 0.85rem;
      margin-top: 4rem;
    }
    .chat-input-bar {
      background: rgba(0, 0, 0, 0.2);
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      padding: 1rem 1.5rem;
      display: flex;
      gap: 0.8rem;
    }
    .chat-input-bar .input-field {
      flex: 1;
      background: #1a1a24;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      color: #fff;
      padding: 0.8rem;
      outline: none;
      font-size: 0.9rem;
    }
    .chat-input-bar .input-field:focus {
      border-color: #00f2fe;
    }
    .chat-input-bar .send-btn {
      background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
      color: #121218;
      border: 0;
      font-weight: 700;
      font-size: 0.9rem;
      padding: 0 1.5rem;
      border-radius: 8px;
      cursor: pointer;
    }
    .welcome-chat {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: 2rem;
      color: rgba(255, 255, 255, 0.4);
    }
    .welcome-chat .icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }
    .welcome-chat h4 {
      color: #fff;
      font-size: 1.1rem;
      margin: 0 0 0.5rem 0;
    }
    .welcome-chat p {
      font-size: 0.85rem;
      max-width: 320px;
      line-height: 1.5;
    }
  `]
})
export class ChatComponent implements OnInit, OnDestroy {
  private readonly chatService = inject(ChatService);
  private readonly authService = inject(AuthService);

  conversations = signal<Conversation[]>([]);
  messages = signal<Message[]>([]);
  selectedConversation = signal<Conversation | null>(null);
  currentUserId = '';
  msgBody = '';

  private stompSubId: string | null = null;

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.currentUserId = user.id;
      this.loadConversations();

      const token = typeof localStorage !== 'undefined' ? localStorage.getItem('access_token') : null;
      if (token) {
        // Connect STOMP WebSocket
        this.chatService.connectWebSocket(token, () => {
          console.log('STOMP connected client setup.');
        });
      }
    }
  }

  ngOnDestroy(): void {
    // Unsubscribe STOMP listener if active
    if (this.stompSubId) {
      // In advanced setup, we would clean up WS connection or subscription channel,
      // which our STOMP parser supports.
    }
  }

  loadConversations(): void {
    this.chatService.getConversations().subscribe({
      next: (res) => this.conversations.set(res),
      error: (err) => console.error('Failed to load conversations', err)
    });
  }

  selectConversation(conv: Conversation): void {
    this.selectedConversation.set(conv);
    this.loadMessages(conv.id);

    // Subscribe to STOMP WebSocket topic for this conversation
    const topic = '/topic/conversation/' + conv.id;
    this.stompSubId = this.chatService.subscribeTopic(topic, (msg: Message) => {
      // Append real-time message to active message list
      if (this.selectedConversation()?.id === msg.conversationId) {
        this.messages.update(msgs => [...msgs, msg]);
        // Auto scroll to bottom
        setTimeout(() => this.scrollToBottom(), 50);
      }
    });
  }

  loadMessages(convId: string): void {
    this.chatService.getMessages(convId, 0, 100).subscribe({
      next: (res) => {
        // Paged results sorted desc by date; reverse to show chronologically
        const content = res.content || [];
        this.messages.set([...content].reverse());
        setTimeout(() => this.scrollToBottom(), 50);
      },
      error: (err) => console.error('Failed to load messages', err)
    });
  }

  sendMessage(): void {
    const conv = this.selectedConversation();
    if (!conv || !this.msgBody.trim()) return;

    // Send via STOMP WebSocket
    this.chatService.sendChatMessage(conv.id, this.msgBody.trim());
    this.msgBody = '';
  }

  scrollToBottom(): void {
    const wrapper = document.querySelector('.messages-wrapper');
    if (wrapper) {
      wrapper.scrollTop = wrapper.scrollHeight;
    }
  }
}

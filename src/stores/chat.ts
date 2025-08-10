import { defineStore } from 'pinia';
import type { IContact, IIncomingWsPayload } from '../types';

const RAW_WS_URL = import.meta.env.VITE_WS_URL ?? 'ws://localhost:8181';
const WS_URL = String(RAW_WS_URL)
  .trim()
  .replace(/["';]+$/g, '')
  .replace(/\.$/, '');

// TODO use uuid from npm instead as alternative
function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const useChatStore = defineStore('chat', {
  state: () => ({
    contacts: new Map<string, IContact>(),
    selectedContactId: null as string | null,
    ws: null as WebSocket | null,
    wsConnected: false,
    reconnectAttempt: 0,
  }),
  getters: {
    sortedContacts(state): IContact[] {
      return Array.from(state.contacts.values()).sort((a, b) => b.lastAt - a.lastAt);
    },
    selectedContact(state): IContact | null {
      if (!state.selectedContactId) return null;
      return state.contacts.get(state.selectedContactId) ?? null;
    },
  },
  actions: {
    // --------- DEMO ДАННЫЕ ДЛЯ СТАРТА ----------
    seedDemo() {
      // пропускаем, если уже есть контакты
      if (this.contacts.size > 0) return;

      const now = Date.now();
      const anzhela = this._ensureContact('Anzhela, 29');
      const marina = this._ensureContact('Marina, 44');

      anzhela.messages.push(
        { id: uid(), from: 'them', text: "What's your name? 🥰", at: now - 1000 * 60 * 90 },
        { id: uid(), from: 'me', text: 'h?', at: now - 1000 * 60 * 85 },
        {
          id: uid(),
          from: 'them',
          text: 'What are you looking for here?😊',
          at: now - 1000 * 60 * 84,
        },
      );
      anzhela.lastMessage = anzhela.messages.at(-1)!.text;
      anzhela.lastAt = anzhela.messages.at(-1)!.at;
      anzhela.unread = 1;

      marina.messages.push({
        id: uid(),
        from: 'them',
        text: "Don't tell me you're afraid ;)",
        at: now - 1000 * 60 * 140,
      });
      marina.lastMessage = marina.messages.at(-1)!.text;
      marina.lastAt = marina.messages.at(-1)!.at;
      marina.unread = 0;

      this.contacts = new Map(this.contacts);
    },

    // --------- WS ----------
    connectWs() {
      if (this.ws) {
        try {
          this.ws.close();
        } catch {
          console.error('error in connect ws');
        }
        this.ws = null;
      }
      const ws = new WebSocket(WS_URL);
      this.ws = ws;

      ws.onopen = () => {
        this.wsConnected = true;
        this.reconnectAttempt = 0;
      };

      ws.onmessage = (ev: MessageEvent) => {
        try {
          const data: IIncomingWsPayload = JSON.parse(ev.data);
          const from = data?.message?.from?.trim();
          const text = data?.message?.message ?? '';
          if (!from) return;
          this._ingestIncoming(from, text);
        } catch {
          // ignore
        }
      };

      ws.onclose = () => {
        this.wsConnected = false;
        this._scheduleReconnect();
      };

      ws.onerror = () => {
        try {
          ws.close();
        } catch {
          console.error('error on closing ws connection');
        }
      };
    },

    _scheduleReconnect() {
      this.reconnectAttempt++;
      const delay = Math.min(15000, 500 * 2 ** (this.reconnectAttempt - 1));
      setTimeout(() => this.connectWs(), delay);
    },

    _ensureContact(name: string): IContact {
      const id = name;
      if (!this.contacts.has(id)) {
        this.contacts.set(id, {
          id,
          name,
          lastAt: 0,
          lastMessage: '',
          unread: 0,
          messages: [],
        });
      }
      this.contacts = new Map(this.contacts); // реактивный триггер
      return this.contacts.get(id)!;
    },

    _ingestIncoming(from: string, text: string) {
      const at = Date.now();
      const contact = this._ensureContact(from);
      contact.messages.push({ id: uid(), from: 'them', text, at });
      contact.lastAt = at;
      contact.lastMessage = text;
      if (this.selectedContactId !== contact.id) contact.unread += 1;
      this.contacts = new Map(this.contacts);
    },

    sendMessage(text: string) {
      const contact = this.selectedContact;
      if (!contact) return;
      const at = Date.now();
      contact.messages.push({ id: uid(), from: 'me', text, at });
      contact.lastAt = at;
      contact.lastMessage = text;
      this.contacts = new Map(this.contacts);
    },

    openChat(contactId: string) {
      this.selectedContactId = contactId;
      const contact = this.contacts.get(contactId);
      if (contact) {
        contact.unread = 0;
        this.contacts = new Map(this.contacts);
      }
    },

    backToContacts() {
      this.selectedContactId = null;
    },
  },
});

export type ISender = 'me' | 'them';

export interface IChatMessage {
  id: string;
  from: ISender;
  text: string;
  at: number; // timestamp
}

export interface IContact {
  id: string; // same as name for simplicity
  name: string;
  lastMessage: string;
  lastAt: number;
  unread: number;
  messages: IChatMessage[];
}

export interface IIncomingWsPayload {
  message: {
    from: string;
    message: string;
  };
}

export interface IScrollComponent {
  getScrollTarget(): Element;
  setScrollPosition(axis: 'vertical' | 'horizontal', position: number, duration?: number): void;
}

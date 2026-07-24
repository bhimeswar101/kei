export type EventPayload = unknown;

export type EventHandler<T = EventPayload> = (payload: T) => void | Promise<void>;

export type Unsubscribe = () => void;

export interface EventBusContract {
  on<T = EventPayload>(event: string, handler: EventHandler<T>): Unsubscribe;

  once<T = EventPayload>(event: string, handler: EventHandler<T>): Unsubscribe;

  emit<T = EventPayload>(event: string, payload: T): Promise<void>;

  off<T = EventPayload>(event: string, handler: EventHandler<T>): void;

  clear(event?: string): void;
}

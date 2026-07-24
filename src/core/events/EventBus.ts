import type {
  EventBusContract,
  EventHandler,
  EventPayload,
  Unsubscribe,
} from "./types";

export class EventBus implements EventBusContract {
  private readonly listeners = new Map<
    string,
    Set<EventHandler>
  >();

  on<T = EventPayload>(
    event: string,
    handler: EventHandler<T>,
  ): Unsubscribe {
    const handlers =
      this.listeners.get(event) ?? new Set<EventHandler>();

    handlers.add(handler as EventHandler);
    this.listeners.set(event, handlers);

    return () => {
      this.off(event, handler);
    };
  }

  once<T = EventPayload>(
    event: string,
    handler: EventHandler<T>,
  ): Unsubscribe {
    const wrapper: EventHandler<T> = async (payload) => {
      this.off(event, wrapper);
      await handler(payload);
    };

    return this.on(event, wrapper);
  }

  async emit<T = EventPayload>(
    event: string,
    payload: T,
  ): Promise<void> {
    const handlers = this.listeners.get(event);

    if (!handlers) {
      return;
    }

    const snapshot = [...handlers];

    await Promise.all(
      snapshot.map((handler) => handler(payload)),
    );
  }

  off<T = EventPayload>(
    event: string,
    handler: EventHandler<T>,
  ): void {
    const handlers = this.listeners.get(event);

    if (!handlers) {
      return;
    }

    handlers.delete(handler as EventHandler);

    if (handlers.size === 0) {
      this.listeners.delete(event);
    }
  }

  clear(event?: string): void {
    if (event) {
      this.listeners.delete(event);
      return;
    }

    this.listeners.clear();
  }
}

export const eventBus = new EventBus();
export interface EventPayload<T = unknown> {
  type: string;
  timestamp: number;
  data?: T;
}
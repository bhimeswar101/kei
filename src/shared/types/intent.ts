export interface Intent {
  id: string;
  type: string;
  confidence: number;
  metadata?: Record<string, unknown>;
}

export interface Plugin {
  id: string;
  name: string;
  version: string;

  initialize(): Promise<void>;
}
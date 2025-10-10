export interface MessageEnvelope<T = any> {
  id: string;
  timestamp: Date;
  payload: T;
  sender: 'main' | 'renderer';
}
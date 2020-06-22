export interface NodeSPHttpResponse<T> {
  ok: boolean;
  status: number;
  text: () => Promise<string>;
  json: () => Promise<T>;
}
import { NodeSPHttpResponse } from "../models";

export interface IMockSPHttpClient {
  init(): Promise<void>;
  get<T>(url: string, version: any, options?: any): Promise<NodeSPHttpResponse<T>>;
  post<T>(url: string, version: any, options?: any): Promise<NodeSPHttpResponse<T>>;
  dispose(): Promise<void>;
}
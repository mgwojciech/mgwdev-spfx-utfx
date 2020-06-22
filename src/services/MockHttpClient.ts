import { IMockSPHttpClient } from ".";
import { IMockResponse } from "./FileSPHttpClient";
import { NodeSPHttpResponse } from "../models";

export class MockHttpClient implements IMockSPHttpClient {
  public onRequestExecuted?: (mockResponse: IMockResponse) => void;

  // TODO: Kolejność clientów jest ważna, jest to inicijalizowane w fabryce
  protected mockHttpClients: IMockSPHttpClient[] = [];

  constructor(mockHttpClients: IMockSPHttpClient[]) { 
    this.mockHttpClients = mockHttpClients;
  }
  
  public async init(): Promise<void> {
    await Promise.all(this.mockHttpClients.map(client=>client.init()));
  }

  public async get<T>(url: string, version: any, options?: any): Promise<NodeSPHttpResponse<T>> {
    for (let client of this.mockHttpClients) {
      let response: NodeSPHttpResponse<T> = await client.get<T>(url, version, options);
      if (response.ok) {
        if (this.onRequestExecuted) {
          // TODO: dodać komentarz dlaczego
          this.onRequestExecuted({
            url: url,
            body: options ? options.body : null,
            response: await response.text()
          });
        }
        return response as NodeSPHttpResponse<T>;
      }
    }
  }

  public async post<T>(url: string, version: any, options?: any): Promise<NodeSPHttpResponse<T>> {
    for (let client of this.mockHttpClients) {
      let response: NodeSPHttpResponse<T> = await client.post(url, version, options);
      if (response.ok) {
        if (this.onRequestExecuted) {
          this.onRequestExecuted({
            url: url,
            body: options ? options.body : null,
            response: await response.text()
          });
        }
        return response;
      }
    }
  }

  public async dispose(): Promise<void> {
    await Promise.all(this.mockHttpClients.map(client=>client.dispose()));
  }
}
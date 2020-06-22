import { IMockSPHttpClient } from ".";
import { NodeSPHttpResponse } from "../models/NodeSPHttpResponse";
import * as fs from "fs";
export interface IMockResponse {
  url: string;
  body: string;
  response: string;
  requestId?: string;
}
export class FileSPHttpClient implements IMockSPHttpClient {
  /**
   * Mocked responses to be used by the client
   */
  protected Responses: IMockResponse[] = [];
  /**
   * The response returned in case no register response is found
   */
  public NotFoundResponse: NodeSPHttpResponse<any> = {
    status: 404,
    ok: false,
    json: () => { return Promise.resolve({ d: { message: "Not found" } }) },
    text: () => { return Promise.resolve("Not found") }
  };
  /**
   * 
   * @param FilePath path to the mock file (optional)
   * @param Responses list of mock responses (optional)
   * @param SaveFile optional flag. If true provided file with be created or overwritten with current Responses on dispose()
   */
  constructor(protected FilePath?: string, Responses?: IMockResponse[], public SaveFile: boolean = false) {
    this.Responses = Responses || [];
    this.dispose =  this.dispose.bind(this);
    this.saveFile =  this.saveFile.bind(this);
    this.init =  this.init.bind(this);
  }

  public async init(): Promise<void> {
    let self = this;
    if (this.FilePath) {
      return new Promise<void>((resolve, error) => {
        fs.readFile(self.FilePath, "utf8", (err, data) => {
          try {
            self.Responses = JSON.parse(data);
            resolve();
          }
          catch(err){
            //swallow read file exception
          }
        });
      });
    }
  }
  public get<T>(url: string, version: any, options?: any): Promise<NodeSPHttpResponse<T>> {
    let response = this.findResponse(url, version, options);
    if (!response) {
      return Promise.resolve(this.NotFoundResponse);
    }

    return Promise.resolve({
      status: 200,
      ok: true,
      json: () => { return Promise.resolve(JSON.parse(response)); },
      text: () => { return Promise.resolve(response); }
    });
  }
  public post<T>(url: string, version: any, options?: any): Promise<NodeSPHttpResponse<T>> {
    let response = this.findResponse(url, version, options);
    if (!response) {
      return Promise.resolve(this.NotFoundResponse);
    }

    return Promise.resolve({
      status: 200,
      ok: true,
      json: () => { return Promise.resolve(JSON.parse(response)); },
      text: () => { return Promise.resolve(response); }
    });
  }
  public async dispose(): Promise<void> {
    if (this.SaveFile) {
      return new Promise<void>((resolve, error) => {
        this.saveFile(()=>{
          resolve();
        });
      })
    }
  }
  private saveFile(callback){
    fs.writeFile(this.FilePath, JSON.stringify(this.Responses), callback);
  }
  /**
   * Adds response to known responses list
   * @param mockResponse the response to be added
   */
  public registerResponse(mockResponse: IMockResponse) {
    this.Responses.push(mockResponse);
  }
  protected findResponse(url: string, version: any, options?: any): string {
    let responses = this.Responses.filter(resp => resp.url === url);
    let response = responses[0];
    if(options && options.body){
      response = responses.filter(resp=>resp.body == options.body)[0];
    }
    if (response) {
      return response.response;
    }
    else {
      return null;
    }
  }
}
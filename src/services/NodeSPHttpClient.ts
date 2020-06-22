import * as spauth from 'node-sp-auth';
import { IAuthOptions, IAuthResponse } from "node-sp-auth";
import * as request from 'request-promise';
import { IMockSPHttpClient } from '.';
import { NodeSPHttpResponse } from '../models';

export class NodeSPHttpClient implements IMockSPHttpClient {
  protected credentails: IAuthOptions;

  protected siteUrl: string;
  protected authResponse: IAuthResponse;

  constructor(siteUrl: string, credentialOptions: IAuthOptions) {
    this.credentails = credentialOptions;
    this.siteUrl = siteUrl;
  }

  public async init(): Promise<void> {
    await this.getAuthenticationHeaders();
  }
  public async get<T>(url: string, version: any, options?: any): Promise<NodeSPHttpResponse<T>> {
    const authHeaders = await this.getAuthenticationHeaders();

    let requestOptions = options || {};
    requestOptions.headers = { ...requestOptions.headers, ...authHeaders };
    requestOptions.headers.accept = requestOptions.headers.accept || "application/json";

    const response = await request.get(url, requestOptions);

    return {
      status: response,
      ok: true,
      json: () => { return Promise.resolve(JSON.parse(response)); },
      text: () => { return Promise.resolve(response); }
    }
  }

  public async post<T>(url: string, version: any, options?: any): Promise<NodeSPHttpResponse<T>> {
    const authHeaders = await this.getAuthenticationHeaders();

    let requestOptions = options || {};
    requestOptions.headers = { ...requestOptions.headers, ...authHeaders };
    requestOptions.headers.accept = requestOptions.headers.accept || "application/json";
    requestOptions.headers['content-type'] = requestOptions.headers['content-type'] || "application/json";
    try {
      const response = await request.post(url, requestOptions);
      return {
        status: response,
        ok: true,
        json: () => { return Promise.resolve(JSON.parse(response)); },
        text: () => { return Promise.resolve(response); }
      }
    }
    catch (err) {
      throw err;
    }
  }

  /**
   * Method returns AuthenticationHeaders for current site collection.
   * @param siteUrl 
   * @param credentialsOptions 
   */
  protected async getAuthenticationHeaders() {
    if (this.authResponse) {
      return this.authResponse.headers;
    }
    let result: IAuthResponse = await spauth.getAuth(this.siteUrl, this.credentails);
    this.authResponse = result;

    return this.authResponse.headers;
  }
  public async dispose(): Promise<void> {
    return Promise.resolve();
  }
}
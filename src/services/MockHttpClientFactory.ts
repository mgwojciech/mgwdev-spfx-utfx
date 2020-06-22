import { MockHttpClient } from "./MockHttpClient";
import { IMockSPHttpClient, FileSPHttpClient, NodeSPHttpClient } from ".";
import { IAuthOptions } from "node-sp-auth";
import { TestConfiguration } from "../utilities";
import { IEnvironmentConfiguration } from "../models/IEnvironmentConfiguration";


export class MockHttpClientFactory {
  public getHttpClient(testConfig: TestConfiguration, filePath: string, sitesWithAuth: { siteUrl: string, credentialOptions: IAuthOptions }[]): IMockSPHttpClient {
    const spClients: IMockSPHttpClient[] = [];
    const fileClient: FileSPHttpClient = new FileSPHttpClient(filePath, null, testConfig === TestConfiguration.integrationWithFileGeneration);

    spClients.push(fileClient);
    if (testConfig === TestConfiguration.isolated) {
      return new MockHttpClient(spClients);
    }

    for (let site of sitesWithAuth) {
      spClients.push(new NodeSPHttpClient(site.siteUrl, site.credentialOptions));
    }
    const result = new MockHttpClient(spClients);
    result.onRequestExecuted = (mockResponse) => {
      fileClient.registerResponse(mockResponse);
    }
    return result;
  }

  protected getHttpClientFromConfig(environmentConfiguration: IEnvironmentConfiguration,
    responseFilePath: string) {
    let mockHttpClient = this.getHttpClient(environmentConfiguration.runConfiguration,
      responseFilePath, [{
        siteUrl: environmentConfiguration.siteUrl,
        credentialOptions: environmentConfiguration.authenticationConfiguration
      }]);

    return mockHttpClient;
  }

  public setupContextFromConfig(environmentConfiguration: IEnvironmentConfiguration,
    responseFilePath: string) {
    let mockHttpClient = this.getHttpClientFromConfig(environmentConfiguration, responseFilePath);
    return this.setupContext(environmentConfiguration.siteUrl, mockHttpClient);
  }

  public setupContext(siteUrl: string, spHttpClient: IMockSPHttpClient) {
    const mockedSPContext = {
      pageContext: {
        web: {
          absoluteUrl: siteUrl
        }
      },
      spHttpClient: spHttpClient
    }
    return mockedSPContext;
  }
}
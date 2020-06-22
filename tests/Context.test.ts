/// <reference types="jest" />

import { assert } from "chai";
import { IAuthOptions } from "node-sp-auth/lib/src/auth/IAuthOptions";
import { TestConfiguration,MockHttpClientFactory } from "./../src/index";

const environmentConfiguration: { authenticationConfiguration: IAuthOptions, siteUrl: string, runConfiguration: TestConfiguration } 
= require("./utfx.json");
jest.mock("@microsoft/sp-http", () => {
    return {
        SPHttpClient: {
            configurations: {
                v1: 1
            }
        }
    }
});
let context;
describe("Test UTFX", () => {
    beforeAll(() => {
        let mockHttpClientFactory = new MockHttpClientFactory();
        environmentConfiguration.runConfiguration = TestConfiguration.isolated;
        context = mockHttpClientFactory.setupContextFromConfig(environmentConfiguration, "./tests/responses/Web.json");
        return context.spHttpClient.init();
    });
    test("get web title", async () => {
        let response = await context.spHttpClient.get("https://mwdevvalo.sharepoint.com/sites/tea-point/_api/web?$select=Title");
        let result = await response.json();
        assert.equal(result.Title,"Tea Point - English");
    });
    afterAll(async () => {
        let disposed = await context.spHttpClient.dispose();
        console.log(disposed);
    });
});
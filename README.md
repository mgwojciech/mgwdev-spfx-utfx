# mgwdev-spfx-utfx
Mocking helper for SPFx

# Installation

npm install mgwdev-spfx-utfx --save-dev

# Simpliest setup

Here is the simpliest possible test You can write.
Of course You can inject context anywhere You will need web part or extension context.


```
/// <reference types="jest" />

import { assert } from "chai";
import { MockHttpClientFactory, TestConfiguration, IMockSPHttpClient } from "mgwdev-spfx-utfx";

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
        context = mockHttpClientFactory.setupContextFromConfig({
            authenticationConfiguration: {
              username: "admin@<tenant_name>.onmicrosoft.com",
              password: "<password>", 
              online: true
            },
            siteUrl : "https://<tenant_name>.sharepoint.com",
            runConfiguration: TestConfiguration.integrationWithFileGeneration
        }, "./tests/responses/Web.json");
        return context.spHttpClient.init();
    });
    test("getWebInfo (absolute)", async () => {
        let response = await context.spHttpClient.get("https://<tenant_name>.sharepoint.com/sites/tea-point/_api/web?$select=Title");
        let result = await response.json();
        assert.equal(result.Title, "Tea Point - English");
    });
    test("getWebInfo (relative)", async () => {
        let response = await context.spHttpClient.get("/sites/tea-point/_api/web?$select=Title");
        let result = await response.json();
        assert.equal(result.Title, "Tea Point - English");
    });
    afterAll(async() => {
        await context.spHttpClient.dispose();
    });
});
```

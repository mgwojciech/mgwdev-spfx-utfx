import { TestConfiguration } from "../utilities/TestConfiguration";
import { IAuthOptions } from "node-sp-auth/lib/src/auth/IAuthOptions";

export interface IEnvironmentConfiguration {
    authenticationConfiguration: IAuthOptions;
    siteUrl: string;
    runConfiguration: TestConfiguration;
}
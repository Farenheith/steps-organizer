import { BaseAppContainer, ISettings } from "base-ddd";
import "reflect-metadata";
export declare class AppContainer extends BaseAppContainer<ISettings> {
    constructor();
    registerDomainServices(): void;
    registerApplications(): void;
}

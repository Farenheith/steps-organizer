import { BaseAppContainer, ISettings } from "base-ddd";
export declare class AppContainer extends BaseAppContainer<ISettings> {
    constructor();
    registerDomainServices(): void;
    registerApplications(): void;
}

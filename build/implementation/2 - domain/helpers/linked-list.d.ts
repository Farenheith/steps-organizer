import { IStepChain } from "../../../interfaces/2 - domain/models/step-chain.interface";
export declare class LinkedList {
    length: number;
    firstNode?: INode<IStepChain>;
    lastNode?: INode<IStepChain>;
    reference: {
        [id: string]: IStepChain | undefined;
    };
    push(item: IStepChain): void;
    pop(): IStepChain | undefined;
    get(id: string): IStepChain | undefined;
}
interface INode<IStep> {
    readonly item: IStep;
    previous?: INode<IStep>;
    next?: INode<IStep>;
}
export {};

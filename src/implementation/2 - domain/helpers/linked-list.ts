import { IStepChain } from "../../../interfaces/2 - domain/models/step-chain.interface";

export class LinkedList {
    length = 0;
    firstNode?: INode<IStepChain>;
    lastNode?: INode<IStepChain>;
    reference: { [id:string]: IStepChain | undefined } = {};

    push(item: IStepChain) {
        this.length++;
        const previous = this.lastNode;
        this.lastNode = { item, previous };
        if (previous) {
            previous.next = this.lastNode;
        } else if (!this.firstNode) {
            this.firstNode = this.lastNode;
        }
        this.reference[item.step.id] = item;
    }

    pop() {
        const node = this.lastNode;
        if (node) {
            this.lastNode = node.previous;
            this.length--;
            if (this.length == 0) {
                this.firstNode = undefined;
            }
            return node.item;
        }
    }

    get(id: string): IStepChain | undefined {
        return this.reference[id];
    }
}

interface INode<IStep> {
    readonly item:IStep;
    previous?:INode<IStep>;
    next?:INode<IStep>;
}
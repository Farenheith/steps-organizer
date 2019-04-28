"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class LinkedList {
    constructor() {
        this.length = 0;
        this.reference = {};
    }
    push(item) {
        this.length++;
        const previous = this.lastNode;
        this.lastNode = { item, previous };
        if (previous) {
            previous.next = this.lastNode;
        }
        else if (!this.firstNode) {
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
    get(id) {
        return this.reference[id];
    }
}
exports.LinkedList = LinkedList;

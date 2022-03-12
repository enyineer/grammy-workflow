import { Composer, Context } from 'grammy';
import { WorkflowFlavor } from './workflowEngine';

export type MaybePromise<T> = Promise<T> | T;

export class Step<C extends Context & WorkflowFlavor> extends Composer<C> {
    private _stepName: string;
    private _onEntryHandler: (ctx: C) => MaybePromise<any>;

    constructor(stepName: string) {
        super();
        this._stepName = stepName;
        this._onEntryHandler = () => {}
    }

    get stepName(): string {
        return this._stepName;
    }

    set onEntry(handler: (ctx: C) => MaybePromise<any>) {
        this._onEntryHandler = handler;
    }

    get onEntry(): (ctx: C) => MaybePromise<any> {
        return this._onEntryHandler;
    }
}

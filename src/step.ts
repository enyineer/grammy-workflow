import { Composer, Context } from 'grammy';
import { WorkflowFlavor } from './workflowEngine';

export type SimpleHandler = (ctx: Context & WorkflowFlavor) => Promise<unknown> | unknown;

export class Step<C extends Context & WorkflowFlavor> extends Composer<C> {
    private _stepName: string;
    private _onEntryHandler: SimpleHandler;

    constructor(stepName: string) {
        super();
        this._stepName = stepName;
        this._onEntryHandler = () => {}
    }

    get stepName(): string {
        return this._stepName;
    }

    set onEntry(handler: SimpleHandler) {
        this._onEntryHandler = handler;
    }

    get onEntry(): SimpleHandler {
        return this._onEntryHandler;
    }
}

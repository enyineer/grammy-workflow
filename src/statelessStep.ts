import { Composer, Context } from 'grammy';
import { WorkflowFlavor } from './workflowEngine';

export class StatelessStep<C extends Context & WorkflowFlavor> extends Composer<C> {
    private _stepName: string;

    constructor(stepName: string) {
        super();
        this._stepName = stepName;
    }

    get stepName(): string {
        return this._stepName;
    }
}

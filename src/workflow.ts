import { Context } from 'grammy'
import { Step } from './step';
import { StatefulStep } from './statefulStep'
import { WorkflowFlavor } from './workflowEngine';

export abstract class Workflow<C extends Context & WorkflowFlavor, T> {
    private registeredSteps: Map<string, Step<C>>;
    private _workflowName: string;
    private initialData: T;

    constructor(workflowName: string, initialData: T) {
        this.registeredSteps = new Map();
        this._workflowName = workflowName;
        this.initialData = initialData;
    }

    registerStep(step: Step<C> | StatefulStep<C, T>) {
        if (this.registeredSteps.has(step.stepName)) {
            throw new Error(`Can not define multiple steps with the same name: ${step.stepName}`);
        }
        this.registeredSteps.set(step.stepName, step);
    }

    async getCurrentStep(ctx: C): Promise<Step<C>> {
        const session = await ctx.session;
        const currentStep = session.grammyWorkflow.currentStep;

        if (currentStep === null) {
            return new Step("unknown");
        }

        const step = this.registeredSteps.get(currentStep);

        if (step === undefined) {
            return new Step("unknown");
        }

        // Check whether workflowData has been initialized for this specific session
        await this.setupWorkflowData(ctx);

        return step;
    }

    get workflowName(): string {
        return this._workflowName;
    }

    private async setupWorkflowData(ctx: C): Promise<void> {
        const session = await ctx.session;
        const workflowData = session.grammyWorkflow.workflowData;
        const dataFromCurrentWorkflow = workflowData.get(this._workflowName);

        if (dataFromCurrentWorkflow === undefined) {
            session.grammyWorkflow.workflowData.set(this._workflowName, this.initialData);
        }
    }
}

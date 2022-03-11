import { Composer, Context } from 'grammy'
import { Step } from './step'
import { WorkflowFlavour } from './workflowEngine';

export class Workflow<C extends Context & WorkflowFlavour, T> {
    private registeredSteps: Map<string, Step<C>>;
    private _workflowName: string;
    private initialData: T;

    constructor(workflowName: string, initialData: T) {
        this.registeredSteps = new Map();
        this._workflowName = workflowName;
        this.initialData = initialData;
    }

    registerStep(step: Step<C>) {
        if (this.registeredSteps.has(step.stepName)) {
            throw new Error(`Can not define multiple steps with the same name: ${step.stepName}`);
        }
        this.registeredSteps.set(step.stepName, step);
    }

    async getCurrentStep(ctx: C): Promise<Composer<C>> {
        const session = await ctx.session;
        const currentStep = session.grammyWorkflow.currentStep;

        if (currentStep === null) {
            return new Composer();
        }

        const step = this.registeredSteps.get(currentStep);

        if (step === undefined) {
            return new Composer();
        }

        // Check whether workflowData has been initialized for this specific session
        await this.setupWorkflowData(ctx);

        return step;
    }

    static async getWorkflowData<C extends Context & WorkflowFlavour, T>(ctx: C): Promise<T | null> {
        const session = await ctx.session;
        const currentWorkflow = session.grammyWorkflow.currentWorkflow;

        if (currentWorkflow === null) {
            return null;
        }

        return session.grammyWorkflow.workflowData.get(currentWorkflow);
    }

    static async setWorkflowData<C extends Context & WorkflowFlavour, T>(ctx: C, data: T): Promise<void> {
        const session = await ctx.session;
        const currentWorkflow = session.grammyWorkflow.currentWorkflow;

        if (currentWorkflow === null) {
            return;
        }

        session.grammyWorkflow.workflowData.set(currentWorkflow, data);
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

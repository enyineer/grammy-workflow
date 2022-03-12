import { Composer, Context, LazySessionFlavor, MiddlewareFn, MiddlewareObj } from 'grammy';
import { Step } from './step';
import { Workflow } from './workflow';

type WorkflowSession = {
    grammyWorkflow: {
        currentWorkflow: string | null;
        currentStep: string | null;
        workflowData: { [key: string]: any }
    }
}

export type WorkflowFlavor = LazySessionFlavor<WorkflowSession>;

export class WorkflowEngine<C extends Context & WorkflowFlavor> implements MiddlewareObj<C> {
    private registeredWorkflows: Map<string, Workflow<C, any>>;
    private static _instance: WorkflowEngine<any>;

    private constructor() {
        this.registeredWorkflows = new Map();
    }

    static getInstance<C extends Context & WorkflowFlavor>(): WorkflowEngine<C> {
        if (this._instance === undefined) {
            this._instance = new WorkflowEngine<C>();
        }
        return this._instance;
    }

    registerWorkflow(workflow: Workflow<C, any>) {
        if (this.registeredWorkflows.has(workflow.workflowName)) {
            throw new Error(`Can not define multiple workflows with the same name: ${workflow.workflowName}`);
        }
        this.registeredWorkflows.set(workflow.workflowName, workflow);

    }

    static async next<C extends Context & WorkflowFlavor>(ctx: C, workflowName: string, stepName: string) {
        const session = await ctx.session;

        if (session.grammyWorkflow === undefined) {
            await WorkflowEngine.setupWorkflowSession<C>(ctx);
        }

        session.grammyWorkflow.currentStep = stepName;
        session.grammyWorkflow.currentWorkflow = workflowName;

        const step = await this._instance.getCurrentStep(ctx);
        await step.onEntry(ctx);
    }

    // Switches to the step in the current workflow
    static async nextInCurrentWorkflow<C extends Context & WorkflowFlavor>(ctx: C, stepName: string) {
        const currentWorkflow = await WorkflowEngine.getCurrentWorkflowName(ctx);

        if (currentWorkflow === null) {
            throw new Error(`The current workflow is not set. Can not navigate to ${stepName}`);
        }

        return this.next(ctx, currentWorkflow, stepName);
    }

    static async end<C extends Context & WorkflowFlavor>(ctx: C) {
        const session = await ctx.session;

        if (session.grammyWorkflow === undefined) {
            await WorkflowEngine.setupWorkflowSession<C>(ctx);
        }

        const currentWorkflow = session.grammyWorkflow.currentWorkflow;

        if (currentWorkflow !== null) {
            delete session.grammyWorkflow.workflowData[currentWorkflow];
        }
        session.grammyWorkflow.currentStep = null;
        session.grammyWorkflow.currentWorkflow = null;
    }

    static async getCurrentWorkflowName<C extends Context & WorkflowFlavor>(ctx: C): Promise<string | null> {
        const session = await ctx.session;
        return session.grammyWorkflow.currentWorkflow;
    }

    static async getCurrentStepName<C extends Context & WorkflowFlavor>(ctx: C): Promise<string | null> {
        const session = await ctx.session;
        return session.grammyWorkflow.currentStep;
    }

    middleware(): MiddlewareFn<C> {
        return new Composer<C>()
            .lazy(async (ctx) => {
                const session = await ctx.session;

                if (session.grammyWorkflow === undefined) {
                    await WorkflowEngine.setupWorkflowSession<C>(ctx);
                }

                return await this.getCurrentStep(ctx);
            })
            .middleware()
    }

    private static async setupWorkflowSession<C extends Context & WorkflowFlavor>(ctx: C) {
        const session = await ctx.session;
        session.grammyWorkflow = {
            currentStep: null,
            currentWorkflow: null,
            workflowData: {}
        }
    }

    private async getCurrentStep(ctx: C): Promise<Step<C>> {
        const currentWorkflow = await WorkflowEngine.getCurrentWorkflowName(ctx);

        if (currentWorkflow === null) {
            return new Step("unknown");
        }

        const workflow = this.registeredWorkflows.get(currentWorkflow);

        if (workflow === undefined) {
            return new Step("unknown");
        }

        return workflow.getCurrentStep(ctx);
    }
}

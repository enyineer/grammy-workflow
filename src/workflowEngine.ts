import { Composer, Context, LazySessionFlavor, MiddlewareFn, MiddlewareObj } from 'grammy';
import { Workflow } from './workflow';

type WorkflowSession = {
    grammyWorkflow: {
        currentWorkflow: string | null;
        currentStep: string | null;
        workflowData: Map<string, any>
    }
}

export type WorkflowFlavor = LazySessionFlavor<WorkflowSession>;

export class WorkflowEngine<C extends Context & WorkflowFlavor> implements MiddlewareObj<C> {
    private registeredWorkflows: Map<string, Workflow<C, any>>;

    constructor() {
        this.registeredWorkflows = new Map();
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
    }

    static async end<C extends Context & WorkflowFlavor>(ctx: C) {
        const session = await ctx.session;
        session.grammyWorkflow.currentStep = null;
        session.grammyWorkflow.currentWorkflow = null;
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
            workflowData: new Map()
        }
    }

    private async getCurrentStep(ctx: C): Promise<Composer<C>> {
        const session = await ctx.session;
        const currentWorkflow = session.grammyWorkflow.currentWorkflow;

        if (currentWorkflow === null) {
            return new Composer();
        }

        const workflow = this.registeredWorkflows.get(currentWorkflow);

        if (workflow === undefined) {
            return new Composer();
        }

        return workflow.getCurrentStep(ctx);
    }
}

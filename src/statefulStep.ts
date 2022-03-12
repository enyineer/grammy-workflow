import { Context } from 'grammy';
import { Step } from './step';
import { WorkflowFlavor } from './workflowEngine';

export abstract class StatefulStep<C extends Context & WorkflowFlavor, T> extends Step<C> {
    protected async getWorkflowData(ctx: C): Promise<T> {
        const session = await ctx.session;
        const currentWorkflow = session.grammyWorkflow.currentWorkflow;

        if (currentWorkflow === null) {
            throw new Error("Tried getting workflowData while no currentWorkflow is defined.");
        }

        return session.grammyWorkflow.workflowData.get(currentWorkflow);
    }

    protected async setWorkflowData(ctx: C, data: T): Promise<void> {
        const session = await ctx.session;
        const currentWorkflow = session.grammyWorkflow.currentWorkflow;

        if (currentWorkflow === null) {
            throw new Error("Tried setting workflowData while no currentWorkflow is defined.");
        }

        session.grammyWorkflow.workflowData.set(currentWorkflow, data);
    }
}

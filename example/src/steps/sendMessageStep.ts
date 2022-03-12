import { StatelessStep, WorkflowEngine } from '@enyineer/grammy-workflow';
import { Filter } from 'grammy';
import { MyContext } from '../example';
import { ExampleWorkflow } from '../workflows/exampleWorkflow';
import { AskQuestionStep } from './askQuestion';

export class SendMessageStep extends StatelessStep<MyContext> {
    // We recommend that you always define a public static Constant for your Step name so that you can
    // reference it from the steps when jumping between steps.
    static readonly STEP_NAME = "SendMessage";

    constructor() {
        super(SendMessageStep.STEP_NAME);
        this.setup();
    }

    setup() {
        this.on("message", this.messageHandler);
    }

    private messageHandler = async (ctx: Filter<MyContext, "message">) => {
        await ctx.reply("Please send me a message that I'll echo to you!");
        await WorkflowEngine.next(ctx, ExampleWorkflow.WORKFLOW_NAME, AskQuestionStep.STEP_NAME);
    }
}

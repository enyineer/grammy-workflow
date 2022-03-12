import { StatefulStep, WorkflowEngine } from '@enyineer/grammy-workflow';
import { Filter, Keyboard } from 'grammy';
import { MyContext } from '../example';
import { ExampleWorkflow } from '../workflows/exampleWorkflow';
import { EchoTextStep } from './echoText';

// Define the data that is needed in this step
export type AskQuestionStepData = {
    text: string;
}

// Make sure to get a generic here that extends your steps needed data
// This helps you to keep your types safe
export class AskQuestionStep<T extends AskQuestionStepData> extends StatefulStep<MyContext, T> {
    // We recommend that you always define a public static Constant for your Step name so that you can
    // reference it from the steps when jumping between steps.
    static readonly STEP_NAME = "AskQuestion";

    constructor() {
        super(AskQuestionStep.STEP_NAME);
        this.setup();
    }

    setup() {
        // You can define entry steps that are called as soon WorkflowEngine.next(...) sets
        // this as the next step!
        this.onEntry = this.onEntryHandler;
        // Define an update type you'd like to listen for
        this.on("message:text", this.messageHandler);
        // You can even define multiple different update types in one Step!
        this.on("message:location", this.locationHandler);
    }

    private onEntryHandler = async (ctx: MyContext) => {
        await ctx.reply("Please send me a message that I'll echo to you!");
    }

    private messageHandler = async (ctx: Filter<MyContext, "message:text">) => {
        const workflowData = await this.getWorkflowData(ctx);

        workflowData.text = ctx.message.text;

        await this.setWorkflowData(ctx, workflowData);

        const keyboard = new Keyboard().text("yes").text("no").build();
        await ctx.reply("Are you sure you want this text to be echoed?", { reply_markup: { keyboard }});

        await WorkflowEngine.next(ctx, ExampleWorkflow.WORKFLOW_NAME, EchoTextStep.STEP_NAME);
    }

    private locationHandler = async (ctx: Filter<MyContext, "message:location">) => {
        await ctx.reply("Sorry, I can not echo locations :-( Please send me a text message!");
        // If we don't call WorkflowEngine.end(...) or WorkflowEngine.next(...) we stay inside
        // the current workflow and step for the next update.
    }
}

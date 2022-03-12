import { StatefulStep, WorkflowEngine } from '@enyineer/grammy-workflow';
import { Filter } from 'grammy';
import { MyContext } from '../example';

// Define the data that is needed in this step
type StepData = {
    text: string;
}

// We set any as WorkflowData type here because we don't access any data in this step
export class EchoTextStep<T extends StepData> extends StatefulStep<MyContext, T> {
    // We recommend that you always define a public static Constant for your Step name so that you can
    // reference it from the steps when jumping between steps.
    static readonly STEP_NAME = "EchoText";

    constructor() {
        super(EchoTextStep.STEP_NAME);
        this.setup();
    }

    setup() {
        this.on("message:text", this.messageHandler);
    }

    private messageHandler = async (ctx: Filter<MyContext, "message:text">) => {
        if (ctx.message.text === "yes") {
            const workflowData = await this.getWorkflowData(ctx);
            await ctx.reply(`You said: ${ workflowData.text }`, { reply_markup: { remove_keyboard: true } });
            WorkflowEngine.end(ctx);
        } else if (ctx.message.text === "no") {
            await ctx.reply("Okay, see you next time!", { reply_markup: { remove_keyboard: true } });
            WorkflowEngine.end(ctx);
        } else {
            await ctx.reply("I couldn't recognize your answer. Please use the keyboard.");
            // If we don't call WorkflowEngine.end(...) or WorkflowEngine.next(...) we stay inside
            // the current workflow and step for the next update.
        }
    }
}

import { Bot, Context, lazySession, LazySessionFlavor } from 'grammy';
import { WorkflowEngine, WorkflowFlavour } from '@enyineer/grammy-workflow';
import 'dotenv/config'
import { ExampleWorkflow } from './workflows/exampleWorkflow';
import { SendMessageStep } from './steps/sendMessageStep';

// Define session data here that you can use inside your steps aside from the workflowData
interface SessionData {}

export type MyContext = Context & LazySessionFlavor<SessionData> & WorkflowFlavour;

if (process.env.BOT_TOKEN === undefined) {
    throw new Error("Could not find a .env file with BOT_TOKEN being set. Please make sure the file exists.");
}

const bot = new Bot<MyContext>(process.env.BOT_TOKEN);

function initial(): SessionData {
    return { };
}

bot.use(lazySession({ initial }));

// Make sure to always define the commands before adding the workflowEngine to your bot
// If you don't do that, the update will not fall through to the workflowEngine
bot.command("echo", async (ctx, next) => {
    // Always await when using WorkflowEngine.next(...)
    await WorkflowEngine.next(ctx, ExampleWorkflow.WORKFLOW_NAME, SendMessageStep.STEP_NAME);
    // Let this update fall through to the WorkflowEngine
    next();
});

const workflowEngine = WorkflowEngine.getInstance();
const exampleWorkflow = new ExampleWorkflow();
workflowEngine.registerWorkflow(exampleWorkflow);

bot.use(workflowEngine);



bot.start()
    .catch((err) => console.log(`Could not start bot: ${err}`));

console.log("Bot started!");

import { Workflow } from '@enyineer/grammy-workflow';
import { MyContext } from '../example';
import { AskQuestionStep, AskQuestionStepData } from '../steps/askQuestion';
import { EchoTextStep, EchoTextStepData } from '../steps/echoText';

// Define the data that is needed inside all of the steps you register for this workflow
export type ExampleWorkflowData = AskQuestionStepData & EchoTextStepData;

export class ExampleWorkflow extends Workflow<MyContext, ExampleWorkflowData> {
    // We recommend that you always define a public static Constant for your Workflow name so that you can
    // reference it from the steps when jumping between workflows.
    static readonly WORKFLOW_NAME = "ExampleWorkflow";

    constructor() {
        super(ExampleWorkflow.WORKFLOW_NAME, {
            text: ""
        });
        this.setup();
    }

    private setup() {
        this.registerStep(new AskQuestionStep<ExampleWorkflowData>());
        this.registerStep(new EchoTextStep<ExampleWorkflowData>());
    }
}

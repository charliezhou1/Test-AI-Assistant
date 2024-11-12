import {
  BedrockRuntimeClient,
  ConverseCommandInput,
  ConverseCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import type { Handler } from "aws-lambda";

// Constants
const AWS_REGION = process.env.AWS_REGION;
const MODEL_ID = process.env.MODEL_ID;
const TABLE_NAME = "ChatHistory-ggi5w66zvjculhv43hpubsfv2m-NONE";

// Configuration
const INFERENCE_CONFIG = {
  maxTokens: 1000,
  temperature: 0.5,
};

const USE_CASE_PROMPTS = {
  "use-case-1": {
    title: "user story Testing Assistant",
    prompt: `Generate user story, derive test specifications and automate them`,
  },
  "use-case-2": {
    title: "API Testing Assistant",
    prompt: `Generate API test cases and automate them`,
  },
  "use-case-3": {
    title: "Testing Strategy Assistant",
    prompt: `Generate test strategy and plan`,
  },
  "use-case-4": {
    title: "Functional Testing Assistant",
    prompt: `Generate functional test cases and analyze Jira user stories`,
  },
};

// Initialize Bedrock Runtime Client
const client = new BedrockRuntimeClient({ region: AWS_REGION });

// Initialize the DynamoDB client
const dbClient = new DynamoDBClient({ region: AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dbClient);

export const handler: Handler = async (event) => {
  const { conversation, useCase } = event.arguments;
  const useCaseConfig =
    USE_CASE_PROMPTS[useCase as keyof typeof USE_CASE_PROMPTS];
  if (!useCaseConfig) {
    throw new Error(`Invalid use case: ${useCase}`);
  }

  const SYSTEM_PROMPT = `
  To ${useCaseConfig.prompt}, greet users warmly and inquire about their test requirements. Based on their input, generate test cases and strategies specific to their requirements.
`;

  const input = {
    modelId: MODEL_ID,
    system: [{ text: SYSTEM_PROMPT }],
    messages: conversation,
    inferenceConfig: INFERENCE_CONFIG,
  } as ConverseCommandInput;

  try {
    // Invoke Bedrock
    const command = new ConverseCommand(input);
    const response = await client.send(command);

    if (!response.output?.message) {
      throw new Error("No message in the response output");
    }

    // Save to DynamoDB
    const item = {
      id: new Date().getTime().toString(),
      timestamp: new Date().toISOString(),
      useCase: useCase,
      question: conversation[conversation.length - 1].content[0].text,
      response: JSON.stringify(response.output.message.content),
      username: event.identity.username,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      __typename: "ChatHistory",
      owner: event.identity.username + "::" + event.identity.username,
    };

    const putCommand = new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    });

    await docClient.send(putCommand);

    return JSON.stringify(response.output.message);
  } catch (error) {
    console.error("Error in chat handler:", error);
    throw error; // Re-throw to be handled by AWS Lambda
  }
};

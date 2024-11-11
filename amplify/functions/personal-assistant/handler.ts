import {
  BedrockRuntimeClient,
  ConverseCommandInput,
  ConverseCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument, PutCommand } from "@aws-sdk/lib-dynamodb";
import type { Handler } from "aws-lambda";

// Constants
const AWS_REGION = process.env.AWS_REGION;
const MODEL_ID = process.env.MODEL_ID;
const TABLE_NAME = process.env.TABLE_NAME;


// Configuration
const INFERENCE_CONFIG = {
  maxTokens: 1000,
  temperature: 0.5,
};

// Initialize Bedrock Runtime Client
const client = new BedrockRuntimeClient({ region: AWS_REGION });
const ddbClient = new DynamoDBClient({ region: AWS_REGION });
const ddbDocClient = DynamoDBDocument.from(ddbClient);

export const handler: Handler = async (event) => {
  const { conversation, useCase, username } = event.arguments;
  const timestamp = new Date().toISOString()

  const SYSTEM_PROMPT = `
  To create a ${useCase} experience, greet users warmly and inquire about their test requirements. Based on their input, generate test cases and strategies specific to their requirements.
`;

  const input = {
    modelId: MODEL_ID,
    system: [{ text: SYSTEM_PROMPT }],
    messages: conversation,
    inferenceConfig: INFERENCE_CONFIG,
  } as ConverseCommandInput;


  try {
    const lastUserMessage = conversation[conversation.length - 1]?.content || '';
    // Invoke Bedrock
    const command = new ConverseCommand(input);
    const response = await client.send(command);

    if (!response.output?.message) {
      throw new Error("No message in the response output");
    }
    try {
      const chatHistoryItem = {
        id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        username,
        question: lastUserMessage,
        response: response.output.message,
        useCase,
        timestamp,
        createdAt: timestamp,
        updatedAt: timestamp,
        owner: username 
      };

      await ddbDocClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: chatHistoryItem
        })
      );

      console.log('Chat history saved:', chatHistoryItem.id);
    } catch (saveError) {
      console.error("Error saving chat history:", saveError);
      
    }

    return JSON.stringify(response.output.message);
  } catch (error) {
    console.error("Error in chat handler:", error);
    throw error; 
  }
};

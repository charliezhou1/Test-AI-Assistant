import { defineFunction } from "@aws-amplify/backend";

export const MODEL_ID = "anthropic.claude-3-haiku-20240307-v1:0";
export const TABLE_NAME = "ChatHistory-ggi5w66zvjculhv43hpubsfv2m-NONE";

export const personalAssistantFunction = defineFunction({
  entry: "./handler.ts",
  environment: {
    MODEL_ID,
  },
  timeoutSeconds: 30,
  runtime: 20,
});

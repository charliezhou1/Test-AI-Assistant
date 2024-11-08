import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource";
import { data } from "./data/resource";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { personalAssistantFunction, MODEL_ID } from "./functions/personal-assistant/resource";

export const backend = defineBackend({
  auth,
  data,
  personalAssistantFunction,
});

// Add DynamoDB putItem permission to below function policy
backend.personalAssistantFunction.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ["dynamodb:PutItem"],
    resources: [
      `arn:aws:dynamodb:*:*:table/*`,
    ],
  })
);
backend.personalAssistantFunction.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ["bedrock:InvokeModel"],
    resources: [
      `arn:aws:bedrock:*::foundation-model/${MODEL_ID}`,
    ],
    
  })
);
import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { personalAssistantFunction } from "../functions/personal-assistant/resource";

const schema = a.schema({
  chat: a
    .query()
    .arguments({
      conversation: a.json().required(),
      useCase: a.string().required(),
      username: a.string().required(),
    })
    .returns(a.string())
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function(personalAssistantFunction)),

  ChatHistory: a
    .model({
      id: a.id(),
      username: a.string().required(),
      question: a.string().required(),
      response: a.string().required(),
      useCase: a.string().required(),
      timestamp: a.datetime().required(),
    })
    .authorization((allow) => [
      allow.owner().to(["create", "read", "update", "delete"]),
      allow.authenticated().to(["create"]),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});

import React, { useState, useEffect } from "react";
import { getCurrentUser } from "@aws-amplify/auth";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument, QueryCommand } from "@aws-sdk/lib-dynamodb";

type Nullable<T> = T | null;

interface ChatHistoryEntry {
  id: Nullable<string>;
  timestamp: string;
  useCase: string;
  question: string;
  response: string;
  username: string;
  createdAt: string;
}

// Use the same table name as in your handler
const TABLE_NAME =
  process.env.TABLE_NAME || "ChatHistory-ggi5w66zvjculhv43hpubsfv2m-NONE";

// Initialize DynamoDB client
const ddbClient = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-west-2",
});
const ddbDocClient = DynamoDBDocument.from(ddbClient);

const ChatHistory: React.FC = () => {
  const [chatHistory, setChatHistory] = useState<ChatHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { username } = await getCurrentUser();

      const params = {
        TableName: TABLE_NAME,
        KeyConditionExpression: "username = :username",
        ExpressionAttributeValues: {
          ":username": username,
        },
      };

      const response = await ddbDocClient.send(new QueryCommand(params));

      if (response.Items) {
        const sortedData = [...response.Items] as ChatHistoryEntry[];
        sortedData.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setChatHistory(sortedData);
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch chat history"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getUseCaseDescription = (useCaseId: string) => {
    const useCaseMap: Record<string, string> = {
      "use-case-1":
        "Generate user story, derive test specifications and automate them",
      "use-case-2": "Generate API test cases and automate them",
      "use-case-3": "Generate test strategy and plan",
      "use-case-4":
        "Generate functional test cases and analyze Jira user stories",
    };
    return useCaseMap[useCaseId] || useCaseId;
  };

  const handleRefresh = () => {
    fetchHistory();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Chat History</h2>
        <button
          onClick={handleRefresh}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Refresh
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">Error: {error}</div>
        ) : chatHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No chat history found
          </div>
        ) : (
          <div className="space-y-2 p-2">
            {chatHistory.map((chat) => (
              <div
                key={chat.id}
                className="p-3 hover:bg-gray-100 rounded cursor-pointer"
                onClick={() => console.log("Chat clicked:", chat)}
              >
                <div className="text-sm text-gray-500">
                  {new Date(chat.timestamp).toLocaleString()}
                </div>
                <div className="font-medium truncate">{chat.question}</div>
                <div className="text-sm text-gray-600 truncate">
                  {getUseCaseDescription(chat.useCase)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHistory;

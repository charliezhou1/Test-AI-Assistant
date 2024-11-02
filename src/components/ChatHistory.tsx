import React, { useState, useEffect } from "react";
import { View } from "@aws-amplify/ui-react";
import { amplifyClient } from "@/app/amplify-utils";
import { getCurrentUser } from "@aws-amplify/auth";

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

const ChatHistory: React.FC = () => {
  const [chatHistory, setChatHistory] = useState<ChatHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { username } = await getCurrentUser();

        setIsLoading(true);
        const { data, errors } = await amplifyClient.models.ChatHistory.list({
          filter: {
            username: {
              eq: username,
            },
          },
        });

        if (!errors && data) {
          const sortedData = [...data].sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          setChatHistory(sortedData);
        } else {
          throw new Error(
            errors?.[0]?.message || "Failed to fetch chat history"
          );
        }
      } catch (error) {
        console.error("Error fetching chat history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

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

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold">Chat History</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
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

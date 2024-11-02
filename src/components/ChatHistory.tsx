import React, { useState, useEffect } from "react";
import { View } from "@aws-amplify/ui-react";
import { amplifyClient } from "@/app/amplify-utils";

type Nullable<T> = T | null;
interface ChatHistoryEntry {
  id: Nullable<string>;
  timestamp: string;
  useCase: string;
  question: string;
  response: string;
  username: string;
}

const ChatHistory: React.FC = () => {
  const [chatHistory, setChatHistory] = useState<ChatHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchChatHistory();
  }, []);

  const fetchChatHistory = async () => {
    try {
      setIsLoading(true);
      const { data, errors } = await amplifyClient.models.ChatHistory.list();

      if (!errors && data) {
        setChatHistory(data);
      } else {
        throw new Error(errors?.[0]?.message || "Failed to fetch chat history");
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
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

  return (
    <View className="w-full p-4">
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Chat History</h2>
        </div>
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : chatHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No chat history found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-2 text-left font-semibold">Time</th>
                    <th className="px-4 py-2 text-left font-semibold">
                      Use Case
                    </th>
                    <th className="px-4 py-2 text-left font-semibold">
                      Question
                    </th>
                    <th className="px-4 py-2 text-left font-semibold">
                      Response
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {chatHistory.map((chat) => (
                    <tr
                      key={chat.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-4 py-2 whitespace-nowrap">
                        {formatTimestamp(chat.timestamp)}
                      </td>
                      <td className="px-4 py-2">
                        {getUseCaseDescription(chat.useCase)}
                      </td>
                      <td className="px-4 py-2">
                        <div className="max-w-xs overflow-hidden text-ellipsis">
                          {chat.question}
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <div className="max-w-xs overflow-hidden text-ellipsis">
                          {chat.response}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </View>
  );
};

export default ChatHistory;

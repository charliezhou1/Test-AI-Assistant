import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { Button, Placeholder, View } from "@aws-amplify/ui-react";
import { amplifyClient } from "@/app/amplify-utils";
import UseCase from "./UseCase";
import ChatHistory from "./ChatHistory";
import { getCurrentUser } from "@aws-amplify/auth";

// Types
type Message = {
  role: string;
  content: { text: string }[];
};

type Conversation = Message[];

export function Chat() {
  const [conversation, setConversation] = useState<Conversation>([]);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUseCase, setSelectedUseCase] = useState("use-case-1");
  const [username, setUsername] = useState<string>("");
  const [showHistory, setShowHistory] = useState(false);
  const messagesRef = useRef(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { username: currentUsername } = await getCurrentUser();
        setUsername(currentUsername);
      } catch (err) {
        console.error("Error getting current user:", err);
        setError("Error getting user information");
      }
    };

    fetchUser();
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setError("");
    setInputValue(e.target.value);
  };

  const handleUseCaseSelect = (useCase: string) => {
    setSelectedUseCase(useCase);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      const message = setNewUserMessage();
      fetchChatResponse(message, selectedUseCase);
    }
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  const fetchChatResponse = async (message: Message, useCase: string) => {
    setInputValue("");
    setIsLoading(true);
    try {
      const { data, errors } = await amplifyClient.queries.chat({
        conversation: JSON.stringify([...conversation, message]),
        useCase,
        username,
      });

      if (!errors && data) {
        setConversation((prevConversation) => [
          ...prevConversation,
          JSON.parse(data),
        ]);
      } else {
        throw new Error(errors?.[0].message || "An unknown error occurred.");
      }
    } catch (err) {
      setError((err as Error).message);
      console.error("Error fetching chat response:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const setNewUserMessage = (): Message => {
    const newUserMessage: Message = {
      role: "user",
      content: [{ text: inputValue }],
    };
    setConversation((prevConversation) => [
      ...prevConversation,
      newUserMessage,
    ]);
    setInputValue("");
    return newUserMessage;
  };

  return (
    <View
      className="flex"
      style={{
        height: "calc(100vh - 120px)", // Much larger subtraction
        overflow: "hidden",
      }}
    >
      {/* Left sidebar */}
      <View
        className={`${
          showHistory ? "w-64" : "w-16"
        } border-r border-gray-200 flex flex-col`}
      >
        <Button
          onClick={toggleHistory}
          className="m-2 bg-gray-100 hover:bg-gray-200 rounded"
        >
          {showHistory ? "← Hide" : "→ Show"}
        </Button>
        {showHistory && <ChatHistory />}
      </View>

      {/* Main chat area with fixed heights */}
      <View
        className="flex-1 grid grid-rows-[auto_1fr_auto]"
        style={{ maxHeight: "calc(100vh - 120px)" }}
      >
        {/* Top UseCase section */}
        <View className="p-2 border-b border-gray-200">
          <UseCase
            selectedUseCase={selectedUseCase}
            onSelect={handleUseCaseSelect}
          />
        </View>

        {/* Messages section */}
        <View className="overflow-y-auto px-4 py-2" ref={messagesRef}>
          {conversation.map((msg, index) => (
            <View key={index} className={`message ${msg.role} mb-4`}>
              {msg.content[0].text}
            </View>
          ))}
          {isLoading && (
            <View className="loader-container mb-4">
              <p>Thinking...</p>
              <Placeholder size="large" />
            </View>
          )}
        </View>

        {/* Bottom input section */}
        <View className="border-t border-gray-200">
          <form onSubmit={handleSubmit} className="flex gap-2 p-2">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Type your message..."
              name="prompt"
              className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button
              type="submit"
              disabled={isLoading}
              className="px-4 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              Send
            </Button>
          </form>
          {error && (
            <View className="text-red-500 text-sm px-2 pb-2">{error}</View>
          )}
        </View>
      </View>
    </View>
  );
}

export default Chat;

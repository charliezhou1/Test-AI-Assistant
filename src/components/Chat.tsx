import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { Button, Placeholder, View } from "@aws-amplify/ui-react";
import { amplifyClient } from "@/app/amplify-utils";
import UseCase from "./UseCase";

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
  const [selectedUseCase, setSelectedUseCase] = useState("API Test Case");
  const messagesRef = useRef(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setError("");
    setInputValue(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputValue.trim()) {
      const message = setNewUserMessage();
      fetchChatResponse(message, selectedUseCase);
    }
  };

  const fetchChatResponse = async (message: Message, useCase: string) => {
    setInputValue("");
    setIsLoading(true);

    try {
      const { data, errors } = await amplifyClient.queries.chat({
        conversation: JSON.stringify([...conversation, message]),
        useCase, 
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
    <View className="chat-container">
      <UseCase
        selectedUseCase={selectedUseCase}
        onSelect={setSelectedUseCase} // Update selected use case
      />

      <View className="messages" ref={messagesRef}>
        {conversation.map((msg, index) => (
          <View key={index} className={`message ${msg.role}`}>
            {msg.content[0].text}
          </View>
        ))}
      </View>

      {isLoading && (
        <View className="loader-container">
          <p>Thinking...</p>
          <Placeholder size="large" />
        </View>
      )}

      <form onSubmit={handleSubmit} className="input-container">
        <input
          name="prompt"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Type your message..."
          className="input"
          type="text"
        />
        <Button
          type="submit"
          className="send-button"
          isDisabled={isLoading}
          loadingText="Sending..."
        >
          Send
        </Button>
      </form>

      {error ? <View className="error-message">{error}</View> : null}
    </View>
  );
}

export default Chat;

"use client";
import { Button, View, Heading, Flex, Text } from "@aws-amplify/ui-react";
import Chat from "@/components/Chat";
import { useAuthenticator } from "@aws-amplify/ui-react";
import logo from "./logo.png";
import Image from "next/image";

export default function Home() {
  const { user, signOut } = useAuthenticator();

  return (
    <View className="app-container">
      <Flex
        as="header"
        justifyContent="space-between"
        alignItems="center"
        padding="1rem"
      >
        <Image src={logo} alt="Logo" width={100} height={32} />

        <Heading level={3}>Testing Personal Assistant</Heading>
        <Flex alignItems="center" gap="1rem">
        <Text fontWeight="bold">{user?.signInDetails?.loginId}</Text>
        <Button onClick={signOut} size="small" variation="destructive">
          Sign out
        </Button>
        </Flex>
      </Flex>
      <View as="main">
        <Chat />
      </View>
    </View>
  );
}

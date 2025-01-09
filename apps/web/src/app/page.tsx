"use client";

import { trpc } from "@/trpc";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import dynamic from "next/dynamic";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

export default function UserPage() {
  const { data: channels, refetch } = trpc.channels.list.useQuery();
  const { mutateAsync: createChannel } = trpc.channels.create.useMutation();
  const { mutateAsync: isTyping } = trpc.channels.isTyping.useMutation();
  const { data } = trpc.channels.randomNumber.useSubscription();
  const { theme } = useTheme();
  const { data: user } = trpc.users.me.useQuery();
  const { address } = useAccount();

  const [currentChannel, setCurrentChannel] = useState<string | null>(null);
  const [channelName, setChannelName] = useState("");

  const { data: whoIsTyping, reset } =
    trpc.channels.whoIsTyping.useSubscription({
      channelId: currentChannel ?? "",
    });

  const handleCreateChannel = async () => {
    if (!channelName.trim()) return;
    await createChannel({ name: channelName });
    setChannelName("");
    refetch();
    reset();
  };

  const handleIsTyping = async () => {
    if (!currentChannel) return;
    await isTyping({
      channelId: currentChannel,
      typing: true,
      username: "User", // Should come from auth context
    });
  };

  const handlePickChannel = (channelId: string) => {
    setCurrentChannel(channelId);
  };

  const currentChannelName = channels?.find(
    (c) => c.id === currentChannel
  )?.name;
  const typingUsers = whoIsTyping ?? [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <h1>{data}</h1>
      <div className="flex flex-col gap-2">
        <p>{user?.name}</p>
        <p>{address}</p>
      </div>
      <ConnectButton label="Connect Wallet 🔗" />
      <div className="p-6 max-w-2xl mx-auto">
        <Card className="border-border">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Chat Channels</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Input
                type="text"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                placeholder="Enter channel name"
                minLength={2}
                className="bg-background border-input"
              />
              <Button
                onClick={handleCreateChannel}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Create Channel
              </Button>
            </div>
          </CardContent>
        </Card>
        <div className="space-y-4 mt-6">
          {currentChannel && (
            <Card className="border-border">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">
                  Currently in: {currentChannelName}
                </p>
                {typingUsers.length > 0 && (
                  <p className="text-sm italic text-muted-foreground">
                    {typingUsers.join(", ")}{" "}
                    {typingUsers.length === 1 ? "is" : "are"} typing...
                  </p>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleIsTyping}
                  className="mt-2 bg-secondary text-secondary-foreground hover:bg-secondary/80"
                >
                  Indicate Typing
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-3">
            {channels?.map((channel) => (
              <Button
                key={channel.id}
                onClick={() => handlePickChannel(channel.id)}
                variant={currentChannel === channel.id ? "default" : "outline"}
                className={cn(
                  "w-full justify-start h-auto py-4",
                  currentChannel === channel.id
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-background border-border hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {channel.name}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

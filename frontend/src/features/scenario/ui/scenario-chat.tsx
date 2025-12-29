"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { scenarioApi } from "@/shared/api/scenario";
import type { Scenario, ScenarioMessage } from "@/shared/types/api";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

export function ScenarioChat({ scenarioId }: { scenarioId: number }) {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);

  const { data: scenario, refetch: refetchScenario, isLoading: isLoadingScenario } = useQuery({
    queryKey: ["scenario", scenarioId],
    queryFn: () => scenarioApi.getById(scenarioId),
    refetchInterval: isWaitingForResponse ? 2000 : false, // Poll every 2 seconds while waiting
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (msg: string) => {
      console.log("Mutation function called with:", { scenarioId, msg });
      try {
        const result = await scenarioApi.addMessage(scenarioId, msg);
        console.log("API call successful:", result);
        return result;
      } catch (error) {
        console.error("API call failed:", error);
        throw error;
      }
    },
    onSuccess: async (data) => {
      console.log("Mutation success:", data);
      setMessage("");
      setError(null);
      
      // Check if AI response is already included
      const lastMessage = data.messages[data.messages.length - 1];
      if (lastMessage.role === "assistant") {
        // AI response is already in the data, update cache and stop polling
        queryClient.setQueryData(["scenario", scenarioId], data);
        setIsWaitingForResponse(false);
      } else {
        // AI response is not yet ready, start polling
        setIsWaitingForResponse(true);
        queryClient.setQueryData(["scenario", scenarioId], data);
      }
      
      queryClient.invalidateQueries({ queryKey: ["scenarios"] });
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setError(errorMessage);
      setTimeout(() => setError(null), 5000); // Clear error after 5 seconds
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    
    // Check if we're still waiting for AI response
    if (scenario && scenario.messages.length > 0) {
      const lastMessage = scenario.messages[scenario.messages.length - 1];
      if (lastMessage.role === "assistant") {
        setIsWaitingForResponse(false);
      }
    }
  }, [scenario?.messages]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    
    console.log("handleSubmit called", {
      trimmedMessage,
      isPending: sendMessageMutation.isPending,
      scenario: !!scenario,
      completed: scenario?.completed,
      scenarioId,
    });
    
    if (!trimmedMessage) {
      console.log("Message is empty, not sending");
      return;
    }
    
    if (sendMessageMutation.isPending) {
      console.log("Mutation is pending, not sending");
      return;
    }
    
    if (!scenario) {
      console.log("Scenario not loaded, not sending");
      return;
    }
    
    if (scenario.completed !== 0) {
      console.log("Scenario is completed, not sending", { completed: scenario.completed });
      return;
    }
    
    console.log("Calling mutation with message:", trimmedMessage);
    sendMessageMutation.mutate(trimmedMessage);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const trimmedMessage = message.trim();
      if (trimmedMessage && !sendMessageMutation.isPending && scenario && scenario.completed === 0) {
        sendMessageMutation.mutate(trimmedMessage);
      }
    }
  };

  if (!scenario) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col h-[600px] border rounded-lg">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {scenario.messages.map((msg: ScenarioMessage, idx: number) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              <p className="text-sm">{msg.content}</p>
            </div>
          </div>
        ))}
        {/* Show typing indicator if waiting for AI response */}
        {isWaitingForResponse && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg p-3 bg-muted">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {scenario.completed !== 0 ? (
        <div className="p-4 bg-green-50 border-t">
          <p className="text-sm text-green-700 text-center">
            Scenario completed! Great job!
          </p>
        </div>
      ) : (
        <div className="border-t">
          {error && (
            <div className="p-2 bg-destructive/10 text-destructive text-sm text-center">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="p-4 flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sendMessageMutation.isPending}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={sendMessageMutation.isPending || !message.trim()}
            >
              {sendMessageMutation.isPending ? "Sending..." : "Send"}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}


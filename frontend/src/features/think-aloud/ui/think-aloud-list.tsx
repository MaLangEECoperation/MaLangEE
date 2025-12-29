"use client";

import { useQuery } from "@tanstack/react-query";
import { thinkAloudApi } from "@/shared/api/think-aloud";

export function ThinkAloudList() {
  const { data: thinkAlouds, isLoading } = useQuery({
    queryKey: ["think-alouds"],
    queryFn: () => thinkAloudApi.getAll(),
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!thinkAlouds || thinkAlouds.length === 0) {
    return <p className="text-muted-foreground">No think alouds yet.</p>;
  }

  return (
    <div className="space-y-4">
      {thinkAlouds.map((thinkAloud) => (
        <div key={thinkAloud.id} className="p-4 border rounded-lg">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-medium">{thinkAloud.topic}</p>
            <span className="text-xs text-muted-foreground">
              {new Date(thinkAloud.created_at).toLocaleDateString()}
            </span>
          </div>
          <p className="text-sm mb-2">{thinkAloud.content}</p>
          {thinkAloud.word_count && thinkAloud.ttr && (
            <div className="text-xs text-muted-foreground mb-2">
              Words: {thinkAloud.word_count} | TTR: {thinkAloud.ttr.toFixed(2)} | Connectors:{" "}
              {thinkAloud.logical_connectors_count || 0}
            </div>
          )}
          {thinkAloud.feedback && (
            <div className="text-sm bg-muted p-2 rounded mt-2">{thinkAloud.feedback}</div>
          )}
        </div>
      ))}
    </div>
  );
}



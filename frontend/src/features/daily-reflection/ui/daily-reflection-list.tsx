"use client";

import { useQuery } from "@tanstack/react-query";
import { dailyReflectionApi } from "@/shared/api/daily-reflection";
import type { DailyReflection } from "@/shared/types/api";

export function DailyReflectionList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["daily-reflections"],
    queryFn: () => dailyReflectionApi.getAll(),
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-destructive">Error loading reflections</div>;
  }

  if (!data || data.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No reflections yet</div>;
  }

  return (
    <div className="space-y-4">
      {data.map((reflection: DailyReflection) => (
        <div key={reflection.id} className="p-4 border border-border rounded-lg">
          <div className="mb-2">
            <p className="text-sm text-muted-foreground">
              {new Date(reflection.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="mb-3">
            <p className="text-sm font-medium mb-1">Your reflection:</p>
            <p className="text-sm">{reflection.content}</p>
          </div>
          {reflection.feedback && (
            <div className="pt-3 border-t border-border">
              <p className="text-sm font-medium mb-1">AI Feedback:</p>
              <div className="text-sm whitespace-pre-wrap">{reflection.feedback}</div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}


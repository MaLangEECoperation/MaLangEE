"use client";

import { useQuery } from "@tanstack/react-query";
import { quickResponseApi } from "@/shared/api/quick-response";

export function QuickResponseList() {
  const { data: responses, isLoading } = useQuery({
    queryKey: ["quick-responses"],
    queryFn: () => quickResponseApi.getAll(),
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!responses || responses.length === 0) {
    return <p className="text-muted-foreground">No responses yet.</p>;
  }

  return (
    <div className="space-y-4">
      {responses.map((response) => (
        <div key={response.id} className="p-4 border rounded-lg">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-medium">{response.scenario}</p>
            <span className="text-xs text-muted-foreground">
              {new Date(response.created_at).toLocaleDateString()}
            </span>
          </div>
          <p className="text-sm mb-2">Your response: {response.user_response}</p>
          {response.grammar_score && response.naturalness_score && (
            <div className="text-xs text-muted-foreground mb-2">
              Grammar: {response.grammar_score.toFixed(1)} | Naturalness:{" "}
              {response.naturalness_score.toFixed(1)} | Time: {response.response_time.toFixed(1)}s
            </div>
          )}
          {response.feedback && (
            <div className="text-sm bg-muted p-2 rounded mt-2">{response.feedback}</div>
          )}
        </div>
      ))}
    </div>
  );
}



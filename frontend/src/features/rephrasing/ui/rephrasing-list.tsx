"use client";

import { useQuery } from "@tanstack/react-query";
import { rephrasingApi } from "@/shared/api/rephrasing";

export function RephrasingList() {
  const { data: rephrasings, isLoading } = useQuery({
    queryKey: ["rephrasings"],
    queryFn: () => rephrasingApi.getAll(),
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!rephrasings || rephrasings.length === 0) {
    return <p className="text-muted-foreground">No rephrasings yet.</p>;
  }

  return (
    <div className="space-y-4">
      {rephrasings.map((rephrasing) => (
        <div key={rephrasing.id} className="p-4 border rounded-lg">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-medium">Original: {rephrasing.original_sentence}</p>
            <span className="text-xs text-muted-foreground">
              {new Date(rephrasing.created_at).toLocaleDateString()}
            </span>
          </div>
          <p className="text-sm mb-2">Your rephrasing: {rephrasing.user_rephrasing}</p>
          {rephrasing.similarity_score && rephrasing.diversity_score && (
            <div className="text-xs text-muted-foreground mb-2">
              Similarity: {rephrasing.similarity_score.toFixed(1)} | Diversity:{" "}
              {rephrasing.diversity_score.toFixed(1)}
            </div>
          )}
          {rephrasing.feedback && (
            <div className="text-sm bg-muted p-2 rounded mt-2">{rephrasing.feedback}</div>
          )}
        </div>
      ))}
    </div>
  );
}



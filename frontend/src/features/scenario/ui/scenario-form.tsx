"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { scenarioApi } from "@/shared/api/scenario";
import type { ScenarioType } from "@/shared/types/api";
import { Button } from "@/shared/ui/button";
import { ScenarioChat } from "./scenario-chat";

export function ScenarioForm() {
  const queryClient = useQueryClient();
  const [selectedScenario, setSelectedScenario] = useState<number | null>(null);

  const { data: types } = useQuery({
    queryKey: ["scenario-types"],
    queryFn: () => scenarioApi.getTypes(),
  });

  const createMutation = useMutation({
    mutationFn: (scenarioType: string) =>
      scenarioApi.create({ scenario_type: scenarioType }),
    onSuccess: (data) => {
      setSelectedScenario(data.id);
      queryClient.invalidateQueries({ queryKey: ["scenarios"] });
    },
  });

  if (selectedScenario) {
    return (
      <div className="space-y-4">
        <Button
          onClick={() => {
            setSelectedScenario(null);
            createMutation.reset();
          }}
          variant="outline"
        >
          Start New Scenario
        </Button>
        <ScenarioChat scenarioId={selectedScenario} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Choose a Scenario</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {types?.map((type) => (
          <Button
            key={type.type}
            onClick={() => createMutation.mutate(type.type)}
            disabled={createMutation.isPending}
            variant="outline"
            className="h-auto p-4 flex flex-col items-start"
          >
            <span className="font-semibold">{type.name_kr}</span>
            <span className="text-sm text-muted-foreground">{type.name}</span>
          </Button>
        ))}
      </div>
      {createMutation.isError && (
        <p className="text-sm text-destructive">
          {createMutation.error instanceof Error
            ? createMutation.error.message
            : "Failed to create scenario"}
        </p>
      )}
    </div>
  );
}



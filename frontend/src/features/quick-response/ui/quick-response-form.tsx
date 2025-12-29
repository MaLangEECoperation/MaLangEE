"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { quickResponseApi } from "@/shared/api/quick-response";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";

const responseSchema = z.object({
  user_response: z.string().min(5, "Please write at least 5 characters"),
});

type ResponseFormData = z.infer<typeof responseSchema>;

export function QuickResponseForm() {
  const queryClient = useQueryClient();
  const [scenario, setScenario] = useState<{ scenario: string; scenario_kr: string } | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  // Fetch random scenario
  const { data: scenarioData } = useQuery({
    queryKey: ["quick-response-scenario"],
    queryFn: () => quickResponseApi.getScenario(),
  });

  useEffect(() => {
    if (scenarioData) {
      setScenario(scenarioData);
    }
  }, [scenarioData]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerActive && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, startTime]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ResponseFormData>({
    resolver: zodResolver(responseSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: ResponseFormData) => {
      if (!scenario) throw new Error("No scenario available");
      const responseTime = elapsedTime; // Already in seconds
      return quickResponseApi.create({
        scenario: scenario.scenario,
        user_response: data.user_response,
        response_time: responseTime,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quick-responses"] });
      reset();
      setTimerActive(false);
      setElapsedTime(0);
      setStartTime(null);
      // Get new scenario
      queryClient.invalidateQueries({ queryKey: ["quick-response-scenario"] });
    },
  });

  const onSubmit = (data: ResponseFormData) => {
    mutation.mutate(data);
  };

  const handleStart = () => {
    setStartTime(Date.now());
    setTimerActive(true);
    setElapsedTime(0);
  };

  const timeLeft = 30 - elapsedTime;
  const isTimeUp = timeLeft <= 0;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {scenario && (
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">{scenario.scenario_kr}</p>
          <p className="font-medium">{scenario.scenario}</p>
        </div>
      )}

      {!timerActive && !startTime && (
        <Button type="button" onClick={handleStart} className="w-full">
          Start (30 seconds)
        </Button>
      )}

      {timerActive && (
        <div className="text-center">
          <div className={`text-2xl font-bold ${isTimeUp ? "text-destructive" : ""}`}>
            {isTimeUp ? "Time's Up!" : `${timeLeft}s`}
          </div>
        </div>
      )}

      {(timerActive || startTime) && (
        <>
          <div>
            <label htmlFor="user_response" className="block text-sm font-medium mb-1">
              Your Response (in English)
            </label>
            <Textarea
              id="user_response"
              rows={4}
              {...register("user_response")}
              disabled={isTimeUp || mutation.isPending}
              className="w-full"
              placeholder="Type your response here..."
            />
            {errors.user_response && (
              <p className="text-sm text-destructive mt-1">{errors.user_response.message}</p>
            )}
          </div>

          {mutation.isError && (
            <p className="text-sm text-destructive">
              {mutation.error instanceof Error ? mutation.error.message : "Failed to submit"}
            </p>
          )}

          {mutation.isSuccess && (
            <p className="text-sm text-green-600">Response submitted successfully!</p>
          )}

          <Button
            type="submit"
            disabled={mutation.isPending || isTimeUp}
            className="w-full"
          >
            {mutation.isPending ? "Submitting..." : "Submit Response"}
          </Button>
        </>
      )}
    </form>
  );
}


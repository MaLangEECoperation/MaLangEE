"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { thinkAloudApi } from "@/shared/api/think-aloud";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";

const thinkAloudSchema = z.object({
  content: z.string().min(20, "Please write at least 20 characters"),
});

type ThinkAloudFormData = z.infer<typeof thinkAloudSchema>;

export function ThinkAloudForm() {
  const queryClient = useQueryClient();
  const [topic, setTopic] = useState<{ topic: string; topic_kr: string } | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  // Fetch random topic
  const { data: topicData } = useQuery({
    queryKey: ["think-aloud-topic"],
    queryFn: () => thinkAloudApi.getTopic(),
  });

  useEffect(() => {
    if (topicData) {
      setTopic(topicData);
    }
  }, [topicData]);

  // Timer effect (2 minutes = 120 seconds)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerActive && startTime) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setElapsedTime(elapsed);
        if (elapsed >= 120) {
          setTimerActive(false);
        }
      }, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, startTime]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<ThinkAloudFormData>({
    resolver: zodResolver(thinkAloudSchema),
  });

  const content = watch("content");
  useEffect(() => {
    if (content) {
      setWordCount(content.split(/\s+/).filter((w) => w.length > 0).length);
    } else {
      setWordCount(0);
    }
  }, [content]);

  const mutation = useMutation({
    mutationFn: (data: ThinkAloudFormData) => {
      if (!topic) throw new Error("No topic available");
      return thinkAloudApi.create({
        topic: topic.topic,
        content: data.content,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["think-alouds"] });
      reset();
      setTimerActive(false);
      setElapsedTime(0);
      setStartTime(null);
      setWordCount(0);
      queryClient.invalidateQueries({ queryKey: ["think-aloud-topic"] });
    },
  });

  const onSubmit = (data: ThinkAloudFormData) => {
    mutation.mutate(data);
  };

  const handleStart = () => {
    setStartTime(Date.now());
    setTimerActive(true);
    setElapsedTime(0);
  };

  const timeLeft = 120 - elapsedTime;
  const isTimeUp = timeLeft <= 0;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {topic && (
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">{topic.topic_kr}</p>
          <p className="font-medium">{topic.topic}</p>
        </div>
      )}

      {!timerActive && !startTime && (
        <Button type="button" onClick={handleStart} className="w-full">
          Start (2 minutes)
        </Button>
      )}

      {timerActive && (
        <div className="text-center">
          <div className={`text-2xl font-bold ${isTimeUp ? "text-destructive" : ""}`}>
            {isTimeUp
              ? "Time's Up!"
              : `${minutes}:${seconds.toString().padStart(2, "0")}`}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Words: {wordCount}
          </p>
        </div>
      )}

      {(timerActive || startTime) && (
        <>
          <div>
            <label htmlFor="content" className="block text-sm font-medium mb-1">
              Write your thoughts (in English)
            </label>
            <Textarea
              id="content"
              rows={8}
              {...register("content")}
              disabled={isTimeUp || mutation.isPending}
              className="w-full"
              placeholder="Start writing your thoughts..."
            />
            {errors.content && (
              <p className="text-sm text-destructive mt-1">{errors.content.message}</p>
            )}
          </div>

          {mutation.isError && (
            <p className="text-sm text-destructive">
              {mutation.error instanceof Error ? mutation.error.message : "Failed to submit"}
            </p>
          )}

          {mutation.isSuccess && (
            <p className="text-sm text-green-600">Think aloud submitted successfully!</p>
          )}

          <Button
            type="submit"
            disabled={mutation.isPending || isTimeUp}
            className="w-full"
          >
            {mutation.isPending ? "Submitting..." : "Submit"}
          </Button>
        </>
      )}
    </form>
  );
}



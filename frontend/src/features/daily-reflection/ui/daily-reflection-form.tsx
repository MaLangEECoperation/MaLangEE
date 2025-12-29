"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { dailyReflectionApi } from "@/shared/api/daily-reflection";

const reflectionSchema = z.object({
  content: z.string().min(10, "Please write at least 10 characters"),
});

type ReflectionFormData = z.infer<typeof reflectionSchema>;

export function DailyReflectionForm() {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ReflectionFormData>({
    resolver: zodResolver(reflectionSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: ReflectionFormData) =>
      dailyReflectionApi.create({ content: data.content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-reflections"] });
      reset();
    },
  });

  const onSubmit = (data: ReflectionFormData) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="content" className="block text-sm font-medium mb-1">
          Write about your day (in English)
        </label>
        <textarea
          id="content"
          rows={6}
          {...register("content")}
          className="w-full px-3 py-2 border border-border rounded-md resize-none"
          placeholder="Today I went to the park and played soccer with my friends..."
        />
        {errors.content && (
          <p className="text-sm text-destructive mt-1">{errors.content.message}</p>
        )}
      </div>

      {mutation.isError && (
        <p className="text-sm text-destructive">
          {mutation.error instanceof Error ? mutation.error.message : "Failed to create reflection"}
        </p>
      )}

      {mutation.isSuccess && (
        <p className="text-sm text-green-600">Reflection created successfully!</p>
      )}

      <button
        type="submit"
        disabled={mutation.isPending}
        className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
      >
        {mutation.isPending ? "Submitting..." : "Submit Reflection"}
      </button>
    </form>
  );
}


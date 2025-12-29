"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { rephrasingApi } from "@/shared/api/rephrasing";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

const rephrasingSchema = z.object({
  user_rephrasing: z.string().min(5, "Please write at least 5 characters"),
});

type RephrasingFormData = z.infer<typeof rephrasingSchema>;

export function RephrasingForm() {
  const queryClient = useQueryClient();
  const [sentence, setSentence] = useState<string | null>(null);

  // Fetch random sentence
  const { data: sentenceData } = useQuery({
    queryKey: ["rephrasing-sentence"],
    queryFn: () => rephrasingApi.getSentence(),
  });

  useEffect(() => {
    if (sentenceData) {
      setSentence(sentenceData.sentence);
    }
  }, [sentenceData]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RephrasingFormData>({
    resolver: zodResolver(rephrasingSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: RephrasingFormData) => {
      if (!sentence) throw new Error("No sentence available");
      return rephrasingApi.create({
        original_sentence: sentence,
        user_rephrasing: data.user_rephrasing,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rephrasings"] });
      reset();
      queryClient.invalidateQueries({ queryKey: ["rephrasing-sentence"] });
    },
  });

  const onSubmit = (data: RephrasingFormData) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {sentence && (
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">Original Sentence:</p>
          <p className="font-medium">{sentence}</p>
        </div>
      )}

      <div>
        <label htmlFor="user_rephrasing" className="block text-sm font-medium mb-1">
          Rephrase it differently (same meaning)
        </label>
        <Input
          id="user_rephrasing"
          {...register("user_rephrasing")}
          disabled={mutation.isPending}
          className="w-full"
          placeholder="Type your rephrasing here..."
        />
        {errors.user_rephrasing && (
          <p className="text-sm text-destructive mt-1">{errors.user_rephrasing.message}</p>
        )}
      </div>

      {mutation.isError && (
        <p className="text-sm text-destructive">
          {mutation.error instanceof Error ? mutation.error.message : "Failed to submit"}
        </p>
      )}

      {mutation.isSuccess && (
        <p className="text-sm text-green-600">Rephrasing submitted successfully!</p>
      )}

      <Button type="submit" disabled={mutation.isPending} className="w-full">
        {mutation.isPending ? "Submitting..." : "Submit Rephrasing"}
      </Button>
    </form>
  );
}



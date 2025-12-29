"use client";

import { FC } from "react";
import { Lightbulb, X } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

export interface HintCardProps {
  hints: string[];
  onApplyHint?: (hint: string) => void;
  onDismiss?: () => void;
  className?: string;
}

export const HintCard: FC<HintCardProps> = ({
  hints,
  onApplyHint,
  onDismiss,
  className,
}) => {
  if (hints.length === 0) return null;

  return (
    <div
      className={cn(
        "mx-4 mb-4 rounded-xl border bg-amber-50 p-4 dark:bg-amber-950/30",
        className
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
          <Lightbulb className="h-4 w-4" />
          <span className="text-sm font-medium">막히셨나요?</span>
        </div>
        {onDismiss && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <p className="mb-2 text-sm text-muted-foreground">이렇게 말해보세요:</p>

      <ul className="space-y-1">
        {hints.map((hint, index) => (
          <li key={index} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onApplyHint?.(hint)}
              className="text-sm text-foreground hover:text-primary hover:underline"
            >
              &quot;{hint}&quot;
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onApplyHint?.(hints[0])}
          className="flex-1"
        >
          힌트 적용
        </Button>
        <Button variant="ghost" size="sm" onClick={onDismiss} className="flex-1">
          직접 말하기
        </Button>
      </div>
    </div>
  );
};

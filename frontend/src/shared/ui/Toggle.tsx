import * as React from "react";

import { cn } from "../lib/utils";

export interface ToggleProps {
  label?: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  className?: string;
}

export function Toggle({ label, enabled, onChange, className }: ToggleProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={cn(
          "focus:ring-brand relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
          enabled ? "bg-brand" : "bg-gray-300"
        )}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
            enabled ? "translate-x-6" : "translate-x-1"
          )}
        />
      </button>
      <span className="text-sm text-gray-600">{enabled ? "ON" : "OFF"}</span>
    </div>
  );
}

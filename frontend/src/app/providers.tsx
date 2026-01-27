"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { TokenKeepAlive } from "@/features/auth";
import { createQueryClient } from "@/shared";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <TokenKeepAlive />
      {children}
    </QueryClientProvider>
  );
}

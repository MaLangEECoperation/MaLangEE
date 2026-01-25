"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function ScenarioSelectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/scenario-select/topic-suggestion");
  }, [router]);

  return null;
}

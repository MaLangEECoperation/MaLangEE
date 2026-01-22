"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ScenarioSelectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/chat/scenario-select/topic-suggestion");
  }, [router]);

  return null;
}

"use client";

import { type FC } from "react";
import { AuthGuard } from "@/features/auth";
import { Button } from "@/shared/ui/button";
import Link from "next/link";

const DashboardPage: FC = () => {
  return (
    <AuthGuard>
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Welcome to MaLangEE Learning Platform</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="bg-card rounded-lg border p-6 shadow-sm">
            <h2 className="mb-2 text-xl font-semibold">Quick Response</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              Practice quick English responses with AI feedback
            </p>
            <Button asChild variant="brand">
              <Link href="/quick-response">Start Practice</Link>
            </Button>
          </div>

          <div className="bg-card rounded-lg border p-6 shadow-sm">
            <h2 className="mb-2 text-xl font-semibold">Scenario Practice</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              Engage in realistic conversation scenarios
            </p>
            <Button asChild variant="brand">
              <Link href="/scenario">Start Scenario</Link>
            </Button>
          </div>

          <div className="bg-card rounded-lg border p-6 shadow-sm">
            <h2 className="mb-2 text-xl font-semibold">Think Aloud</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              Practice expressing your thoughts in English
            </p>
            <Button asChild variant="brand">
              <Link href="/think-aloud">Start Practice</Link>
            </Button>
          </div>

          <div className="bg-card rounded-lg border p-6 shadow-sm">
            <h2 className="mb-2 text-xl font-semibold">Rephrasing</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              Improve your expression skills with rephrasing exercises
            </p>
            <Button asChild variant="brand">
              <Link href="/rephrasing">Start Practice</Link>
            </Button>
          </div>

          <div className="bg-card rounded-lg border p-6 shadow-sm">
            <h2 className="mb-2 text-xl font-semibold">Daily Reflection</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              Reflect on your daily learning progress
            </p>
            <Button asChild variant="brand">
              <Link href="/daily-reflection">View Reflection</Link>
            </Button>
          </div>

          <div className="bg-card rounded-lg border p-6 shadow-sm">
            <h2 className="mb-2 text-xl font-semibold">My Progress</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              Track your learning achievements and statistics
            </p>
            <Button asChild variant="brand-outline">
              <Link href="/progress">View Progress</Link>
            </Button>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default DashboardPage;

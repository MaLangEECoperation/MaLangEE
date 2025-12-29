import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <main className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">ETutor</h1>
          <p className="text-xl text-muted-foreground mb-8">
            English Thinking Training Chatbot
          </p>
          <div className="flex flex-col gap-4 justify-center">
            <div className="flex gap-4 justify-center">
              <Link
                href="/auth/login"
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="px-6 py-3 border border-border rounded-lg hover:bg-accent"
              >
                Register
              </Link>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              5가지 영어 사고 훈련 기능: Daily Reflection, Quick Response, Think Aloud, Rephrasing, Scenario Practice
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}


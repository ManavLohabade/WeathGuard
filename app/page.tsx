import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-background">
      <main className="flex flex-col items-center gap-8 text-center max-w-3xl">
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-foreground">
          Guard Your Wealth. <br className="hidden sm:block" />
          <span className="text-primary">Track Every Flow.</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          The beautiful, multi-currency personal finance manager that helps you balance your needs, wants, and savings.
        </p>
        <div className="flex gap-4">
          <Button asChild size="lg">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}

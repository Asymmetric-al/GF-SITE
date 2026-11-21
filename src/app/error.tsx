"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ErrorPageProps {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}

const ErrorPage = ({ error, reset }: ErrorPageProps) => (
  <main
    className="mx-auto flex w-full max-w-2xl flex-1 items-center px-6 py-16"
    id="main-content"
  >
    <Card className="w-full">
      <CardHeader>
        <p className="text-muted-foreground text-sm font-medium">
          Application Error
        </p>
        <CardTitle>
          <h1 className="text-2xl font-semibold tracking-tight">
            Something went wrong
          </h1>
        </CardTitle>
        <CardDescription>
          An unexpected error interrupted rendering of this route.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error.digest !== undefined && error.digest !== "" ? (
          <p className="text-muted-foreground font-mono text-xs">
            Reference: {error.digest}
          </p>
        ) : null}
      </CardContent>
      <CardFooter>
        <Button onClick={reset} type="button">
          Try again
        </Button>
      </CardFooter>
    </Card>
  </main>
);

export default ErrorPage;

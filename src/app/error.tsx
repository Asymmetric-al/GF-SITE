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

interface RouteError extends Error {
  readonly digest?: string;
}

interface ErrorPageProps {
  readonly error: RouteError;
  readonly retry: () => void;
}

const ErrorPage = ({ error, retry }: ErrorPageProps) => {
  const digest =
    error.digest !== undefined && error.digest.length > 0
      ? error.digest
      : undefined;

  return (
    <main
      className="mx-auto flex w-full max-w-2xl flex-1 items-center px-6 py-16 focus:outline-none"
      id="main-content"
      tabIndex={-1}
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
          {digest === undefined ? null : (
            <p className="text-muted-foreground font-mono text-xs">
              Reference: {digest}
            </p>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={retry} type="button">
            Try again
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
};

export default ErrorPage;

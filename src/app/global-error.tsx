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
import type { CaughtRouteValue } from "@/lib/error-digest";
import { extractErrorDigest } from "@/lib/error-digest";

import "./globals.css";

interface GlobalErrorPageProps {
  readonly error: CaughtRouteValue;
  readonly retry: () => void;
}

const GlobalErrorPage = ({ error, retry }: GlobalErrorPageProps) => {
  const digest = extractErrorDigest(error);

  return (
    <html className="h-full antialiased" lang="en">
      <body className="bg-background text-foreground flex min-h-full flex-col font-sans">
        <title>Application Error | Global Fellowship</title>
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
                An unexpected error interrupted loading the application layout.
              </CardDescription>
            </CardHeader>
            {digest === undefined ? null : (
              <CardContent>
                <p className="text-muted-foreground font-mono text-xs">
                  Reference: {digest}
                </p>
              </CardContent>
            )}
            <CardFooter>
              <Button onClick={retry} type="button">
                Try again
              </Button>
            </CardFooter>
          </Card>
        </main>
      </body>
    </html>
  );
};

export default GlobalErrorPage;

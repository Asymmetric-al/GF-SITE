import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const NotFound = () => (
  <main
    className="mx-auto flex w-full max-w-2xl flex-1 items-center px-6 py-16 focus:outline-none"
    id="main-content"
    tabIndex={-1}
  >
    <Card className="w-full">
      <CardHeader>
        <p className="text-muted-foreground text-sm font-medium">404</p>
        <CardTitle>
          <h1 className="text-2xl font-semibold tracking-tight">
            Page not found
          </h1>
        </CardTitle>
        <CardDescription>
          The requested route does not exist in this provisional website
          foundation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">
          Return to the starter route to inspect the configured frontend
          architecture.
        </p>
      </CardContent>
      <CardFooter>
        <Link className={buttonVariants({ variant: "default" })} href="/">
          Back to starter page
        </Link>
      </CardFooter>
    </Card>
  </main>
);

export default NotFound;

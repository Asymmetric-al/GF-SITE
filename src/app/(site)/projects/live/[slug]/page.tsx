import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

import {
  PageTransition,
  SuspenseContentTransition,
  SuspenseFallbackTransition,
} from "@/components/brand/page-transition";
import { CmsPageRenderer } from "@/components/cms/cms-block-renderer";
import { GivingHandoffWidget } from "@/components/interactive/giving-handoff-widget";
import { getContactDesk } from "@/lib/brand/contact";
import { ADMISSION_TOKEN_HEADER } from "@/lib/content/admission-handoff";
import { getCoreClientConfigStatus } from "@/lib/content/core-client";
import { readProjectPage } from "@/lib/content/reader";
import {
  isCorePaymentUuid,
  isOnlineCheckoutEligible,
} from "@/lib/giving/checkout-handoff";
import { buildPageMetadata } from "@/lib/site";

export const generateMetadata = async ({
  params,
}: {
  readonly params: Promise<{ slug: string }>;
}): Promise<Metadata> => {
  const [{ slug }, requestHeaders] = await Promise.all([params, headers()]);
  const configStatus = getCoreClientConfigStatus();

  if (configStatus.status !== "configured") {
    return { title: "Ministry Project" };
  }

  const result = await readProjectPage(
    slug,
    requestHeaders.get(ADMISSION_TOKEN_HEADER)
  );

  if (result.status !== "found") {
    return { title: "Ministry Project" };
  }

  return buildPageMetadata({
    description: result.data.summary,
    pathname: `/projects/${slug}`,
    title: result.data.title,
  });
};

const LiveCmsProjectDetail = async ({
  params,
}: {
  readonly params: Promise<{ slug: string }>;
}) => {
  await connection();

  const [{ slug }, requestHeaders] = await Promise.all([params, headers()]);
  const configStatus = getCoreClientConfigStatus();

  if (configStatus.status !== "configured") {
    notFound();
  }

  const admissionToken = requestHeaders.get(ADMISSION_TOKEN_HEADER);
  const result = await readProjectPage(slug, admissionToken);

  if (result.status === "not-found" || result.status === "withdrawn") {
    notFound();
  }

  if (result.status === "unavailable") {
    throw new Error(result.reason);
  }

  const financeDesk = getContactDesk("finance");

  const verifiedFundId =
    result.data.fundId !== null && isCorePaymentUuid(result.data.fundId)
      ? result.data.fundId
      : result.data.slug;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-5 py-10 sm:px-8 lg:py-16">
      <nav aria-label="Breadcrumb" className="text-muted-foreground text-xs">
        <Link
          className="hover:text-primary underline underline-offset-4 transition-colors"
          href="/"
          transitionTypes={["nav-back"]}
        >
          Global Fellowship
        </Link>{" "}
        /{" "}
        <Link
          className="hover:text-primary underline underline-offset-4 transition-colors"
          href="/projects"
          transitionTypes={["nav-back"]}
        >
          Ministry Projects
        </Link>{" "}
        / <span className="text-foreground">{result.data.title}</span>
      </nav>

      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <CmsPageRenderer page={result.data} />
        </div>

        <div className="flex flex-col gap-6 lg:sticky lg:top-24 lg:col-span-5">
          <GivingHandoffWidget
            generalFundOnlineEligible={isOnlineCheckoutEligible({
              fundId: "general-fund",
              kind: "fund",
            })}
            onlineCheckoutEligible={isOnlineCheckoutEligible({
              fundId: verifiedFundId,
              kind: "fund",
            })}
            recipientName={result.data.title}
            sourceCode={`project-${result.data.slug}`}
            target={{ fundId: verifiedFundId, kind: "fund" }}
          />
          <div className="border-border bg-linen flex flex-col gap-2 rounded-2xl border p-5 text-xs leading-relaxed">
            <p className="text-foreground font-semibold">
              Questions about this project?
            </p>
            <p className="text-muted-foreground">
              Write{" "}
              <a
                className="text-primary font-medium underline underline-offset-4"
                href={`mailto:${financeDesk.email}?subject=${encodeURIComponent(`Project Inquiry: ${result.data.title}`)}`}
              >
                {financeDesk.email}
              </a>
              , review{" "}
              <Link
                className="text-primary font-medium underline underline-offset-4"
                href="/financials"
              >
                Financials
              </Link>
              , or{" "}
              <Link
                className="text-primary font-medium underline underline-offset-4"
                href="/contact#safeguarding"
              >
                request removal
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const LiveProjectPage = ({
  params,
}: {
  readonly params: Promise<{ slug: string }>;
}) => (
  <PageTransition>
    <div className="flex flex-col">
      <Suspense
        fallback={
          <SuspenseFallbackTransition>
            <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8">
              <p className="text-muted-foreground text-sm">
                Loading published project...
              </p>
            </div>
          </SuspenseFallbackTransition>
        }
      >
        <SuspenseContentTransition>
          <LiveCmsProjectDetail params={params} />
        </SuspenseContentTransition>
      </Suspense>
    </div>
  </PageTransition>
);

export default LiveProjectPage;

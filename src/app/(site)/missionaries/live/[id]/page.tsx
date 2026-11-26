import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

import { PageTransition } from "@/components/brand/page-transition";
import { CmsPageRenderer } from "@/components/cms/cms-block-renderer";
import { GivingHandoffWidget } from "@/components/interactive/giving-handoff-widget";
import { getContactDesk } from "@/lib/brand/contact";
import { ADMISSION_TOKEN_HEADER } from "@/lib/content/admission-handoff";
import { getCoreClientConfigStatus } from "@/lib/content/core-client";
import { readMissionaryPage } from "@/lib/content/reader";
import {
  isCorePaymentUuid,
  isOnlineCheckoutEligible,
} from "@/lib/giving/checkout-handoff";
import { buildPageMetadata } from "@/lib/site";

export const generateMetadata = async ({
  params,
}: {
  readonly params: Promise<{ id: string }>;
}): Promise<Metadata> => {
  const [{ id }, requestHeaders] = await Promise.all([params, headers()]);
  const configStatus = getCoreClientConfigStatus();

  if (configStatus.status !== "configured") {
    return { title: "Missionary" };
  }

  const result = await readMissionaryPage(
    id,
    requestHeaders.get(ADMISSION_TOKEN_HEADER)
  );

  if (result.status !== "found") {
    return { title: "Missionary" };
  }

  return buildPageMetadata({
    description: result.data.summary,
    pathname: `/missionaries/${id}`,
    title: result.data.title,
  });
};

const LiveCmsMissionaryDetail = async ({
  params,
}: {
  readonly params: Promise<{ id: string }>;
}) => {
  await connection();

  const [{ id }, requestHeaders] = await Promise.all([params, headers()]);
  const configStatus = getCoreClientConfigStatus();

  if (configStatus.status !== "configured") {
    notFound();
  }

  const admissionToken = requestHeaders.get(ADMISSION_TOKEN_HEADER);
  const result = await readMissionaryPage(id, admissionToken);

  if (result.status === "not-found" || result.status === "withdrawn") {
    notFound();
  }

  if (result.status === "unavailable") {
    throw new Error(result.reason);
  }

  const financeDesk = getContactDesk("finance");

  const verifiedMissionaryId =
    result.data.missionaryId !== null &&
    isCorePaymentUuid(result.data.missionaryId)
      ? result.data.missionaryId
      : id;

  const missionaryTarget =
    isCorePaymentUuid(verifiedMissionaryId) &&
    verifiedMissionaryId.toLowerCase() !== id.toLowerCase()
      ? {
          kind: "missionary" as const,
          missionaryId: verifiedMissionaryId,
        }
      : {
          kind: "missionary" as const,
          missionaryId: verifiedMissionaryId,
          workerId: id,
        };

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
          href="/missionaries"
          transitionTypes={["nav-back"]}
        >
          Missionaries
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
            onlineCheckoutEligible={isOnlineCheckoutEligible(missionaryTarget)}
            recipientName={result.data.title}
            sourceCode={`missionary-${result.data.slug}`}
            target={missionaryTarget}
          />
          <p className="text-muted-foreground px-1 text-xs leading-relaxed">
            Questions about this designation? Write{" "}
            <a
              className="text-primary font-medium underline underline-offset-4"
              href={`mailto:${financeDesk.email}?subject=${encodeURIComponent(`Missionary Inquiry: ${result.data.title}`)}`}
            >
              {financeDesk.email}
            </a>
            , or{" "}
            <Link
              className="text-primary font-medium underline underline-offset-4"
              href="/contact#safeguarding"
            >
              request immediate page removal
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

const LiveMissionaryPage = ({
  params,
}: {
  readonly params: Promise<{ id: string }>;
}) => (
  <PageTransition>
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8">
          <p className="text-muted-foreground text-sm">
            Loading missionary profile...
          </p>
        </div>
      }
    >
      <LiveCmsMissionaryDetail params={params} />
    </Suspense>
  </PageTransition>
);

export default LiveMissionaryPage;

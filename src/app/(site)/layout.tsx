import type { ReactNode } from "react";

import { BrandWordmarkSprite } from "@/components/brand/cross-in-oval-mark";
import { LenisRoot } from "@/components/interactive/lenis-root";
import { SiteToaster } from "@/components/interactive/site-toaster";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getContactDesk, VERIFIED_ORGANIZATION } from "@/lib/brand/contact";
import { getCanonicalUrl, SITE_DEFAULTS } from "@/lib/site";

interface OrganizationJsonLd {
  readonly "@context": "https://schema.org";
  readonly "@type": "NGO";
  readonly address: {
    readonly "@type": "PostalAddress";
    readonly addressCountry: string;
    readonly addressLocality: string;
    readonly addressRegion: string;
    readonly postalCode: string;
    readonly postOfficeBoxNumber: string;
  };
  readonly description: string;
  readonly email: string;
  readonly foundingDate: string;
  image?: string;
  readonly legalName: string;
  logo?: string;
  readonly name: string;
  readonly nonprofitStatus: string;
  readonly sameAs: readonly string[];
  readonly taxID: string;
  readonly telephone: string;
  url?: string;
}

const buildOrganizationJsonLd = (): string => {
  const infoDesk = getContactDesk("info");
  const canonicalHome = getCanonicalUrl("/");

  const schema: OrganizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "NGO",
    address: {
      "@type": "PostalAddress",
      addressCountry: "US",
      addressLocality: "Meadow Vista",
      addressRegion: "CA",
      postalCode: "95722",
      postOfficeBoxNumber: "1",
    },
    description: SITE_DEFAULTS.description,
    email: infoDesk.email,
    foundingDate: "1989",
    legalName: VERIFIED_ORGANIZATION.legalName,
    name: SITE_DEFAULTS.name,
    nonprofitStatus: "Nonprofit501c3",
    sameAs: [VERIFIED_ORGANIZATION.candidUrl],
    taxID: VERIFIED_ORGANIZATION.ein,
    telephone: "+1-866-984-5622",
  };

  if (canonicalHome !== undefined) {
    schema.url = canonicalHome;
    schema.logo = new URL(
      "/brand/gf-apple-touch-180.png",
      canonicalHome
    ).toString();
    schema.image = new URL(SITE_DEFAULTS.ogImagePath, canonicalHome).toString();
  }

  return JSON.stringify(schema).replaceAll("<", "\\u003c");
};

const SiteLayout = ({ children }: { readonly children: ReactNode }) => {
  const organizationJsonLd = buildOrganizationJsonLd();

  return (
    <div className="flex min-h-screen flex-col">
      <BrandWordmarkSprite />
      <script
        // Verified static JSON-LD with `<` escaped to `\u003c` per Next.js structured-data guidance.
        // oxlint-disable-next-line react/no-danger -- JSON-LD structured data script requires raw JSON text.
        dangerouslySetInnerHTML={{ __html: organizationJsonLd }}
        type="application/ld+json"
      />
      <SiteHeader />
      <main
        className="flex-1 focus:outline-none"
        id="main-content"
        tabIndex={-1}
      >
        {children}
      </main>
      <SiteFooter />
      <LenisRoot />
      <SiteToaster />
    </div>
  );
};

export default SiteLayout;

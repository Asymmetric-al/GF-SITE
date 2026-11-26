import Image from "next/image";
import Link from "next/link";

import { ExternalLinkIcon } from "@/components/brand/ui-arrow";
import { buttonVariants } from "@/components/ui/button-variants";
import { LexicalRenderer } from "@/lib/content/lexical-renderer";
import type {
  SerializedPublicLayoutBlock,
  SerializedPublicMedia,
  SerializedPublicPage,
} from "@/lib/content/types";
import { toInternalUrlObject } from "@/lib/content/url-object";

const resolveBestMediaUrl = (media: SerializedPublicMedia): string | null =>
  media.cardURL ?? media.url ?? media.thumbnailURL;

const isRemoteUrl = (url: string): boolean =>
  url.startsWith("http://") || url.startsWith("https://");

const isCrossAppDonorBridgePath = (href: string): boolean => {
  const pathname = (href.split("?")[0] ?? href).split("#")[0] ?? href;

  return (
    pathname === "/checkout" ||
    pathname === "/login" ||
    pathname === "/donor-dashboard" ||
    pathname.startsWith("/donor-dashboard/")
  );
};

const isInternalRouteHref = (href: string): boolean =>
  href.startsWith("/") &&
  !href.startsWith("//") &&
  !isCrossAppDonorBridgePath(href);

const CmsActionLink = ({
  href,
  label,
  openInNewTab,
}: {
  readonly href: string;
  readonly label: string;
  readonly openInNewTab: boolean;
}) => {
  const linkClass = buttonVariants({ variant: "default" });

  if (!openInNewTab && isInternalRouteHref(href)) {
    return (
      <Link className={linkClass} href={toInternalUrlObject(href)}>
        {label}
      </Link>
    );
  }

  if (openInNewTab) {
    return (
      <a
        className={linkClass}
        href={href}
        rel="noopener noreferrer"
        target="_blank"
      >
        <span>{label}</span>
        <ExternalLinkIcon />
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  }

  return (
    <a className={linkClass} href={href}>
      {label}
    </a>
  );
};

const CmsMediaImage = ({
  media,
  caption,
}: {
  readonly media: SerializedPublicMedia;
  readonly caption?: string | null;
}) => {
  const src = resolveBestMediaUrl(media);

  if (src === null || media.alt === null) {
    return null;
  }

  const resolvedCaption = caption ?? media.caption ?? null;

  return (
    <figure className="flex flex-col gap-2.5">
      <div className="gf-photo-frame relative aspect-3/2 overflow-hidden">
        <Image
          alt={media.alt}
          className="h-full w-full object-cover"
          height={media.height ?? 1067}
          sizes="(max-width: 1024px) 100vw, 560px"
          src={src}
          unoptimized={isRemoteUrl(src)}
          width={media.width ?? 1600}
        />
      </div>
      {resolvedCaption === null ? null : (
        <figcaption className="text-muted-foreground text-xs leading-relaxed">
          {resolvedCaption}
        </figcaption>
      )}
    </figure>
  );
};

const HeroBlockView = ({
  block,
  isPrimaryHeading,
}: {
  readonly block: Extract<SerializedPublicLayoutBlock, { blockType: "hero" }>;
  readonly isPrimaryHeading: boolean;
}) => (
  <section className="border-border flex flex-col gap-6 border-b pb-10">
    {block.eyebrow === null ? null : (
      <p className="gf-eyebrow text-clay">{block.eyebrow}</p>
    )}
    {isPrimaryHeading ? (
      <h1 className="gf-display-hero text-foreground">{block.headline}</h1>
    ) : (
      <h2 className="gf-display-section text-foreground">{block.headline}</h2>
    )}
    {block.subheading === null ? null : (
      <p className="text-muted-foreground gf-measure-lead text-lg leading-relaxed">
        {block.subheading}
      </p>
    )}
    {block.primaryCtaHref !== null && block.primaryCtaLabel !== null ? (
      <div className="pt-1">
        <CmsActionLink
          href={block.primaryCtaHref}
          label={block.primaryCtaLabel}
          openInNewTab={false}
        />
      </div>
    ) : null}
    {block.backgroundImage === null ? null : (
      <div className="pt-2">
        <CmsMediaImage media={block.backgroundImage} />
      </div>
    )}
  </section>
);

const RichTextBlockView = ({
  block,
}: {
  readonly block: Extract<
    SerializedPublicLayoutBlock,
    { blockType: "rich-text" }
  >;
}) => (
  <section className="flex flex-col gap-4">
    {block.heading === null ? null : (
      <h2 className="gf-display-section text-foreground">{block.heading}</h2>
    )}
    <LexicalRenderer
      document={block.body}
      minHeadingLevel={block.heading === null ? 2 : 3}
    />
  </section>
);

const MediaFeatureBlockView = ({
  block,
}: {
  readonly block: Extract<
    SerializedPublicLayoutBlock,
    { blockType: "media-feature" }
  >;
}) => {
  const hasRenderableMedia =
    block.media !== null &&
    block.media.alt !== null &&
    resolveBestMediaUrl(block.media) !== null;

  return (
    <section className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
      {hasRenderableMedia && block.media !== null ? (
        <div className="lg:col-span-6">
          <CmsMediaImage caption={block.mediaCaption} media={block.media} />
        </div>
      ) : null}
      <div
        className={
          hasRenderableMedia
            ? "flex flex-col gap-3 lg:col-span-6"
            : "flex flex-col gap-3 lg:col-span-12"
        }
      >
        {block.title === null ? null : (
          <h2 className="gf-display-section text-foreground">{block.title}</h2>
        )}
        {block.body === null ? null : (
          <p className="text-muted-foreground gf-measure text-base leading-relaxed">
            {block.body}
          </p>
        )}
      </div>
    </section>
  );
};

const ImpactStatsBlockView = ({
  block,
}: {
  readonly block: Extract<
    SerializedPublicLayoutBlock,
    { blockType: "impact-stats" }
  >;
}) => (
  <section className="flex flex-col gap-6">
    {block.heading === null ? null : (
      <h2 className="gf-display-section text-foreground">{block.heading}</h2>
    )}
    <dl className="border-border grid grid-cols-1 gap-8 border-t pt-6 sm:grid-cols-3">
      {block.items.map((item) => (
        <div
          className="border-border flex flex-col gap-2 sm:border-l sm:pl-6 sm:first:border-l-0 sm:first:pl-0"
          key={item.id ?? `${item.value}-${item.label}`}
        >
          <dt className="text-foreground order-2 text-sm font-medium">
            {item.label}
          </dt>
          <dd className="gf-tabular text-foreground order-1 font-sans text-3xl font-semibold tracking-tight">
            {item.value}
          </dd>
          {item.description === null ? null : (
            <dd className="text-muted-foreground order-3 text-xs leading-relaxed">
              {item.description}
            </dd>
          )}
        </div>
      ))}
    </dl>
  </section>
);

const FaqBlockView = ({
  block,
}: {
  readonly block: Extract<SerializedPublicLayoutBlock, { blockType: "faq" }>;
}) => (
  <section className="flex flex-col gap-5">
    {block.heading === null ? null : (
      <h2 className="gf-display-section text-foreground">{block.heading}</h2>
    )}
    <div className="border-border divide-border divide-y border-t border-b">
      {block.items.map((item) => (
        <details className="gf-disclosure py-4" key={item.id ?? item.question}>
          <summary className="text-foreground focus-visible:outline-ring flex min-h-11 items-center justify-between gap-4 text-base font-medium focus-visible:outline-2 focus-visible:outline-offset-2">
            <span>{item.question}</span>
            <span
              aria-hidden="true"
              className="gf-disclosure-plus text-muted-foreground inline-block shrink-0 text-base leading-none transition-transform duration-150 motion-reduce:transition-none"
            >
              +
            </span>
          </summary>
          <p className="text-muted-foreground gf-measure pt-3 text-sm leading-relaxed">
            {item.answer}
          </p>
        </details>
      ))}
    </div>
  </section>
);

const TestimonialBlockView = ({
  block,
}: {
  readonly block: Extract<
    SerializedPublicLayoutBlock,
    { blockType: "testimonial" }
  >;
}) => (
  <section className="border-border border-y py-8">
    <blockquote className="border-structural border-l-3 pl-6">
      <p className="gf-display-quote text-foreground">
        &ldquo;{block.quote}&rdquo;
      </p>
      <footer className="text-muted-foreground mt-4 text-sm font-medium">
        {block.attribution}
      </footer>
    </blockquote>
  </section>
);

const CallToActionBlockView = ({
  block,
}: {
  readonly block: Extract<
    SerializedPublicLayoutBlock,
    { blockType: "call-to-action" }
  >;
}) => (
  <section className="bg-linen border-border flex flex-col gap-4 rounded-3xl border px-6 py-8 sm:px-9 sm:py-10">
    <h2 className="text-foreground font-sans text-2xl font-semibold tracking-tight">
      {block.headline}
    </h2>
    {block.copy === null ? null : (
      <p className="text-muted-foreground gf-measure text-base leading-relaxed">
        {block.copy}
      </p>
    )}
    {block.buttonHref !== null && block.buttonLabel !== null ? (
      <div className="flex flex-wrap gap-3 pt-1">
        <CmsActionLink
          href={block.buttonHref}
          label={block.buttonLabel}
          openInNewTab={block.openInNewTab}
        />
      </div>
    ) : null}
  </section>
);

const getStableBlockKey = (
  block: SerializedPublicLayoutBlock,
  index: number
): string => {
  if (block.id !== null) {
    return block.id;
  }

  return `${block.blockType}-${block.blockName ?? "section"}-${String(index)}`;
};

const renderBlock = (
  block: SerializedPublicLayoutBlock,
  index: number,
  primaryHeroIndex: number
) => {
  const blockKey = getStableBlockKey(block, index);

  switch (block.blockType) {
    case "hero": {
      return (
        <HeroBlockView
          block={block}
          isPrimaryHeading={index === primaryHeroIndex}
          key={blockKey}
        />
      );
    }

    case "rich-text": {
      return <RichTextBlockView block={block} key={blockKey} />;
    }

    case "media-feature": {
      return <MediaFeatureBlockView block={block} key={blockKey} />;
    }

    case "impact-stats": {
      return <ImpactStatsBlockView block={block} key={blockKey} />;
    }

    case "faq": {
      return <FaqBlockView block={block} key={blockKey} />;
    }

    case "testimonial": {
      return <TestimonialBlockView block={block} key={blockKey} />;
    }

    case "call-to-action": {
      return <CallToActionBlockView block={block} key={blockKey} />;
    }

    default: {
      return null;
    }
  }
};

interface CmsPageRendererProps {
  readonly page: SerializedPublicPage;
}

/**
 * Renders a `SerializedPublicPage` from Core Payload CMS v4 while strictly
 * honoring `legacyContentFallback` and guaranteeing a single semantic `<h1>`.
 */
export const CmsPageRenderer = ({ page }: CmsPageRendererProps) => {
  const hasLayoutBlocks = page.layout !== null && page.layout.length > 0;

  const primaryHeroIndex = hasLayoutBlocks
    ? page.layout.findIndex((block) => block.blockType === "hero")
    : -1;

  const shouldRenderLegacyContent =
    !hasLayoutBlocks && page.legacyContentFallback === true;

  return (
    <div className="flex flex-col gap-12">
      {primaryHeroIndex === -1 ? (
        <header className="border-border flex flex-col gap-4 border-b pb-8">
          <h1 className="gf-display-hero text-foreground">{page.title}</h1>
          {page.summary === null ? null : (
            <p className="text-muted-foreground gf-measure-lead text-lg leading-relaxed">
              {page.summary}
            </p>
          )}
        </header>
      ) : null}

      {hasLayoutBlocks
        ? page.layout.map((block, index) =>
            renderBlock(block, index, primaryHeroIndex)
          )
        : null}

      {shouldRenderLegacyContent ? (
        <LexicalRenderer document={page.content} />
      ) : null}
    </div>
  );
};

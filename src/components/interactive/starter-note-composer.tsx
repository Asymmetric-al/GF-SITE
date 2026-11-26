"use client";

import { useId, useState } from "react";

import { CopyNoteButton } from "@/components/interactive/copy-note-button";
import { buttonVariants } from "@/components/ui/button-variants";

interface StarterNoteComposerProps {
  readonly email: string;
  readonly subject: string;
  readonly ctaLabel: string;
  readonly heading: string;
  readonly description: string;
  readonly secondFieldLabel: string;
  readonly secondFieldPlaceholder: string;
  readonly buildBody: (name: string, detail: string) => string;
  readonly footerNote?: string;
}

const buildBridgeBody = (name: string, detail: string): string => {
  const safeName = name.trim() || "[Your name or family name]";
  const safeDetail = detail.trim() || "[Your city, church, or language]";

  return `Hello Global Fellowship team,

We are writing from ${safeDetail} about The Bridge Project. We would love to pray monthly and exchange short, encouraging letters with a local church planter and their family.

Please send your correspondence guide when you have a moment.

Warmly,
${safeName}`;
};

interface BridgeStarterNoteComposerProps {
  readonly email: string;
}

/**
 * Zero-PII browser-only correspondence personalizer for The Bridge Project.
 * Degrades cleanly to the complete starter letter and direct `mailto:` link
 * when JavaScript is disabled; enhances with live in-browser preview, copy,
 * and pre-filled `mailto:` body without storing or transmitting form data.
 */
export const BridgeStarterNoteComposer = ({
  email,
}: BridgeStarterNoteComposerProps) => (
  <StarterNoteComposer
    buildBody={buildBridgeBody}
    ctaLabel="Open in email app"
    description="This page doesn't save or send your draft. You can copy it or open it in your email app and review it before sending."
    email={email}
    footerNote="No child names or photos needed."
    heading="Write your first note"
    secondFieldLabel="City, church, or language (optional)"
    secondFieldPlaceholder="e.g. Boise, ID · English"
    subject="Bridge Project Match Request"
  />
);

const StarterNoteComposer = ({
  email,
  subject,
  ctaLabel,
  heading,
  description,
  secondFieldLabel,
  secondFieldPlaceholder,
  buildBody,
  footerNote,
}: StarterNoteComposerProps) => {
  const [senderName, setSenderName] = useState("");
  const [senderDetail, setSenderDetail] = useState("");
  const nameId = useId();
  const detailId = useId();

  const noteBody = buildBody(senderName, senderDetail);
  const mailtoHref = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(noteBody)}`;

  return (
    <div className="bg-card border-border flex flex-col gap-5 rounded-3xl border p-6 shadow-xs sm:p-8">
      <div className="flex flex-col gap-2">
        <div aria-hidden="true" className="gf-gold-rule" />
        <h3 className="text-foreground font-sans text-xl font-semibold tracking-tight">
          {heading}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>
      </div>

      <div className="gf-js-block gf-no-print grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label
            className="text-foreground text-sm font-medium"
            htmlFor={nameId}
          >
            Your name or family (optional)
          </label>
          <input
            autoComplete="name"
            className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:outline-ring min-h-11 rounded-xl border px-3.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2"
            id={nameId}
            maxLength={80}
            onChange={(event) => {
              setSenderName(event.target.value);
            }}
            placeholder="e.g. Hannah & David"
            type="text"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label
            className="text-foreground text-sm font-medium"
            htmlFor={detailId}
          >
            {secondFieldLabel}
          </label>
          <input
            className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:outline-ring min-h-11 rounded-xl border px-3.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2"
            id={detailId}
            maxLength={100}
            onChange={(event) => {
              setSenderDetail(event.target.value);
            }}
            placeholder={secondFieldPlaceholder}
            type="text"
          />
        </div>
      </div>

      <div className="border-border bg-linen/55 text-foreground rounded-2xl border px-5 py-4 font-serif text-sm leading-relaxed whitespace-pre-line sm:text-base">
        {noteBody}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <a
            className={buttonVariants({ size: "default", variant: "default" })}
            href={mailtoHref}
          >
            {ctaLabel}
          </a>
          <CopyNoteButton
            ariaLabel="Copy note for The Bridge Project"
            copiedDescription="Ready to paste into your email client."
            copiedTitle="Starter note copied"
            label="Copy note"
            textToCopy={noteBody}
            variant="inline"
          />
        </div>
        {footerNote === undefined ? null : (
          <span className="text-muted-foreground text-sm">{footerNote}</span>
        )}
      </div>
    </div>
  );
};

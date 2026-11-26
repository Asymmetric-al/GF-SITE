import { CopyNoteButton } from "@/components/interactive/copy-note-button";

interface DirectDeskTwinProps {
  readonly email: string;
  readonly label?: string;
  readonly note?: string;
  readonly tone?: "light" | "night";
}

const renderBreakableEmail = (email: string) => {
  const [localPart, domainPart] = email.split("@");

  if (domainPart === undefined) {
    return email;
  }

  return (
    <>
      {localPart}@<wbr />
      {domainPart}
    </>
  );
};

/**
 * Visible plain-text email address paired tightly with an inline 44px-tall
 * `Copy email` text control so webmail-only visitors never hit a dead `mailto:`
 * click and the copy action never wraps away as a lonely pill below the note.
 */
export const DirectDeskTwin = ({
  email,
  label = "Direct email",
  note,
  tone = "light",
}: DirectDeskTwinProps) => (
  <div
    className={
      tone === "night"
        ? "text-night-muted flex min-w-0 flex-col gap-0.5 text-sm leading-relaxed"
        : "text-muted-foreground flex min-w-0 flex-col gap-0.5 text-sm leading-relaxed"
    }
  >
    <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-0.5">
      <span className="min-w-0">
        {label}:{" "}
        <a
          className={
            tone === "night"
              ? "text-sea-mist font-medium break-words underline underline-offset-4"
              : "text-primary font-medium break-words underline underline-offset-4"
          }
          href={`mailto:${email}`}
        >
          {renderBreakableEmail(email)}
        </a>
      </span>
      <CopyNoteButton
        ariaLabel={`Copy email ${email}`}
        className="-ml-1.5 sm:ml-0"
        copiedTitle={`${email} copied`}
        label="Copy email"
        textToCopy={email}
        variant={tone === "night" ? "nightInline" : "inline"}
      />
    </div>
    {note === undefined ? null : <p>{note}</p>}
  </div>
);

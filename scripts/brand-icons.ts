/**
 * Original 1.65px-stroke Global Fellowship Iconography System (100% Original Work
 * for Global Fellowship, G6 compliant with zero third-party MIT vector dependencies
 * inside `brand-kit/` exports). Proportioned on a 24x24 grid with rounded caps and
 * joins so future Next.js website components using Hugeicons share consistent stroke rhythm.
 */

export const GF_ICON_STROKE_WIDTH = 1.65;

export const GF_ICON_PROVENANCE = {
  kind: "Original vector UI iconography",
  citation: `Global Fellowship Original ${GF_ICON_STROKE_WIDTH}px Line Icon Set (scripts/brand-icons.ts): mail, bookOpen, shield, userGroup, checkCircle, alert, info, globe, fileLedger, videoCamera, radioBroadcast, megaphoneShare`,
  rightsBasis:
    "Original work created for Global Fellowship (100% owned; zero third-party icon vector redistribution in brand-kit exports)",
} as const;

const ICON_PATHS = {
  // Envelope for private email / Bridge correspondence
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.8 6.5 12 12.6l8.2-6.1"/>',
  // Open book / prayer card / printed handout
  bookOpen:
    '<path d="M12 6.5c-2-1.4-5.2-1.9-8-1.5v12.5c2.8-.4 6 .1 8 1.5m0-12.5c2-1.4 5.2-1.9 8-1.5v12.5c-2.8-.4-6 .1-8 1.5m0-12.5V19"/>',
  // Shield with lock keyhole for encrypted chat / security tier
  shield:
    '<path d="M12 3 4.5 6v5.4c0 4.6 3.1 8.5 7.5 9.6 4.4-1.1 7.5-5 7.5-9.6V6L12 3Z"/><circle cx="12" cy="11" r="1.4"/><path d="M12 12.4v2.4"/>',
  // Two neighbors / local fellowship community
  userGroup:
    '<circle cx="9" cy="8.5" r="2.8"/><path d="M3.8 18.5c.6-2.9 2.7-4.5 5.2-4.5s4.6 1.6 5.2 4.5"/><circle cx="16.5" cy="9.5" r="2.2"/><path d="M15.8 14.3c2.1.3 3.8 1.7 4.4 4.2"/>',
  // Checkmark circle for verified confirmation status
  checkCircle:
    '<circle cx="12" cy="12" r="8.5"/><path d="M8.5 12.2 10.9 14.6 15.8 9.6"/>',
  // Warning triangle for validation error / safety stop alert
  alert:
    '<path d="M10.7 4.3 3.2 17.4a1.5 1.5 0 0 0 1.3 2.2h15a1.5 1.5 0 0 0 1.3-2.2L13.3 4.3a1.5 1.5 0 0 0-2.6 0Z"/><path d="M12 9.5v4.2"/><circle cx="12" cy="16.4" r="0.6" fill="currentColor"/>',
  // Info circle for calm safety notice
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11.2v4.6"/><circle cx="12" cy="8.2" r="0.6" fill="currentColor"/>',
  // Globe with meridians for public website
  globe:
    '<circle cx="12" cy="12" r="8.5"/><ellipse cx="12" cy="12" rx="3.8" ry="8.5"/><path d="M4 9.2h16M4 14.8h16"/>',
  // Document with ledger lines for Annual Report PDF (semantically accurate!)
  fileLedger:
    '<path d="M6.5 3.5h7.5L18.5 8v12.5h-12V3.5Z"/><path d="M14 3.5V8h4.5"/><path d="M9 11.5h6M9 14.5h6M9 17.5h4"/>',
  // Video camera for Recorded Church Service offline archive (semantically accurate!)
  videoCamera:
    '<rect x="3.2" y="7" width="12.2" height="10" rx="2"/><path d="m15.4 10.2 5.4-2.8v9.2l-5.4-2.8"/>',
  // Radio signal waves for Livestreamed public church service (semantically accurate!)
  radioBroadcast:
    '<circle cx="12" cy="12" r="1.8"/><path d="M8.4 8.4a5.1 5.1 0 0 0 0 7.2m7.2-7.2a5.1 5.1 0 0 1 0 7.2M5.6 5.6a9.1 9.1 0 0 0 0 12.8m12.8-12.8a9.1 9.1 0 0 1 0 12.8"/>',
  // Share network nodes for Public Social Media / Video (semantically accurate!)
  megaphoneShare:
    '<circle cx="17.5" cy="5.8" r="2.3"/><circle cx="6.5" cy="12" r="2.3"/><circle cx="17.5" cy="18.2" r="2.3"/><path d="m8.6 10.9 6.8-3.9m-6.8 6.1 6.8 3.9"/>',
} as const;

export type GfIconName = keyof typeof ICON_PATHS;

export const renderGfIconSvg = (
  name: GfIconName,
  options: {
    readonly size?: number;
    readonly color?: string;
    readonly strokeWidth?: number;
    readonly ariaLabel?: string;
  } = {}
): string => {
  const { size = 20, color = "currentColor", strokeWidth = 1.65 } = options;

  const aria =
    options.ariaLabel === undefined
      ? 'aria-hidden="true"'
      : `role="img" aria-label="${options.ariaLabel}"`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" ${aria}>${ICON_PATHS[name]}</svg>`;
};

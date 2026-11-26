import { cx } from "@/lib/cx";

type ArrowHoverGroup = "card" | "default" | "give";

interface IconProps {
  readonly className?: string;
  readonly hoverGroup?: ArrowHoverGroup;
  readonly size?: "sm" | "md";
}

const ARROW_HOVER_CLASS: Record<ArrowHoverGroup, string> = {
  card: "[@media(hover:hover)_and_(pointer:fine)]:group-hover/card:translate-x-0.5",
  default:
    "[@media(hover:hover)_and_(pointer:fine)]:group-hover:translate-x-0.5",
  give: "[@media(hover:hover)_and_(pointer:fine)]:group-hover/give:translate-x-0.5",
};

/**
 * Zero-JS geometric hairline arrow replacing ASCII `->` across navigation,
 * directory rows, and inline editorial links.
 */
export const ArrowRightIcon = ({
  className,
  hoverGroup = "default",
  size = "md",
}: IconProps) => (
  <svg
    aria-hidden="true"
    className={cx(
      "gf-ease inline-block shrink-0 transition-transform duration-150 motion-reduce:transform-none",
      ARROW_HOVER_CLASS[hoverGroup],
      size === "sm" ? "size-3.5" : "size-4",
      className
    )}
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.75"
    viewBox="0 0 16 16"
  >
    <path d="M3.5 8h9" />
    <path d="M8.75 4.25 12.5 8l-3.75 3.75" />
  </svg>
);

/**
 * Zero-JS hairline diagonal indicator signaling verified external handoffs
 * (such as Candid) before a visitor leaves the site.
 */
export const ExternalLinkIcon = ({ className }: IconProps) => (
  <svg
    aria-hidden="true"
    className={cx("inline-block size-3.5 shrink-0", className)}
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.75"
    viewBox="0 0 16 16"
  >
    <path d="M5.5 3.5h7v7" />
    <path d="M12.5 3.5 4 12" />
  </svg>
);

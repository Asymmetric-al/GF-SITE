import { cva } from "class-variance-authority";

/**
 * Pure zero-React, zero-Base-UI button class variants shared across Server
 * Components and lightweight Client Components so importing `buttonVariants`
 * never pulls `@base-ui/react` into client navigation or tab bundles.
 *
 * Uses `border-input` (>= 5:1 contrast in light and dark modes) on interactive
 * outlined controls to satisfy WCAG 2.2 SC 1.4.11 non-text contrast.
 */
export const buttonVariants = cva(
  "group/button focus-visible:outline-ring aria-invalid:border-destructive aria-invalid:ring-destructive/20 inline-flex max-w-full cursor-pointer items-center justify-center rounded-full border bg-clip-padding text-center text-sm font-semibold whitespace-normal transition-[background-color,color,border-color,box-shadow,transform] duration-150 ease-out select-none focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none motion-reduce:active:scale-100 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "gf-btn-primary-depth bg-primary text-primary-foreground hover:bg-primary/90 border-transparent",
        outline:
          "border-input bg-card text-foreground hover:bg-muted aria-expanded:bg-muted",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 border-transparent",
        ghost: "text-foreground hover:bg-muted border-transparent",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 border-transparent",
        link: "text-primary border-transparent underline-offset-4 hover:underline",
      },
      size: {
        default: "min-h-11 gap-2 px-5.5 py-2.5",
        sm: "min-h-11 gap-1.5 px-4 py-2 text-sm",
        lg: "min-h-12 gap-2 px-6.5 py-3 text-base",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

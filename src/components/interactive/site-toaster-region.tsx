"use client";

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastRegion,
  ToastTitle,
  toast,
} from "@ui-sdk/react/toast";
import { useEffect, useEffectEvent } from "react";

import type { SiteToastMessage } from "./toast-bus";

interface SiteToasterRegionProps {
  readonly initialMessages: readonly SiteToastMessage[];
  readonly onFlushed: () => void;
}

const dispatchToSdk = (message: SiteToastMessage): void => {
  if (message.kind === "success") {
    toast.success(message.title, {
      description: message.description,
      duration: message.duration ?? 4000,
    });

    return;
  }

  toast.info(message.title, {
    description: message.description,
    duration: message.duration ?? 5000,
  });
};

export const SiteToasterRegion = ({
  initialMessages,
  onFlushed,
}: SiteToasterRegionProps) => {
  const flushInitialMessages = useEffectEvent(
    (messages: readonly SiteToastMessage[]) => {
      for (const msg of messages) {
        dispatchToSdk(msg);
      }

      onFlushed();
    }
  );

  useEffect(() => {
    const frameId =
      initialMessages.length > 0
        ? requestAnimationFrame(() => {
            flushInitialMessages(initialMessages);
          })
        : null;

    return () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [initialMessages]);

  return (
    <ToastRegion
      align="end"
      aria-label="Site notifications"
      className="gf-no-print fixed inset-x-4 bottom-4 z-50 flex flex-col gap-2 outline-none sm:right-4 sm:left-auto sm:w-full sm:max-w-sm"
      maxVisible={3}
      side="bottom"
    >
      {() => (
        <Toast className="bg-night text-night-foreground border-night-border flex items-start justify-between gap-4 rounded-2xl border px-4 py-3.5 shadow-lg transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-none">
          <div className="flex flex-col gap-0.5">
            <ToastTitle className="text-night-foreground text-sm font-semibold" />
            <ToastDescription className="text-night-muted text-xs leading-relaxed" />
          </div>
          <ToastClose
            aria-label="Dismiss notification"
            className="text-night-muted hover:text-night-foreground focus-visible:outline-ring inline-flex min-h-11 shrink-0 cursor-pointer items-center rounded-full px-3 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Close
          </ToastClose>
        </Toast>
      )}
    </ToastRegion>
  );
};

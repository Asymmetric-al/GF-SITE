"use client";

export interface SiteToastMessage {
  readonly kind: "success" | "info";
  readonly title: string;
  readonly description?: string;
  readonly duration?: number;
}

type ToastListener = (message: SiteToastMessage) => void;

const listeners = new Set<ToastListener>();
const pendingQueue: SiteToastMessage[] = [];

/**
 * Lightweight zero-dependency toast bus so pages never eagerly hydrate
 * `@ui-sdk/react/toast` on initial load. On the first `notifyToast` event,
 * `SiteToaster` dynamically loads `@ui-sdk/react/toast` and flushes queued
 * notifications immediately.
 */
export const notifyToast = (message: SiteToastMessage): void => {
  if (listeners.size === 0) {
    pendingQueue.push(message);

    return;
  }

  for (const listener of listeners) {
    listener(message);
  }
};

export const subscribeToToastBus = (listener: ToastListener): (() => void) => {
  listeners.add(listener);

  while (pendingQueue.length > 0) {
    const queued = pendingQueue.shift();

    if (queued !== undefined) {
      listener(queued);
    }
  }

  return () => {
    listeners.delete(listener);
  };
};

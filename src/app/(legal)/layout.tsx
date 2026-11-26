import Link from "next/link";
import type { ReactNode } from "react";

const LegalLayout = ({ children }: { readonly children: ReactNode }) => (
  <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-5 py-12 sm:px-8">
    <header className="border-border mb-10 flex flex-wrap items-center justify-between gap-4 border-b pb-5">
      <p className="text-foreground font-serif text-lg font-medium">
        Global Fellowship Accounting · Application Legal Notice
      </p>
      <Link
        className="text-primary text-sm font-medium underline underline-offset-4 transition-opacity hover:opacity-80"
        href="/"
      >
        Global Fellowship Public Website
      </Link>
    </header>
    <main className="flex-1 focus:outline-none" id="main-content" tabIndex={-1}>
      {children}
    </main>
    <footer className="border-border text-muted-foreground mt-14 border-t pt-6 text-xs leading-relaxed">
      <p>
        This standalone document governs the Global Fellowship Accounting
        web-based application and is kept separate from Global Fellowship&apos;s
        public donor stewardship and communication practices.
      </p>
    </footer>
  </div>
);

export default LegalLayout;

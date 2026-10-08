import Link from "next/link";
import { ArrowLeft, PencilLine } from "lucide-react";
import ThemeToggle from "@/components/theme-toggle";
import AuthShowcase from "@/components/auth/auth-showcase";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Fixed to the viewport so the page itself never scrolls, only <main> does
    <div className="grid h-dvh overflow-hidden bg-background lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      {/* Form side */}
      <div className="flex h-dvh min-h-0 flex-col px-4 sm:px-8 lg:px-12">
        <header className="flex h-16 shrink-0 items-center justify-between">
  <Link
    href="/"
    className="flex items-center gap-2 rounded-sm text-foreground transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
  >
    <PencilLine className="h-5 w-5" aria-hidden="true" />
    <span className="font-serif text-xl font-semibold tracking-tight">Sketchpad</span>
  </Link>

  <div className="flex items-center gap-1">
    <Link
      href="/"
      className="group flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-foreground/6 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <ArrowLeft
        className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
        aria-hidden="true"
      />
      Back to home
    </Link>
    <ThemeToggle />
  </div>
</header>

        {/* The only scroll container. min-h-0 lets a flex child shrink below its content height. */}
        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto [scrollbar-gutter-stable]">
          {/* my-auto centers short forms and falls back to top-aligned scrolling for tall ones.
              items-center on the container would clip the top of a tall form. */}
          <div className="mx-auto my-auto w-full max-w-105 py-8">{children}</div>
        </main>

        <footer className="shrink-0 py-6 text-xs text-muted-foreground">© {new Date().getFullYear()} Sketchpad</footer>
      </div>

      {/* Showcase side (lg and up), fixed in place */}
      <aside className="hidden h-dvh items-center justify-center overflow-y-auto border-l bg-secondary p-12 lg:flex xl:p-16">
        <AuthShowcase />
      </aside>
    </div>
  );
}
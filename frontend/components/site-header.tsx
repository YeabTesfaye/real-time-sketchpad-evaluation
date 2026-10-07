import Link from "next/link";
import ThemeToggle from "@/components/theme-toggle";

export default function SiteHeader() {
  return (
    <header className="border-b border-border bg-background h-16 flex items-center px-4">
      <div className="flex items-center gap-3">
        {/* Simple SVG pencil-stroke mark */}
        <svg className="h-5 w-5 stroke-current" strokeWidth="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17 3a2.85 2.83 0 1 1-4 0L7 8.06 5.06 6.12a2.85 2.83 0 0 1 4-0l3.94 3.94 1.06-1.06a2.85 2.83 0 0 1 4 0Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {/* "Sketchpad" wordmark */}
        <Link href="/" className="text-2xl font-display font-semibold text-foreground hover:no-underline">
          Sketchpad
        </Link>
      </div>

      {/* Right: ThemeToggle only */}
      <div className="ml-auto flex items-center">
        <ThemeToggle />
      </div>
    </header>
  );
}
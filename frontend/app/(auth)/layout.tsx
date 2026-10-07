import Link from "next/link";
import ThemeToggle from "@/components/theme-toggle";
import CanvasPreview from "@/components/canvas-preview";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-dvh grid lg:grid-cols-2">
      {/* Left side */}
      <div className="flex flex-col lg:py-12">
        {/* Slim top row */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="flex items-center gap-2">
            {/* Logo */}
            <svg className="h-5 w-5 stroke-current" strokeWidth="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 3a2.85 2.83 0 1 1-4 0L7 8.06 5.06 6.12a2.85 2.83 0 0 1 4-0l3.94 3.94 1.06-1.06a2.85 2.83 0 0 1 4 0Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-sm font-semibold text-foreground">Sketchpad</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/" className="text-sm text-muted-foreground hover:underline">
              Back to home
            </Link>
            <ThemeToggle />
          </div>
        </div>

        {/* Form centered at max-w-sm */}
        <div className="w-full max-w-sm mx-auto flex-1 flex-col justify-center">
          {children}
        </div>
      </div>

      {/* Right side (lg+ only) */}
      <div className="hidden lg:block bg-card border-l border-card/50">
        <div className="p-6">
          <CanvasPreview />
          <p className="mt-4 text-sm text-muted-foreground">
            Pick up where the whiteboard left off.
          </p>
        </div>
      </div>
    </div>
  );
}
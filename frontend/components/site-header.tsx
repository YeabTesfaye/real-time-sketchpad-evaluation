'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { PencilLine, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function SiteHeader() {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href: string) => pathname === href;

  return (
    <header className="sticky top-0 z-50 h-16 border-b border-border bg-background/85 backdrop-blur flex items-center px-4">
      {/* Left zone: Logo + icon */}
      <div className="flex items-center gap-3">
        <PencilLine className="h-6 w-6 stroke-current" />
        <Link href="/" className="text-2xl font-serif font-semibold text-foreground hover:no-underline">
          Sketchpad
        </Link>
      </div>

      {/* Center zone: Navigation links (hidden on mobile) */}
      <div className="hidden md:flex items-center space-x-6">
        <Link
          href="#how-it-works"
          className={cn(
            "text-sm text-muted-foreground hover:text-foreground",
            isActive("#how-it-works") ? "text-foreground" : ""
          )}
        >
          How it works
        </Link>
        <Link
          href="#features"
          className={cn(
            "text-sm text-muted-foreground hover:text-foreground",
            isActive("#features") ? "text-foreground" : ""
          )}
        >
          Features
        </Link>
      </div>

      {/* Right zone: Theme toggle, Log in, Sign up */}
      <div className="ml-auto flex items-center space-x-3">
        {/* Theme toggle as shadcn Button variant="ghost" */}
        <Button
          variant="ghost"
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle theme"
          className="p-1 [&>svg]:h-4 [&>svg]:w-4"
        >
          {resolvedTheme === 'dark' ? (
            <Sun className="text-accent" />
          ) : (
            <Moon className="text-accent" />
          )}
        </Button>

        {/* Log in button */}
        <Button variant="ghost">
          <Link href="/login">Log in</Link>
        </Button>

        {/* Sign up button - using primary variant */}
        <Button variant="default">
          <Link href="/signup">Sign up</Link>
        </Button>
      </div>

      {/* Mobile menu trigger (hamburger) */}
      <div className="md:hidden">
        <Button
          variant="ghost"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Open menu"
          className="p-1 [&>div]:h-0.5 [&>div]:w-4"
        >
          {/* Hamburger icon */}
          <div className="flex flex-col gap-1">
            <div className="h-0.5 w-4 bg-muted-foreground" />
            <div className="h-0.5 w-4 bg-muted-foreground" />
            <div className="h-0.5 w-4 bg-muted-foreground" />
          </div>
        </Button>
      </div>

      {/* Mobile menu using shadcn Sheet */}
      <Sheet side="top">
        <SheetContent>
          <SheetHeader className="space-y-4">
            <SheetTitle className="text-xl font-serif font-semibold">
              Sketchpad
            </SheetTitle>
            <SheetDescription className="text-sm text-muted-foreground">
              Navigation menu
            </SheetDescription>
          </SheetHeader>

          <SheetContent className="space-y-4">
            <Link
              href="/"
              className={cn(
                "block text-sm text-muted-foreground hover:text-foreground",
                isActive("/") ? "text-foreground" : ""
              )}
            >
              Home
            </Link>
            <Link
              href="#how-it-works"
              className={cn(
                "block text-sm text-muted-foreground hover:text-foreground",
                isActive("#how-it-works") ? "text-foreground" : ""
              )}
            >
              How it works
            </Link>
            <Link
              href="#features"
              className={cn(
                "block text-sm text-muted-foreground hover:text-foreground",
                isActive("#features") ? "text-foreground" : ""
              )}
            >
              Features
            </Link>
          </SheetContent>

          <SheetFooter className="space-y-4">
            <Button variant="ghost" className="w-full">
              <Link href="/login">Log in</Link>
            </Button>
            <Button variant="default" className="w-full mt-2">
              <Link href="/signup">Sign up</Link>
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </header>
  );
}
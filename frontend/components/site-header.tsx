'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Menu, PencilLine, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#features", label: "Features" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the sheet after any route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMenuOpen(false);
  }, [pathname]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 h-16 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-full w-full max-w-6xl items-center gap-6 px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 text-foreground">
          <PencilLine className="h-6 w-6" aria-hidden="true" />
          <span className="font-serif text-2xl font-semibold leading-none">Sketchpad</span>
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Main" className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right zone */}
        <div className="ml-auto flex items-center gap-2">
          {/* Both icons render, CSS picks one, so there is no hydration mismatch */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            aria-label="Toggle theme"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          >
            <Sun className="hidden h-4 w-4 dark:block" />
            <Moon className="h-4 w-4 dark:hidden" />
          </Button>

          {/* Desktop auth buttons */}
          <div className="hidden items-center gap-2 md:flex">
            <Button asChild variant="ghost" className="h-9 px-4">
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild className="h-9 px-4">
              <Link href="/signup">Sign up</Link>
            </Button>
          </div>

          {/* Mobile menu */}
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 md:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>

            <SheetContent side="left" className="flex w-72 flex-col gap-0 p-0">
              <SheetHeader className="border-b border-border p-6">
                <SheetTitle className="font-serif text-xl font-semibold">Sketchpad</SheetTitle>
                <SheetDescription className="sr-only">Site navigation</SheetDescription>
              </SheetHeader>

              <nav aria-label="Mobile" className="flex flex-1 flex-col gap-1 p-4">
                <Link
                  href="/"
                  onClick={closeMenu}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
                    pathname === "/" && "text-foreground"
                  )}
                >
                  Home
                </Link>
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMenu}
                    className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <SheetFooter className="flex-col gap-2 border-t border-border p-4 sm:flex-col sm:space-x-0">
                <Button asChild variant="outline" className="h-10 w-full" onClick={closeMenu}>
                  <Link href="/login">Log in</Link>
                </Button>
                <Button asChild className="h-10 w-full" onClick={closeMenu}>
                  <Link href="/signup">Sign up</Link>
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
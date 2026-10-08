'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
import { useAuth } from "@/lib/hooks/useAuth";
import { Avatar } from "@/components/ui/avatar";

const NAV_LINKS = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#features", label: "Features" },
];

type HeaderUser = {
  id: string;
  email: string;
  firstname: string | null;
  lastname: string | null;
  avatar_url: string | null;
} | null;

// Declared at module level so component identity is stable across renders
function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9 border-transparent text-muted-foreground hover:bg-secondary hover:text-foreground"
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {/* Both icons render, CSS picks one, so there is no hydration mismatch */}
      <Sun className=" h-4 w-4 dark:block" />
      <Moon className=" h-4 w-4 dark:hidden" />
    </Button>
  );
}

function AuthActions({ user }: { user: HeaderUser }) {
  if (!user) {
    return (
      <>
        <Button
          asChild
          variant="ghost"
          className="h-9 border-transparent px-3 text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <Link href="/login">Log in</Link>
        </Button>
        <Button asChild className="h-9 px-4 shadow-sm">
          <Link href="/signup">Sign up</Link>
        </Button>
      </>
    );
  }

  return <Avatar user={user} size={36} className="h-9 w-9" />;
}

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const { user } = useAuth();

  // Redirect authenticated users away from auth pages
  useEffect(() => {
    if (user && (pathname === "/login" || pathname === "/signup")) {
      router.replace("/");
    }
  }, [user, pathname, router]);

  // Passive scroll listener for the border/shadow state
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll-spy, home page only
  useEffect(() => {
    if (pathname !== "/") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((entry) => entry.isIntersecting);
        if (hit) setActiveSectionId(hit.target.id);
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
    );

    ["how-it-works", "features"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [pathname]);

  const closeMenu = () => setMenuOpen(false);

  const isSectionActive = (href: string) =>
    pathname === "/" && activeSectionId === href.split("#")[1];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 h-16 border-b bg-background/80 backdrop-blur-md transition-shadow",
        scrolled ? "border-border shadow-sm" : "border-transparent"
      )}
    >
      <div className="mx-auto flex h-full w-full max-w-[1600px] items-center gap-8 px-4 sm:px-6 lg:px-10">
        {/* Left: logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <PencilLine className="h-5 w-5" aria-hidden="true" />
          <span className="font-serif text-xl font-semibold tracking-tight">Sketchpad</span>
        </Link>

        {/* Nav sits next to the logo instead of floating in the middle */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {NAV_LINKS.map((link) => {
            const isActive = isSectionActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "location" : undefined}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive && "bg-secondary text-foreground"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: pushed to the far edge */}
        <div className="ml-auto flex items-center gap-1.5">
          <div className="hidden items-center gap-1.5 md:flex">
            <AuthActions user={user} />
          </div>

          <div className="mx-2 hidden h-5 w-px bg-border md:block" aria-hidden="true" />

          <ThemeToggle />

          {/* Mobile menu */}
          <div className="flex items-center md:hidden">
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 border-transparent"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>

              <SheetContent side="right" className="flex w-72 flex-col gap-0 p-0">
                <SheetHeader className="border-b p-6">
                  <SheetTitle className="font-serif text-xl font-semibold">Sketchpad</SheetTitle>
                  <SheetDescription className="sr-only">Site navigation</SheetDescription>
                </SheetHeader>

                <nav aria-label="Mobile" className="flex flex-1 flex-col gap-1 p-4">
                  <Link
                    href="/"
                    onClick={closeMenu}
                    className={cn(
                      "flex h-11 items-center rounded-md px-3 text-base transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      pathname === "/" && "bg-secondary text-foreground"
                    )}
                  >
                    Home
                  </Link>
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={closeMenu}
                      className={cn(
                        "flex h-11 items-center rounded-md px-3 text-base transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        isSectionActive(link.href) && "bg-secondary text-foreground"
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>

                {!user && (
                  <SheetFooter className="flex-col gap-2 border-t border-border p-4 sm:flex-col sm:space-x-0">
                    <Button asChild variant="outline" className="h-11 w-full">
                      <Link href="/login" onClick={closeMenu}>Log in</Link>
                    </Button>
                    <Button asChild className="h-11 w-full">
                      <Link href="/signup" onClick={closeMenu}>Sign up</Link>
                    </Button>
                  </SheetFooter>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
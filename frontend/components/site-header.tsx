'use client';

import dynamic from 'next/dynamic';
import {
  useEffect,
  useState,
} from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  PencilLine,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

import ThemeToggle from '@/components/theme-toggle';
import { cn } from '@/lib/utils';

/*
 * Authentication depends on browser storage.
 *
 * Do not render this component on the server.
 *
 * This guarantees that the server HTML and the initial
 * client HTML cannot disagree about whether the user is
 * logged in.
 */
const AuthActions = dynamic(
  () =>
    import(
      '@/components/auth/AuthActions'
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-9 w-20"
        aria-hidden="true"
      />
    ),
  }
);

const NAV_LINKS = [
  {
    href: '/#how-it-works',
    label: 'How it works',
  },
  {
    href: '/#features',
    label: 'Features',
  },
];

export default function SiteHeader() {
  const pathname = usePathname();

  const [
    menuOpen,
    setMenuOpen,
  ] = useState(false);

  const [
    scrolled,
    setScrolled,
  ] = useState(false);

  const [
    activeSectionId,
    setActiveSectionId,
  ] = useState<string | null>(
    null
  );

  /*
   * Passive scroll listener.
   */
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(
        window.scrollY > 8
      );
    };

    window.addEventListener(
      'scroll',
      handleScroll,
      {
        passive: true,
      }
    );

    handleScroll();

    return () => {
      window.removeEventListener(
        'scroll',
        handleScroll
      );
    };
  }, []);

  /*
   * Scroll spy.
   */
  useEffect(() => {
    if (pathname !== '/') {
      return;
    }

    const observer =
      new IntersectionObserver(
        (entries) => {
          const hit =
            entries.find(
              (entry) =>
                entry.isIntersecting
            );

          if (hit) {
            setActiveSectionId(
              hit.target.id
            );
          }
        },
        {
          rootMargin:
            '-40% 0px -50% 0px',
          threshold: 0,
        }
      );

    [
      'how-it-works',
      'features',
    ].forEach((id) => {
      const element =
        document.getElementById(
          id
        );

      if (element) {
        observer.observe(
          element
        );
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [pathname]);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const isSectionActive = (
    href: string
  ) => {
    return (
      pathname === '/' &&
      activeSectionId ===
        href.split('#')[1]
    );
  };

  const createNavLinks = (
    onClick?: () => void
  ) => {
    return NAV_LINKS.map(
      (link) => {
        const isActive =
          isSectionActive(
            link.href
          );

        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClick}
            aria-current={
              isActive
                ? 'location'
                : undefined
            }
            className={cn(
              'flex h-11 items-center rounded-md px-3 text-base transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              isActive &&
                'bg-secondary text-foreground'
            )}
          >
            {link.label}
          </Link>
        );
      }
    );
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-50 h-16 border-b bg-background/80 backdrop-blur-md transition-shadow',
        scrolled
          ? 'border-border shadow-sm'
          : 'border-transparent'
      )}
    >
      <div className="mx-auto flex h-full w-full max-w-[1600px] items-center gap-8 px-4 sm:px-6 lg:px-10">
        {/* Logo */}

        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <PencilLine
            className="h-5 w-5"
            aria-hidden="true"
          />

          <span className="font-serif text-xl font-semibold tracking-tight">
            Sketchpad
          </span>
        </Link>

        {/* Desktop navigation */}

        <nav
          className="hidden items-center gap-1 md:flex"
          aria-label="Main"
        >
          {createNavLinks()}
        </nav>

        {/* Right side */}

        <div className="ml-auto flex items-center gap-1.5">
          <div className="hidden items-center gap-1.5 md:flex">
            <AuthActions />
          </div>

          <div
            className="mx-2 hidden h-5 w-px bg-border md:block"
            aria-hidden="true"
          />

          <ThemeToggle />

          {/* Mobile menu */}

          <div className="flex items-center md:hidden">
            <Sheet
              open={menuOpen}
              onOpenChange={
                setMenuOpen
              }
            >
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 border-transparent"
                  aria-label="Open menu"
                >
                  <Menu
                    className="h-5 w-5"
                    aria-hidden="true"
                  />
                </Button>
              </SheetTrigger>

              <SheetContent
                side="right"
                className="flex w-72 flex-col gap-0 p-0"
              >
                <SheetHeader className="border-b p-6">
                  <SheetTitle className="font-serif text-xl font-semibold">
                    Sketchpad
                  </SheetTitle>

                  <SheetDescription className="sr-only">
                    Site navigation
                  </SheetDescription>
                </SheetHeader>

                <nav
                  aria-label="Mobile"
                  className="flex flex-1 flex-col gap-1 p-4"
                >
                  <Link
                    href="/"
                    onClick={closeMenu}
                    className={cn(
                      'flex h-11 items-center rounded-md px-3 text-base transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      pathname ===
                        '/' &&
                        'bg-secondary text-foreground'
                    )}
                  >
                    Home
                  </Link>

                  {createNavLinks(
                    closeMenu
                  )}
                </nav>

                <SheetFooter className="flex-col gap-2 border-t border-border p-4 sm:flex-col sm:space-x-0">
                  <AuthActions />
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

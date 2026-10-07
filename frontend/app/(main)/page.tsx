"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MousePointer2,
  Lock,
  Smartphone,
  PenTool,
  Code2,
  GraduationCap,
  RefreshCw,
  KeyRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StartRoomButton } from "@/components/room-actions";

// Same container as site-header so the edges line up
const CONTAINER = "mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-10";

// Adjust to your real room route
const roomPath = (code: string) => `/room/${code}`;

const STEPS = [
  { n: "01", title: "Start a room", body: "One click creates a private room with an 8-character code." },
  { n: "02", title: "Share the code", body: "Send it to anyone. They type it in and land on the same canvas." },
  { n: "03", title: "Draw together", body: "Strokes and cursors show up for everyone the moment they happen." },
];

const FEATURES: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: PenTool, title: "Live strokes", body: "Every stroke appears for everyone in real time as it's drawn." },
  { icon: Users, title: "Presence", body: "See who's in the room and where they're working." },
  { icon: RefreshCw, title: "Auto-reconnect", body: "Drop offline for a moment and you rejoin right where you left off." },
  { icon: KeyRound, title: "Share by code", body: "No invite flow. Just an 8-character code anyone can type." },
];

const AUDIENCES: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: PenTool, title: "Designers", body: "Sketch wireframes and UI flows in real time with teammates." },
  { icon: Code2, title: "Engineers", body: "Draft architecture diagrams and talk through logic on one canvas." },
  { icon: GraduationCap, title: "Students", body: "Work through problems together and visualize concepts as a group." },
];

const HERO_FACTS = [
  { icon: MousePointer2, label: "Live cursors" },
  { icon: Lock, label: "Private rooms" },
  { icon: Smartphone, label: "Works on any device" },
];

const FOOTER_LINKS = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#features", label: "Features" },
  { href: "/login", label: "Log in" },
  { href: "/signup", label: "Sign up" },
];

// All components live at module level so their identity is stable across renders

function IconTile({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
      <Icon className="h-5 w-5" aria-hidden="true" />
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-2xl space-y-3">
      <p className="font-mono text-xs uppercase tracking-widest text-primary">{eyebrow}</p>
      <h2 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {description && <p className="text-lg text-muted-foreground">{description}</p>}
    </div>
  );
}

function JoinForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (code.length !== 8) {
      setError("Room codes are 8 characters.");
      return;
    }
    router.push(roomPath(code));
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-1.5">
      <div className="flex gap-2">
        <Input
          type="text"
          value={code}
          maxLength={8}
          placeholder="ROOM CODE"
          aria-label="Room code"
          aria-invalid={error ? true : undefined}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""));
            setError(null);
          }}
          className="h-12 w-full min-w-0 bg-card font-mono text-base uppercase tracking-widest sm:w-48"
        />
        <Button type="submit" variant="outline" className="h-12 px-6 text-base">
          Join
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </form>
  );
}

// Static stand-in for CanvasPreview: no overlapping labels, scales cleanly
function HeroBoard() {
  const avatars = [
    { letter: "M", style: "bg-primary text-primary-foreground" },
    { letter: "D", style: "bg-foreground text-background" },
    { letter: "S", style: "bg-secondary text-foreground" },
  ];

  return (
    <div className="w-full overflow-hidden rounded-2xl border bg-card shadow-lg">
      {/* Window bar */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-border" />
            <span className="h-2.5 w-2.5 rounded-full bg-border" />
            <span className="h-2.5 w-2.5 rounded-full bg-border" />
          </div>
          <span className="rounded-md bg-secondary px-2 py-0.5 font-mono text-xs tracking-widest text-muted-foreground">
            K7QX92AB
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
            3 online
          </span>
          <div className="flex -space-x-2" aria-hidden="true">
            {avatars.map((a) => (
              <span
                key={a.letter}
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ring-2 ring-card ${a.style}`}
              >
                {a.letter}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative aspect-[8/5]">
        {/* Dot grid */}
        <div
          aria-hidden="true"
          className="absolute inset-0 text-border [background-image:radial-gradient(circle,currentColor_1px,transparent_1px)] [background-size:22px_22px]"
        />

        <svg
          viewBox="0 0 640 400"
          className="relative h-full w-full"
          role="img"
          aria-label="Three people sketching a client, API and database diagram together"
        >
          <g fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="stroke-foreground">
            {/* Client and API boxes */}
            <rect x="40" y="70" width="150" height="86" rx="12" className="fill-card" />
            <rect x="250" y="70" width="150" height="86" rx="12" className="fill-card" />

            {/* Database cylinder */}
            <path d="M470 90 V146 C470 166 497 176 530 176 C563 176 590 166 590 146 V90" className="fill-card" />
            <ellipse cx="530" cy="90" rx="60" ry="18" className="fill-card" />

            {/* Arrows */}
            <path d="M190 113 H246 M236 103 L248 113 L236 123" className="stroke-primary" />
            <path d="M400 113 H462 M452 103 L464 113 L452 123" className="stroke-primary" />

            {/* Hand-drawn underline under Client */}
            <path d="M48 182 C80 194 110 172 140 186 S178 190 186 180" className="stroke-primary" />

            {/* Dotted connector from API to the sticky note */}
            <path d="M325 156 V240" strokeDasharray="1 10" />

            {/* Dev's dashed selection box */}
            <rect x="470" y="215" width="120" height="70" rx="8" strokeDasharray="6 6" strokeWidth="2" className="stroke-foreground/50" />
          </g>

          {/* Sticky note */}
          <g transform="rotate(-3 325 295)">
            <rect x="245" y="245" width="160" height="100" rx="4" strokeWidth="2" className="fill-primary/15 stroke-primary" />
            <g textAnchor="middle" className="fill-foreground text-[18px] font-medium">
              <text x="325" y="290">Add a</text>
              <text x="325" y="316">cache here?</text>
            </g>
          </g>

          {/* Labels */}
          <g textAnchor="middle" className="fill-foreground font-serif text-[22px] font-semibold">
            <text x="115" y="120">Client</text>
            <text x="325" y="120">API</text>
            <text x="530" y="132">DB</text>
          </g>
          <text x="530" y="256" textAnchor="middle" className="fill-muted-foreground text-[15px]">
            Read replica
          </text>

          {/* Maya's cursor */}
          <g transform="translate(186 180)">
            <g>
              <animateTransform attributeName="transform" type="translate" values="0 0; 10 -6; 0 0" dur="5s" repeatCount="indefinite" />
              <path d="M0 0 L0 18 L5 13.5 L9 22 L12.5 20.5 L8.5 12.5 L15 12 Z" strokeWidth="1.5" strokeLinejoin="round" className="fill-primary stroke-card" />
              <rect x="16" y="20" width="52" height="22" rx="11" className="fill-primary" />
              <text x="42" y="35" textAnchor="middle" className="fill-primary-foreground text-[12px] font-medium">Maya</text>
            </g>
          </g>

          {/* Dev's cursor */}
          <g transform="translate(590 285)">
            <g>
              <animateTransform attributeName="transform" type="translate" values="0 0; -8 6; 0 0" dur="6s" repeatCount="indefinite" />
              <path d="M0 0 L0 18 L5 13.5 L9 22 L12.5 20.5 L8.5 12.5 L15 12 Z" strokeWidth="1.5" strokeLinejoin="round" className="fill-foreground stroke-card" />
              <rect x="16" y="20" width="44" height="22" rx="11" className="fill-foreground" />
              <text x="38" y="35" textAnchor="middle" className="fill-background text-[12px] font-medium">Dev</text>
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}

function CTAButtons() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
      <StartRoomButton className="h-12 gap-2 px-6 text-base" />
      <Button asChild variant="outline" className="h-12 px-6 text-base">
        <Link href="/signup">Create an account</Link>
      </Button>
      <Button
        asChild
        variant="ghost"
        className="h-12 border-transparent px-4 text-base text-muted-foreground hover:bg-background hover:text-foreground"
      >
        <Link href="/login">Log in</Link>
      </Button>
    </div>
  );
}

export default function Page() {
  return (
    <>
      {/* Hero */}
      <section id="hero" className="flex min-h-[calc(100dvh-4rem)] w-full scroll-mt-20 items-center">
        <div className={`${CONTAINER} py-14 lg:py-20`}>
          <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-16 xl:gap-24">
            {/* Left column */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
                <span className="relative flex h-2 w-2" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                Real-time whiteboard
              </div>

              <h1 className="font-serif text-5xl font-semibold leading-[1.04] tracking-tight text-foreground sm:text-6xl xl:text-7xl">
                Draw it out <span className="text-primary">together.</span>
              </h1>

              <p className="max-w-xl text-lg leading-relaxed text-muted-foreground xl:text-xl">
                Open a room, share the 8-character code, and everyone you invite draws on the same
                canvas at the same time.
              </p>

              {/* Start or join */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <StartRoomButton className="h-12 gap-2 px-6 text-base" />
                <span className="hidden h-12 items-center text-sm text-muted-foreground sm:flex">or</span>
                <JoinForm />
              </div>

              {/* Facts */}
              <ul className="flex flex-wrap gap-x-8 gap-y-3 border-t pt-6 text-sm text-muted-foreground">
                {HERO_FACTS.map(({ icon: Icon, label }) => (
                  <li key={label} className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-foreground" aria-hidden="true" />
                    <span>{label}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right column */}
            <div className="flex w-full justify-center lg:justify-end">
              <div className="w-full max-w-2xl">
                <HeroBoard />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-20 py-16 lg:py-24">
        <div className={CONTAINER}>
          <SectionHeading
            eyebrow="How it works"
            title="Three steps, no setup"
            description="From empty page to shared canvas in under a minute."
          />
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {STEPS.map((step) => (
              <div
                key={step.n}
                className="space-y-4 rounded-[var(--card-radius)] border bg-card p-6 lg:p-8"
              >
                <p className="font-mono text-3xl text-primary">{step.n}</p>
                <h3 className="font-serif text-xl font-semibold text-foreground">{step.title}</h3>
                <p className="text-muted-foreground">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-20 py-16 lg:py-24">
        <div className={CONTAINER}>
          <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
            <div className="lg:sticky lg:top-28">
              <SectionHeading
                eyebrow="Features"
                title="Built for thinking out loud"
                description="Share ideas instantly, without delays or distractions."
              />
            </div>

            {/* gap-px on a border-colored parent draws the hairlines */}
            <div className="grid grid-cols-1 gap-px overflow-hidden rounded-[var(--card-radius)] border bg-border sm:grid-cols-2">
              {FEATURES.map(({ icon, title, body }) => (
                <div key={title} className="space-y-4 bg-card p-6 lg:p-8">
                  <IconTile icon={icon} />
                  <div className="space-y-1.5">
                    <h3 className="font-serif text-lg font-semibold text-foreground">{title}</h3>
                    <p className="text-sm text-muted-foreground">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="scroll-mt-20 py-16 lg:py-24">
        <div className={CONTAINER}>
          <SectionHeading eyebrow="Who it's for" title="Made for people who think in sketches" />
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {AUDIENCES.map(({ icon, title, body }) => (
              <div
                key={title}
                className="flex items-start gap-4 rounded-[var(--card-radius)] border bg-card p-6"
              >
                <IconTile icon={icon} />
                <div className="space-y-1.5">
                  <h3 className="font-serif text-lg font-semibold text-foreground">{title}</h3>
                  <p className="text-sm text-muted-foreground">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="scroll-mt-20 pb-16 pt-8 lg:pb-24">
        <div className={CONTAINER}>
          <div className="rounded-[var(--card-radius)] border bg-secondary px-6 py-14 text-center sm:px-8 lg:py-20">
            <h2 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Open a room in one click.
            </h2>
            <p className="mx-auto mb-8 mt-3 max-w-md text-muted-foreground">
              Share the code and start drawing together in seconds.
            </p>
            <CTAButtons />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background/80 py-6">
        <div
          className={`${CONTAINER} flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row`}
        >
          <span>© 2026 Sketchpad</span>
          <nav aria-label="Footer" className="flex items-center gap-5">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    </>
  );
}
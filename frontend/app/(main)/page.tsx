"use client";

// export const metadata = {
//   title: "Sketchpad - Draw it out together",
//   description: "Draw it out together. Collaborative sketching for designers, engineers and students.",
// };

import { MousePointer2, Lock, Smartphone, PenTool, Code2, GraduationCap, RefreshCw, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CanvasPreview from "@/components/canvas-preview";
import Link from "next/link";
import { StartRoomButton } from "@/components/room-actions";
import { useRouter } from 'next/navigation';

function CTAButtons() {
  const router = useRouter();

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center gap-4">
      <StartRoomButton className="h-11" />
      <div className="flex space-x-2">
        <Button variant="outline" className="h-11" onClick={() => router.push('/signup')}>
          Create an account
        </Button>
        <Button variant="outline" className="h-11" onClick={() => router.push('/login')}>
          Log in
        </Button>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <>
      {/* Hero section */}
      <section id="hero" className="min-h-[calc(100dvh-4rem)] w-full scroll-mt-20">
        <div className="mx-auto w-full max-w-6xl px-6 py-16 lg:py-24">
          <div className="lg:grid grid-cols-[1fr_1.1fr] gap-12 items-center">
            {/* Left column */}
            <div className="space-y-6">
              {/* Eyebrow with primary-colored dot */}
              <div className="flex items-center gap-2 text-xs uppercase text-muted-foreground">
                <span className="h-1 w-1 bg-primary rounded-full"></span>
                <span>Real-time whiteboard</span>
              </div>
              {/* Heading */}
              <h1 className="text-5xl lg:text-6xl font-serif font-semibold text-foreground tracking-tight leading-[1.05]">
                Draw it out together.
              </h1>
              {/* Description */}
              <p className="text-base text-muted-foreground max-w-md">
                Open a room, share the 8-character code, and everyone you invite draws on the same canvas at the same time.
              </p>

              {/* Input row */}
              <div className="flex items-start space-x-3">
                {/* Start button */}
                <StartRoomButton className="h-11" />
                <div className="flex flex-col space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Have a code?
                  </p>
                  <div className="flex w-full space-x-2 sm:w-auto">
                    {/* Mono Input */}
                    <Input
                      type="text"
                      maxLength={8}
                      placeholder="ROOM CODE"
                      className="flex-1 h-11 w-0 font-mono uppercase tracking-widest"
                    />
                    {/* Join button */}
                    <Button variant="outline" className="h-11">
                      Join
                    </Button>
                  </div>
                </div>
              </div>

              {/* Inline facts (server component) */}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-4">
                <div className="flex items-center gap-2">
                  <MousePointer2 className="h-4 w-4" />
                  <span>Live cursors</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  <span>Private rooms</span>
                </div>
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  <span>Works on any device</span>
                </div>
              </div>
            </div>

            {/* Right column - Canvas preview */}
            <div className="lg:flex lg:items-start">
              <CanvasPreview
                className="rounded-[var(--card-radius)] border bg-card p-3 shadow-sm w-full max-w-lg aspect-[4/3]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How it works section */}
      <section id="how-it-works" className="py-16 lg:py-24 scroll-mt-20">
        <div className="mx-auto w-full max-w-6xl px-6">
          <h2 className="text-3xl font-serif font-semibold text-foreground mb-8">
            Three steps, no setup
          </h2>
          <div className="grid lg:grid-cols-3 gap-8 border-t pt-8">
            {/* Step 1 */}
            <div className="space-y-4">
              <p className="text-xl font-mono text-primary">01</p>
              <h3 className="text-lg font-serif font-semibold text-foreground">
                Start a room
              </h3>
              <p className="text-muted-foreground">
                One click creates an 8-character code
              </p>
            </div>
            {/* Step 2 */}
            <div className="space-y-4">
              <p className="text-xl font-mono text-primary">02</p>
              <h3 className="text-lg font-serif font-semibold text-foreground">
                Share the code
              </h3>
              <p className="text-muted-foreground">
                Anyone types it in and lands on the same canvas
              </p>
            </div>
            {/* Step 3 */}
            <div className="space-y-4">
              <p className="text-xl font-mono text-primary">03</p>
              <h3 className="text-lg font-serif font-semibold text-foreground">
                Draw together
              </h3>
              <p className="text-muted-foreground">
                Strokes and cursors appear for everyone as they happen
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section id="features" className="py-16 lg:py-24 scroll-mt-20">
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left column */}
            <div className="space-y-4">
              <h2 className="text-3xl font-serif font-semibold text-foreground">
                Built for thinking out loud
              </h2>
              <p className="text-lg text-muted-foreground">
                Share ideas instantly without delays or distractions
              </p>
            </div>

            {/* Right column - 2x2 hairline grid */}
            <div className="grid grid-cols-2 gap-4 border">
              {/* Live strokes */}
              <div className="flex items-center gap-3 p-4">
                <div className="h-5 w-5 bg-secondary rounded-sm flex items-center justify-center">
                  <PenTool className="h-3 w-3 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-serif font-semibold text-foreground">Live strokes</h3>
                  <p className="text-sm text-muted-foreground">
                    See every stroke appear in real-time as it&apos;s drawn
                  </p>
                </div>
              </div>

              {/* Presence */}
              <div className="flex items-center gap-3 p-4">
                <div className="h-5 w-5 bg-secondary rounded-sm flex items-center justify-center">
                  <Code2 className="h-3 w-3 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-serif font-semibold text-foreground">Presence</h3>
                  <p className="text-sm text-muted-foreground">
                    See who&apos;s online and what they&apos;re working on
                  </p>
                </div>
              </div>

              {/* Auto-reconnect */}
              <div className="flex items-center gap-3 p-4">
                <div className="h-5 w-5 bg-secondary rounded-sm flex items-center justify-center">
                  <RefreshCw className="h-3 w-3 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-serif font-semibold text-foreground">Auto-reconnect</h3>
                  <p className="text-sm text-muted-foreground">
                    Stay connected even if your connection drops temporarily
                  </p>
                </div>
              </div>

              {/* Share by code */}
              <div className="flex items-center gap-3 p-4">
                <div className="h-5 w-5 bg-secondary rounded-sm flex items-center justify-center">
                  <KeyRound className="h-3 w-3 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-serif font-semibold text-foreground">Share by code</h3>
                  <p className="text-sm text-muted-foreground">
                    Join instantly with just an 8-character code
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="py-16 lg:py-24 scroll-mt-20">
        <div className="mx-auto w-full max-w-6xl px-6">
          <h2 className="text-3xl font-serif font-semibold text-foreground mb-8">
            Who it&apos;s for
          </h2>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Designers */}
            <div className="flex items-center gap-3 p-4 border">
              <div className="h-5 w-5 bg-secondary rounded-sm flex items-center justify-center">
                <PenTool className="h-3 w-3 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-serif font-semibold text-foreground">Designers</h3>
                <p className="text-sm text-muted-foreground">
                  Sketch wireframes and UI flows in real time with teammates.
                </p>
              </div>
            </div>
            {/* Engineers */}
            <div className="flex items-center gap-3 p-4 border">
              <div className="h-5 w-5 bg-secondary rounded-sm flex items-center justify-center">
                <Code2 className="h-3 w-3 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-serif font-semibold text-foreground">Engineers</h3>
                <p className="text-sm text-muted-foreground">
                  Draft architecture diagrams and share logic instantly.
                </p>
              </div>
            </div>
            {/* Students */}
            <div className="flex items-center gap-3 p-4 border">
              <div className="h-5 w-5 bg-secondary rounded-sm flex items-center justify-center">
                <GraduationCap className="h-3 w-3 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-serif font-semibold text-foreground">Students</h3>
                <p className="text-sm text-muted-foreground">
                  Solve problems together and visualize concepts as a group.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="py-16 lg:py-24 scroll-mt-20">
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="border rounded-[var(--card-radius)] bg-secondary p-8 text-center">
            <h2 className="text-2xl font-serif font-semibold text-foreground mb-6">
              Open a room in one click.
            </h2>
            <CTAButtons />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background/80 py-6 scroll-mt-20">
        <div className="mx-auto w-full max-w-6xl px-6 text-center text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>© 2026 Sketchpad</span>
            <div className="flex space-x-4">
              <Link href="/how-it-works" className="hover:text-foreground">
                How it works
              </Link>
              <Link href="/features" className="hover:text-foreground">
                Features
              </Link>
              <Link href="/login" className="hover:text-foreground">
                Log in
              </Link>
              <Link href="/signup" className="hover:text-foreground">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
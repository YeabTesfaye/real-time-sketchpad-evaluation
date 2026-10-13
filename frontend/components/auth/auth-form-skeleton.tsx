import { cn } from "@/lib/utils";

type Variant = "login" | "signup";

// One config per page, so each skeleton matches its real form
const VARIANTS: Record<
  Variant,
  {
    srLabel: string;
    titleWidth: string;
    footerWidth: string;
    fields: { label: string; hint?: boolean }[];
  }
> = {
  login: {
    srLabel: "Loading the log in form",
    titleWidth: "w-3/5",
    footerWidth: "w-52",
    fields: [{ label: "w-12" }, { label: "w-16" }],
  },
  signup: {
    srLabel: "Loading the sign up form",
    titleWidth: "w-4/5",
    footerWidth: "w-48",
    fields: [
      { label: "w-12" },
      { label: "w-12" },
      { label: "w-16", hint: true },
      { label: "w-32" },
    ],
  },
};

// motion-safe: users with reduced motion get a static placeholder instead of a pulse
function Bone({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("rounded-md bg-foreground/10 motion-safe:animate-pulse", className)}
    />
  );
}

export default function AuthFormSkeleton({ variant }: { variant: Variant }) {
  const { srLabel, titleWidth, footerWidth, fields } = VARIANTS[variant];

  return (
    // Same spacing scale as LoginClient and SignupClient, so nothing shifts on swap
    <div role="status" aria-busy="true" aria-live="polite" className="space-y-8">
      <span className="sr-only">{srLabel}</span>

      {/* Heading */}
      <div className="space-y-3">
        <Bone className={cn("h-9 sm:h-10", titleWidth)} />
        <Bone className="h-5 w-5/6" />
      </div>

      <div className="space-y-6">
        {/* Google button */}
        <Bone className="h-11 w-full" />

        {/* Divider */}
        <div className="flex items-center gap-3" aria-hidden="true">
          <span className="h-px flex-1 bg-border" />
          <Bone className="h-3 w-28" />
          <span className="h-px flex-1 bg-border" />
        </div>

        {/* Fields and submit */}
        <div className="space-y-5">
          {fields.map((field, i) => (
            <div key={i} className="space-y-1.5">
              <Bone className={cn("h-4", field.label)} />
              <Bone className="h-11 w-full" />
              {field.hint && <Bone className="h-3 w-40" />}
            </div>
          ))}
          {/* Tinted like the real primary button */}
          <Bone className="h-11 w-full bg-primary/25" />
        </div>
      </div>

      {/* Switch-page link */}
      <div className="flex justify-center" aria-hidden="true">
        <Bone className={cn("h-4", footerWidth)} />
      </div>
    </div>
  );
}
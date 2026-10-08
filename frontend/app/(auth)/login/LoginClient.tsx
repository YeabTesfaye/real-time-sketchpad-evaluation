"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AuthDivider,
  AuthHeading,
  FormAlert,
  GoogleButton,
  PasswordField,
  TextField,
  authLinkClass,
} from "@/components/auth/auth-form-parts";
import { validateEmail, validateLoginPassword } from "@/lib/auth-validation";

type Field = "email" | "password";

export default function LoginClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Derived on every render, so there is no effect and no stale error state
  const errors: Record<Field, string | undefined> = {
    email: validateEmail(email),
    password: validateLoginPassword(password),
  };
  const visibleError = (f: Field) => (submitted || touched[f] ? errors[f] : undefined);
  const markTouched = (f: Field) => () => setTouched((t) => ({ ...t, [f]: true }));

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
    setFormError(null);
    setNotice(null);

    const firstInvalid = (["email", "password"] as const).find((f) => errors[f]);
    if (firstInvalid) {
      document.getElementById(firstInvalid)?.focus();
      return;
    }

    setLoading(true);
    try {
      // Frontend-only: simulate the request
      await new Promise((resolve) => setTimeout(resolve, 1000));
      localStorage.setItem("sketchpad_token", "demo-token");
      router.push("/");
    } catch {
      setFormError("We couldn't log you in. Check your details and try again.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <AuthHeading
        title="Welcome back"
        description="Log in to pick up your rooms where you left off."
      />

      <div className="space-y-6">
        <GoogleButton
          label="Continue with Google"
          disabled={loading}
          onClick={() => {
            setFormError(null);
            setNotice("Google sign-in isn't connected yet. Use your email and password for now.");
          }}
        />

        <AuthDivider>or log in with email</AuthDivider>

        {formError && <FormAlert tone="error">{formError}</FormAlert>}
        {notice && <FormAlert tone="info">{notice}</FormAlert>}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <TextField
            id="email"
            label="Email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={markTouched("email")}
            error={visibleError("email")}
            disabled={loading}
          />

          <PasswordField
            id="password"
            label="Password"
            autoComplete="current-password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={markTouched("password")}
            error={visibleError("password")}
            disabled={loading}
            aside={
              <button
                type="button"
                onClick={() => {
                  setFormError(null);
                  setNotice("Password reset isn't available in this demo yet.");
                }}
            className="-mr-2 cursor-pointer rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-foreground/6 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"              >
                Forgot password?
              </button>
            }
          />

          <Button type="submit" className="h-11 w-full text-base" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Logging in...
              </>
            ) : (
              "Log in"
            )}
          </Button>
        </form>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        New to Sketchpad?{" "}
        <Link href="/signup" className={authLinkClass}>
          Create an account
        </Link>
      </p>
    </div>
  );
}
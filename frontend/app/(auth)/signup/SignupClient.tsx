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
import {
  MIN_PASSWORD_LENGTH,
  validateConfirm,
  validateEmail,
  validateName,
  validateNewPassword,
} from "@/lib/auth-validation";

type Field = "name" | "email" | "password" | "confirm";
const FIELD_ORDER: Field[] = ["name", "email", "password", "confirm"];

export default function SignupClient() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const errors: Record<Field, string | undefined> = {
    name: validateName(name),
    email: validateEmail(email),
    password: validateNewPassword(password),
    confirm: validateConfirm(password, confirm),
  };
  const visibleError = (f: Field) => (submitted || touched[f] ? errors[f] : undefined);
  const markTouched = (f: Field) => () => setTouched((t) => ({ ...t, [f]: true }));

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
    setFormError(null);
    setNotice(null);

    const firstInvalid = FIELD_ORDER.find((f) => errors[f]);
    if (firstInvalid) {
      document.getElementById(firstInvalid)?.focus();
      return;
    }

    setLoading(true);
    try {
      // Frontend-only: simulate the request, then send them to log in
      await new Promise((resolve) => setTimeout(resolve, 1500));
      router.push("/login");
    } catch {
      setFormError("Something went wrong creating your account. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <AuthHeading
        title="Create your account"
        description="Start sketching with your team in under a minute."
      />

      <div className="space-y-6">
        <GoogleButton
          label="Sign up with Google"
          disabled={loading}
          onClick={() => {
            setFormError(null);
            setNotice("Google sign-in isn't connected yet. Sign up with your email for now.");
          }}
        />

        <AuthDivider>or sign up with email</AuthDivider>

        {formError && <FormAlert tone="error">{formError}</FormAlert>}
        {notice && <FormAlert tone="info">{notice}</FormAlert>}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <TextField
            id="name"
            label="Name"
            autoComplete="name"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={markTouched("name")}
            error={visibleError("name")}
            disabled={loading}
          />

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
            autoComplete="new-password"
            placeholder="Create a password"
            hint={`Use at least ${MIN_PASSWORD_LENGTH} characters.`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={markTouched("password")}
            error={visibleError("password")}
            disabled={loading}
          />

          <PasswordField
            id="confirm"
            label="Confirm password"
            autoComplete="new-password"
            placeholder="Repeat your password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            onBlur={markTouched("confirm")}
            error={visibleError("confirm")}
            disabled={loading}
          />

          <Button type="submit" className="h-11 w-full text-base" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </Button>
        </form>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className={authLinkClass}>
          Log in
        </Link>
      </p>
    </div>
  );
}
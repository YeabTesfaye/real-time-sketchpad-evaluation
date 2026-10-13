import { Suspense } from "react";
import type { Metadata } from "next";
import AuthFormSkeleton from "@/components/auth/auth-form-skeleton";
import SignupClient from "./SignupClient";
import Delay from "@/components/dev/delay";

export const metadata: Metadata = {
  title: "Sign up - Sketchpad",
  description: "Create your Sketchpad account",
};

export default function SignupPage() {
  return (
    <Suspense fallback={<AuthFormSkeleton variant="signup" />}>
      <Delay ms={400000}>
        <SignupClient />
      </Delay>
    </Suspense>
  );
}
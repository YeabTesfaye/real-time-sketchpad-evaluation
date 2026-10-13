import { Suspense } from "react";
import type { Metadata } from "next";
import AuthFormSkeleton from "@/components/auth/auth-form-skeleton";
import LoginClient from "./LoginClient";

export const metadata: Metadata = {
  title: "Log in - Sketchpad",
  description: "Log in to your Sketchpad account",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthFormSkeleton variant="login" />}>
      <LoginClient />
    </Suspense>
  );
}
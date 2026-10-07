export const metadata = {
  title: "Sign up - Sketchpad",
  description: "Create your Sketchpad account",
};

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-serif font-semibold text-foreground">
        Create your account
      </h2>
      <form className="space-y-4">
        <div className="space-y-2">
          <span className="text-sm font-medium text-muted-foreground">
            Name
          </span>
          <Input
            id="name"
            type="text"
            placeholder="Your name"
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <span className="text-sm font-medium text-muted-foreground">
            Email
          </span>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <span className="text-sm font-medium text-muted-foreground">
            Password
          </span>
          <div className="relative">
            <Input
              id="password"
              type="password"
              placeholder=" "
              className="w-full pl-10"
            />
            {/* Show/hide toggle would go here */}
          </div>
        </div>
        <Button
          type="submit"
          className="w-full"
        >
          Create account
        </Button>
      </form>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <Link href="/" className="hover:underline">
          Back to home
        </Link>
        <Link href="/login" className="hover:underline">
          Log in
        </Link>
      </div>
    </div>
  );
}
export const metadata = {
  title: "Log in - Sketchpad",
  description: "Log in to your Sketchpad account",
};

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-serif font-semibold text-foreground">
        Welcome back
      </h2>
      <form className="space-y-4">
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
          Log in
        </Button>
      </form>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <a href="/signup" className="hover:underline">
          Create an account
        </a>
      </div>
    </div>
  );
}
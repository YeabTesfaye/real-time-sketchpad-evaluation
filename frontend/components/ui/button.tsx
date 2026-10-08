import { forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  // Explicit border color, background-based ring offset, and pointer/disabled cursors
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md border border-transparent text-sm font-medium ring-offset-background transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:translate-y-px disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
  // Darken on hover (lighten in dark mode) instead of fading, so the change is obvious
      default:
        "bg-primary text-primary-foreground shadow-sm hover:shadow-md hover:brightness-90 active:brightness-75 dark:hover:brightness-110 dark:active:brightness-125",
      destructive:
        "bg-destructive text-destructive-foreground shadow-sm hover:shadow-md hover:brightness-90 active:brightness-75 dark:hover:brightness-110 dark:active:brightness-125",
      outline:
        "border-border bg-card text-foreground hover:border-foreground/30 hover:bg-secondary hover:shadow-sm active:bg-secondary/70",
      secondary:
        "bg-secondary text-secondary-foreground hover:bg-foreground/10 active:bg-foreground/15",
      // A foreground tint works on any surface, including ones that are already secondary
      ghost:
        "text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground active:bg-foreground/10",
      link: "text-primary underline-offset-4 hover:underline",
},
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size,
      asChild = false,
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), isLoading && "opacity-50", className)}
        {...props}
        {...(asChild ? {} : { disabled: disabled || isLoading })}
      >
        {isLoading && !asChild ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span>Working...</span>
          </div>
        ) : (
          children
        )}
      </Comp>
    );
  }
);

Button.displayName = 'Button';
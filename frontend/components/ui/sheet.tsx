import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg width-full sm:max-w-sm sm:rounded-lg",
  {
    variants: {
      side: {
        top: "top-0 border-b",
        right: "right-0 border-l",
        bottom: "bottom-0 border-t",
        left: "left-0 border-r",
      },
    },
    defaultVariants: {
      side: "bottom",
    },
  }
);

interface SheetProps
  extends React.ComponentPropsWithoutRef<typeof Slot>,
    VariantProps<typeof sheetVariants> {
  side?: VariantProps<typeof sheetVariants>["side"];
  children?: React.ReactNode;
}

export const Sheet = React.forwardRef<HTMLElement, SheetProps>(
  ({ className, side, children, ...props }, ref) => (
    <Slot
      ref={ref}
      className={cn(sheetVariants({ side, className }), className)}
      {...props}
    >
      {children}
    </Slot>
  )
);
Sheet.displayName = "Sheet";

export const SheetContent = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<typeof Slot> & { inset?: boolean; children?: React.ReactNode }
>(({ className, inset = true, children, ...props }, ref) => {
  const insetSize = inset ? "pb-20" : "";
  return (
    <Slot
      ref={ref}
      className={cn(
        "w-full space-y-6",
        insetSize,
        className
      )}
      {...props}
    >
      <div className="max-w-xs w-full">{children}</div>
    </Slot>
  );
});
SheetContent.displayName = "SheetContent";

export const SheetHeader = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<typeof Slot> & { children?: React.ReactNode }
>(({ className, children, ...props }, ref) => (
  <Slot
    ref={ref}
    className={cn("space-y-2", className)}
    {...props}
  >
    <div className="w-full">{children}</div>
  </Slot>
));
SheetHeader.displayName = "SheetHeader";

export const SheetTitle = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<typeof Slot> & { children?: React.ReactNode }
>(({ className, children, ...props }, ref) => (
  <Slot
    ref={ref}
    className={cn("text-xl font-semibold leading-none tracking-tight", className)}
    {...props}
  >
    <div className="w-full">{children}</div>
  </Slot>
));
SheetTitle.displayName = "SheetTitle";

export const SheetDescription = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<typeof Slot> & { children?: React.ReactNode }
>(({ className, children, ...props }, ref) => (
  <Slot
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  >
    <div className="w-full">{children}</div>
  </Slot>
));
SheetDescription.displayName = "SheetDescription";

export const SheetFooter = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<typeof Slot> & { children?: React.ReactNode }
>(({ className, children, ...props }, ref) => (
  <Slot
    ref={ref}
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
    {...props}
  >
    <div className="w-full">{children}</div>
  </Slot>
));
SheetFooter.displayName = "SheetFooter";
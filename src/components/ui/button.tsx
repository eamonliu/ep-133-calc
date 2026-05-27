import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "keycap inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-control)] text-sm font-medium transition-[background,box-shadow,transform,color,border-color] duration-100 outline-none select-none disabled:pointer-events-none disabled:opacity-45 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "keycap-orange bg-primary text-primary-foreground hover:bg-primary/95",
        secondary:
          "keycap-dark bg-secondary text-secondary-foreground hover:bg-secondary/95",
        operator:
          "keycap-orange bg-accent text-accent-foreground hover:bg-accent/95",
        function:
          "keycap-light bg-muted text-muted-foreground hover:bg-muted/95",
        ghost: "bg-transparent text-foreground hover:bg-foreground/8",
      },
      size: {
        default: "h-12 px-5",
        key: "h-12 w-full px-2 font-display text-[1.2rem] font-bold tracking-[0.04em] sm:text-[1.3rem]",
        icon: "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

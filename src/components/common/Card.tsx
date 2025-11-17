import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/components/ui/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  theme?: "light" | "dark";
  interactive?: boolean;
  noPadding?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ theme = "light", interactive = false, noPadding = false, className, children, ...props }, ref) => {
    const baseStyles = "rounded-2xl border transition-all duration-200";

    const themeStyles =
      theme === "dark"
        ? "bg-slate-900 border-slate-800"
        : "bg-white border-gray-200 shadow-sm";

    const interactiveStyles = interactive
      ? "cursor-pointer hover:shadow-md active:scale-[0.98]"
      : "";

    const paddingStyles = noPadding ? "" : "p-5";

    return (
      <div
        ref={ref}
        className={cn(baseStyles, themeStyles, interactiveStyles, paddingStyles, className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/components/ui/utils";

interface TagProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  theme?: "light" | "dark";
  selected?: boolean;
  variant?: "default" | "badge";
}

export const Tag = forwardRef<HTMLButtonElement, TagProps>(
  ({ theme = "light", selected = false, variant = "default", className, children, ...props }, ref) => {
    const baseStyles =
      "px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B35] focus-visible:ring-offset-2";

    const getVariantStyles = () => {
      if (variant === "badge") {
        return "cursor-default";
      }
      return "cursor-pointer";
    };

    const getThemeStyles = () => {
      if (selected) {
        return theme === "dark"
          ? "bg-[#FF6B35]/20 text-[#FF6B35] border-2 border-[#FF6B35]"
          : "bg-[#FF6B35]/10 text-[#FF6B35] border-2 border-[#FF6B35]";
      }

      if (variant === "badge") {
        return theme === "dark"
          ? "bg-slate-800 text-slate-300"
          : "bg-gray-100 text-gray-700";
      }

      return theme === "dark"
        ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
        : "bg-gray-100 text-gray-700 hover:bg-gray-200";
    };

    return (
      <button
        ref={ref}
        type="button"
        className={cn(baseStyles, getVariantStyles(), getThemeStyles(), className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Tag.displayName = "Tag";

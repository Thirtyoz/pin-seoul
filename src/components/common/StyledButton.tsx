import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/components/ui/utils";

interface StyledButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  theme?: "light" | "dark";
  fullWidth?: boolean;
}

export const StyledButton = forwardRef<HTMLButtonElement, StyledButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      theme = "light",
      fullWidth = false,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B35] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";

    const variantStyles = {
      primary: "bg-[#FF6B35] hover:bg-[#E55A2B] text-white shadow-sm",
      secondary:
        theme === "dark"
          ? "bg-slate-800 hover:bg-slate-700 text-white"
          : "bg-gray-100 hover:bg-gray-200 text-black",
      outline:
        theme === "dark"
          ? "bg-transparent hover:bg-slate-800 border-2 border-slate-600 text-white"
          : "bg-transparent hover:bg-gray-50 border-2 border-gray-300 text-black",
      ghost:
        theme === "dark"
          ? "bg-transparent hover:bg-slate-800 text-white"
          : "bg-transparent hover:bg-gray-100 text-black",
    };

    const sizeStyles = {
      sm: "px-4 py-2 text-sm gap-1.5",
      md: "px-6 py-3 text-base gap-2",
      lg: "px-8 py-4 text-lg gap-3",
    };

    const widthStyles = fullWidth ? "w-full" : "";

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          widthStyles,
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

StyledButton.displayName = "StyledButton";

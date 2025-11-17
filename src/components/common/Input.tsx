import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/components/ui/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  theme?: "light" | "dark";
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ theme = "light", error = false, className, ...props }, ref) => {
    const baseStyles =
      "w-full rounded-xl border transition-all duration-200 outline-none px-4 py-3";

    const themeStyles =
      theme === "dark"
        ? "bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-white focus:bg-slate-900"
        : "bg-gray-50 border-gray-200 text-black placeholder:text-gray-400 focus:border-black focus:bg-white";

    const errorStyles = error
      ? "border-red-500 focus:border-red-500"
      : "";

    const focusStyles =
      "focus-visible:ring-2 focus-visible:ring-[#FF6B35] focus-visible:ring-offset-2";

    return (
      <input
        ref={ref}
        className={cn(baseStyles, themeStyles, errorStyles, focusStyles, className)}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

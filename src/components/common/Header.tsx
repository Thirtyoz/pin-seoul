import { ArrowLeft } from "lucide-react";
import { cn } from "@/components/ui/utils";

interface HeaderProps {
  title?: string;
  onBack?: () => void;
  theme?: "light" | "dark";
  rightAction?: React.ReactNode;
  sticky?: boolean;
}

export function Header({ title, onBack, theme = "light", rightAction, sticky = true }: HeaderProps) {
  const baseStyles = "px-6 py-4 flex items-center gap-3 border-b backdrop-blur-sm z-20";

  const stickyStyles = sticky ? "sticky top-0" : "";

  const themeStyles =
    theme === "dark"
      ? "bg-[#0a0e1a]/95 border-slate-800"
      : "bg-white/95 border-gray-200";

  const textStyles = theme === "dark" ? "text-white" : "text-black";

  return (
    <header className={cn(baseStyles, stickyStyles, themeStyles)}>
      {onBack && (
        <button
          onClick={onBack}
          className={cn(
            "outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B35] rounded-lg p-1 transition-colors",
            theme === "dark" ? "hover:bg-slate-800" : "hover:bg-gray-100",
            textStyles
          )}
          aria-label="뒤로 가기"
        >
          <ArrowLeft className="w-6 h-6" strokeWidth={1.5} />
        </button>
      )}

      {title && <h1 className={cn("text-lg font-medium flex-1", textStyles)}>{title}</h1>}

      {rightAction && <div className="ml-auto">{rightAction}</div>}
    </header>
  );
}

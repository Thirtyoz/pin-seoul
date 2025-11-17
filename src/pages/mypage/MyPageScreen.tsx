import { User, MapPin, Award, Settings, LogOut, Edit2, Moon, Sun } from "lucide-react";
import { Header } from "@/components/common/Header";
import { Card } from "@/components/common/Card";
import { Tag } from "@/components/common/Tag";
import { StyledButton } from "@/components/common/StyledButton";
import { cn } from "@/components/ui/utils";

interface MyPageScreenProps {
  onBack: () => void;
  onLogout: () => void;
  userNickname: string;
  userInterests: string[];
  userEmail?: string;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

export function MyPageScreen({
  onBack,
  onLogout,
  userNickname,
  userInterests,
  userEmail,
  theme,
  onToggleTheme,
}: MyPageScreenProps) {
  return (
    <div
      className={cn(
        "min-h-screen flex flex-col transition-colors",
        theme === "dark" ? "bg-[#0a0e1a]" : "bg-white"
      )}
    >
      <Header title="마이페이지" onBack={onBack} theme={theme} />

      {/* Profile section */}
      <section
        className={cn(
          "px-6 py-8 border-b",
          theme === "dark" ? "border-slate-800" : "border-gray-100"
        )}
        aria-label="프로필 정보"
      >
        <div className="flex items-start gap-4 mb-6">
          {/* Avatar */}
          <div
            className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center transition-colors",
              theme === "dark" ? "bg-white" : "bg-gradient-to-br from-gray-900 to-gray-700"
            )}
            aria-hidden="true"
          >
            <User
              className={cn("w-10 h-10", theme === "dark" ? "text-black" : "text-white")}
              strokeWidth={1.5}
            />
          </div>

          {/* User info */}
          <div className="flex-1 min-w-0">
            <h2
              className={cn(
                "text-2xl font-semibold mb-1",
                theme === "dark" ? "text-white" : "text-black"
              )}
            >
              {userNickname}
            </h2>
            <p
              className={cn(
                "text-sm mb-3",
                theme === "dark" ? "text-slate-400" : "text-gray-600"
              )}
            >
              서울을 수집하는 중입니다.
            </p>
            <button
              className={cn(
                "text-sm flex items-center gap-1.5 transition-all duration-200 rounded-lg px-3 py-1.5 -ml-3",
                "outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B35] focus-visible:ring-offset-2",
                theme === "dark"
                  ? "text-white hover:bg-slate-800"
                  : "text-black hover:bg-gray-100"
              )}
              aria-label="프로필 수정"
            >
              <Edit2 className="w-3.5 h-3.5" strokeWidth={1.5} />
              프로필 수정
            </button>
          </div>
        </div>

        {/* Interest tags */}
        <div>
          <p
            className={cn(
              "text-sm font-medium mb-3",
              theme === "dark" ? "text-slate-400" : "text-gray-600"
            )}
          >
            관심사
          </p>
          <div className="flex flex-wrap gap-2">
            {userInterests.map((tag) => (
              <Tag key={tag} theme={theme} variant="badge">
                {tag}
              </Tag>
            ))}
          </div>
        </div>
      </section>

      {/* Stats section */}
      <section
        className={cn(
          "px-6 py-6 border-b",
          theme === "dark" ? "border-slate-800" : "border-gray-100"
        )}
        aria-label="통계"
      >
        <h3
          className={cn(
            "text-lg font-semibold mb-4",
            theme === "dark" ? "text-white" : "text-black"
          )}
        >
          나의 서울 컬렉션
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <Card theme={theme} className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award
                className={cn(
                  "w-5 h-5",
                  theme === "dark" ? "text-slate-400" : "text-gray-600"
                )}
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <span
                className={cn(
                  "text-sm",
                  theme === "dark" ? "text-slate-400" : "text-gray-600"
                )}
              >
                모은 배지
              </span>
            </div>
            <p
              className={cn(
                "text-2xl font-bold",
                theme === "dark" ? "text-white" : "text-black"
              )}
            >
              12개
            </p>
          </Card>

          <Card theme={theme} className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin
                className={cn(
                  "w-5 h-5",
                  theme === "dark" ? "text-slate-400" : "text-gray-600"
                )}
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <span
                className={cn(
                  "text-sm",
                  theme === "dark" ? "text-slate-400" : "text-gray-600"
                )}
              >
                방문한 구
              </span>
            </div>
            <p
              className={cn(
                "text-2xl font-bold",
                theme === "dark" ? "text-white" : "text-black"
              )}
            >
              8곳
            </p>
          </Card>
        </div>
      </section>

      {/* Account info section */}
      <section
        className={cn(
          "px-6 py-6 border-b",
          theme === "dark" ? "border-slate-800" : "border-gray-100"
        )}
        aria-label="계정 정보"
      >
        <h3
          className={cn(
            "text-lg font-semibold mb-4",
            theme === "dark" ? "text-white" : "text-black"
          )}
        >
          계정 정보
        </h3>
        <Card theme={theme} className="p-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-8 h-8 rounded flex items-center justify-center border shrink-0",
                theme === "dark"
                  ? "bg-slate-800 border-slate-700"
                  : "bg-white border-gray-200"
              )}
              aria-hidden="true"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  "text-xs mb-0.5",
                  theme === "dark" ? "text-slate-500" : "text-gray-500"
                )}
              >
                Google 계정
              </p>
              <p
                className={cn(
                  "text-sm truncate font-medium",
                  theme === "dark" ? "text-white" : "text-black"
                )}
              >
                {userEmail ?? "이메일 정보 없음"}
              </p>
            </div>
          </div>
        </Card>
      </section>

      {/* Settings section */}
      <section className="flex-1 px-6 py-6" aria-label="설정">
        <h3
          className={cn(
            "text-lg font-semibold mb-4",
            theme === "dark" ? "text-white" : "text-black"
          )}
        >
          설정
        </h3>
        <div className="space-y-3">
          {/* Theme toggle */}
          <Card
            theme={theme}
            interactive
            className="p-4 cursor-pointer"
            onClick={onToggleTheme}
            role="switch"
            aria-checked={theme === "dark"}
            aria-label="테마 전환"
            tabIndex={0}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {theme === "dark" ? (
                  <Moon
                    className="w-5 h-5 text-slate-400"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                ) : (
                  <Sun
                    className="w-5 h-5 text-gray-600"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                )}
                <span
                  className={cn(
                    "font-medium",
                    theme === "dark" ? "text-white" : "text-black"
                  )}
                >
                  {theme === "dark" ? "다크 모드" : "라이트 모드"}
                </span>
              </div>
              <div
                className={cn(
                  "w-11 h-6 rounded-full relative transition-all duration-200",
                  theme === "dark" ? "bg-[#FF6B35]" : "bg-gray-300"
                )}
                aria-hidden="true"
              >
                <div
                  className={cn(
                    "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200",
                    theme === "dark" ? "translate-x-6" : "translate-x-1"
                  )}
                />
              </div>
            </div>
          </Card>

          {/* Settings items */}
          <Card
            theme={theme}
            interactive
            className="p-4"
            role="button"
            tabIndex={0}
            aria-label="관심사 편집"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Edit2
                  className={cn(
                    "w-5 h-5",
                    theme === "dark" ? "text-slate-400" : "text-gray-600"
                  )}
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <span
                  className={cn(
                    "font-medium",
                    theme === "dark" ? "text-white" : "text-black"
                  )}
                >
                  관심사 편집
                </span>
              </div>
              <span
                className={cn(
                  "text-xl",
                  theme === "dark" ? "text-slate-600" : "text-gray-400"
                )}
                aria-hidden="true"
              >
                ›
              </span>
            </div>
          </Card>

          <Card
            theme={theme}
            interactive
            className="p-4"
            role="button"
            tabIndex={0}
            aria-label="계정 관리"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Settings
                  className={cn(
                    "w-5 h-5",
                    theme === "dark" ? "text-slate-400" : "text-gray-600"
                  )}
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <span
                  className={cn(
                    "font-medium",
                    theme === "dark" ? "text-white" : "text-black"
                  )}
                >
                  계정 관리
                </span>
              </div>
              <span
                className={cn(
                  "text-xl",
                  theme === "dark" ? "text-slate-600" : "text-gray-400"
                )}
                aria-hidden="true"
              >
                ›
              </span>
            </div>
          </Card>
        </div>
      </section>

      {/* Logout button */}
      <div
        className={cn(
          "px-6 pb-10 pt-4 border-t",
          theme === "dark" ? "border-slate-800" : "border-gray-100"
        )}
      >
        <StyledButton
          onClick={onLogout}
          variant="outline"
          theme={theme}
          fullWidth
          className="h-12"
        >
          <LogOut className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
          로그아웃
        </StyledButton>
      </div>
    </div>
  );
}

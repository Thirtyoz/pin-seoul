import {
  MapPin,
  Image as ImageIcon,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { Header } from "@/components/common/Header";
import { Card } from "@/components/common/Card";
import { Tag } from "@/components/common/Tag";
import { StyledButton } from "@/components/common/StyledButton";
import { Textarea } from "@/components/ui/textarea";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { cn } from "@/components/ui/utils";
import { generateBadgeImage, createBadgePrompt, analyzeImageContent, ImageAnalysisResult, ImageMetadata } from "@/services/geminiImageService";
import type { MapLocation } from "@/types/location";
import exifr from "exifr";

interface CreateBadgeScreenProps {
  onBack: () => void;
  onComplete: (badgeData: {
    imageUrl: string;
    description: string;
    tags: string[];
    location: string;
    locationCoords?: { lat: number; lng: number };
  }) => void;
  theme?: "light" | "dark";
}

const SUGGESTED_TAGS = [
  "#카페투어",
  "#야경",
  "#데이트",
  "#산책",
  "#뷰맛집",
  "#한강",
  "#골목산책",
];

export function CreateBadgeScreen({
  onBack,
  onComplete,
  theme = "light",
}: CreateBadgeScreenProps) {
  const location = useLocation();
  const selectedLocation = location.state?.selectedLocation as MapLocation | undefined;

  const [gpsVerified, setGpsVerified] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [description, setDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [imageGenerating, setImageGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<ImageAnalysisResult | null>(null);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiAnalysisProgress, setAiAnalysisProgress] = useState("");
  const [imageMetadata, setImageMetadata] = useState<ImageMetadata | null>(null);

  const handleGPSVerify = () => {
    setGpsLoading(true);
    setTimeout(() => {
      setGpsVerified(true);
      setGpsLoading(false);
    }, 1500);
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드 가능합니다.");
      return;
    }

    // Create object URL for preview first
    const objectUrl = URL.createObjectURL(file);
    setUploadedImageUrl(objectUrl);

    // Extract and log photo metadata
    let extractedMetadata: ImageMetadata | undefined;
    try {
      const metadata = await exifr.parse(file);

      console.log("=== 📸 사진 메타데이터 ===");
      console.log("파일명:", file.name);
      console.log("파일 크기:", (file.size / 1024 / 1024).toFixed(2), "MB");
      console.log("파일 타입:", file.type);
      console.log("마지막 수정 시간:", new Date(file.lastModified).toLocaleString('ko-KR'));

      if (metadata) {
        // Build ImageMetadata object
        extractedMetadata = {};

        // 사진 촬영 시간
        if (metadata.DateTimeOriginal || metadata.DateTime || metadata.CreateDate) {
          const dateTime = metadata.DateTimeOriginal || metadata.DateTime || metadata.CreateDate;
          extractedMetadata.dateTime = dateTime;
          console.log("📅 촬영 시간:", dateTime);
        }

        // GPS 위치 정보 (좌표)
        if (metadata.latitude && metadata.longitude) {
          extractedMetadata.latitude = metadata.latitude;
          extractedMetadata.longitude = metadata.longitude;
          console.log("📍 GPS 좌표:");
          console.log("  - 위도 (Latitude):", metadata.latitude);
          console.log("  - 경도 (Longitude):", metadata.longitude);
          if (metadata.altitude) {
            extractedMetadata.altitude = metadata.altitude;
            console.log("  - 고도 (Altitude):", metadata.altitude, "m");
          }
        } else {
          console.log("📍 GPS 좌표: 정보 없음");
        }

        // 카메라 정보
        if (metadata.Make || metadata.Model) {
          if (metadata.Make) extractedMetadata.make = metadata.Make;
          if (metadata.Model) extractedMetadata.model = metadata.Model;
          console.log("📷 카메라 정보:");
          if (metadata.Make) console.log("  - 제조사:", metadata.Make);
          if (metadata.Model) console.log("  - 모델:", metadata.Model);
        }

        // 이미지 크기
        if (metadata.ImageWidth && metadata.ImageHeight) {
          console.log("🖼️ 이미지 크기:", `${metadata.ImageWidth} x ${metadata.ImageHeight}px`);
        }

        // 기타 촬영 정보
        if (metadata.FNumber) console.log("조리개:", `f/${metadata.FNumber}`);
        if (metadata.ExposureTime) console.log("셔터 스피드:", metadata.ExposureTime, "초");
        if (metadata.ISO) console.log("ISO:", metadata.ISO);
        if (metadata.FocalLength) console.log("초점 거리:", metadata.FocalLength, "mm");

        // 전체 메타데이터 객체
        console.log("\n📋 전체 메타데이터:", metadata);
      } else {
        console.log("⚠️ EXIF 메타데이터를 찾을 수 없습니다.");
      }
      console.log("========================\n");
    } catch (error) {
      console.error("메타데이터 추출 중 오류:", error);
    }

    // Store metadata
    setImageMetadata(extractedMetadata || null);

    // Always run AI analysis (with or without metadata)
    console.log("🤖 AI 분석을 시작합니다...");
    setAiAnalyzing(true);
    setAiAnalysisProgress("AI가 사진을 분석하고 있습니다...");

    try {
      const analysisResult = await analyzeImageContent(
        objectUrl,
        (progress) => {
          setAiAnalysisProgress(progress);
        },
        extractedMetadata
      );

      console.log("=== 🤖 AI 분석 결과 ===");
      console.log("위치:", analysisResult.location);
      console.log("랜드마크:", analysisResult.landmark);
      console.log("설명:", analysisResult.description);
      console.log("추천 태그:", analysisResult.tags);
      console.log("신뢰도:", analysisResult.confidence);
      console.log("=====================\n");

      setAiAnalysisResult(analysisResult);

      // Auto-fill description and tags from AI analysis
      if (!description) {
        setDescription(analysisResult.description);
      }
      if (selectedTags.length === 0 && analysisResult.tags.length > 0) {
        setSelectedTags(analysisResult.tags);
      }

    } catch (error) {
      console.error("AI 분석 중 오류:", error);
      alert("AI 분석에 실패했습니다. 직접 정보를 입력해주세요.");
    } finally {
      setAiAnalyzing(false);
      setAiAnalysisProgress("");
    }
  };

  const canSubmit = gpsVerified && uploadedImageUrl && description.trim();

  const handleSubmit = async () => {
    if (!uploadedImageUrl) {
      alert("사진을 먼저 업로드해주세요!");
      return;
    }

    setImageGenerating(true);
    setGenerationProgress("업로드된 사진을 기반으로 AI 배지 생성 중...");

    try {
      const prompt = createBadgePrompt(description, selectedTags, true);
      console.log("=== AI 배지 생성 프롬프트 ===");
      console.log(prompt);
      console.log("=========================");

      const result = await generateBadgeImage({
        prompt,
        sourceImageUrl: uploadedImageUrl,
        onProgress: (message) => {
          setGenerationProgress(message);
        },
      });

      // Determine location: use selectedLocation first, then AI analysis result, then default
      const finalLocation = selectedLocation?.name ||
                          selectedLocation?.contsName ||
                          aiAnalysisResult?.location ||
                          "서울시 마포구 합정동";

      // Use GPS coordinates from selectedLocation if available
      const finalLocationCoords = selectedLocation?.location ||
                                 (imageMetadata?.latitude && imageMetadata?.longitude ?
                                   { lat: imageMetadata.latitude, lng: imageMetadata.longitude } :
                                   undefined);

      onComplete({
        imageUrl: result.dataUrl,
        description: description,
        tags: selectedTags,
        location: finalLocation,
        locationCoords: finalLocationCoords,
      });
    } catch (error) {
      console.error("Image generation failed:", error);
      alert("이미지 생성에 실패했습니다. 다시 시도해주세요.");
      setImageGenerating(false);
      setGenerationProgress("");
    }
  };

  return (
    <div
      className={cn(
        "min-h-screen flex flex-col transition-colors",
        theme === "dark" ? "bg-[#0a0e1a]" : "bg-white"
      )}
    >
      <Header title="새 배지 만들기" onBack={onBack} theme={theme} />

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {/* Step 1: GPS Verification */}
        <Card theme={theme} className="p-5" aria-label="위치 인증 단계">
          <div className="flex items-center gap-3 mb-4">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                theme === "dark"
                  ? "bg-white text-black"
                  : "bg-black text-white"
              )}
              aria-hidden="true"
            >
              01
            </div>
            <h3
              className={cn(
                "text-base font-semibold",
                theme === "dark" ? "text-white" : "text-black"
              )}
            >
              위치 인증
            </h3>
          </div>

          {!gpsVerified ? (
            <>
              <Card
                theme={theme}
                className="p-4 mb-4"
                aria-label="GPS 위치 확인"
              >
                <div className="flex items-center gap-3">
                  <MapPin
                    className={cn(
                      "w-5 h-5",
                      theme === "dark" ? "text-slate-400" : "text-gray-500"
                    )}
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <div className="flex-1">
                    {gpsLoading ? (
                      <p
                        className={cn(
                          "text-sm",
                          theme === "dark" ? "text-white" : "text-black"
                        )}
                      >
                        GPS로 현재 위치 확인중...
                      </p>
                    ) : (
                      <p
                        className={cn(
                          "text-sm",
                          theme === "dark"
                            ? "text-slate-400"
                            : "text-gray-600"
                        )}
                      >
                        현재 위치를 확인해주세요
                      </p>
                    )}
                  </div>
                  {gpsLoading && (
                    <Loader2
                      className={cn(
                        "w-5 h-5 animate-spin",
                        theme === "dark" ? "text-white" : "text-black"
                      )}
                      strokeWidth={1.5}
                      aria-label="로딩 중"
                    />
                  )}
                </div>
              </Card>
              <StyledButton
                onClick={handleGPSVerify}
                disabled={gpsLoading}
                variant="secondary"
                theme={theme}
                fullWidth
              >
                위치 인증하기
              </StyledButton>
            </>
          ) : (
            <Card
              theme={theme}
              className="p-4 flex items-center gap-3"
              aria-label="위치 인증 완료"
            >
              <CheckCircle2
                className="w-5 h-5 text-[#FF6B35]"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <div className="flex-1">
                <p
                  className={cn(
                    "text-sm font-medium mb-1",
                    theme === "dark" ? "text-white" : "text-black"
                  )}
                >
                  위치 인증 완료 ✓
                </p>
                <p
                  className={cn(
                    "text-xs",
                    theme === "dark" ? "text-slate-400" : "text-gray-600"
                  )}
                >
                  {selectedLocation?.name || selectedLocation?.contsName || "서울시 마포구 합정동"}
                </p>
              </div>
            </Card>
          )}
        </Card>

        {/* Step 2: Photo Upload - Show after GPS verification */}
        {gpsVerified && (
          <Card theme={theme} className="p-5" aria-label="사진 업로드 단계">
          <div className="flex items-center gap-3 mb-4">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                theme === "dark"
                  ? "bg-white text-black"
                  : "bg-black text-white"
              )}
              aria-hidden="true"
            >
              02
            </div>
            <h3
              className={cn(
                "text-base font-semibold",
                theme === "dark" ? "text-white" : "text-black"
              )}
            >
              사진 업로드
            </h3>
          </div>

          <div className="space-y-3">
              <div
                className={cn(
                  "aspect-[4/3] rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-3 relative",
                  theme === "dark"
                    ? "bg-slate-800/50 border-slate-600"
                    : "bg-white border-gray-300"
                )}
                aria-label="사진 업로드 영역"
              >
                {uploadedImageUrl ? (
                  <>
                    <ImageWithFallback
                      src={uploadedImageUrl}
                      alt="업로드된 사진"
                      className="w-full h-full object-cover rounded-xl"
                    />
                    {/* AI Analyzing Overlay */}
                    {aiAnalyzing && (
                      <div className="absolute inset-0 bg-black/60 rounded-xl flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
                        <Loader2
                          className="w-12 h-12 animate-spin text-white"
                          strokeWidth={1.5}
                          aria-label="분석 중"
                        />
                        <p className="text-white text-sm font-medium px-4 text-center">
                          {aiAnalysisProgress}
                        </p>
                      </div>
                    )}
                    {!aiAnalyzing && (
                      <button
                        onClick={() => {
                          setUploadedImageUrl(null);
                          setAiAnalysisResult(null);
                          setImageMetadata(null);
                          setDescription("");
                          setSelectedTags([]);
                        }}
                        className={cn(
                          "absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-md transition-all duration-200",
                          "outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B35] focus-visible:ring-offset-2",
                          theme === "dark"
                            ? "bg-slate-800 text-white hover:bg-slate-700"
                            : "bg-white text-black hover:bg-gray-100"
                        )}
                        aria-label="사진 삭제"
                      >
                        ✕
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <ImageIcon
                      className={cn(
                        "w-12 h-12",
                        theme === "dark" ? "text-slate-500" : "text-gray-400"
                      )}
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                    <p
                      className={cn(
                        "text-sm",
                        theme === "dark" ? "text-slate-400" : "text-gray-500"
                      )}
                    >
                      사진을 추가해주세요
                    </p>
                  </>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                disabled={!gpsVerified || imageGenerating || aiAnalyzing}
                id="file-upload-input"
              />
              <StyledButton
                onClick={() => document.getElementById('file-upload-input')?.click()}
                variant="secondary"
                theme={theme}
                fullWidth
                disabled={!gpsVerified || imageGenerating || aiAnalyzing}
                aria-label="앨범에서 선택"
              >
                <ImageIcon className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
                {!gpsVerified ? "위치 인증 후 업로드 가능" : "앨범에서 선택"}
              </StyledButton>
            </div>
        </Card>
        )}

        {/* Step 3: Description & Keywords - Show after AI analysis is complete */}
        {gpsVerified && uploadedImageUrl && aiAnalysisResult && (
          <Card
            theme={theme}
            className="p-5"
            aria-label="설명 및 키워드 입력 단계"
          >
          <div className="flex items-center gap-3 mb-4">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                theme === "dark"
                  ? "bg-white text-black"
                  : "bg-black text-white"
              )}
              aria-hidden="true"
            >
              03
            </div>
            <h3
              className={cn(
                "text-base font-semibold",
                theme === "dark" ? "text-white" : "text-black"
              )}
            >
              설명 & 키워드
            </h3>
          </div>

          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="이 순간을 한 줄로 기록해보세요."
            className={cn(
              "mb-4 rounded-xl resize-none outline-none transition-all duration-200",
              "focus-visible:ring-2 focus-visible:ring-[#FF6B35] focus-visible:ring-offset-2",
              theme === "dark"
                ? "bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-white focus:bg-slate-900"
                : "bg-white border-gray-300 text-black placeholder:text-gray-400 focus:border-black"
            )}
            rows={3}
            aria-label="배지 설명 입력"
          />

          <div>
            <p
              className={cn(
                "text-sm font-medium mb-3",
                theme === "dark" ? "text-slate-400" : "text-gray-600"
              )}
            >
              추천 키워드
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <Tag
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    theme={theme}
                    selected={isSelected}
                    aria-pressed={isSelected}
                    aria-label={`${tag} 키워드`}
                  >
                    {tag}
                  </Tag>
                );
              })}
            </div>
          </div>
        </Card>
        )}
      </div>

      {/* Bottom button */}
      <div
        className={cn(
          "px-6 pb-10 pt-4 border-t",
          theme === "dark" ? "border-slate-800" : "border-gray-100"
        )}
      >
        <StyledButton
          onClick={handleSubmit}
          disabled={!canSubmit || imageGenerating}
          variant="primary"
          fullWidth
          className="h-12"
        >
          {imageGenerating ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {generationProgress || "AI 배지 생성 중..."}
            </div>
          ) : (
            "AI 배지 생성하기"
          )}
        </StyledButton>
      </div>
    </div>
  );
}

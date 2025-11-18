import { MapPin, Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "react-router-dom";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { useAppStore, UserBadge } from "@/store/useAppStore";

interface BadgeResultScreenProps {
  onSave: () => void;
  onRegenerate: () => void;
}

interface BadgeData {
  imageUrl: string;
  description: string;
  tags: string[];
  location: string;
  locationCoords?: { lat: number; lng: number };
}

export function BadgeResultScreen({ onSave, onRegenerate }: BadgeResultScreenProps) {
  const location = useLocation();
  const badgeData = location.state as BadgeData | null;
  const addBadge = useAppStore((state) => state.addBadge);

  // Default data if no state passed
  const imageUrl = badgeData?.imageUrl || "";
  const description = badgeData?.description || "합정 카페거리";
  const tags = badgeData?.tags || ["#카페투어", "#힙한동네", "#데이트"];
  const locationText = badgeData?.location || "서울시 마포구 합정동";

  const handleSave = () => {
    if (!badgeData) {
      alert("저장할 배지 데이터가 없습니다.");
      return;
    }

    // 위치에서 주요 장소명 추출 (마지막 부분 또는 전체)
    // 예: "서울시 마포구 합정동" -> "합정동"
    // 예: "경복궁" -> "경복궁"
    const extractContsName = (location: string) => {
      const parts = location.split(' ');
      // 만약 짧은 이름이면 그대로 사용, 긴 주소면 마지막 부분 사용
      if (parts.length === 1) {
        return location;
      }
      // "서울시 마포구 합정동" 같은 경우 "합정동" 추출
      return parts[parts.length - 1];
    };

    // 새로운 배지 데이터 생성
    const newBadge: UserBadge = {
      id: `badge-${Date.now()}`,
      name: locationText,  // 장소명을 name으로 저장
      location: locationText,
      locationCoords: badgeData.locationCoords, // GPS 좌표 저장
      date: new Date().toLocaleDateString('ko-KR'),
      tags: tags,
      imageUrl: imageUrl,
      contsName: extractContsName(locationText),
      description: description, // 설명은 별도로 저장 (필요 시)
    };

    // Zustand store에 배지 추가
    addBadge(newBadge);

    console.log('배지가 저장되었습니다:', newBadge);

    // 홈으로 이동
    onSave();
  };
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <h2 className="text-black text-center">배지 생성 결과</h2>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        {/* Success animation/icon */}
        <div className="mb-8">
          <Sparkles className="w-16 h-16 text-[#FF6B35] mx-auto mb-2" strokeWidth={1.5} />
          <p className="text-gray-600 text-center text-sm">AI가 배지를 생성했어요!</p>
        </div>

        {/* Generated Badge */}
        <div className="mb-8 relative">
          {imageUrl ? (
            <div className="w-72 h-72 rounded-3xl shadow-lg overflow-hidden bg-gray-100 flex items-center justify-center">
              <ImageWithFallback
                src={imageUrl}
                alt="생성된 배지"
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="w-72 h-72 bg-black rounded-3xl shadow-sm flex flex-col items-center justify-center p-6">
              <MapPin className="w-28 h-28 text-white mb-4" fill="white" strokeWidth={1.5} />
              <p className="text-white text-2xl text-center mb-2">{description}</p>
              <p className="text-white/60 text-sm">AI Generated Badge</p>
            </div>
          )}
        </div>

        {/* Badge info */}
        <div className="w-full bg-gray-50 rounded-2xl p-5 border border-gray-200 space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 text-sm">설명</span>
            <span className="text-black">{description}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 text-sm">위치</span>
            <span className="text-black">{locationText}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 text-sm">날짜</span>
            <span className="text-black">{new Date().toLocaleDateString('ko-KR')}</span>
          </div>
          {tags.length > 0 && (
            <div className="pt-3 border-t border-gray-200">
              <p className="text-gray-600 text-sm mb-2">키워드</p>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-white text-gray-700 rounded-full text-sm border border-gray-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Helper text */}
        <p className="text-gray-500 text-xs text-center max-w-md leading-relaxed">
          업로드한 사진과 위치, 키워드를 기반으로 AI가 배지를 생성했습니다.
        </p>
      </div>

      {/* Bottom actions */}
      <div className="px-6 pb-10 pt-4 border-t border-gray-100 space-y-3">
        <Button
          onClick={handleSave}
          className="w-full h-12 bg-[#FF6B35] hover:bg-[#E55A2B] text-white rounded-full"
        >
          내 배지에 추가하기
        </Button>
        <Button
          onClick={onRegenerate}
          variant="outline"
          className="w-full h-12 bg-white border-gray-300 text-black hover:bg-gray-50 rounded-full"
        >
          <RefreshCw className="w-4 h-4 mr-2" strokeWidth={1.5} />
          다시 생성하기
        </Button>
      </div>
    </div>
  );
}
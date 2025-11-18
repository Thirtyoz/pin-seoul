import { GoogleGenAI } from '@google/genai';

export interface ImageGenerationOptions {
  prompt: string;
  sourceImageUrl?: string; // Optional: uploaded image to base the badge on
  onProgress?: (message: string) => void;
}

export interface ImageGenerationResult {
  dataUrl: string;
  mimeType: string;
}

export interface ImageAnalysisResult {
  location: string; // 추론된 위치 (예: "서울시 종로구")
  landmark: string; // 인식된 랜드마크/장소 (예: "경복궁")
  description: string; // 사진 내용 설명
  tags: string[]; // 추천 태그
  confidence: 'high' | 'medium' | 'low'; // 분석 신뢰도
}

export interface ImageMetadata {
  latitude?: number;
  longitude?: number;
  altitude?: number;
  dateTime?: Date | string;
  make?: string;
  model?: string;
  [key: string]: any; // Allow other metadata fields
}

/**
 * Generate an image using Gemini API
 * Returns a data URL that can be used directly in img src
 */
export async function generateBadgeImage(
  options: ImageGenerationOptions
): Promise<ImageGenerationResult> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('VITE_GEMINI_API_KEY is not configured');
  }

  const ai = new GoogleGenAI({
    apiKey,
  });

  const config = {
    responseModalities: ['IMAGE', 'TEXT'],
    imageConfig: {
      imageSize: '1K',
    },
  };

  const model = 'gemini-2.5-flash-image';

  // Build parts array based on whether source image is provided
  const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [
    {
      text: options.prompt,
    },
  ];

  // If source image is provided, convert it to base64 and add to parts
  if (options.sourceImageUrl) {
    options.onProgress?.('업로드된 이미지 처리 중...');

    // Convert data URL or blob URL to base64
    const base64Data = await urlToBase64(options.sourceImageUrl);
    const mimeType = getMimeTypeFromDataUrl(options.sourceImageUrl);

    parts.push({
      inlineData: {
        mimeType: mimeType || 'image/png',
        data: base64Data,
      },
    });
  }

  const contents = [
    {
      role: 'user',
      parts,
    },
  ];

  options.onProgress?.('AI 이미지 생성을 시작합니다...');

  const response = await ai.models.generateContentStream({
    model,
    config,
    contents,
  });

  let imageData: string | null = null;
  let imageMimeType: string | null = null;

  for await (const chunk of response) {
    if (!chunk.candidates || !chunk.candidates[0].content || !chunk.candidates[0].content.parts) {
      continue;
    }

    // Check for inline image data
    if (chunk.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
      const inlineData = chunk.candidates[0].content.parts[0].inlineData;
      imageData = inlineData.data || null;
      imageMimeType = inlineData.mimeType || null;
      options.onProgress?.('이미지 생성 완료!');
    } else if (chunk.text) {
      // Handle text progress updates if any
      options.onProgress?.(chunk.text);
    }
  }

  if (!imageData || !imageMimeType) {
    throw new Error('Failed to generate image from Gemini API');
  }

  // Convert base64 to data URL for browser use
  const dataUrl = `data:${imageMimeType};base64,${imageData}`;

  return {
    dataUrl,
    mimeType: imageMimeType,
  };
}

/**
 * Helper function to create a badge prompt from user input
 */
export function createBadgePrompt(description: string, tags: string[], hasSourceImage: boolean = false): string {
  const tagText = tags.length > 0 ? tags.join(', ') : '';

  if (hasSourceImage) {
    return `Transform this photo into a 3D figurine-style travel souvenir magnet design.

Location/Theme: ${description}
Keywords: ${tagText}

Style requirements:
- Remove white borders and background completely (transparent or clean background)
- Create a cute, collectible figurine aesthetic (like miniature travel souvenirs)
- Add depth and 3D dimensionality to make it look like a physical object
- Maintain the essence of the scene but stylize it as a charming collectible item
- Vibrant, eye-catching colors
- NOT just a flat photo - transform it into an illustrated, figurine-like object
- Think: refrigerator magnet souvenir that tourists would buy
- IMPORTANT: DO NOT include any Korean text, letters, or characters in the image - use English or no text at all
- If there is Korean text in the source image, replace it with English or remove it completely

The final result should look like a premium travel souvenir magnet with character and charm.`;
  }

  return `Create a beautiful, artistic badge image for a location in Seoul, South Korea.
Description: ${description}
Theme/Tags: ${tagText}

The image should be aesthetic, visually appealing, and suitable as a collectible digital badge.
Style: Modern, clean, with vibrant colors suitable for mobile app display.
Format: Square or rounded square composition.
IMPORTANT: DO NOT include any Korean text, letters, or characters in the image - use English or no text at all.`;
}

/**
 * Convert image URL (data URL or blob URL) to base64 string
 */
async function urlToBase64(url: string): Promise<string> {
  // If it's already a data URL, extract the base64 part
  if (url.startsWith('data:')) {
    const base64Match = url.match(/base64,(.+)/);
    if (base64Match) {
      return base64Match[1];
    }
  }

  // For blob URLs or other URLs, fetch and convert to base64
  const response = await fetch(url);
  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const base64Match = dataUrl.match(/base64,(.+)/);
      if (base64Match) {
        resolve(base64Match[1]);
      } else {
        reject(new Error('Failed to convert image to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Get MIME type from data URL
 */
function getMimeTypeFromDataUrl(url: string): string | null {
  if (url.startsWith('data:')) {
    const match = url.match(/data:([^;]+);/);
    return match ? match[1] : null;
  }
  return null;
}

/**
 * Analyze image content using Gemini Vision API
 * Returns location, landmark, description, and suggested tags
 */
export async function analyzeImageContent(
  imageUrl: string,
  onProgress?: (message: string) => void,
  metadata?: ImageMetadata
): Promise<ImageAnalysisResult> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('VITE_GEMINI_API_KEY is not configured');
  }

  const ai = new GoogleGenAI({
    apiKey,
  });

  onProgress?.('AI가 사진을 분석하고 있습니다...');

  // Convert image URL to base64
  const base64Data = await urlToBase64(imageUrl);
  const mimeType = getMimeTypeFromDataUrl(imageUrl) || 'image/png';

  // Build metadata context for the prompt
  let metadataContext = '';
  if (metadata) {
    metadataContext = '\n\n사진의 메타데이터 정보:';
    if (metadata.latitude && metadata.longitude) {
      metadataContext += `\n- GPS 좌표: 위도 ${metadata.latitude}, 경도 ${metadata.longitude}`;
      if (metadata.altitude) {
        metadataContext += ` (고도: ${metadata.altitude}m)`;
      }
      metadataContext += '\n  → 이 GPS 좌표를 기반으로 정확한 서울 위치(구/동)를 찾아주세요!';
    }
    if (metadata.dateTime) {
      metadataContext += `\n- 촬영 시간: ${metadata.dateTime}`;
    }
    if (metadata.make || metadata.model) {
      metadataContext += `\n- 카메라: ${metadata.make || ''} ${metadata.model || ''}`.trim();
    }
    metadataContext += '\n\n메타데이터가 있으면 이를 최우선으로 활용하여 위치를 정확히 파악해주세요.';
  } else {
    metadataContext = '\n\n사진에 메타데이터(GPS, 촬영시간 등)가 없습니다. 사진의 시각적 내용만으로 위치와 장소를 추론해주세요.';
  }

  const prompt = `이 사진을 분석하여 다음 정보를 JSON 형식으로 제공해주세요:

1. location: 서울의 어느 구/동인지 추론 (예: "서울시 종로구", "서울시 강남구 역삼동")
2. landmark: 인식된 랜드마크나 장소 이름 (예: "경복궁", "홍대 거리", "한강공원", "카페")
3. description: 사진 내용을 한 문장으로 설명 (예: "전통 한옥 건물과 궁궐", "야경이 아름다운 강변")
4. tags: 다음 태그 중 사진과 어울리는 3-5개를 선택 ["#카페투어", "#야경", "#데이트", "#산책", "#뷰맛집", "#한강", "#골목산책"]
5. confidence: 분석 신뢰도 - "high", "medium", "low" 중 하나${metadataContext}

서울의 유명한 랜드마크를 최대한 정확히 식별해주세요. 만약 특정 장소를 식별할 수 없다면, 사진의 특징(카페, 공원, 거리 등)을 기반으로 추론해주세요.

응답은 반드시 다음 형식의 JSON만 반환해주세요:
{
  "location": "서울시 XX구",
  "landmark": "장소명",
  "description": "설명",
  "tags": ["#태그1", "#태그2", "#태그3"],
  "confidence": "high"
}`;

  const contents = [
    {
      role: 'user',
      parts: [
        {
          text: prompt,
        },
        {
          inlineData: {
            mimeType,
            data: base64Data,
          },
        },
      ],
    },
  ];

  const model = 'gemini-2.0-flash-exp';

  const response = await ai.models.generateContent({
    model,
    contents,
  });

  onProgress?.('분석 결과 처리 중...');

  // Extract text response
  const text = response.text;

  try {
    // Extract JSON from response (handle markdown code blocks)
    let jsonText = text.trim();

    // Remove markdown code blocks if present
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    }

    const result = JSON.parse(jsonText) as ImageAnalysisResult;

    onProgress?.('분석 완료!');

    return result;
  } catch (error) {
    console.error('Failed to parse AI response:', text, error);

    // Fallback response if parsing fails
    return {
      location: '서울시',
      landmark: '알 수 없음',
      description: '사진 분석 중 오류가 발생했습니다.',
      tags: ['#서울'],
      confidence: 'low',
    };
  }
}

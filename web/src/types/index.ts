export interface VideoAnalysisResult {
  steps: string[];
  techniques: string[];
  style: string;
  duration: string;
  difficulty: '简单' | '中等' | '困难';
  skinType: string[];
  faceShape: string[];
  targetAudience: string;
}

export type SelfieFaceAnalysisSkillResult = {
  code: number;
  message: string;
  data?: {
    basic_info: {
      face_shape: '鹅蛋脸' | '圆脸' | '方脸' | '心形脸' | '菱形脸' | string;
      symmetry_score: number;
      proportion_match: number;
      feature_balance: number;
    };
    features_detail?: {
      eye: { type: string; description: string };
      brow: { type: string; description: string };
      nose: { type: string; description: string };
      lip: { type: string; description: string };
    };
    overall_description: string;
    note: string;
  };
};

export interface Recommendation {
  makeupStyle: string;
  products: Product[];
  relatedTutorials: Tutorial[];
}

export interface Product {
  name: string;
  category: string;
  shade?: string;
  description: string;
  matchScore?: number; // 0-100
  owned?: boolean;
}

export interface Tutorial {
  title: string;
  platform: string;
  link: string;
}

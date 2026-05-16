import { create } from 'zustand'

interface VideoAnalysis {
  steps: string[];
  skinType: string[];
  faceShape: string[];
  targetAudience: string;
}

interface FaceAnalysis {
  faceShape: string;
  skinTone: string;
  features: string[];
  photoUrl?: string;
}

interface AppState {
  videoAnalysis: VideoAnalysis | null;
  faceAnalysis: FaceAnalysis | null;
  loading: boolean;
  error: string | null;
  setVideoAnalysis: (data: VideoAnalysis) => void;
  setFaceAnalysis: (data: FaceAnalysis) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useStore = create<AppState>((set) => ({
  videoAnalysis: null,
  faceAnalysis: null,
  loading: false,
  error: null,
  setVideoAnalysis: (data) => set({ videoAnalysis: data }),
  setFaceAnalysis: (data) => set({ faceAnalysis: data }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}))

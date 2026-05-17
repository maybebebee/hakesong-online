import PhotoUploader from "@/components/PhotoUploader";
import VideoAnalyzer from "@/components/VideoAnalyzer";
import MakeupPreview from "@/components/MakeupPreview";
import FaceProcessor from "@/components/FaceProcessor";
import RecommendationResult from "@/components/RecommendationResult";
import { Sparkles, ArrowDown } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden bg-white">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-beauty-100/50 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-beauty-200/30 blur-[120px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-beauty-50 text-beauty-600 px-6 py-2 rounded-full font-bold text-sm mb-8 animate-bounce">
            <Sparkles size={16} />
            Hackathon 2026 Special Project
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 leading-tight">
            让美妆视频<br />
            成为你的<span className="text-beauty-500">生活搭子</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed">
            AI 驱动的智能美妆助手。从视频分析到人脸检测，<br className="hidden md:block" />
            为您量身打造每一套专属妆容方案。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a 
              href="#video" 
              className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
            >
              立即开始分析
            </a>
            <a 
              href="#upload" 
              className="bg-white text-beauty-500 border-2 border-beauty-100 px-10 py-5 rounded-2xl font-bold text-lg hover:bg-beauty-50 transition-all"
            >
              先上传照片
            </a>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-slate-300">
          <ArrowDown size={32} />
        </div>
      </section>

      {/* Feature Sections */}
      <PhotoUploader />
      <VideoAnalyzer />
      <MakeupPreview />
      <FaceProcessor />
      <RecommendationResult />

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="text-beauty-400" size={32} />
                <span className="text-2xl font-bold">Mirror Ai</span>
              </div>
              <p className="text-slate-400 max-w-sm leading-relaxed">
                重新定义美妆内容消费。我们利用 AI 技术，让每个用户都能轻松复刻心仪妆容。
              </p>
            </div>
            <div className="text-right">
              <p className="text-slate-500 text-sm">© 2026 Hackathon Beauty Tech. All rights reserved.</p>
              <div className="flex gap-6 justify-end mt-4 text-slate-400 text-sm">
                <a href="#" className="hover:text-beauty-400 transition-colors">隐私政策</a>
                <a href="#" className="hover:text-beauty-400 transition-colors">使用条款</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

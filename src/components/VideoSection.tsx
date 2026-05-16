import React, { useState } from 'react'
import { Link, Search, CheckCircle2, ChevronRight, Play } from 'lucide-react'
import { useStore } from '../store/useStore'

interface VideoSectionProps {
  onNext: () => void;
}

const VideoSection: React.FC<VideoSectionProps> = ({ onNext }) => {
  const [url, setUrl] = useState('')
  const { setVideoAnalysis, setLoading, videoAnalysis } = useStore()

  const handleAnalyze = async () => {
    if (!url) return
    setLoading(true)
    // 模拟 API 调用延迟
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setVideoAnalysis({
      steps: ['清透底妆', '消肿眼妆', '自然修容', '奶茶唇色'],
      skinType: ['混合皮', '油皮'],
      faceShape: ['圆脸', '方脸'],
      targetAudience: '18-25岁，追求日常通勤感的人群'
    })
    setLoading(false)
  }

  return (
    <div className="space-y-8">
      {/* Input Area */}
      <section className="bg-white rounded-3xl p-8 shadow-sm border border-beauty-100">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Link className="text-beauty-500" />
          美妆视频智能分析
        </h2>
        
        <div className="relative group">
          <input
            type="text"
            placeholder="粘贴抖音/小红书美妆视频链接..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full bg-beauty-50 border-2 border-beauty-100 rounded-2xl px-6 py-4 pr-32 focus:outline-none focus:border-beauty-400 transition-all text-slate-700 placeholder:text-slate-400"
          />
          <button
            onClick={handleAnalyze}
            disabled={!url}
            className="absolute right-2 top-2 bottom-2 bg-beauty-500 hover:bg-beauty-600 disabled:bg-slate-300 text-white px-6 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-lg shadow-beauty-100"
          >
            <Search size={18} />
            分析
          </button>
        </div>
        
        <p className="mt-4 text-sm text-slate-500 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-beauty-400 rounded-full" />
          支持主流短视频平台，AI 将自动提取化妆步骤与适用参数
        </p>
      </section>

      {/* Results Area */}
      {videoAnalysis && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Steps */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-beauty-100">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Play size={20} className="text-beauty-500" />
                化妆流程步骤
              </h3>
              <div className="space-y-3">
                {videoAnalysis.steps.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-beauty-50 rounded-xl group hover:bg-beauty-100 transition-colors">
                    <span className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-xs font-bold text-beauty-500 shadow-sm">
                      {idx + 1}
                    </span>
                    <span className="text-slate-700 font-medium">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-beauty-100">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-beauty-500" />
                  适配面部特征
                </h3>
                <div className="flex flex-wrap gap-2">
                  {videoAnalysis.skinType.map(t => (
                    <span key={t} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold">#{t}</span>
                  ))}
                  {videoAnalysis.faceShape.map(t => (
                    <span key={t} className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-bold">#{t}</span>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-sm border border-beauty-100">
                <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
                  目标适用人群
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {videoAnalysis.targetAudience}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onNext}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all group"
          >
            下一步：上传人脸进行检测
            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}
    </div>
  )
}

export default VideoSection

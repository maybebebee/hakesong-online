import { useState } from 'react'
import { Sparkles, Video, UserCircle, Wand2, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import VideoSection from './components/VideoSection'
import FaceSection from './components/FaceSection'
import RecommendationSection from './components/RecommendationSection'
import PreviewSection from './components/PreviewSection'
import { useStore } from './store/useStore'

function App() {
  const [activeTab, setActiveTab] = useState('video')
  const { loading, error } = useStore()

  const tabs = [
    { id: 'video', label: '视频分析', icon: Video },
    { id: 'face', label: '人脸检测', icon: UserCircle },
    { id: 'recommend', label: '推荐结果', icon: Sparkles },
    { id: 'preview', label: '妆后预览', icon: Wand2 },
  ]

  return (
    <div className="min-h-screen bg-beauty-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-beauty-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-beauty-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-beauty-200">
                <Sparkles size={24} />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-beauty-600 to-beauty-400">
                AI 美妆搭子
              </span>
            </div>
            
            <div className="hidden md:flex gap-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                    activeTab === tab.id
                      ? 'bg-beauty-500 text-white shadow-md'
                      : 'text-slate-600 hover:bg-beauty-100'
                  }`}
                >
                  <tab.icon size={18} />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading Overlay */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-white/60 backdrop-blur-sm flex items-center justify-center"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-beauty-200 border-t-beauty-500 rounded-full animate-spin" />
                <p className="text-beauty-600 font-medium animate-pulse">AI 正在努力计算中...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Toast */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              className="fixed top-20 left-1/2 -translate-x-1/2 z-[70] bg-red-50 text-red-600 px-6 py-3 rounded-2xl shadow-xl border border-red-100 flex items-center gap-3"
            >
              <span className="font-medium">{error}</span>
              <button onClick={() => useStore.getState().setError(null)} className="hover:bg-red-100 p-1 rounded-full">
                &times;
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Content Area */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'video' && <VideoSection onNext={() => setActiveTab('face')} />}
                {activeTab === 'face' && <FaceSection onNext={() => setActiveTab('recommend')} />}
                {activeTab === 'recommend' && <RecommendationSection onNext={() => setActiveTab('preview')} />}
                {activeTab === 'preview' && <PreviewSection />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Sidebar Info / Progress */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-beauty-100">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <ArrowRight size={20} className="text-beauty-500" />
                使用指引
              </h3>
              <ul className="space-y-4">
                {[
                  { step: 1, text: '粘贴美妆视频链接，AI 自动拆解步骤', done: !!useStore.getState().videoAnalysis },
                  { step: 2, text: '上传或拍摄照片，识别你的面部特征', done: !!useStore.getState().faceAnalysis },
                  { step: 3, text: '获取个性化美妆建议与产品推荐', done: false },
                  { step: 4, text: '预览 AI 生成的真人妆后效果', done: false },
                ].map((item) => (
                  <li key={item.step} className="flex gap-4 items-start">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      item.done ? 'bg-green-500 text-white' : 'bg-beauty-100 text-beauty-600'
                    }`}>
                      {item.step}
                    </div>
                    <p className={`text-sm ${item.done ? 'text-slate-400 line-through' : 'text-slate-600'}`}>
                      {item.text}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gradient-to-br from-beauty-500 to-beauty-400 rounded-3xl p-6 text-white shadow-lg shadow-beauty-200">
              <h3 className="font-bold mb-2">💡 黑客松小贴士</h3>
              <p className="text-sm opacity-90 leading-relaxed">
                我们的 AI 不仅解析视频，还会根据你的肤质实时调整方案。快来试试“妆后预览”功能吧！
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-beauty-100 px-4 py-2 flex justify-around z-50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl ${
              activeTab === tab.id ? 'text-beauty-500' : 'text-slate-400'
            }`}
          >
            <tab.icon size={20} />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default App

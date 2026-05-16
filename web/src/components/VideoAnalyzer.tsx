'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Video, Play, CheckCircle2, AlertCircle, RefreshCcw, Clock, Zap, BookOpen, User, ChevronRight, X } from 'lucide-react'
import { analyzeVideo } from '@/lib/api'
import { VideoAnalysisResult } from '@/types'

export default function VideoAnalyzer() {
  const [url, setUrl] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<VideoAnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showPractice, setShowPractice] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null)

  const presets = [
    {
      id: '1',
      title: '男模教程',
      subtitle: '快速上镜',
      meta: '6-10min',
      url: 'https://v.douyin.com/Rnm0lFqRvrY/'
    },
    {
      id: '2',
      title: '烟熏妆',
      subtitle: '氛围浓郁',
      meta: '18-25min',
      url: 'https://v.douyin.com/1gK28tUEXzI/'
    },
    {
      id: '3',
      title: '漫画妆',
      subtitle: '眼神放大',
      meta: '15-22min',
      url: 'https://v.douyin.com/_sZllrORtwY/'
    },
    {
      id: '4',
      title: '清冷妆',
      subtitle: '冷感高级',
      meta: '12-18min',
      url: 'https://v.douyin.com/aTb4CEtbvX8/'
    },
  ] as const
  const presetIdByUrl = presets.find(p => p.url === url)?.id
  const activePresetId = presetIdByUrl ?? selectedPresetId
  const activePreset = activePresetId ? presets.find(p => p.id === activePresetId) : undefined
  const syncPresetToPreview = (presetId: string | null, autoGenerate: boolean) => {
    try {
      if (!presetId) return
      localStorage.setItem('video_preset_v1', presetId)
      window.dispatchEvent(new CustomEvent('video_preset_v1:updated', { detail: { presetId, autoGenerate } }))
    } catch {}
  }
  const getPreviewPreset = () => {
    const preset =
      (presetIdByUrl ?? selectedPresetId) && ['1', '2', '3', '4'].includes(presetIdByUrl ?? selectedPresetId ?? '')
        ? (presetIdByUrl ?? selectedPresetId)
        : null
    return preset
  }

  const handleAnalyze = async () => {
    if (!url) return
    setAnalyzing(true)
    setError(null)
    setResult(null)
    setShowPractice(false)
    setCurrentStep(0)
    try {
      localStorage.setItem('video_analysis_ready_v1', '0')
      window.dispatchEvent(new CustomEvent('video_analysis_ready_v1:updated', { detail: { ready: false } }))
    } catch {}
    
    try {
      const data = await analyzeVideo(url, presetIdByUrl ?? selectedPresetId ?? undefined)
      setResult(data)
      syncPresetToPreview(getPreviewPreset(), false)
      try {
        localStorage.setItem('video_analysis_ready_v1', '1')
        window.dispatchEvent(new CustomEvent('video_analysis_ready_v1:updated', { detail: { ready: true } }))
      } catch {}
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '分析过程中出现未知错误')
      try {
        localStorage.setItem('video_analysis_ready_v1', '0')
        window.dispatchEvent(new CustomEvent('video_analysis_ready_v1:updated', { detail: { ready: false } }))
      } catch {}
    } finally {
      setAnalyzing(false)
    }
  }

  useEffect(() => {
    const onOpenPractice = () => {
      if (result) setShowPractice(true)
    }
    window.addEventListener('video_practice_v1:open', onOpenPractice)
    return () => window.removeEventListener('video_practice_v1:open', onOpenPractice)
  }, [result])

  return (
    <section id="video" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {presets.map((preset) => {
            const selected = selectedPresetId === preset.id
            return (
              <motion.div
                key={preset.id}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSelectedPresetId(preset.id)
                  setUrl(preset.url)
                  syncPresetToPreview(preset.id, false)
                }}
                className={[
                  'text-left rounded-[1.75rem] p-5 border transition-all bg-white shadow-sm',
                  selected ? 'border-beauty-300 ring-2 ring-beauty-300 shadow-beauty-100' : 'border-slate-100 hover:border-beauty-200'
                ].join(' ')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key !== 'Enter' && e.key !== ' ') return
                  e.preventDefault()
                  setSelectedPresetId(preset.id)
                  setUrl(preset.url)
                }}
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <div className="text-slate-900 font-black leading-tight">{preset.title}</div>
                    <div className="text-xs text-slate-400 font-bold mt-1">{preset.subtitle}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-[10px] font-black px-2 py-1 rounded-full border bg-slate-50 text-slate-600 border-slate-100">
                      视频{preset.id}
                    </div>
                    <Link
                      href={`/video/${preset.id}`}
                      className={[
                        'text-[10px] font-black px-2 py-1 rounded-full border transition-colors',
                        selected ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      ].join(' ')}
                    >
                      播放
                    </Link>
                    <div className={[
                      'text-[10px] font-black px-2 py-1 rounded-full border',
                      selected ? 'bg-beauty-50 text-beauty-600 border-beauty-100' : 'bg-slate-50 text-slate-500 border-slate-100'
                    ].join(' ')}>
                      {selected ? '已选择' : '示例'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold">
                  <span>预计时长</span>
                  <span className="text-slate-700">{preset.meta}</span>
                </div>
              </motion.div>
            )
          })}
        </div>

        <div className="text-center mb-12">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-beauty-50 text-beauty-600 px-4 py-1.5 rounded-full text-sm font-bold mb-4"
          >
            <Video size={16} />
            Step 1: 视频解析
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-slate-900 mb-4"
          >
            美妆视频智能分析
          </motion.h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            支持抖音、小红书、B站等主流平台链接。AI 将自动梳理完整妆容流程、适配肤质与脸型。
          </p>
        </div>

        <div className="max-w-3xl mx-auto mb-16">
          <div className="relative group">
            <input
              type="text"
              placeholder="在此粘贴视频链接（也可先选择上方示例视频）"
              value={url}
              onChange={(e) => {
                const nextUrl = e.target.value
                setUrl(nextUrl)
                const matched = presets.find(p => p.url === nextUrl)
                setSelectedPresetId(matched ? matched.id : null)
              }}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl px-8 py-6 pr-40 focus:outline-none focus:border-beauty-400 transition-all text-lg"
            />
            <button
              onClick={handleAnalyze}
              disabled={analyzing || !url}
              className="absolute right-3 top-3 bottom-3 bg-beauty-500 hover:bg-beauty-600 disabled:bg-slate-300 text-white px-8 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-beauty-200"
            >
              {analyzing ? (
                <RefreshCcw size={20} className="animate-spin" />
              ) : (
                <Search size={20} />
              )}
              {analyzing ? '解析中...' : '立即分析'}
            </button>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600"
              >
                <AlertCircle size={20} />
                <span className="text-sm font-medium">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* 报告概览卡片 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Zap, label: '化妆风格', value: result.style, color: 'text-beauty-500', bg: 'bg-beauty-50' },
                { icon: Clock, label: '预计时长', value: result.duration, color: 'text-blue-500', bg: 'bg-blue-50' },
                { icon: BookOpen, label: '难度等级', value: result.difficulty, color: 'text-orange-500', bg: 'bg-orange-50' },
                { icon: User, label: '适用脸型', value: result.faceShape[0], color: 'text-purple-500', bg: 'bg-purple-50' },
              ].map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`${item.bg} p-6 rounded-[2rem] border border-white shadow-sm`}
                >
                  <item.icon size={24} className={`${item.color} mb-3`} />
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">{item.label}</p>
                  <p className="text-slate-800 font-black">{item.value}</p>
                </motion.div>
              ))}
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => {
                  syncPresetToPreview(getPreviewPreset(), true)
                  document.getElementById('preview')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="bg-beauty-500 hover:bg-beauty-600 text-white px-10 py-4 rounded-2xl font-black transition-all shadow-xl shadow-beauty-200"
              >
                去看 AI 妆后预览效果
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* 化妆流程 */}
              <div className="lg:col-span-2 bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-beauty-500 rounded-xl flex items-center justify-center text-white">
                    <Play size={20} />
                  </div>
                  化妆流程详细分解报告
                </h3>
                <div className="space-y-4 relative">
                  {result.steps.map((step, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-beauty-200 transition-colors"
                    >
                      <span className="text-2xl font-black text-beauty-100 italic leading-none">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="font-bold text-slate-700">{step}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* 互动跟练 Modal */}
              <AnimatePresence>
                {showPractice && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-4"
                  >
                    <motion.div 
                      initial={{ scale: 0.9, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      className="bg-white w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl relative"
                    >
                      <button 
                        onClick={() => setShowPractice(false)}
                        className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 z-10"
                      >
                        <X size={32} />
                      </button>

                      <div className="grid grid-cols-1 md:grid-cols-12 h-[80vh]">
                        {/* 模拟视频播放区 */}
                        <div className="md:col-span-7 lg:col-span-8 bg-slate-100 px-6 pt-4 pb-4 flex flex-col gap-3 min-h-0">
                          <div className="relative flex-1 min-h-0 rounded-[2.25rem] overflow-hidden bg-black shadow-lg">
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-slate-200 text-center px-10">
                                <Play size={84} className="mx-auto mb-4 opacity-25" />
                                <p className="font-black text-xl">演示模式：模拟播放器</p>
                                <p className="text-sm mt-2 opacity-80">
                                  {activePreset ? `当前：${activePreset.title}（${activePreset.meta}）` : '请先从上方 4 个示例视频中选择一个'}
                                </p>
                                {activePreset?.url && (
                                  <a
                                    href={activePreset.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center justify-center mt-6 bg-white/10 border border-white/20 text-white px-6 py-3 rounded-2xl font-bold hover:bg-white/15 transition-colors"
                                  >
                                    打开原视频链接
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="px-2 pb-1">
                            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-2">
                              <span>步骤进度</span>
                              <span className="text-slate-800">{currentStep + 1}/{result.steps.length}</span>
                            </div>
                            <div className="h-1.5 bg-white rounded-full overflow-hidden">
                              <motion.div
                                animate={{ width: `${((currentStep + 1) / result.steps.length) * 100}%` }}
                                className="h-full bg-beauty-500"
                              />
                            </div>
                          </div>
                        </div>

                        {/* 指引操作区 */}
                        <div className="md:col-span-5 lg:col-span-4 p-10 flex flex-col">
                          <div className="flex-1">
                            <span className="text-beauty-500 font-bold text-sm tracking-widest uppercase mb-4 block">
                              Step {currentStep + 1} of {result.steps.length}
                            </span>
                            <h4 className="text-4xl font-black text-slate-900 mb-6">
                              {result.steps[currentStep]}
                            </h4>
                            <div className="space-y-6">
                              <div className="bg-beauty-50 p-6 rounded-3xl border border-beauty-100">
                                <h5 className="font-bold text-beauty-700 mb-2 flex items-center gap-2">
                                  <Zap size={16} /> 技巧要点
                                </h5>
                                <p className="text-beauty-600 leading-relaxed">
                                  {result.techniques[currentStep % result.techniques.length]}。注意力度均匀，避开眼周娇嫩肌肤。
                                </p>
                              </div>
                              <div className="flex items-center gap-4 text-slate-400">
                                <Clock size={20} />
                                <span className="text-sm font-medium">建议操作时长：3 分钟</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-4">
                            <button 
                              disabled={currentStep === 0}
                              onClick={() => setCurrentStep(prev => prev - 1)}
                              className="flex-1 py-5 rounded-2xl border-2 border-slate-100 font-bold text-slate-400 hover:bg-slate-50 disabled:opacity-30 transition-all"
                            >
                              上一步
                            </button>
                            <button 
                              onClick={() => {
                                if (currentStep < result.steps.length - 1) {
                                  setCurrentStep(prev => prev + 1)
                                } else {
                                  setShowPractice(false)
                                  setCurrentStep(0)
                                }
                              }}
                              className="flex-[2] py-5 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all shadow-xl"
                            >
                              {currentStep < result.steps.length - 1 ? '完成，下一步' : '收妆，完成练习'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 技巧与人群 */}
              <div className="space-y-6">
                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                  <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white">
                      <Zap size={20} />
                    </div>
                    核心化妆技巧
                  </h3>
                  <div className="space-y-3">
                    {result.techniques.map((tech, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-slate-600">
                        <div className="w-1.5 h-1.5 bg-orange-400 rounded-full shrink-0" />
                        <span className="text-sm font-medium">{tech}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                  <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white">
                      <CheckCircle2 size={20} />
                    </div>
                    适配人群画像
                  </h3>
                  <div className="space-y-4">
                    <p className="text-slate-600 text-sm leading-relaxed font-medium p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      {result.targetAudience}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {result.skinType.map(t => (
                        <span key={t} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold border border-blue-100">#{t}</span>
                      ))}
                      {result.faceShape.map(t => (
                        <span key={t} className="px-3 py-1 bg-purple-50 text-purple-600 rounded-lg text-[10px] font-bold border border-purple-100">#{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  )
}

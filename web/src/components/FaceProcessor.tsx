'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, User, ScanFace, CheckCircle, AlertCircle, RefreshCcw } from 'lucide-react'
import { detectFace } from '@/lib/api'
import { SelfieFaceAnalysisSkillResult } from '@/types'

export default function FaceProcessor() {
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<SelfieFaceAnalysisSkillResult | null>(null)
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user_photo_v1')
      if (raw && typeof raw === 'string') setImageDataUrl(raw)
    } catch {}

    const onPhoto = (e: Event) => {
      const detail = (e as CustomEvent).detail as string | null | undefined
      if (!detail || typeof detail !== 'string') return
      setImageDataUrl(detail)
      setError(null)
      setResult(null)
    }
    window.addEventListener('user_photo_v1:updated', onPhoto as EventListener)
    return () => window.removeEventListener('user_photo_v1:updated', onPhoto as EventListener)
  }, [])

  const hasPhoto = Boolean(imageDataUrl)
  const previewSrc = useMemo(() => imageDataUrl, [imageDataUrl])

  const handleAnalyze = async () => {
    if (!imageDataUrl) {
      setError('请先在最上方上传一张照片')
      setTimeout(() => {
        document.getElementById('upload')?.scrollIntoView({ behavior: 'smooth' })
      }, 0)
      return
    }
    setAnalyzing(true)
    setError(null)
    setResult(null)

    try {
      const data = await detectFace(imageDataUrl, { need_detail: true, lang: 'zh_CN' })
      setResult(data)
      try {
        localStorage.setItem('selfie_face_analysis_v1', JSON.stringify(data))
        window.dispatchEvent(new CustomEvent('selfie_face_analysis_v1:updated', { detail: data }))
      } catch {}
      setTimeout(() => {
        document.getElementById('face-report')?.scrollIntoView({ behavior: 'smooth' })
      }, 150)
    } catch (e) {
      setError(e instanceof Error ? e.message : '人脸识别失败，请重试')
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <section id="face" className="py-20 bg-beauty-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-white text-beauty-600 px-4 py-1.5 rounded-full text-sm font-bold mb-4 shadow-sm"
          >
            <ScanFace size={16} />
            Step 3: 五官友好分析
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-slate-900 mb-4"
          >
            自拍照五官友好分析
          </motion.h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            基于你上传的照片，输出客观但温和的特征描述，用于后续妆造推荐。
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-square max-w-md mx-auto w-full bg-white rounded-[3.5rem] shadow-2xl border-[12px] border-white overflow-hidden group">
            <AnimatePresence mode="wait">
              {previewSrc ? (
                <motion.img 
                  key="preview"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  src={previewSrc} 
                  alt="User Face" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <motion.div 
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center"
                >
                  <div className="w-24 h-24 bg-beauty-50 rounded-[2rem] flex items-center justify-center text-beauty-500 mb-8 shadow-inner">
                    <User size={48} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">准备就绪</h3>
                  <p className="text-slate-400 text-sm mb-10 max-w-[200px]">
                    请确保您的面部完整出现在取景框内
                  </p>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => document.getElementById('upload')?.scrollIntoView({ behavior: 'smooth' })}
                      className="bg-beauty-500 text-white px-8 py-4 rounded-2xl font-bold hover:bg-beauty-600 transition-all flex items-center gap-2 shadow-lg shadow-beauty-200 active:scale-95"
                    >
                      <Upload size={20} />
                      去上传
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {analyzing && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-md flex flex-col items-center justify-center text-white z-20">
                <div className="relative w-56 h-56 border-2 border-white/20 rounded-full overflow-hidden mb-8">
                  <motion.div 
                    animate={{ top: ['-10%', '110%', '-10%'] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute left-0 right-0 h-1.5 bg-beauty-400 shadow-[0_0_25px_rgba(244,63,94,1)] z-10"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-20">
                    <ScanFace size={100} />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <RefreshCcw size={20} className="animate-spin text-beauty-400" />
                  <p className="font-bold text-xl tracking-widest uppercase">Scanning Face...</p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-8">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div 
                  key="result"
                  id="face-report"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  className="space-y-8"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-green-500 rounded-[1.25rem] flex items-center justify-center text-white shadow-xl shadow-green-100">
                      <CheckCircle size={32} />
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-slate-800 tracking-tight">分析完成</h3>
                      <p className="text-slate-400 font-medium">温和的五官特征参考（闭环 Demo）</p>
                    </div>
                  </div>

                  {result.data ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-white p-7 rounded-[2rem] shadow-sm border border-white hover:border-beauty-100 transition-colors">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-widest block mb-2">脸型分类</span>
                        <span className="text-2xl font-black text-beauty-600">{result.data.basic_info.face_shape}</span>
                      </div>
                      <div className="bg-white p-7 rounded-[2rem] shadow-sm border border-white hover:border-beauty-100 transition-colors">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-widest block mb-2">对称度</span>
                        <span className="text-2xl font-black text-beauty-600">{result.data.basic_info.symmetry_score}</span>
                      </div>
                      <div className="bg-white p-7 rounded-[2rem] shadow-sm border border-white hover:border-beauty-100 transition-colors">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-widest block mb-2">三庭五眼匹配度</span>
                        <span className="text-2xl font-black text-beauty-600">{result.data.basic_info.proportion_match}</span>
                      </div>
                      <div className="bg-white p-7 rounded-[2rem] shadow-sm border border-white hover:border-beauty-100 transition-colors">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-widest block mb-2">五官均衡度</span>
                        <span className="text-2xl font-black text-beauty-600">{result.data.basic_info.feature_balance}</span>
                      </div>
                    </div>
                  ) : null}

                  {result.data?.features_detail ? (
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-white space-y-6">
                      <h4 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                        <div className="w-2 h-2 bg-beauty-500 rounded-full" />
                        五官友好拆分
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-beauty-50 border border-beauty-100 rounded-2xl p-5">
                          <div className="text-sm font-black text-beauty-700">眼部 · {result.data.features_detail.eye.type}</div>
                          <div className="text-sm text-slate-600 mt-2 leading-relaxed">{result.data.features_detail.eye.description}</div>
                        </div>
                        <div className="bg-beauty-50 border border-beauty-100 rounded-2xl p-5">
                          <div className="text-sm font-black text-beauty-700">眉形 · {result.data.features_detail.brow.type}</div>
                          <div className="text-sm text-slate-600 mt-2 leading-relaxed">{result.data.features_detail.brow.description}</div>
                        </div>
                        <div className="bg-beauty-50 border border-beauty-100 rounded-2xl p-5">
                          <div className="text-sm font-black text-beauty-700">鼻型 · {result.data.features_detail.nose.type}</div>
                          <div className="text-sm text-slate-600 mt-2 leading-relaxed">{result.data.features_detail.nose.description}</div>
                        </div>
                        <div className="bg-beauty-50 border border-beauty-100 rounded-2xl p-5">
                          <div className="text-sm font-black text-beauty-700">唇形 · {result.data.features_detail.lip.type}</div>
                          <div className="text-sm text-slate-600 mt-2 leading-relaxed">{result.data.features_detail.lip.description}</div>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {result.data ? (
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-white space-y-4">
                      <div className="text-slate-800 font-black text-lg">整体描述</div>
                      <p className="text-slate-600 leading-relaxed">{result.data.overall_description}</p>
                      <p className="text-slate-500 text-sm">{result.data.note}</p>
                    </div>
                  ) : null}

                  <button 
                    onClick={() => document.getElementById('recommend')?.scrollIntoView({ behavior: 'smooth' })}
                    className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group"
                  >
                    下一步：查看个性化方案
                    <motion.div animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity }}>
                      <RefreshCcw size={20} className="rotate-90" />
                    </motion.div>
                  </button>
                </motion.div>
              ) : error ? (
                <motion.div 
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-10 bg-red-50 border border-red-100 rounded-[2.5rem] text-center"
                >
                  <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-red-600 mb-2">检测遇到困难</h3>
                  <p className="text-red-400 mb-6">{error}</p>
                  <button 
                    onClick={() => {
                      setError(null)
                      setResult(null)
                      setImageDataUrl(null)
                      try {
                        localStorage.removeItem('selfie_face_analysis_v1')
                        window.dispatchEvent(new CustomEvent('selfie_face_analysis_v1:updated', { detail: null }))
                      } catch {}
                      setTimeout(() => {
                        document.getElementById('upload')?.scrollIntoView({ behavior: 'smooth' })
                      }, 0)
                    }}
                    className="bg-white text-red-600 px-6 py-2 rounded-xl font-bold shadow-sm border border-red-100"
                  >
                    去重新上传
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="p-10 bg-white rounded-[2.5rem] border border-white shadow-sm">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div>
                        <h3 className="text-2xl font-bold text-slate-800">开始五官友好分析</h3>
                        <p className="text-slate-400 mt-1 text-sm">如果你想换照片，请回到最上方重新上传。</p>
                      </div>
                      <button
                        onClick={() => document.getElementById('upload')?.scrollIntoView({ behavior: 'smooth' })}
                        className="bg-beauty-500 text-white px-6 py-3 rounded-2xl font-bold hover:bg-beauty-600 transition-all flex items-center gap-2 shadow-lg shadow-beauty-200 active:scale-95"
                      >
                        <Upload size={18} />
                        重新上传
                      </button>
                    </div>

                    <div className="mt-8">
                      <button
                        onClick={handleAnalyze}
                        disabled={!hasPhoto || analyzing}
                        className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white px-6 py-5 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 active:scale-[0.99]"
                      >
                        <ScanFace size={22} />
                        自拍照五官友好分析
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}

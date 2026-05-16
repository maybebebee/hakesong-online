'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Wand2, Image as ImageIcon, Sparkles, RefreshCcw, Upload, AlertTriangle, Zap, ChevronRight } from 'lucide-react'

function isGitHubPagesRuntime(): boolean {
  if (typeof window === 'undefined') return false
  if (process.env.NEXT_PUBLIC_GITHUB_PAGES === 'true') return true
  return window.location.hostname.endsWith('github.io')
}

async function mockMakeupImage(inputImage: string, pick: '1' | '2' | '3' | '4'): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const w = Math.max(1, img.naturalWidth)
      const h = Math.max(1, img.naturalHeight)
      const maxSide = 1400
      const scale = Math.min(1, maxSide / Math.max(w, h))
      const cw = Math.max(1, Math.round(w * scale))
      const ch = Math.max(1, Math.round(h * scale))

      const canvas = document.createElement('canvas')
      canvas.width = cw
      canvas.height = ch
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('无法生成预览图'))
        return
      }

      const baseFilter =
        pick === '1'
          ? 'contrast(1.05) saturate(1.05) brightness(1.03)'
          : pick === '2'
            ? 'contrast(1.18) saturate(0.95) brightness(0.98)'
            : pick === '3'
              ? 'contrast(1.08) saturate(1.12) brightness(1.06)'
              : 'contrast(1.1) saturate(0.92) brightness(1.02)'

      ctx.filter = baseFilter
      ctx.drawImage(img, 0, 0, cw, ch)
      ctx.filter = 'none'

      const minSide = Math.min(cw, ch)
      const cx = cw / 2
      const cy = ch / 2

      const overlay = (color: string, alpha: number, op: GlobalCompositeOperation) => {
        ctx.save()
        ctx.globalAlpha = alpha
        ctx.globalCompositeOperation = op
        ctx.fillStyle = color
        ctx.fillRect(0, 0, cw, ch)
        ctx.restore()
      }

      if (pick === '2') {
        overlay('#0b1020', 0.08, 'multiply')
      } else if (pick === '4') {
        overlay('#0b1220', 0.05, 'multiply')
        overlay('#8aa7c8', 0.05, 'screen')
      } else if (pick === '3') {
        overlay('#ffd1e6', 0.05, 'screen')
      } else {
        overlay('#ffefe6', 0.03, 'screen')
      }

      const softCircle = (x: number, y: number, r: number, color: string, alpha: number, op: GlobalCompositeOperation) => {
        ctx.save()
        ctx.globalCompositeOperation = op
        const g = ctx.createRadialGradient(x, y, 0, x, y, r)
        g.addColorStop(0, color)
        g.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.globalAlpha = alpha
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      const cheekY = cy + minSide * 0.06
      const cheekR = minSide * 0.12
      const cheekDx = minSide * 0.16

      if (pick === '1') {
        softCircle(cx - cheekDx, cheekY, cheekR, 'rgba(255, 120, 120, 1)', 0.08, 'overlay')
        softCircle(cx + cheekDx, cheekY, cheekR, 'rgba(255, 120, 120, 1)', 0.08, 'overlay')
      }
      if (pick === '3') {
        softCircle(cx - cheekDx, cheekY, cheekR * 1.05, 'rgba(255, 110, 160, 1)', 0.11, 'overlay')
        softCircle(cx + cheekDx, cheekY, cheekR * 1.05, 'rgba(255, 110, 160, 1)', 0.11, 'overlay')
        softCircle(cx, cy - minSide * 0.1, minSide * 0.08, 'rgba(255,255,255,1)', 0.08, 'screen')
      }
      if (pick === '2') {
        softCircle(cx - minSide * 0.12, cy - minSide * 0.08, minSide * 0.15, 'rgba(30, 30, 30, 1)', 0.16, 'multiply')
        softCircle(cx + minSide * 0.12, cy - minSide * 0.08, minSide * 0.15, 'rgba(30, 30, 30, 1)', 0.16, 'multiply')
      }
      if (pick === '4') {
        softCircle(cx - minSide * 0.12, cy - minSide * 0.08, minSide * 0.12, 'rgba(80, 90, 110, 1)', 0.14, 'multiply')
        softCircle(cx + minSide * 0.12, cy - minSide * 0.08, minSide * 0.12, 'rgba(80, 90, 110, 1)', 0.14, 'multiply')
      }

      const watermark = (text: string) => {
        ctx.save()
        ctx.globalAlpha = 0.78
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)'
        const pad = Math.round(minSide * 0.02)
        const fontSize = Math.max(12, Math.round(minSide * 0.03))
        ctx.font = `700 ${fontSize}px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial`
        const metrics = ctx.measureText(text)
        const tw = Math.ceil(metrics.width)
        const th = Math.ceil(fontSize * 1.6)
        const x = cw - tw - pad * 2 - pad
        const y = ch - th - pad
        const r = Math.round(pad * 1.2)
        ctx.beginPath()
        ctx.moveTo(x + r, y)
        ctx.arcTo(x + tw + pad * 2, y, x + tw + pad * 2, y + th, r)
        ctx.arcTo(x + tw + pad * 2, y + th, x, y + th, r)
        ctx.arcTo(x, y + th, x, y, r)
        ctx.arcTo(x, y, x + tw + pad * 2, y, r)
        ctx.closePath()
        ctx.fill()
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
        ctx.fillText(text, x + pad, y + Math.round(th * 0.68))
        ctx.restore()
      }

      watermark('Demo Preview')

      try {
        resolve(canvas.toDataURL('image/jpeg', 0.92))
      } catch {
        resolve(canvas.toDataURL())
      }
    }
    img.onerror = () => reject(new Error('读取照片失败，请换一张更清晰的正脸照'))
    img.crossOrigin = 'anonymous'
    img.src = inputImage
  })
}

export default function MakeupPreview() {
  const [generating, setGenerating] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [beforeImage, setBeforeImage] = useState<string | null>(null)
  const [afterImageUrl, setAfterImageUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [styleId, setStyleId] = useState<'1' | '2' | '3' | '4'>('1')
  const [videoReady, setVideoReady] = useState(false)
  const [prefetchUrl, setPrefetchUrl] = useState<string | null>(null)
  const [prefetchKey, setPrefetchKey] = useState<string | null>(null)
  const beforeImageRef = useRef<string | null>(null)
  const generatingRef = useRef(false)
  const styleIdRef = useRef<'1' | '2' | '3' | '4'>('1')
  const prefetchAbortRef = useRef<AbortController | null>(null)
  const prefetchTimerRef = useRef<number | null>(null)

  useEffect(() => {
    try {
      const preset = localStorage.getItem('video_preset_v1')
      if (preset && ['1', '2', '3', '4'].includes(preset)) {
        setStyleId(preset as '1' | '2' | '3' | '4')
      }
    } catch {}
  }, [])

  useEffect(() => {
    const readReady = () => {
      try {
        setVideoReady(localStorage.getItem('video_analysis_ready_v1') === '1')
      } catch {
        setVideoReady(false)
      }
    }
    readReady()
    const onUpdated = () => readReady()
    window.addEventListener('video_analysis_ready_v1:updated', onUpdated as EventListener)
    return () => window.removeEventListener('video_analysis_ready_v1:updated', onUpdated as EventListener)
  }, [])

  useEffect(() => {
    beforeImageRef.current = beforeImage
    generatingRef.current = generating
    styleIdRef.current = styleId
  }, [beforeImage, generating, styleId])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user_photo_v1')
      if (raw && typeof raw === 'string') {
        setBeforeImage(raw)
        setShowResult(false)
        setAfterImageUrl(null)
        setError(null)
      }
    } catch {}

    const onPhoto = (e: Event) => {
      const detail = (e as CustomEvent).detail as string | null | undefined
      if (!detail || typeof detail !== 'string') return
      setBeforeImage(detail)
      setShowResult(false)
      setAfterImageUrl(null)
      setError(null)
    }
    window.addEventListener('user_photo_v1:updated', onPhoto as EventListener)
    return () => window.removeEventListener('user_photo_v1:updated', onPhoto as EventListener)
  }, [])

  const styleLabel = useMemo(() => {
    const map: Record<typeof styleId, string> = {
      '1': '男模清爽提气色（自然修饰）',
      '2': '女生烟熏妆（氛围浓郁）',
      '3': '女生漫画妆（眼神放大）',
      '4': '女生清冷妆（冷感高级）',
    }
    return map[styleId]
  }, [styleId])

  const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

  const computeKey = (inputImage: string, pick: typeof styleId) => {
    const head = inputImage.slice(0, 256)
    const tail = inputImage.slice(-256)
    const h = (s: string) => {
      let x = 5381
      for (let i = 0; i < s.length; i += 1) x = (x * 33) ^ s.charCodeAt(i)
      return (x >>> 0).toString(16)
    }
    return `${pick}_${inputImage.length}_${h(head)}_${h(tail)}`
  }

  const buildPrompt = (pick: typeof styleId) => {
    const base =
      '请基于参考人脸照片进行妆容生成，尽量保持人物身份特征（脸型、五官比例、发型轮廓、表情）不变，只改变妆容。整体妆感要日常、干净、耐看，不要夸张，不要过度浓重。画面写实、自然光，肤质细腻但不磨皮过度。避免明显变脸、过强修容、过黑眼妆、夸张眼线和过深唇色。'
    const stylePrompts: Record<typeof styleId, string> = {
      '1': '妆容风格：男模清爽提气色（自然修饰）。重点：薄透干净底妆、轻微修容（非常克制）、自然眉型、眼下轻提亮、润色唇部（偏自然豆沙/裸色），整体更精神但看不出厚重妆感。',
      '2': '妆容风格：柔和烟熏（不吓人、日常友好）。重点：灰棕/棕咖低饱和烟熏，少量多次晕染，边界干净；眼线只做睫毛根部内眼线/细短眼尾，不要粗长上挑；避免大面积黑色、避免“熊猫眼”；睫毛自然纤长，不要夸张假睫毛；唇色用柔雾豆沙/玫瑰奶茶，不要深色。整体氛围感有但仍然清爽。',
      '3': '妆容风格：清透漫画妆（放大但不夸张）。重点：清透底妆、卧蚕与下睫毛强调要克制，眼线细而干净；高光少量点到为止；腮红柔和、范围小；唇色水润自然，整体甜感但不“妆感重”。',
      '4': '妆容风格：清冷淡颜（高级克制）。重点：冷调/灰调低饱和配色，线条干净但不要锐利；修容极轻；高光克制；腮红很淡；唇色偏冷调豆沙/玫瑰灰，不要过深。整体高级、清冷但日常可用。',
    }
    return `${base}\n${stylePrompts[pick]}\n输出：一张妆后效果参考图。`
  }

  const requestMakeupImage = async (inputImage: string, pick: typeof styleId, signal?: AbortSignal) => {
    if (isGitHubPagesRuntime()) {
      return mockMakeupImage(inputImage, pick)
    }
    const res = await fetch('/api/makeup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: buildPrompt(pick),
        image: inputImage,
        size: '2K',
        watermark: true,
      }),
      signal,
    })
    if (res.status === 404) {
      return mockMakeupImage(inputImage, pick)
    }
    const data = (await res.json().catch(() => null)) as { imageUrl?: string; error?: string } | null
    if (!res.ok || !data?.imageUrl) {
      throw new Error(data?.error || '生成失败，请稍后重试。')
    }
    return data.imageUrl
  }

  const prefetch = async (inputImage: string, pick: typeof styleId) => {
    if (!inputImage) return
    const key = computeKey(inputImage, pick)
    if (prefetchKey === key && prefetchUrl) return

    if (prefetchTimerRef.current) window.clearTimeout(prefetchTimerRef.current)
    if (prefetchAbortRef.current) prefetchAbortRef.current.abort()

    const controller = new AbortController()
    prefetchAbortRef.current = controller
    prefetchTimerRef.current = window.setTimeout(async () => {
      try {
        const url = await requestMakeupImage(inputImage, pick, controller.signal)
        setPrefetchKey(key)
        setPrefetchUrl(url)
      } catch {
      } finally {
        if (prefetchAbortRef.current === controller) {
          prefetchAbortRef.current = null
        }
      }
    }, 200)
  }

  const handleGenerate = async () => {
    setError(null)
    if (!beforeImage) {
      setError('请先在最上方上传一张面部照片，用于生成妆后预览。')
      return
    }
    const pick = styleId
    const key = computeKey(beforeImage, pick)
    const delay = Math.floor(1000 + Math.random() * 800)

    setGenerating(true)
    setAfterImageUrl(null)

    try {
      const urlPromise = prefetchKey === key && prefetchUrl ? Promise.resolve(prefetchUrl) : requestMakeupImage(beforeImage, pick)
      const [url] = await Promise.all([urlPromise, sleep(delay)].map((p) => p))
      setAfterImageUrl(url as unknown as string)
      setShowResult(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : '生成失败，请稍后重试。')
    } finally {
      setGenerating(false)
    }
  }

  useEffect(() => {
    const onPreset = (e: Event) => {
      const detail = (e as CustomEvent).detail as { presetId?: string; autoGenerate?: boolean } | null | undefined
      const presetId = detail?.presetId
      if (presetId && ['1', '2', '3', '4'].includes(presetId)) {
        setStyleId(presetId as '1' | '2' | '3' | '4')
      }
    }
    window.addEventListener('video_preset_v1:updated', onPreset as EventListener)
    return () => window.removeEventListener('video_preset_v1:updated', onPreset as EventListener)
  }, [])

  useEffect(() => {
    if (!beforeImage) return
    void prefetch(beforeImage, styleId)
  }, [beforeImage, styleId])

  return (
    <section id="preview" className="py-20 bg-beauty-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">AI 妆后效果预览</h2>
          <p className="text-slate-500">跟着视频选风格，上传照片即可生成妆后参考效果图</p>
        </div>

        <div className="max-w-4xl mx-auto">
          {!showResult ? (
            <div className="bg-white rounded-[3rem] p-12 shadow-xl border border-beauty-100 text-center relative overflow-hidden">
              <div className="relative z-10">
                <div className="w-24 h-24 bg-beauty-50 rounded-full flex items-center justify-center text-beauty-500 mx-auto mb-8">
                  <Wand2 size={48} />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4">一键生成妆后预览</h3>
                <p className="text-slate-400 mb-10 max-w-sm mx-auto">
                  基于先进的 AI 生图算法，为您呈现最真实的妆后参考效果图
                </p>

                <div className="max-w-xl mx-auto mb-10 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-beauty-50 border border-beauty-100 rounded-2xl p-4 text-left">
                    <div className="text-sm font-bold text-slate-700 mb-2">面部照片</div>
                    {beforeImage ? (
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-xs text-slate-500">已上传，后续将默认使用这张照片</div>
                        <button
                          type="button"
                          onClick={() => document.getElementById('upload')?.scrollIntoView({ behavior: 'smooth' })}
                          className="inline-flex items-center gap-2 text-beauty-600 text-sm font-bold"
                        >
                          <RefreshCcw size={16} />
                          重新上传
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-xs text-slate-500">请先在最上方上传照片</div>
                        <button
                          type="button"
                          onClick={() => document.getElementById('upload')?.scrollIntoView({ behavior: 'smooth' })}
                          className="inline-flex items-center gap-2 text-beauty-600 text-sm font-bold"
                        >
                          <Upload size={16} />
                          去上传
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="bg-beauty-50 border border-beauty-100 rounded-2xl p-4 text-left">
                    <div className="text-sm font-bold text-slate-700 mb-2">选择妆容风格</div>
                    <select
                      value={styleId}
                      onChange={(e) => setStyleId(e.target.value as '1' | '2' | '3' | '4')}
                      className="w-full bg-white border border-beauty-100 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-beauty-100"
                    >
                      <option value="1">视频1：男模教程</option>
                      <option value="2">视频2：烟熏妆</option>
                      <option value="3">视频3：漫画妆</option>
                      <option value="4">视频4：清冷妆</option>
                    </select>
                    <div className="mt-2 text-xs text-slate-500">当前：{styleLabel}</div>
                  </div>
                </div>

                {error && (
                  <div className="max-w-xl mx-auto mb-8 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-left">
                    <AlertTriangle className="text-red-500 mt-0.5" size={18} />
                    <div className="text-sm font-bold text-red-700">{error}</div>
                  </div>
                )}

                <button 
                  onClick={handleGenerate}
                  disabled={generating}
                  className="bg-beauty-500 hover:bg-beauty-600 disabled:bg-slate-300 text-white px-12 py-5 rounded-3xl font-bold text-lg transition-all shadow-xl shadow-beauty-200 flex items-center gap-3 mx-auto"
                >
                  {generating ? (
                    <RefreshCcw size={24} className="animate-spin" />
                  ) : (
                    <Sparkles size={24} />
                  )}
                  {generating ? '正在准备妆后预览...' : '生成妆后图'}
                </button>
              </div>

              {generating && (
                <div className="absolute inset-0 z-0">
                   <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-80" />
                   <motion.div 
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 90, 180, 270, 360] 
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-20 -right-20 w-64 h-64 bg-beauty-200/20 blur-3xl rounded-full"
                   />
                </div>
              )}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              <div className="space-y-4">
                <div className="aspect-[3/4] rounded-[2.5rem] overflow-hidden border-4 border-white shadow-lg relative group">
                  <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-md text-white px-4 py-1 rounded-full text-xs font-bold">妆前原图</div>
                  {beforeImage ? (
                    <img src={beforeImage} alt="before" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
                      <ImageIcon size={64} />
                    </div>
                  )}
                </div>
                <p className="text-center text-sm font-medium text-slate-500 uppercase tracking-widest">Before</p>
              </div>

              <div className="space-y-4">
                <div className="aspect-[3/4] rounded-[2.5rem] overflow-hidden border-4 border-beauty-400 shadow-2xl shadow-beauty-200 relative group">
                  <div className="absolute top-4 left-4 z-10 bg-beauty-500 text-white px-4 py-1 rounded-full text-xs font-bold">AI 妆后预览</div>
                  {afterImageUrl ? (
                    <img src={afterImageUrl} alt="after" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-beauty-100 flex items-center justify-center text-beauty-300">
                      <Sparkles size={80} />
                    </div>
                  )}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-gradient-to-t from-beauty-900/40 to-transparent"
                  />
                </div>
                <p className="text-center text-sm font-bold text-beauty-500 uppercase tracking-widest">After</p>
              </div>

              <div className="md:col-span-2 flex justify-center pt-6">
                <button
                  type="button"
                  disabled={!videoReady}
                  onClick={() => {
                    if (!videoReady) {
                      document.getElementById('video')?.scrollIntoView({ behavior: 'smooth' })
                      return
                    }
                    window.dispatchEvent(new CustomEvent('video_practice_v1:open'))
                  }}
                  className="w-full max-w-4xl bg-beauty-500 hover:bg-beauty-600 disabled:bg-slate-300 text-white py-5 rounded-[2.25rem] font-black flex items-center justify-center gap-3 shadow-xl shadow-beauty-200 transition-all group"
                >
                  <Zap size={22} className="fill-current" />
                  {videoReady ? '开启“边看边练”互动模式' : '先完成视频智能分析'}
                  <ChevronRight size={22} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="md:col-span-2 flex justify-center pt-8">
                <button 
                  onClick={() => {
                    setShowResult(false)
                    setAfterImageUrl(null)
                    setError(null)
                  }}
                  className="text-slate-400 hover:text-beauty-500 flex items-center gap-2 font-medium transition-colors"
                >
                  <RefreshCcw size={18} />
                  重新生成
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}

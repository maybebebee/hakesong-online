'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, ShoppingBag, ExternalLink, Bookmark, CheckCircle, AlertTriangle } from 'lucide-react'
import type { Recommendation, SelfieFaceAnalysisSkillResult } from '@/types'

const STORAGE_KEY = 'selfie_face_analysis_v1'
const OWNED_STORAGE_KEY = 'owned_cosmetics_v1'
const FAVORITES_STORAGE_KEY = 'favorite_makeup_plans_v1'

function hashString(input: string): number {
  let h = 5381
  for (let i = 0; i < input.length; i += 1) {
    h = (h * 33) ^ input.charCodeAt(i)
  }
  return h >>> 0
}

function pickFrom<T>(arr: readonly T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length] as T
}

function clampInt(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(n)))
}

function buildRecommendationFromFace(result: SelfieFaceAnalysisSkillResult): Recommendation {
  const data = result.data
  const faceShape = data?.basic_info.face_shape ?? '其他'
  const eyeType = data?.features_detail?.eye.type ?? '眼部特征'
  const browType = data?.features_detail?.brow.type ?? '眉形特征'
  const noseType = data?.features_detail?.nose.type ?? '鼻型特征'
  const lipType = data?.features_detail?.lip.type ?? '唇形特征'
  const overall = data?.overall_description ?? ''
  const s = data?.basic_info.symmetry_score ?? 85
  const p = data?.basic_info.proportion_match ?? 85
  const b = data?.basic_info.feature_balance ?? 85

  const seed = hashString(`${faceShape}|${eyeType}|${browType}|${noseType}|${lipType}|${overall}|${s}|${p}|${b}`)

  const styleByFace: Record<string, readonly string[]> = {
    圆脸: ['温柔韩系通勤妆', '轻氛围清透妆', '干净显精神日常妆'],
    方脸: ['清冷高级通勤妆', '干净骨相妆', '利落淡颜系'],
    心形脸: ['灵气氛围妆', '甜酷轻氛围', '清透元气妆'],
    菱形脸: ['电影感氛围妆', '高级轮廓感淡妆', '克制港风妆感'],
    鹅蛋脸: ['百搭清透精致妆', '原生感氛围妆', '干净耐看通勤妆'],
    长脸: ['比例优化通勤妆', '松弛感氛围妆', '清透显幼态妆'],
    其他: ['清透耐看通勤妆', '轻氛围淡颜系', '干净显气色日常妆'],
  }

  const makeupStyle = pickFrom(styleByFace[faceShape] ?? styleByFace.其他, seed)

  const productPool = [
    { category: '底妆', name: '轻薄贴肤粉底液', shade: pickFrom(['N01', 'N02', 'B10', 'C20'] as const, seed), description: '薄透服帖，妆面更像原生皮感' },
    { category: '底妆', name: '局部遮瑕膏', shade: pickFrom(['自然色', '提亮色'] as const, seed >>> 2), description: '只遮该遮的地方，让脸更干净' },
    { category: '眉眼', name: '灰棕眉笔/眉粉', shade: pickFrom(['灰棕', '自然棕', '冷棕'] as const, seed >>> 3), description: `配合「${browType}」走毛流路线，更显高级` },
    { category: '眉眼', name: '低饱和大地色眼影', shade: pickFrom(['01 奶咖', '02 灰棕', '03 玫瑰棕'] as const, seed >>> 4), description: `衔接「${eyeType}」的轮廓，显深邃但不浓` },
    { category: '腮红', name: '轻雾感腮红', shade: pickFrom(['杏粉', '豆沙', '玫瑰奶茶'] as const, seed >>> 5), description: '少量多次，氛围更自然' },
    { category: '唇妆', name: '缎光/柔雾口红', shade: pickFrom(['奶茶豆沙', '玫瑰豆沙', '清冷裸粉'] as const, seed >>> 6), description: `顺着「${lipType}」的形状轻描轮廓，显气色不突兀` },
  ] as const

  const start = seed % (productPool.length - 4)
  const picks = [0, 1, 2, 3].map((i) => productPool[(start + i) % productPool.length])

  const products = picks.map((p0, idx) => {
    const base = clampInt(80 + ((seed >>> (idx * 3)) % 17), 80, 96)
    const owned = idx < 2
    return {
      ...p0,
      matchScore: owned ? clampInt(base + 1, 84, 99) : clampInt(base - 6, 75, 92),
      owned,
    }
  })

  const relatedTutorials = [
    {
      title: `${faceShape}的通勤妆「更上镜」思路`,
      platform: '小红书',
      link: '#',
    },
    {
      title: `围绕「${eyeType}」做干净眼妆的关键点`,
      platform: '抖音',
      link: '#',
    },
  ]

  return {
    makeupStyle,
    products,
    relatedTutorials,
  }
}

function buildInsightFromFace(result: SelfieFaceAnalysisSkillResult): { summary: string; expertAdvice: string } {
  const data = result.data
  const faceShape = data?.basic_info.face_shape ?? '其他'
  const eyeType = data?.features_detail?.eye.type ?? '眼部特征'
  const browType = data?.features_detail?.brow.type ?? '眉形特征'
  const noseType = data?.features_detail?.nose.type ?? '鼻型特征'
  const lipType = data?.features_detail?.lip.type ?? '唇形特征'
  const overall = data?.overall_description ?? ''
  const s = data?.basic_info.symmetry_score ?? 85
  const p = data?.basic_info.proportion_match ?? 85
  const b = data?.basic_info.feature_balance ?? 85

  const seed = hashString(`${faceShape}|${eyeType}|${browType}|${noseType}|${lipType}|${overall}|${s}|${p}|${b}`)
  const focusPool: readonly string[] = [
    `把重点放在「${eyeType}」的横向延展，眼神会更干净、更上镜`,
    `用「${browType}」的毛流感做气质底座，整张脸会更松弛耐看`,
    `中轴线由「${noseType}」稳住后，底妆只要干净就会很高级`,
    `「${lipType}」很适合做轻雾面或缎光唇，气色会更自然显贵`,
  ]
  const focus = pickFrom(focusPool, seed >>> 1)
  const intensity = clampInt(Math.round((s + p + b) / 3), 75, 96)
  const shapeHint = pickFrom(
    [
      `你是「${faceShape}」的轮廓基底，更适合用“收口干净”的方式做高级感`,
      `你是「${faceShape}」的上镜路线，妆面越克制越显质感`,
      `你是「${faceShape}」的氛围型五官，轻轻提气色就很出片`,
    ] as const,
    seed >>> 2,
  )
  const expertAdvicePool: readonly string[] = [
    `建议把妆面强度控制在 ${intensity}/100 的“日常可用”区间：底妆薄、边界软、重点集中在眉眼与气色，照片里会更显高级耐看。`,
    `建议用 ${intensity}/100 的“克制精致感”：先把底妆做干净，再用眼尾/唇色做轻重点，不用堆浓度也能很有存在感。`,
    `建议走 ${intensity}/100 的“轻氛围路线”：腮红与眼影少量多次，整体留白多一点，更像天生好气色。`,
  ]
  return { summary: `${shapeHint}；${focus}。`, expertAdvice: pickFrom(expertAdvicePool, seed >>> 3) }
}

type OwnedCosmetic = {
  brand: string
  name: string
}

type SuggestedCosmetic = {
  brand: string
  name: string
  link: string
}

type FavoriteMakeupPlan = {
  id: string
  savedAt: string
  title: string
  summary: string
  keyItems: Array<{ category: string; name: string; shade?: string }>
}

type ProductIntent =
  | 'foundation'
  | 'concealer'
  | 'powder'
  | 'brow'
  | 'eyeshadow'
  | 'mascara'
  | 'blush'
  | 'lip'
  | 'other'

function getProductIntent(category: string, name: string): ProductIntent {
  const c = category.trim()
  const n = name.trim()

  if (c.includes('底妆')) {
    if (n.includes('遮瑕')) return 'concealer'
    if (n.includes('散粉') || n.includes('粉饼') || n.includes('定妆')) return 'powder'
    return 'foundation'
  }

  if (c.includes('眉眼')) {
    if (n.includes('眉')) return 'brow'
    if (n.includes('眼影')) return 'eyeshadow'
    if (n.includes('睫毛')) return 'mascara'
    return 'eyeshadow'
  }

  if (c.includes('腮红')) return 'blush'
  if (c.includes('唇')) return 'lip'
  return 'other'
}

function pickOwnedForIntent(intent: ProductIntent, owned: OwnedCosmetic[], seed: number): OwnedCosmetic {
  const keywordByIntent: Record<ProductIntent, readonly string[]> = {
    foundation: ['粉底', '气垫', '粉霜'],
    concealer: ['遮瑕'],
    powder: ['散粉', '定妆', '粉饼'],
    brow: ['眉笔', '眉粉', '眉胶', '染眉'],
    eyeshadow: ['眼影', '眼影盘'],
    mascara: ['睫毛膏', '睫毛'],
    blush: ['腮红'],
    lip: ['口红', '唇釉', '唇泥', '唇膏'],
    other: [],
  }

  const keywords = keywordByIntent[intent]
  if (keywords.length) {
    const hit = owned.filter((x) => keywords.some((k) => x.name.includes(k)))
    if (hit.length) return pickFrom(hit, seed)
  }

  const fallbackByIntent: Record<ProductIntent, OwnedCosmetic> = {
    foundation: { brand: '兰蔻', name: '持妆粉底液' },
    concealer: { brand: 'NARS', name: '遮瑕膏' },
    powder: { brand: 'MAKE UP FOR EVER', name: '定妆散粉' },
    brow: { brand: '植村秀', name: '砍刀眉笔' },
    eyeshadow: { brand: '3CE', name: '九宫格眼影盘' },
    mascara: { brand: 'KISSME', name: '纤长睫毛膏' },
    blush: { brand: 'NARS', name: '腮红（经典色系）' },
    lip: { brand: 'Dior', name: '唇釉（豆沙系）' },
    other: { brand: 'Perfect Diary', name: '综合彩妆单品' },
  }
  return fallbackByIntent[intent]
}

function parseOwnedCosmetics(input: string): OwnedCosmetic[] {
  const lines = input
    .split(/\r?\n/g)
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 20)
  return lines
    .map((line) => {
      const parts = line.includes('|')
        ? line.split('|').map((p) => p.trim()).filter(Boolean)
        : line.includes('—')
          ? line.split('—').map((p) => p.trim()).filter(Boolean)
          : line.includes('-')
            ? line.split('-').map((p) => p.trim()).filter(Boolean)
            : line.split(/\s+/g).map((p) => p.trim()).filter(Boolean)
      const brand = (parts[0] ?? '').trim() || '其他'
      const name = parts.slice(1).join(' ').trim() || line
      return { brand, name }
    })
    .filter((x) => x.name.length > 0)
}

function getVirtualBuyLink(seed: number): string {
  const id = (seed >>> 0).toString(16).slice(0, 8)
  return `https://douyin.mock/item/${id}`
}

function suggestCosmetics(intent: ProductIntent, seed: number): SuggestedCosmetic[] {
  const pools: Record<ProductIntent, SuggestedCosmetic[]> = {
    foundation: [
      { brand: 'Estée Lauder', name: 'Double Wear 持妆粉底液', link: getVirtualBuyLink(seed ^ 0x11) },
      { brand: 'ARMANI', name: 'Luminous Silk 粉底液', link: getVirtualBuyLink(seed ^ 0x12) },
      { brand: 'YSL', name: '恒久粉底液', link: getVirtualBuyLink(seed ^ 0x13) },
    ],
    concealer: [
      { brand: 'NARS', name: 'Soft Matte 遮瑕膏', link: getVirtualBuyLink(seed ^ 0x21) },
      { brand: 'the SAEM', name: '得鲜遮瑕液', link: getVirtualBuyLink(seed ^ 0x22) },
      { brand: 'Hourglass', name: '遮瑕液', link: getVirtualBuyLink(seed ^ 0x23) },
    ],
    powder: [
      { brand: 'MAKE UP FOR EVER', name: '定妆散粉', link: getVirtualBuyLink(seed ^ 0x31) },
      { brand: 'Givenchy', name: '四宫格散粉', link: getVirtualBuyLink(seed ^ 0x32) },
      { brand: 'Laura Mercier', name: '柔光散粉', link: getVirtualBuyLink(seed ^ 0x33) },
    ],
    brow: [
      { brand: '植村秀', name: '砍刀眉笔', link: getVirtualBuyLink(seed ^ 0x41) },
      { brand: 'KATE', name: '眉粉', link: getVirtualBuyLink(seed ^ 0x42) },
      { brand: 'Benefit', name: '染眉膏', link: getVirtualBuyLink(seed ^ 0x43) },
    ],
    eyeshadow: [
      { brand: '3CE', name: '九宫格眼影盘', link: getVirtualBuyLink(seed ^ 0x51) },
      { brand: 'CLIO', name: '十色眼影盘', link: getVirtualBuyLink(seed ^ 0x52) },
      { brand: 'Huda Beauty', name: '眼影盘', link: getVirtualBuyLink(seed ^ 0x53) },
    ],
    mascara: [
      { brand: 'KISSME', name: '纤长睫毛膏', link: getVirtualBuyLink(seed ^ 0x61) },
      { brand: 'Maybelline', name: '天空睫毛膏', link: getVirtualBuyLink(seed ^ 0x62) },
      { brand: 'Lancôme', name: '催眠睫毛膏', link: getVirtualBuyLink(seed ^ 0x63) },
    ],
    blush: [
      { brand: 'Rare Beauty', name: '液体腮红', link: getVirtualBuyLink(seed ^ 0x71) },
      { brand: 'NARS', name: '腮红（经典色系）', link: getVirtualBuyLink(seed ^ 0x72) },
      { brand: 'CANMAKE', name: '单色腮红', link: getVirtualBuyLink(seed ^ 0x73) },
    ],
    lip: [
      { brand: 'Dior', name: '唇釉（豆沙系）', link: getVirtualBuyLink(seed ^ 0x81) },
      { brand: 'YSL', name: '镜面唇釉（玫瑰系）', link: getVirtualBuyLink(seed ^ 0x82) },
      { brand: 'MAC', name: '子弹头口红（奶茶系）', link: getVirtualBuyLink(seed ^ 0x83) },
    ],
    other: [
      { brand: 'Perfect Diary', name: '综合彩妆单品', link: getVirtualBuyLink(seed ^ 0x91) },
      { brand: 'Judydoll', name: '综合彩妆单品', link: getVirtualBuyLink(seed ^ 0x92) },
      { brand: 'Flower Knows', name: '综合彩妆单品', link: getVirtualBuyLink(seed ^ 0x93) },
    ],
  }

  const list = pools[intent] ?? pools.other
  const a = pickFrom(list, seed)
  const b = pickFrom(list, seed >>> 2)
  if (a.brand === b.brand && a.name === b.name) {
    return [a, pickFrom(list, seed >>> 4)]
  }
  return [a, b]
}

export default function RecommendationResult() {
  const [faceResult, setFaceResult] = useState<SelfieFaceAnalysisSkillResult | null>(null)
  const [ownedOpen, setOwnedOpen] = useState(false)
  const [ownedInput, setOwnedInput] = useState('')
  const [ownedCosmetics, setOwnedCosmetics] = useState<OwnedCosmetic[]>([])
  const [favorites, setFavorites] = useState<FavoriteMakeupPlan[]>([])
  const [favoriteOpen, setFavoriteOpen] = useState(false)
  const [selectedFavorite, setSelectedFavorite] = useState<FavoriteMakeupPlan | null>(null)

  useEffect(() => {
    const read = () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) {
          setFaceResult(null)
          return
        }
        const parsed = JSON.parse(raw) as SelfieFaceAnalysisSkillResult
        if (parsed && typeof parsed === 'object' && typeof parsed.code === 'number') {
          setFaceResult(parsed)
          return
        }
        setFaceResult(null)
      } catch {
        setFaceResult(null)
      }
    }

    read()
    const onUpdate = (e: Event) => {
      const detail = (e as CustomEvent).detail as SelfieFaceAnalysisSkillResult | null | undefined
      if (detail && typeof detail === 'object') {
        setFaceResult(detail)
        return
      }
      read()
    }
    window.addEventListener('selfie_face_analysis_v1:updated', onUpdate as EventListener)
    return () => window.removeEventListener('selfie_face_analysis_v1:updated', onUpdate as EventListener)
  }, [])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(OWNED_STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as OwnedCosmetic[]
      if (Array.isArray(parsed)) {
        setOwnedCosmetics(
          parsed
            .filter((x): x is OwnedCosmetic => Boolean(x && typeof x === 'object' && 'name' in x))
            .slice(0, 20)
            .map((x) => ({ brand: (x.brand ?? '其他').toString(), name: (x.name ?? '').toString() }))
            .filter((x) => x.name.trim().length > 0),
        )
      }
    } catch {}
  }, [])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAVORITES_STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as FavoriteMakeupPlan[]
      if (!Array.isArray(parsed)) return
      const cleaned = parsed
        .filter((x): x is FavoriteMakeupPlan => Boolean(x && typeof x === 'object' && 'id' in x))
        .map((x) => ({
          id: (x.id ?? '').toString(),
          savedAt: (x.savedAt ?? '').toString(),
          title: (x.title ?? '').toString(),
          summary: (x.summary ?? '').toString(),
          keyItems: Array.isArray(x.keyItems) ? x.keyItems.slice(0, 6) : [],
        }))
        .filter((x) => x.id && x.title)
        .slice(0, 12)
      setFavorites(cleaned)
    } catch {}
  }, [])

  const recommendation = useMemo(() => {
    if (!faceResult?.data || faceResult.code !== 200) return null
    return buildRecommendationFromFace(faceResult)
  }, [faceResult])

  const insight = useMemo(() => {
    if (!faceResult?.data || faceResult.code !== 200) return null
    return buildInsightFromFace(faceResult)
  }, [faceResult])

  const currentPlanId = useMemo(() => {
    if (!faceResult?.data || faceResult.code !== 200 || !recommendation) return null
    const base = JSON.stringify({
      face: faceResult.data.basic_info,
      detail: faceResult.data.features_detail,
      overall: faceResult.data.overall_description,
      style: recommendation.makeupStyle,
      products: recommendation.products.map((p) => ({ category: p.category, name: p.name, shade: p.shade })),
    })
    return `plan_${hashString(base).toString(16)}`
  }, [faceResult, recommendation])

  const isFavorited = useMemo(() => {
    if (!currentPlanId) return false
    return favorites.some((x) => x.id === currentPlanId)
  }, [favorites, currentPlanId])

  const addToFavorites = () => {
    if (!currentPlanId || !recommendation) return
    if (isFavorited) return
    const title = recommendation.makeupStyle
    const summary = insight?.summary ?? '已收藏的妆造方案'
    const keyItems = recommendation.products.slice(0, 4).map((p) => ({ category: p.category, name: p.name, shade: p.shade }))
    const next: FavoriteMakeupPlan[] = [
      { id: currentPlanId, savedAt: new Date().toISOString(), title, summary, keyItems },
      ...favorites,
    ].slice(0, 12)
    setFavorites(next)
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(next))
    } catch {}
  }

  const effectiveOwned = useMemo(() => {
    const sample: OwnedCosmetic[] = [
      { brand: '兰蔻', name: '持妆粉底液' },
      { brand: '花西子', name: '眉笔' },
    ]
    return ownedCosmetics.length >= 2 ? ownedCosmetics : sample
  }, [ownedCosmetics])

  return (
    <section id="recommend" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-beauty-50 text-beauty-600 px-6 py-2 rounded-full font-bold text-sm mb-6"
          >
            <Sparkles size={16} />
            AI 个性化定制方案
          </motion.div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">为您推荐的妆容方案</h2>
          <p className="text-slate-500">基于自拍照五官分析结果，为您量身定制</p>
        </div>

        {!recommendation ? (
          <div className="max-w-3xl mx-auto">
            <div className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-10 text-center">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-beauty-500 mx-auto mb-5 border border-slate-100">
                <Sparkles size={26} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800">先完成自拍照五官分析</h3>
              <p className="text-slate-500 mt-3 leading-relaxed">
                妆造推荐会在「自拍照五官友好分析」完成后生成，并且会根据你的脸型与五官特点做差异化建议。
              </p>
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => document.getElementById('face')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold hover:bg-slate-800 transition-all"
                >
                  去做自拍照分析
                </button>
              </div>
            </div>
          </div>
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-10 text-white relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-3xl font-bold mb-4">{recommendation.makeupStyle}</h3>
                <p className="text-slate-400 max-w-md leading-relaxed mb-8">
                  {insight?.summary ?? '这套方案会围绕你的脸型与五官特点做更克制、更出片的调整：让妆面干净、重点更集中，同时保留你的原生辨识度。'}
                </p>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={addToFavorites}
                    className="bg-beauty-500 hover:bg-beauty-600 disabled:bg-slate-400 text-white px-8 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-beauty-900/20"
                    disabled={isFavorited}
                  >
                    <Bookmark size={20} />
                    {isFavorited ? '已收藏' : '收藏此方案'}
                  </button>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-beauty-500/10 blur-[100px] rounded-full -mr-20 -mt-20" />
            </div>

            <motion.button
              type="button"
              onClick={() => {
                setOwnedOpen(true)
                setOwnedInput(effectiveOwned.map((x) => `${x.brand} ${x.name}`).join('\n'))
              }}
              whileHover={{ y: -2 }}
              className="w-full text-left bg-slate-50 border border-slate-100 rounded-[2rem] p-6 hover:border-beauty-200 transition-all"
            >
              <div className="flex items-start justify-between gap-6">
                <div>
                  <div className="text-sm font-black text-slate-900">导入我的化妆品</div>
                  <div className="mt-2 text-sm text-slate-500 leading-relaxed">
                    点击后可从抖音商城一键导入已购买的化妆品，或手动输入你已有的化妆品。导入后会优先展示“已拥有”的匹配项。
                  </div>
                </div>
                <div className="shrink-0 bg-white border border-slate-100 rounded-2xl px-4 py-3">
                  <div className="text-xs font-bold text-slate-500">已导入</div>
                  <div className="text-lg font-black text-beauty-600">{ownedCosmetics.length}</div>
                </div>
              </div>
            </motion.button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendation.products.map((product, idx) => (
                <motion.div 
                  key={idx}
                  whileHover={{ y: -5 }}
                  className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm flex flex-col gap-4"
                >
                  <div className="flex gap-6 items-center">
                    <div className="w-16 h-16 bg-beauty-50 rounded-2xl flex items-center justify-center text-beauty-500 shrink-0">
                      <ShoppingBag size={24} />
                    </div>
                    <div className="flex-1">
                      <span className="text-[10px] font-bold text-beauty-500 uppercase tracking-wider">{product.category}</span>
                      <h4 className="font-bold text-slate-800">{product.name}</h4>
                      <p className="text-xs text-slate-400 mt-1">{product.shade && `色号: ${product.shade}`}</p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">妆造推荐度</span>
                      <span className={`text-[10px] font-bold ${product.owned ? 'text-green-500' : 'text-orange-500'}`}>
                        {product.owned ? '已拥有' : '暂无匹配'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: `${product.matchScore}%` }}
                          className={`h-full ${product.owned ? 'bg-green-500' : 'bg-orange-400'}`}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-600">{product.matchScore}%</span>
                    </div>

                    {product.owned ? (
                      <div className="mt-4">
                        <div className="flex items-center gap-2 text-[10px] text-green-600 font-bold">
                          <CheckCircle size={12} />
                          {ownedCosmetics.length >= 2 ? '已拥有（优先匹配）' : '已拥有（示例，可导入替换）'}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {(() => {
                            const intent = getProductIntent(product.category, product.name)
                            const picked = pickOwnedForIntent(intent, effectiveOwned, hashString(`${intent}|${idx}`))
                            return (
                              <span className="text-[10px] font-bold text-slate-700 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-full">
                                {picked.brand} · {picked.name}
                              </span>
                            )
                          })()}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4">
                        <div className="flex items-center gap-2 text-[10px] text-orange-600 font-bold">
                          <AlertTriangle size={12} />
                          暂无匹配（推荐入手）
                        </div>
                        <div className="mt-3 space-y-2">
                          {suggestCosmetics(
                            getProductIntent(product.category, product.name),
                            hashString(`${product.category}|${product.name}|${idx}`),
                          ).map((x, i) => (
                            <a
                              key={`${x.brand}-${x.name}-${i}`}
                              href={x.link}
                              target="_blank"
                              rel="noreferrer"
                              className="block text-[10px] font-bold text-slate-700 bg-white border border-slate-100 rounded-xl px-3 py-2 hover:border-beauty-200 transition-colors"
                            >
                              {x.brand} · {x.name}
                              <span className="ml-2 text-beauty-600">虚拟购买链接</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                <ExternalLink size={20} className="text-beauty-500" />
                关联视频教程
              </h3>
              <div className="space-y-4">
                {recommendation.relatedTutorials.map((tutorial, idx) => (
                  <a 
                    key={idx}
                    href={tutorial.link}
                    className="group block bg-white p-4 rounded-2xl border border-slate-100 hover:border-beauty-200 transition-all shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded text-slate-500">{tutorial.platform}</span>
                    </div>
                    <h4 className="font-bold text-slate-700 group-hover:text-beauty-500 transition-colors">{tutorial.title}</h4>
                  </a>
                ))}
              </div>
            </div>

            <div className="bg-beauty-50 rounded-[2.5rem] p-8 border border-beauty-100">
              <h4 className="font-bold text-beauty-700 mb-2">💡 专家建议</h4>
              <p className="text-sm text-beauty-600/80 leading-relaxed">
                {insight?.expertAdvice ??
                  '建议把妆面强度控制在「看得出精致、但不显用力」：底妆薄、重点集中在眉眼与气色，照片里会更显高级耐看。'}
              </p>
            </div>

            <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100">
              <div className="flex items-center justify-between gap-4">
                <h4 className="font-bold text-slate-800">推荐妆造收藏库</h4>
                <div className="text-xs font-bold text-slate-500">{favorites.length} 条</div>
              </div>

              {favorites.length ? (
                <div className="mt-6 grid grid-cols-3 gap-3">
                  {favorites.slice(0, 6).map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => {
                        setSelectedFavorite(item)
                        setFavoriteOpen(true)
                      }}
                      className="text-left bg-beauty-50 border border-beauty-100 rounded-2xl p-3 hover:border-beauty-200 transition-colors aspect-square flex flex-col"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-black text-slate-800 text-sm truncate">{item.title}</div>
                          <div className="mt-1 text-xs text-slate-500 leading-snug max-h-10 overflow-hidden">
                            {item.summary}
                          </div>
                        </div>
                        <div className="shrink-0 text-[10px] font-bold text-slate-400">
                          {item.savedAt ? new Date(item.savedAt).toLocaleDateString() : ''}
                        </div>
                      </div>
                      {item.keyItems.length ? (
                        <div className="mt-auto pt-3 flex flex-wrap gap-2">
                          <span className="text-[10px] font-bold text-beauty-600 bg-beauty-50 border border-beauty-100 px-2.5 py-1 rounded-full">
                            {item.keyItems.length} 个单品
                          </span>
                          {item.keyItems.slice(0, 2).map((p, idx) => (
                            <span
                              key={`${item.id}-${p.category}-${idx}`}
                              className="text-[10px] font-bold text-slate-700 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-full"
                            >
                              {p.category}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="mt-6 text-sm text-slate-500 leading-relaxed">
                  点击左侧的“收藏此方案”，这里会自动沉淀你喜欢的妆造方案，方便下次直接复用。
                </div>
              )}
            </div>
          </div>
        </div>
        )}
      </div>

      {ownedOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-2xl bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl overflow-hidden">
            <div className="p-8">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <div className="text-2xl font-black text-slate-900">导入我的化妆品</div>
                  <div className="mt-2 text-sm text-slate-500">
                    支持从抖音商城一键导入（Demo），或手动输入你已拥有的化妆品（每行一条：品牌 名称）。
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOwnedOpen(false)}
                  className="shrink-0 bg-slate-900 text-white px-4 py-2 rounded-2xl font-bold hover:bg-slate-800 transition-all"
                >
                  关闭
                </button>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    const imported: OwnedCosmetic[] = [
                      { brand: '兰蔻', name: '持妆粉底液' },
                      { brand: 'NARS', name: '遮瑕膏' },
                      { brand: '3CE', name: '九宫格眼影盘' },
                      { brand: 'MAC', name: '子弹头口红' },
                    ]
                    setOwnedCosmetics(imported)
                    try {
                      localStorage.setItem(OWNED_STORAGE_KEY, JSON.stringify(imported))
                    } catch {}
                    setOwnedInput(imported.map((x) => `${x.brand} ${x.name}`).join('\n'))
                  }}
                  className="bg-beauty-500 text-white px-5 py-4 rounded-2xl font-black hover:bg-beauty-600 transition-all"
                >
                  抖音商城一键导入
                </button>

                <button
                  type="button"
                  onClick={() => {
                    try {
                      localStorage.removeItem(OWNED_STORAGE_KEY)
                    } catch {}
                    setOwnedCosmetics([])
                    setOwnedInput('')
                  }}
                  className="bg-white text-slate-700 px-5 py-4 rounded-2xl font-black border border-slate-200 hover:border-beauty-200 transition-all"
                >
                  清空已导入
                </button>
              </div>

              <div className="mt-6">
                <div className="text-sm font-black text-slate-800 mb-2">手动输入</div>
                <textarea
                  value={ownedInput}
                  onChange={(e) => setOwnedInput(e.target.value)}
                  className="w-full h-40 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium text-slate-800 outline-none focus:ring-4 focus:ring-beauty-100"
                  placeholder="示例：\n兰蔻 持妆粉底液\nNARS 遮瑕膏\n3CE 九宫格眼影盘"
                />
                <div className="mt-4 flex items-center justify-between gap-4 flex-wrap">
                  <div className="text-xs text-slate-500">当前已导入：{ownedCosmetics.length} 件</div>
                  <button
                    type="button"
                    onClick={() => {
                      const parsed = parseOwnedCosmetics(ownedInput)
                      setOwnedCosmetics(parsed)
                      try {
                        localStorage.setItem(OWNED_STORAGE_KEY, JSON.stringify(parsed))
                      } catch {}
                      setOwnedOpen(false)
                    }}
                    className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black hover:bg-slate-800 transition-all"
                  >
                    保存并应用
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {favoriteOpen && selectedFavorite ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-2xl bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl overflow-hidden">
            <div className="p-8">
              <div className="flex items-start justify-between gap-6">
                <div className="min-w-0">
                  <div className="text-2xl font-black text-slate-900 truncate">{selectedFavorite.title}</div>
                  <div className="mt-2 text-sm text-slate-500">
                    收藏时间：{selectedFavorite.savedAt ? new Date(selectedFavorite.savedAt).toLocaleString() : ''}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFavoriteOpen(false)
                    setSelectedFavorite(null)
                  }}
                  className="shrink-0 bg-slate-900 text-white px-4 py-2 rounded-2xl font-bold hover:bg-slate-800 transition-all"
                >
                  关闭
                </button>
              </div>

              <div className="mt-6 bg-slate-50 border border-slate-100 rounded-2xl p-5">
                <div className="text-sm font-black text-slate-800">方案描述</div>
                <div className="mt-2 text-sm text-slate-600 leading-relaxed">{selectedFavorite.summary}</div>
              </div>

              {selectedFavorite.keyItems.length ? (
                <div className="mt-6">
                  <div className="text-sm font-black text-slate-800">关键单品</div>
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedFavorite.keyItems.map((p, idx) => (
                      <div
                        key={`${selectedFavorite.id}-item-${idx}`}
                        className="bg-white border border-slate-100 rounded-2xl p-4"
                      >
                        <div className="text-[10px] font-bold text-slate-400 uppercase">{p.category}</div>
                        <div className="mt-1 font-black text-slate-800">{p.name}</div>
                        {p.shade ? <div className="mt-1 text-xs text-slate-500">色号：{p.shade}</div> : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}

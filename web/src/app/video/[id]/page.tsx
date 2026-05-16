import Link from 'next/link'
import { Play } from 'lucide-react'

const VIDEOS: Record<string, { title: string; douyinUrl: string }> = {
  '1': {
    title: '给男模兄弟们出的化妆教程',
    douyinUrl: 'https://v.douyin.com/Rnm0lFqRvrY/',
  },
  '2': {
    title: '女生烟熏妆',
    douyinUrl: 'https://v.douyin.com/1gK28tUEXzI/',
  },
  '3': {
    title: '女生漫画妆',
    douyinUrl: 'https://v.douyin.com/_sZllrORtwY/',
  },
  '4': {
    title: '女生清冷妆',
    douyinUrl: 'https://v.douyin.com/aTb4CEtbvX8/',
  },
}

export function generateStaticParams() {
  return Object.keys(VIDEOS).map((id) => ({ id }))
}

export default async function VideoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const aliasMap: Record<string, keyof typeof VIDEOS> = {
    male: '1',
    smokey: '2',
    manga: '3',
    cool: '4',
  }
  const resolvedId = (aliasMap[id] ?? id) as keyof typeof VIDEOS
  const video = VIDEOS[resolvedId]

  if (!video) {
    return (
      <main className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-sm">
            <div className="text-2xl font-black text-slate-900 mb-2">未找到该视频</div>
            <div className="text-slate-500 mb-8">请从首页的示例视频进入播放页面。</div>
            <Link
              href="/#video"
              className="inline-flex items-center justify-center bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-slate-800 transition-colors"
            >
              返回 Step 1
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <div className="text-3xl font-black text-slate-900">{video.title}</div>
            <div className="text-sm text-slate-500 mt-1">
              本地视频播放（用于 Demo 演示），也可打开抖音原链接
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={video.douyinUrl}
              target="_blank"
              rel="noreferrer"
              className="bg-white border border-slate-200 text-slate-700 px-5 py-3 rounded-2xl font-bold hover:bg-slate-50 transition-colors"
            >
              打开抖音
            </a>
            <Link
              href="/#video"
              className="bg-slate-900 text-white px-5 py-3 rounded-2xl font-bold hover:bg-slate-800 transition-colors"
            >
              返回分析
            </Link>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-[2.75rem] overflow-hidden shadow-lg">
          <div className="aspect-video bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
            <div className="text-center px-10">
              <Play size={96} className="mx-auto mb-4 opacity-25 text-white" />
              <div className="text-white font-black text-2xl">演示模式：模拟播放器</div>
              <div className="text-white/70 text-sm mt-2">为保证 GitHub Pages 可快速部署，此处仅还原产品流程展示</div>
              <a
                href={video.douyinUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center mt-6 bg-white/10 border border-white/20 text-white px-6 py-3 rounded-2xl font-bold hover:bg-white/15 transition-colors"
              >
                打开原视频链接
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

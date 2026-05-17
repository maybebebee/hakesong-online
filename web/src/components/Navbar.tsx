'use client'

import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-beauty-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-beauty-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-beauty-200">
              <Sparkles size={24} />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-beauty-600 to-beauty-400">
              Mirror Ai
            </span>
          </Link>
          
          <div className="hidden md:flex gap-6">
            <Link href="#video" className="text-slate-600 hover:text-beauty-500 font-medium transition-colors">视频分析</Link>
            <Link href="#face" className="text-slate-600 hover:text-beauty-500 font-medium transition-colors">人脸识别/妆后预览</Link>
            <Link href="#recommend" className="text-slate-600 hover:text-beauty-500 font-medium transition-colors">推荐结果</Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

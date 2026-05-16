'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, RefreshCcw } from 'lucide-react'

const PHOTO_KEY = 'user_photo_v1'

export default function PhotoUploader() {
  const [photo, setPhoto] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PHOTO_KEY)
      if (raw && typeof raw === 'string') setPhoto(raw)
    } catch {}
  }, [])

  const onPick = async (file: File) => {
    setError(null)
    try {
      const reader = new FileReader()
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => (typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('invalid')))
        reader.onerror = () => reject(new Error('read failed'))
        reader.readAsDataURL(file)
      })
      setPhoto(dataUrl)
      try {
        localStorage.setItem(PHOTO_KEY, dataUrl)
        window.dispatchEvent(new CustomEvent('user_photo_v1:updated', { detail: dataUrl }))
        localStorage.removeItem('selfie_face_analysis_v1')
        window.dispatchEvent(new CustomEvent('selfie_face_analysis_v1:updated', { detail: null }))
      } catch {}
    } catch {
      setError('读取图片失败，请换一张图片重试。')
    }
  }

  const triggerPick = () => inputRef.current?.click()

  return (
    <section id="upload" className="py-10 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center">
          <motion.button
            type="button"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={triggerPick}
            className="bg-beauty-50 border border-beauty-100 rounded-3xl px-5 py-4 shadow-sm hover:border-beauty-200 transition-colors text-left w-full max-w-xl"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-white border border-beauty-100 flex items-center justify-center text-beauty-600 shrink-0">
                  <Upload size={22} />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-black text-slate-900">Step 0：上传照片以获得完整体验</div>
                  <div className="mt-1 text-xs text-slate-500 leading-relaxed">
                    {photo ? '已上传，点击可重新上传' : '点击选择一张正脸清晰自拍照'}
                  </div>
                </div>
              </div>
              {photo ? (
                <div className="shrink-0 flex items-center gap-2">
                  <img src={photo} alt="thumb" className="w-12 h-12 rounded-2xl object-cover border border-white shadow-sm" />
                  <div className="text-xs font-black text-slate-700 bg-white border border-slate-100 rounded-2xl px-3 py-2 flex items-center gap-2">
                    <RefreshCcw size={14} />
                    重新上传
                  </div>
                </div>
              ) : (
                <div className="shrink-0 text-xs font-black text-beauty-600 bg-white border border-beauty-100 rounded-2xl px-4 py-3">
                  选择照片
                </div>
              )}
            </div>
            {error ? (
              <div className="mt-3 text-xs font-bold text-red-700 bg-red-50 border border-red-100 rounded-2xl px-3 py-2">
                {error}
              </div>
            ) : null}
          </motion.button>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) void onPick(f)
          }}
        />
      </div>
    </section>
  )
}

import React, { useRef, useState } from 'react'
import { Camera, Upload, User, ChevronRight, ScanFace } from 'lucide-react'
import { useStore } from '../store/useStore'

interface FaceSectionProps {
  onNext: () => void;
}

const FaceSection: React.FC<FaceSectionProps> = ({ onNext }) => {
  const { setFaceAnalysis, setLoading, faceAnalysis } = useStore()
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreview(url)
      analyzeFace(url)
    }
  }

  const analyzeFace = async (url: string) => {
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setFaceAnalysis({
      faceShape: '圆脸',
      skinTone: '中性二白',
      features: ['内双眼', '小圆鼻', '嘟嘟唇'],
      photoUrl: url
    })
    setLoading(false)
  }

  return (
    <div className="space-y-8">
      <section className="bg-white rounded-3xl p-8 shadow-sm border border-beauty-100">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Camera className="text-beauty-500" />
          人脸分析与检测
        </h2>

        <div className="flex flex-col md:flex-row gap-8 items-center">
          {/* Upload/Camera Area */}
          <div className="w-full md:w-1/2 aspect-square rounded-3xl border-4 border-dashed border-beauty-100 bg-beauty-50 flex flex-col items-center justify-center relative overflow-hidden group">
            {preview ? (
              <>
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                   <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 bg-white rounded-full text-beauty-500 hover:scale-110 transition-transform"
                   >
                     <Upload size={24} />
                   </button>
                </div>
              </>
            ) : (
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-beauty-400 mx-auto mb-4 shadow-sm">
                  <User size={32} />
                </div>
                <p className="text-slate-600 font-medium mb-2">上传照片或开始拍摄</p>
                <p className="text-xs text-slate-400 mb-6">请保证光线充足，正对镜头</p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-beauty-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-beauty-600 transition-colors"
                  >
                    选择照片
                  </button>
                  <button className="bg-white text-beauty-500 border border-beauty-200 px-4 py-2 rounded-xl text-sm font-bold hover:bg-beauty-50 transition-colors">
                    实时拍摄
                  </button>
                </div>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange} 
            />
          </div>

          {/* Analysis Result */}
          <div className="w-full md:w-1/2 space-y-6">
            {faceAnalysis ? (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-500">
                    <ScanFace size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">识别完成</h3>
                    <p className="text-xs text-slate-500">已提取 128 个面部关键特征点</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { label: '面部轮廓', value: faceAnalysis.faceShape },
                    { label: '皮肤色号', value: faceAnalysis.skinTone },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between items-center p-4 bg-beauty-50 rounded-2xl">
                      <span className="text-sm text-slate-500">{item.label}</span>
                      <span className="font-bold text-beauty-600">{item.value}</span>
                    </div>
                  ))}
                  
                  <div className="p-4 bg-beauty-50 rounded-2xl">
                    <span className="text-sm text-slate-500 block mb-3">五官特点</span>
                    <div className="flex flex-wrap gap-2">
                      {faceAnalysis.features.map(f => (
                        <span key={f} className="px-3 py-1 bg-white border border-beauty-100 rounded-lg text-xs text-slate-600 font-medium">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 py-12">
                <ScanFace size={64} className="mb-4 opacity-20" />
                <p>待识别面部特征</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {faceAnalysis && (
        <button
          onClick={onNext}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all group animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          查看匹配推荐
          <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </button>
      )}
    </div>
  )
}

export default FaceSection

import React from 'react'
import { Sparkles, ShoppingBag, Palette, ChevronRight, Check } from 'lucide-react'
import { useStore } from '../store/useStore'

interface RecommendationSectionProps {
  onNext: () => void;
}

const RecommendationSection: React.FC<RecommendationSectionProps> = ({ onNext }) => {
  const { videoAnalysis, faceAnalysis } = useStore()

  // 模拟推荐逻辑
  const recommendations = {
    style: '清透奶茶感通勤妆',
    products: [
      { name: '保湿水光粉底液', shade: 'N01 象牙白', reason: '适合你的中性皮，打造清透底妆' },
      { name: '低饱和眼影盘', shade: '大地奶茶色', reason: '针对内双眼消肿，自然放大双眼' },
      { name: '水光镜面唇釉', shade: '03 冰透红茶', reason: '适配嘟嘟唇，提升气色' },
    ],
    tips: [
      '眼影晕染不要超过内双褶皱处 2mm',
      '修容重点在下颌线，弱化圆脸轮廓',
      '腮红斜向上打，提升面部折叠度'
    ]
  }

  if (!videoAnalysis || !faceAnalysis) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-beauty-100 shadow-sm">
        <Sparkles size={48} className="mx-auto mb-4 text-beauty-200" />
        <p className="text-slate-500">请先完成视频分析和人脸检测</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Style Banner */}
      <section className="bg-gradient-to-r from-beauty-500 to-beauty-400 rounded-3xl p-8 text-white shadow-lg shadow-beauty-100">
        <div className="flex items-center gap-3 mb-2 opacity-90">
          <Sparkles size={20} />
          <span className="text-sm font-medium">定制化方案</span>
        </div>
        <h2 className="text-3xl font-bold mb-4">最适合你的妆容风格：{recommendations.style}</h2>
        <p className="opacity-90 max-w-lg">
          结合了视频中的{videoAnalysis.steps[1]}技巧，并针对你的{faceAnalysis.faceShape}和{faceAnalysis.features[0]}进行了专属改写。
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Products */}
        <section className="bg-white rounded-3xl p-8 shadow-sm border border-beauty-100">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <ShoppingBag className="text-beauty-500" />
            推荐好物
          </h3>
          <div className="space-y-6">
            {recommendations.products.map((item, idx) => (
              <div key={idx} className="group cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-slate-800 group-hover:text-beauty-600 transition-colors">{item.name}</h4>
                  <span className="text-xs font-bold bg-beauty-50 text-beauty-500 px-2 py-1 rounded-lg">{item.shade}</span>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">{item.reason}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tips */}
        <section className="bg-white rounded-3xl p-8 shadow-sm border border-beauty-100">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Palette className="text-beauty-500" />
            个性化上妆技巧
          </h3>
          <div className="space-y-4">
            {recommendations.tips.map((tip, idx) => (
              <div key={idx} className="flex gap-4 p-4 bg-beauty-50 rounded-2xl hover:bg-beauty-100 transition-colors">
                <div className="w-6 h-6 rounded-full bg-beauty-500 text-white flex items-center justify-center shrink-0">
                  <Check size={14} />
                </div>
                <p className="text-sm text-slate-600 font-medium">{tip}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <button
        onClick={onNext}
        className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all group"
      >
        生成 AI 妆后预览
        <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  )
}

export default RecommendationSection

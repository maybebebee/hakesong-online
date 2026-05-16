import { VideoAnalysisResult, Recommendation } from '../types';

export const MOCK_VIDEO_ANALYSIS: VideoAnalysisResult = {
  steps: ['清透底妆', '消肿眼妆', '自然修容', '奶茶唇色'],
  techniques: ['少量多次叠加', '晕染边界', '重点提亮'],
  style: '温柔通勤妆',
  duration: '10-15 分钟',
  difficulty: '中等',
  skinType: ['混合皮', '油皮'],
  faceShape: ['圆脸', '方脸'],
  targetAudience: '18-25岁，追求日常通勤感的人群'
};

export const MOCK_RECOMMENDATION: Recommendation = {
  makeupStyle: '温柔韩系通勤妆',
  products: [
    { name: '轻盈无暇粉底液', category: '底妆', shade: 'B10', description: '适合中性皮肤，自然持妆', matchScore: 95, owned: true },
    { name: '大地色系四色眼影', category: '眼妆', shade: '01 暖棕', description: '消肿利器，新手友好', matchScore: 40, owned: false },
    { name: '哑光雾面口红', category: '唇妆', shade: '602 奶茶色', description: '显白提气色', matchScore: 100, owned: true }
  ],
  relatedTutorials: [
    { title: '5分钟早八快速妆容', platform: '抖音', link: '#' },
    { title: '圆脸如何化出高级感', platform: '小红书', link: '#' }
  ]
};

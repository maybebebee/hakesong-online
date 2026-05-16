import type { VideoAnalysisResult } from '@/types';
import type { SelfieFaceAnalysisSkillResult } from '@/types';

function isGitHubPagesRuntime(): boolean {
  if (typeof window === 'undefined') return false;
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
  if (window.location.hostname.endsWith('github.io')) return true;
  if (basePath && window.location.pathname.startsWith(basePath)) return true;
  return false;
}

export const analyzeVideo = async (url: string, presetId?: string): Promise<VideoAnalysisResult> => {
  // 模拟 API 延迟
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // 模拟根据链接内容返回不同结果
  if (url.includes('error')) {
    throw new Error('解析失败，请检查视频链接是否有效');
  }
  
  if (url.includes('limit')) {
    const error = new Error('请求过于频繁') as Error & {
      response?: { status: number };
    };
    error.response = { status: 429 };
    throw error;
  }

  const id = presetId?.trim() ?? '';

  if (id === '1' || id === 'male') {
    return {
      steps: ['快速清洁与保湿', '自然提气色底妆', '眉形修整与定型', '眼部立体加深', '唇色修饰与轮廓提亮'],
      techniques: ['底妆薄铺，重点遮瑕', '眉峰稍上提更显精神', '眼尾轻微加深不显妆感', '唇周提亮增强立体'],
      style: '男生上镜提气色妆',
      duration: '6-10 分钟',
      difficulty: '简单',
      skinType: ['油皮', '混合皮', '中性皮'],
      faceShape: ['圆脸', '方脸', '长脸'],
      targetAudience: '男生日常/拍摄/面试场景，需要快速提气色的人群',
    };
  }

  if (id === '2' || id === 'smokey') {
    return {
      steps: ['控油妆前与眼部打底', '高遮瑕雾面底妆', '深色眼影晕染与加深', '上挑眼线与假睫毛', '修容加强轮廓与雾面唇'],
      techniques: ['眼影少量多次叠加', '晕染边界用干净刷子收口', '眼线从睫毛根部填满再拉长', '下眼影增强氛围'],
      style: '女生烟熏氛围妆',
      duration: '18-25 分钟',
      difficulty: '困难',
      skinType: ['油皮', '混合偏油'],
      faceShape: ['方脸', '长脸', '菱形脸'],
      targetAudience: '夜晚聚会/舞台/拍照，追求强氛围与眼妆存在感的人群',
    };
  }

  if (id === '3' || id === 'manga') {
    return {
      steps: ['水润妆前与提亮', '清透奶油肌底妆', '漫画眼线与卧蚕塑形', '纤长睫毛与下睫毛点画', '腮红集中与水光唇'],
      techniques: ['卧蚕阴影要轻，提亮要准', '下睫毛用点画更自然', '眼线细长，眼尾上扬', '腮红集中在苹果肌'],
      style: '女生漫画大眼妆',
      duration: '15-22 分钟',
      difficulty: '中等',
      skinType: ['干皮', '混合偏干', '中性皮'],
      faceShape: ['圆脸', '鹅蛋脸', '心形脸'],
      targetAudience: '拍照/约会/二次元风格穿搭，偏好甜酷大眼效果的人群',
    };
  }

  if (id === '4' || id === 'cool') {
    return {
      steps: ['清爽妆前与局部控油', '冷调底妆与提亮', '低饱和眼妆与眼尾拉长', '灰调修容与高光克制', '冷感雾面唇'],
      techniques: ['底妆冷调更显清冷', '眼尾拉长但不加粗', '修容从颧骨下方向后收', '高光点在鼻尖与眉骨少量'],
      style: '女生清冷氛围妆',
      duration: '12-18 分钟',
      difficulty: '中等',
      skinType: ['混合皮', '油皮', '中性皮'],
      faceShape: ['长脸', '鹅蛋脸', '方脸'],
      targetAudience: '通勤/拍照/冷感穿搭风格，追求高级克制妆感的人群',
    };
  }

  return {
    steps: ['深度清洁与补水妆前', '哑光雾面底妆打造', '深邃大地色眼影叠加', '修容勾勒立体五官', '复古红唇上色'],
    techniques: ['分区上妆法', '倒叙修容', '少量多次晕染', '眼部“三明治”定妆'],
    style: '高级感复古冷艳妆',
    duration: '15-20 分钟',
    difficulty: '中等',
    skinType: ['油性肌肤', '混合偏油'],
    faceShape: ['圆脸', '鹅蛋脸'],
    targetAudience: '20-30岁，职场精英或正式场合出席者',
  };
};

function hashString(input: string): number {
  let h = 5381;
  for (let i = 0; i < input.length; i += 1) {
    h = (h * 33) ^ input.charCodeAt(i);
  }
  return h >>> 0;
}

async function getAverageColor(dataUrl: string): Promise<{ r: number; g: number; b: number } | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(null);
        return;
      }
      const w = Math.max(1, Math.min(96, img.naturalWidth));
      const h = Math.max(1, Math.min(96, img.naturalHeight));
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(img, 0, 0, w, h);
      const pixels = ctx.getImageData(0, 0, w, h).data;
      let r = 0;
      let g = 0;
      let b = 0;
      let count = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        const a = pixels[i + 3] ?? 255;
        if (a < 10) continue;
        r += pixels[i] ?? 0;
        g += pixels[i + 1] ?? 0;
        b += pixels[i + 2] ?? 0;
        count += 1;
      }
      if (!count) {
        resolve(null);
        return;
      }
      resolve({ r: Math.round(r / count), g: Math.round(g / count), b: Math.round(b / count) });
    };
    img.onerror = () => resolve(null);
    img.src = dataUrl;
  });
}

function clampInt(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(n)));
}

export const detectFace = async (
  imageDataUrl: string,
  opts?: { need_detail?: boolean; lang?: 'zh_CN' },
): Promise<SelfieFaceAnalysisSkillResult> => {
  const needDetail = opts?.need_detail ?? true;
  const lang = opts?.lang ?? 'zh_CN';

  if (isGitHubPagesRuntime()) {
    return mockDetectFace(imageDataUrl, { need_detail: needDetail, lang });
  }

  let res: Response;
  try {
    res = await fetch('/api/face', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageDataUrl, format: 'skill', need_detail: needDetail, lang }),
    });
  } catch {
    return mockDetectFace(imageDataUrl, { need_detail: needDetail, lang });
  }

  const json = (await res.json().catch(() => null)) as SelfieFaceAnalysisSkillResult | { error?: string } | null;
  if (!res.ok) {
    if (res.status === 404) {
      return mockDetectFace(imageDataUrl, { need_detail: needDetail, lang });
    }
    const message = json && typeof json === 'object' && 'error' in json && typeof json.error === 'string'
      ? json.error
      : `请求失败（HTTP ${res.status}）`;
    throw new Error(message);
  }
  if (!json || typeof json !== 'object' || !('code' in json)) {
    throw new Error('返回格式不正确');
  }

  const result = json as SelfieFaceAnalysisSkillResult;
  if (result.code !== 200) {
    throw new Error(result.message || '未检测到清晰人脸，请重试');
  }
  return result;
};

async function mockDetectFace(
  imageDataUrl: string,
  opts?: { need_detail?: boolean; lang?: 'zh_CN' },
): Promise<SelfieFaceAnalysisSkillResult> {
  const needDetail = opts?.need_detail ?? true;
  const h = hashString(imageDataUrl);

  const faceShapes = ['鹅蛋脸', '圆脸', '方脸', '心形脸', '菱形脸'] as const;
  const faceShape = faceShapes[h % faceShapes.length];

  const avg = typeof window === 'undefined' ? null : await getAverageColor(imageDataUrl);
  const warmth = avg ? avg.r - avg.b : ((h >>> 8) % 41) - 20;
  const brightness = avg ? (avg.r + avg.g + avg.b) / 3 : 160;
  const toneBase = brightness >= 175 ? '一白' : brightness >= 145 ? '二白' : '自然';
  const tonePrefix = warmth >= 8 ? '暖调' : warmth <= -8 ? '冷调' : '中性调';
  const skinTone = toneBase === '自然' ? tonePrefix : `${tonePrefix}${toneBase}`;

  const symmetryScore = clampInt(84 + ((h >>> 2) % 13), 70, 99);
  const proportionMatch = clampInt(78 + ((h >>> 5) % 19), 60, 99);
  const featureBalance = clampInt(80 + ((h >>> 9) % 18), 60, 99);

  const eyeTypes = [
    { type: '杏眼', description: '眼型圆润舒展，眼神很有亲和力，笑起来特别灵动。' },
    { type: '内双眼', description: '内双更显温柔内敛，眼神自带故事感，耐看型气质。' },
    { type: '圆眼', description: '圆眼元气十足，眼神清亮，整体氛围更显减龄。' },
    { type: '单眼皮', description: '单眼皮干净利落，轮廓更显高级感，可塑性很强。' },
  ] as const;
  const browTypes = [
    { type: '自然眉', description: '眉形流畅柔和，眉峰过渡自然，自带松弛感。' },
    { type: '平直眉', description: '平直眉更显清爽少年感，整体气质干净利落。' },
    { type: '野生眉', description: '眉毛毛流感强，氛围更自然，显得很有生命力。' },
    { type: '微挑眉', description: '眉尾微微上扬，精气神更足，显得更有气场。' },
  ] as const;
  const noseTypes = [
    { type: '秀气鼻', description: '鼻梁线条温润，鼻尖小巧，稳稳撑起面部中轴线。' },
    { type: '直鼻', description: '鼻梁线条更利落，侧面轮廓清晰，整体更显立体。' },
    { type: '小翘鼻', description: '鼻尖微翘很俏皮，面中更显轻盈，自带甜感。' },
    { type: '骨相鼻', description: '骨相支撑感更强，轮廓更上镜，整体气质更高级。' },
  ] as const;
  const lipTypes = [
    { type: 'M唇', description: '唇峰清晰，唇形立体，笑起来特别有甜感。' },
    { type: '微笑唇', description: '唇角自然上扬，自带亲和力，表情更显温柔。' },
    { type: '饱满唇', description: '唇部更显饱满，气色感更强，上唇色更好看。' },
    { type: '清爽薄唇', description: '唇形利落清爽，更显干净高级，适合多种风格。' },
  ] as const;

  const eye = eyeTypes[(h >>> 12) % eyeTypes.length];
  const brow = browTypes[(h >>> 15) % browTypes.length];
  const nose = noseTypes[(h >>> 18) % noseTypes.length];
  const lip = lipTypes[(h >>> 21) % lipTypes.length];

  const faceShapeDesc: Record<(typeof faceShapes)[number], string> = {
    鹅蛋脸: '整体轮廓流畅柔和，属于适配度很高的百搭脸型。',
    圆脸: '面部线条更圆润，自带减龄的元气感与亲和力。',
    方脸: '轮廓线条更利落，气质更显干净高级，很有辨识度。',
    心形脸: '上庭更有存在感，下巴更精致，整体灵气十足。',
    菱形脸: '面中立体、轮廓更分明，上镜优势明显，很有高级感。',
  };

  const overall =
    `整体面部轮廓干净耐看，${faceShapeDesc[faceShape]} ` +
    `五官分布均衡舒展，属于越看越耐看的类型。` +
    `眼部是「${eye.type}」，${eye.description} ` +
    `眉形偏「${brow.type}」，${brow.description}`;

  const data: SelfieFaceAnalysisSkillResult['data'] = {
    basic_info: {
      face_shape: faceShape,
      symmetry_score: symmetryScore,
      proportion_match: proportionMatch,
      feature_balance: featureBalance,
    },
    overall_description: overall,
    note: '以上分析仅为基于图像的客观特征参考，仅在会话内临时处理，不存储任何人脸数据；美是多元的，你的独特性才是最珍贵的~',
  };

  if (needDetail) {
    data.features_detail = {
      eye,
      brow,
      nose,
      lip,
    };
  }

  data.overall_description =
    `${data.overall_description} 肤色基调更偏「${skinTone}」，很适合做更精致的底妆与气色管理。`;

  return { code: 200, message: 'success', data };
}

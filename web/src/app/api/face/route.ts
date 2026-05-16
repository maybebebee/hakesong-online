import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-static";

const DEFAULT_BASE_URL = "https://ark.cn-beijing.volces.com/api/v3";
const DEFAULT_MODEL = "doubao-1-5-vision-pro-32k-250115";

type FaceAnalyzeRequest = {
  image: string;
  model?: string;
  format?: "simple" | "skill";
  need_detail?: boolean;
  lang?: "zh_CN";
};

type ArkChatCompletionsResponse = {
  choices?: Array<{
    message?: { content?: string };
  }>;
  error?: unknown;
};

type FaceAnalysisResult = {
  faceShape: string;
  skinTone: string;
  features: string[];
};

type SelfieFaceAnalysisSkillResult = {
  code: number;
  message: string;
  data?: {
    basic_info: {
      face_shape: string;
      symmetry_score: number;
      proportion_match: number;
      feature_balance: number;
    };
    features_detail?: {
      eye: { type: string; description: string };
      brow: { type: string; description: string };
      nose: { type: string; description: string };
      lip: { type: string; description: string };
    };
    overall_description: string;
    note: string;
  };
};

function cleanEnvValue(value: string | undefined): string | undefined {
  if (!value) return undefined;
  let v = value.trim();
  const hasPair = (left: string, right: string) => v.startsWith(left) && v.endsWith(right) && v.length >= 2;
  if (hasPair("`", "`") || hasPair('"', '"') || hasPair("'", "'")) {
    v = v.slice(1, -1).trim();
  }
  return v;
}

function normalizeBaseUrl(raw: string): string {
  const cleaned = cleanEnvValue(raw) ?? raw.trim();
  return cleaned.replace(/\/+$/g, "");
}

function normalizeVisionModelId(input: string): string {
  const trimmed = input.trim();
  const lower = trimmed.toLowerCase();
  if (
    lower === "doubao-1.5-vision-pro" ||
    lower === "doubao-1-5-vision-pro" ||
    lower === "doubao-1-5-vision-pro-latest" ||
    lower === "doubao-1.5-vision-pro-latest"
  ) {
    return "doubao-1-5-vision-pro-32k-250115";
  }
  if (lower === "doubao-vision-pro" || lower === "doubao-vision-pro-latest") {
    return "doubao-vision-pro-32k-241028";
  }
  return trimmed;
}

function getErrorCodeMessage(err: unknown): { code?: string; message?: string } {
  if (!err || typeof err !== "object") return {};
  const anyErr = err as Record<string, unknown>;
  const code = typeof anyErr.code === "string" ? anyErr.code : undefined;
  const message = typeof anyErr.message === "string" ? anyErr.message : undefined;
  return { code, message };
}

function extractJsonObject(text: string): unknown | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

function normalizeResult(raw: unknown): FaceAnalysisResult | null {
  if (!raw || typeof raw !== "object") return null;
  const anyRaw = raw as Record<string, unknown>;
  const faceShape = typeof anyRaw.faceShape === "string" ? anyRaw.faceShape : undefined;
  const skinTone = typeof anyRaw.skinTone === "string" ? anyRaw.skinTone : undefined;
  const features = Array.isArray(anyRaw.features)
    ? anyRaw.features.filter((v): v is string => typeof v === "string" && v.trim().length > 0)
    : undefined;
  if (!faceShape || !skinTone || !features || features.length === 0) return null;
  return { faceShape, skinTone, features: features.slice(0, 8) };
}

function clampScore(n: unknown, fallback: number): number {
  const num = typeof n === "number" && Number.isFinite(n) ? n : fallback;
  return Math.max(0, Math.min(100, Math.round(num)));
}

function clampInt(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(n)));
}

function hashString(input: string): number {
  let h = 5381;
  for (let i = 0; i < input.length; i += 1) {
    h = (h * 33) ^ input.charCodeAt(i);
  }
  return h >>> 0;
}

function normalizeCode(n: unknown, fallback: number): number {
  const num = typeof n === "number" && Number.isFinite(n) ? n : Number.NaN;
  const rounded = Number.isFinite(num) ? Math.round(num) : Number.NaN;
  if (rounded === 200 || rounded === 400) return rounded;
  return fallback;
}

function coerceScore(n: unknown): number | null {
  if (typeof n !== "number" || !Number.isFinite(n)) return null;
  return clampInt(n, 0, 100);
}

function synthesizeScores(seed: number): { symmetry: number; proportion: number; balance: number } {
  const base = 84 + (seed % 7);
  const symmetry = clampInt(base + (((seed >>> 3) % 7) - 3), 78, 96);
  const proportion = clampInt(base + (((seed >>> 7) % 7) - 3), 78, 96);
  const balance = clampInt(base + (((seed >>> 11) % 7) - 3), 78, 96);

  if (symmetry === proportion && proportion === balance) {
    return {
      symmetry: clampInt(symmetry + 1, 78, 96),
      proportion: proportion,
      balance: clampInt(balance - 1, 78, 96),
    };
  }
  return { symmetry, proportion, balance };
}

function normalizeSkillResult(raw: unknown, needDetail: boolean): SelfieFaceAnalysisSkillResult | null {
  if (!raw || typeof raw !== "object") return null;
  const anyRaw = raw as Record<string, unknown>;
  const code = normalizeCode(anyRaw.code, 200);
  const message =
    typeof anyRaw.message === "string" && anyRaw.message.trim()
      ? anyRaw.message.trim()
      : code === 200
        ? "success"
        : "failed";
  const data = anyRaw.data && typeof anyRaw.data === "object" ? (anyRaw.data as Record<string, unknown>) : null;
  if (!data) return { code, message };

  const basic = data.basic_info && typeof data.basic_info === "object" ? (data.basic_info as Record<string, unknown>) : null;
  const faceShape = typeof basic?.face_shape === "string" ? basic.face_shape.trim() : "";
  if (!faceShape) return null;

  const overall =
    typeof data.overall_description === "string" && data.overall_description.trim()
      ? data.overall_description.trim()
      : "";
  const note =
    typeof data.note === "string" && data.note.trim()
      ? data.note.trim()
      : "以上分析仅为基于图像的特征参考，美是多元的，你的独特性本身就很珍贵。";
  if (!overall) return null;

  const symRaw = coerceScore(basic?.symmetry_score);
  const propRaw = coerceScore(basic?.proportion_match);
  const balRaw = coerceScore(basic?.feature_balance);
  const allPresent = symRaw !== null && propRaw !== null && balRaw !== null;
  const allEqual = allPresent && symRaw === propRaw && propRaw === balRaw;
  const allLow = allPresent && symRaw < 75 && propRaw < 75 && balRaw < 75;

  const seed = hashString(`${faceShape}|${overall}`) ^ hashString(message);
  const synth = synthesizeScores(seed);

  const symmetryScore = clampInt(Math.max(75, symRaw ?? synth.symmetry), 0, 100);
  const proportionMatch = clampInt(Math.max(75, propRaw ?? synth.proportion), 0, 100);
  const featureBalance = clampInt(Math.max(75, balRaw ?? synth.balance), 0, 100);
  const scoresAdjusted = allEqual || allLow;
  const finalScores = scoresAdjusted ? synthesizeScores(seed ^ 0x9e3779b9) : null;
  const finalSym = scoresAdjusted ? finalScores!.symmetry : symmetryScore;
  const finalProp = scoresAdjusted ? finalScores!.proportion : proportionMatch;
  const finalBal = scoresAdjusted ? finalScores!.balance : featureBalance;

  const normalized: SelfieFaceAnalysisSkillResult = {
    code,
    message,
    data: {
      basic_info: {
        face_shape: faceShape,
        symmetry_score: finalSym,
        proportion_match: finalProp,
        feature_balance: finalBal,
      },
      overall_description: overall,
      note,
    },
  };

  if (!needDetail) return normalized;

  const detail =
    data.features_detail && typeof data.features_detail === "object"
      ? (data.features_detail as Record<string, unknown>)
      : null;
  const pickPair = (k: string): { type: string; description: string } | null => {
    const v = detail?.[k];
    if (!v || typeof v !== "object") return null;
    const obj = v as Record<string, unknown>;
    const type = typeof obj.type === "string" ? obj.type.trim() : "";
    const description = typeof obj.description === "string" ? obj.description.trim() : "";
    if (!type || !description) return null;
    return { type, description };
  };

  const eye = pickPair("eye");
  const brow = pickPair("brow");
  const nose = pickPair("nose");
  const lip = pickPair("lip");
  if (eye && brow && nose && lip) {
    normalized.data!.features_detail = { eye, brow, nose, lip };
  }

  return normalized;
}

export async function POST(req: Request) {
  const apiKey = process.env.ARK_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "缺少 ARK_API_KEY。请在 web/.env.local 中配置后重启开发服务。" },
      { status: 500 },
    );
  }

  let body: FaceAnalyzeRequest;
  try {
    body = (await req.json()) as FaceAnalyzeRequest;
  } catch {
    return NextResponse.json({ error: "请求体不是合法 JSON。" }, { status: 400 });
  }

  if (!body.image || typeof body.image !== "string") {
    return NextResponse.json({ error: "缺少 image（dataURL 或 URL）。" }, { status: 400 });
  }

  const baseUrlRaw = process.env.ARK_BASE_URL ?? DEFAULT_BASE_URL;
  const baseUrl = normalizeBaseUrl(baseUrlRaw);
  const modelRaw = body.model ?? process.env.ARK_VISION_MODEL ?? DEFAULT_MODEL;
  const modelCleaned = cleanEnvValue(modelRaw) ?? DEFAULT_MODEL;
  const model = normalizeVisionModelId(modelCleaned);

  const format: "simple" | "skill" = body.format ?? "skill";
  const needDetail = body.need_detail !== false;
  const lang: "zh_CN" = body.lang ?? "zh_CN";

  const systemBase =
    "你是一名专业的面部风格分析师与美学顾问。目标是给用户带来被理解感，描述温和高级、偏小红书审美，不做医学诊断，不做容貌贬低。";
  const system =
    format === "skill"
      ? `${systemBase} 输出语言：${lang}。请只输出 JSON，不要输出任何多余文字或 Markdown。`
      : "你是一个严谨的视觉分析助手。请根据输入照片做面部特征分析，用于美妆推荐。只输出 JSON，不要输出任何多余文字。";

  const instruction =
    format === "skill"
      ? "请根据照片做「自拍照五官友好分析」，返回严格 JSON（不要 Markdown）。如果未检测到清晰人脸/人脸遮挡严重/角度偏差过大，请返回：\n" +
        '{ "code": 400, "message": "未检测到清晰人脸，请上传正面清晰、光线充足且无遮挡的自拍照" }\n' +
        "否则返回结构如下：\n" +
        "{\n" +
        '  "code": 200,\n' +
        '  "message": "success",\n' +
        '  "data": {\n' +
        '    "basic_info": {\n' +
        '      "face_shape": "鹅蛋脸|圆脸|方脸|心形脸|菱形脸|长脸|其他（短语）",\n' +
        '      "symmetry_score": 75-96,\n' +
        '      "proportion_match": 75-96,\n' +
        '      "feature_balance": 75-96\n' +
        "    },\n" +
        (needDetail
          ? '    "features_detail": {\n' +
            '      "eye": { "type": "短语", "description": "1-2句温和高级的描述" },\n' +
            '      "brow": { "type": "短语", "description": "1-2句温和高级的描述" },\n' +
            '      "nose": { "type": "短语", "description": "1-2句温和高级的描述" },\n' +
            '      "lip": { "type": "短语", "description": "1-2句温和高级的描述" }\n' +
            "    },\n"
          : "") +
        '    "overall_description": "2-4句整体综合描述：客观特征 + 友好审美语言，突出个人特点与优势、适合什么妆面方向，避免绝对化与负面评价",\n' +
        '    "note": "一句温柔免责声明 + 多元审美引导（可带隐私承诺：仅会话内处理，不存储）"\n' +
        "  }\n" +
        "}\n" +
        "要求：只做客观特征 + 友好描述；完全避免锐评、尖锐负面评价；不确定时用“其他：...”保持克制；分数只表示视觉观感（不要全部填一样的数，三项之间允许有轻微差异），不代表价值判断；禁止使用冒犯词。"
      : "请返回严格 JSON，字段如下：\n" +
        "{\n" +
        '  "faceShape": "圆脸|方脸|长脸|鹅蛋脸|心形脸|菱形脸|其他（短语）",\n' +
        '  "skinTone": "冷调一白|冷调二白|暖调一白|暖调二白|中性调|其他（短语）",\n' +
        '  "features": ["3-8个短语，描述五官特点/眉眼/鼻梁/唇形/脸部比例等"]\n' +
        "}\n" +
        "要求：不要编造不存在的东西；如果不确定，用“其他：...”并保持克制。";

  const payload = {
    model,
    messages: [
      { role: "system", content: system },
      {
        role: "user",
        content: [
          { type: "text", text: instruction },
          { type: "image_url", image_url: { url: body.image } },
        ],
      },
    ],
    temperature: 0.2,
  };

  let res: Response;
  try {
    res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown error";
    return NextResponse.json(
      {
        error:
          "请求火山方舟失败：无法连接到 ARK_BASE_URL。\n" +
          `当前 baseUrl=${JSON.stringify(baseUrlRaw)}（清理后 ${JSON.stringify(baseUrl)}）。\n` +
          `原始信息：${message}`,
      },
      { status: 502 },
    );
  }

  const raw = (await res.json().catch(() => null)) as ArkChatCompletionsResponse | null;
  if (!res.ok) {
    const { code, message } = getErrorCodeMessage(raw?.error);
    if (code === "ModelNotOpen") {
      const readable =
        `模型未开通：当前账号尚未开通模型 ${model}。\n` +
        `解决方法：到火山方舟控制台开通该模型，或在 web/.env.local 将 ARK_VISION_MODEL 改为你已开通的模型 ID 后重启。\n` +
        (message ? `原始信息：${message}` : "");
      return NextResponse.json({ error: readable }, { status: res.status });
    }

    const fallback =
      typeof raw === "object" && raw && "error" in raw && raw?.error ? JSON.stringify(raw.error) : `HTTP ${res.status}`;
    return NextResponse.json({ error: `分析失败：${message ?? fallback}` }, { status: res.status });
  }

  const content = raw?.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") {
    return NextResponse.json({ error: "分析失败：未返回有效内容。" }, { status: 502 });
  }

  const parsed = extractJsonObject(content);
  if (format === "skill") {
    const normalized = normalizeSkillResult(parsed, needDetail);
    if (!normalized) {
      return NextResponse.json(
        { error: "分析失败：模型输出无法解析为预期 JSON。", raw: content },
        { status: 502 },
      );
    }
    return NextResponse.json(normalized);
  }

  const simple = normalizeResult(parsed);
  if (!simple) {
    return NextResponse.json({ error: "分析失败：模型输出无法解析为预期 JSON。", raw: content }, { status: 502 });
  }

  return NextResponse.json(simple);
}

export async function GET() {
  const baseUrlRaw = process.env.ARK_BASE_URL ?? DEFAULT_BASE_URL;
  const baseUrl = normalizeBaseUrl(baseUrlRaw);
  const modelRaw = process.env.ARK_VISION_MODEL ?? DEFAULT_MODEL;
  const modelCleaned = cleanEnvValue(modelRaw) ?? DEFAULT_MODEL;
  const model = normalizeVisionModelId(modelCleaned);
  return NextResponse.json({
    ok: true,
    hasApiKey: Boolean(process.env.ARK_API_KEY),
    baseUrl,
    model,
    debug: {
      baseUrlRaw,
      modelRaw,
      modelCleaned,
    },
  });
}

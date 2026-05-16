import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-static";

const DEFAULT_BASE_URL = "https://ark.cn-beijing.volces.com/api/v3";
const DEFAULT_MODEL = "doubao-seedream-5-0-260128";

type GenerateMakeupRequest = {
  prompt: string;
  image?: string;
  size?: "1K" | "2K" | "4K";
  watermark?: boolean;
  model?: string;
};

type ArkImageGenerationsResponse = {
  data?: Array<{ url?: string; size?: string }>;
  error?: unknown;
};

function normalizeModelId(input: string): string {
  const trimmed = input.trim();
  const lower = trimmed.toLowerCase();
  if (lower === "doubao-seedream-5.0-lite" || lower === "doubao-seedream-5-0-lite") {
    return "doubao-seedream-5-0-260128";
  }
  if (trimmed === "Doubao-Seedream-5.0-lite" || trimmed === "Doubao-Seedream-5-0-lite") {
    return "doubao-seedream-5-0-260128";
  }
  return trimmed;
}

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

function getErrorCodeMessage(err: unknown): { code?: string; message?: string } {
  if (!err || typeof err !== "object") return {};
  const anyErr = err as Record<string, unknown>;
  const code = typeof anyErr.code === "string" ? anyErr.code : undefined;
  const message = typeof anyErr.message === "string" ? anyErr.message : undefined;
  return { code, message };
}

export async function POST(req: Request) {
  const apiKey = process.env.ARK_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "缺少 ARK_API_KEY。请在 web/.env.local 中配置后重启开发服务。" },
      { status: 500 },
    );
  }

  let body: GenerateMakeupRequest;
  try {
    body = (await req.json()) as GenerateMakeupRequest;
  } catch {
    return NextResponse.json({ error: "请求体不是合法 JSON。" }, { status: 400 });
  }

  if (!body.prompt || typeof body.prompt !== "string") {
    return NextResponse.json({ error: "缺少 prompt。" }, { status: 400 });
  }

  const baseUrlRaw = process.env.ARK_BASE_URL ?? DEFAULT_BASE_URL;
  const baseUrl = normalizeBaseUrl(baseUrlRaw);
  const rawModelInput = body.model ?? process.env.ARK_IMAGE_MODEL ?? DEFAULT_MODEL;
  const rawModelCleaned = cleanEnvValue(rawModelInput) ?? DEFAULT_MODEL;
  const normalizedModel = normalizeModelId(rawModelCleaned);
  const model =
    body.model || normalizedModel !== "doubao-seedream-4-5-251128" ? normalizedModel : DEFAULT_MODEL;
  const size = body.size ?? (process.env.ARK_IMAGE_SIZE as "1K" | "2K" | "4K" | undefined) ?? "2K";
  const watermark =
    typeof body.watermark === "boolean" ? body.watermark : process.env.ARK_IMAGE_WATERMARK !== "false";

  const payload: Record<string, unknown> = {
    model,
    prompt: body.prompt,
    size,
    response_format: "url",
    watermark,
  };

  if (body.image && typeof body.image === "string") {
    payload.image = body.image;
  }

  let res: Response;
  try {
    res = await fetch(`${baseUrl}/images/generations`, {
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

  const raw = (await res.json().catch(() => null)) as ArkImageGenerationsResponse | null;
  if (!res.ok) {
    const { code, message } = getErrorCodeMessage(raw?.error);
    if (code === "ModelNotOpen") {
      const readable =
        `模型未开通：当前账号尚未开通模型 ${model}。\n` +
        `解决方法：到火山方舟控制台开通该模型，或在 web/.env.local 将 ARK_IMAGE_MODEL 改为你已开通的模型 ID 后重启。\n` +
        (message ? `原始信息：${message}` : "");
      return NextResponse.json({ error: readable }, { status: res.status });
    }

    const fallback =
      typeof raw === "object" && raw && "error" in raw && raw?.error ? JSON.stringify(raw.error) : `HTTP ${res.status}`;
    return NextResponse.json({ error: `生成失败：${message ?? fallback}` }, { status: res.status });
  }

  const url = raw?.data?.[0]?.url;
  if (!url) {
    return NextResponse.json({ error: "生成失败：未返回图片 URL。" }, { status: 502 });
  }

  return NextResponse.json({ imageUrl: url });
}

export async function GET() {
  const baseUrlRaw = process.env.ARK_BASE_URL ?? DEFAULT_BASE_URL;
  const baseUrl = normalizeBaseUrl(baseUrlRaw);
  const rawModel = process.env.ARK_IMAGE_MODEL ?? DEFAULT_MODEL;
  const rawModelCleaned = cleanEnvValue(rawModel) ?? DEFAULT_MODEL;
  const modelNormalized = normalizeModelId(rawModelCleaned);
  const model = modelNormalized === "doubao-seedream-4-5-251128" ? DEFAULT_MODEL : modelNormalized;
  return NextResponse.json({
    ok: true,
    hasApiKey: Boolean(process.env.ARK_API_KEY),
    baseUrl,
    model,
    debug: {
      baseUrlRaw,
      modelRaw: rawModel,
      modelCleaned: rawModelCleaned,
      modelNormalized,
    },
  });
}

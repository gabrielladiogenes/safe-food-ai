
import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { z } from "zod";

const callbackSchema = z.object({
  requestId: z.string().uuid(),
  status: z.enum(["GERADO_PELO_GEMINI", "ERRO"]),
  mensagemIA: z.string().trim().min(1).max(20000).optional(),
}).superRefine((data, ctx) => {
  if (
    data.status === "GERADO_PELO_GEMINI" &&
    !data.mensagemIA
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["mensagemIA"],
      message: "A mensagem gerada pelo Gemini é obrigatória.",
    });
  }
});

export async function POST(request: NextRequest) {
  try {
    const secret = process.env.MAKE_CALLBACK_SECRET;

    if (!secret) {
      return NextResponse.json(
        { error: "Callback não configurado." },
        { status: 503 }
      );
    }

    const authorization = request.headers.get("authorization");

    if (authorization !== `Bearer ${secret}`) {
      return NextResponse.json(
        { error: "Não autorizado." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = callbackSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos." },
        { status: 400 }
      );
    }

    const redis = Redis.fromEnv();
    const { requestId, status, mensagemIA } = parsed.data;
    const key = `safefood:request:${requestId}`;

    const existing = await redis.get<{ status: string }>(key);

    if (!existing) {
      return NextResponse.json(
        { error: "Solicitação não encontrada ou expirada." },
        { status: 404 }
      );
    }

    if (existing.status !== "PROCESSANDO") {
      return NextResponse.json(
        { error: "Solicitação já finalizada." },
        { status: 409 }
      );
    }

    const result =
      status === "GERADO_PELO_GEMINI"
        ? {
            status,
            mensagemIA,
            updatedAt: new Date().toISOString(),
          }
        : {
            status,
            updatedAt: new Date().toISOString(),
          };

    await redis.set(key, result, { ex: 3600 });

    return NextResponse.json({
      success: true,
      requestId,
      status,
    });
  } catch (error) {
    console.error("Erro no callback do SAFE FOOD AI:", error);

    return NextResponse.json(
      { error: "Erro interno ao processar callback." },
      { status: 500 }
    );
  }
}

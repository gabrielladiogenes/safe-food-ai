
import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { z } from "zod";

const requestIdSchema = z.string().uuid();

type RequestStatus = {
  status: "PROCESSANDO" | "GERADO_PELO_GEMINI" | "ERRO";
  mensagemIA?: string;
  createdAt?: string;
  updatedAt?: string;
};

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ requestId: string }> }
) {
  try {
    const { requestId } = await context.params;

    const validation = requestIdSchema.safeParse(requestId);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Identificador inválido." },
        { status: 400 }
      );
    }

    const redis = Redis.fromEnv();

    const result = await redis.get<RequestStatus>(
      `safefood:request:${requestId}`
    );

    if (!result) {
      return NextResponse.json(
        { error: "Solicitação não encontrada ou expirada." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        requestId,
        status: result.status,
        mensagemIA: result.mensagemIA ?? null,
        updatedAt: result.updatedAt ?? null,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Erro ao consultar status do SAFE FOOD AI:", error);

    return NextResponse.json(
      { error: "Erro interno ao consultar solicitação." },
      { status: 500 }
    );
  }
}

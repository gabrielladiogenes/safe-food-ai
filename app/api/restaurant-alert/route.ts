
import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { z } from "zod";
import { randomUUID } from "node:crypto";

// SAFE FOOD AI
// API de integração assíncrona com Make + Gemini AI
// Compatível com Next.js 16 e cacheComponents

const requestSchema = z.object({
  projeto: z.literal("SAFE FOOD AI"),

  nome: z.string().trim().min(1).max(120),

  plataforma: z.string().trim().min(1).max(80),

  restaurante: z.string().trim().min(1).max(160),

  pedido: z.string().trim().min(1).max(100),

  especificacao: z.string().trim().min(1).max(3000),

  avisoAlimentar: z.string().trim().min(1).max(4000),

  sugestaoIA: z.string().trim().min(1).max(4000),

  selo: z.string().trim().min(1).max(100),

  mensagem: z.string().trim().min(1).max(10000),
});

const MAKE_TIMEOUT_MS = 15000;
const RESULT_TTL_SECONDS = 3600;

type RequestStatus = {
  status: "PROCESSANDO" | "FALHA";
  createdAt?: string;
};

function getRedis(): Redis {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    throw new Error("REDIS_NOT_CONFIGURED");
  }

  return new Redis({
    url,
    token,
  });
}

function publicError(
  status: number,
  message = "Não foi possível concluir sua solicitação. Tente novamente."
) {
  return NextResponse.json(
    {
      received: false,
      status: "FALHA",
      error: message,
    },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

export async function POST(request: Request) {
  let payload: unknown;

  // 1. Ler o JSON enviado pelo aplicativo.
  try {
    payload = await request.json();
  } catch {
    return publicError(
      400,
      "Não foi possível ler sua solicitação."
    );
  }

  // 2. Validar os dados recebidos.
  const parsed = requestSchema.safeParse(payload);

  if (!parsed.success) {
    return publicError(
      400,
      "Verifique as informações e tente novamente."
    );
  }

  // 3. Verificar o webhook privado do Make.
  const webhookUrl = process.env.MAKE_WEBHOOK_URL;

  if (!webhookUrl) {
    console.error(
      "[SAFE FOOD AI] MAKE_WEBHOOK_URL não configurada."
    );

    return publicError(503);
  }

  // 4. Gerar um identificador exclusivo.
  const requestId = randomUUID();

  const redisKey = `safefood:request:${requestId}`;

  // 5. Conectar ao Redis e registrar o pedido.
  let redis: Redis;

  try {
    redis = getRedis();

    const initialStatus: RequestStatus = {
      status: "PROCESSANDO",
      createdAt: new Date().toISOString(),
    };

    await redis.set(
      redisKey,
      initialStatus,
      {
        ex: RESULT_TTL_SECONDS,
      }
    );
  } catch (error) {
    console.error(
      "[SAFE FOOD AI] Erro ao registrar solicitação:",
      error
    );

    return publicError(503);
  }

  // 6. Configurar limite de espera apenas para
  // a confirmação inicial de recebimento do Make.
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, MAKE_TIMEOUT_MS);

  try {
    // 7. Enviar o pedido com o identificador.
    const response = await fetch(webhookUrl, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/plain",
      },

      body: JSON.stringify({
        ...parsed.data,
        requestId,
      }),

      signal: controller.signal,

      cache: "no-store",
    });

    // 8. Verificar se o Make aceitou o pedido.
    if (!response.ok) {
      console.error(
        "[SAFE FOOD AI] Make retornou HTTP:",
        response.status
      );

      await redis.set(
        redisKey,
        {
          status: "FALHA",
        },
        {
          ex: RESULT_TTL_SECONDS,
        }
      );

      return publicError(502);
    }

    // 9. Responder rapidamente ao aplicativo.
    // O resultado final será consultado por outra rota.
    return NextResponse.json(
      {
        received: true,
        status: "PROCESSANDO",
        requestId,
      },
      {
        status: 202,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    const isTimeout =
      error instanceof Error &&
      (
        error.name === "AbortError" ||
        error.name === "TimeoutError"
      );

    console.error(
      "[SAFE FOOD AI] Falha na comunicação:",
      error instanceof Error
        ? error.name
        : "desconhecida"
    );

    if (isTimeout) {
      // O Make pode continuar processando.
      // Não marcamos como falha automaticamente.
      return NextResponse.json(
        {
          received: true,
          status: "PROCESSANDO",
          requestId,
        },
        {
          status: 202,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    try {
      await redis.set(
        redisKey,
        {
          status: "FALHA",
        },
        {
          ex: RESULT_TTL_SECONDS,
        }
      );
    } catch (redisError) {
      console.error(
        "[SAFE FOOD AI] Falha ao atualizar status:",
        redisError
      );
    }

    return publicError(502);
  } finally {
    clearTimeout(timeout);
  }
}

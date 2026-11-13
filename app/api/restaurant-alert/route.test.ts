
import { beforeEach, describe, expect, it, vi } from "vitest";

// Simula as respostas dos limitadores sem usar o Redis real.
const mocks = vi.hoisted(() => ({
  limit: vi.fn(),
  redisSet: vi.fn(),
  redisConstructor: vi.fn(),
  ratelimitConstructor: vi.fn(),
}));

vi.mock("@upstash/redis", () => ({
  Redis: class {
    constructor(options: unknown) {
      mocks.redisConstructor(options);
    }

    set(...args: unknown[]) {
      return mocks.redisSet(...args);
    }
  },
}));

vi.mock("@upstash/ratelimit", () => ({
  Ratelimit: class {
    static slidingWindow = vi.fn(
      (limit: number, window: string) => ({
        type: "sliding",
        limit,
        window,
      })
    );

    static fixedWindow = vi.fn(
      (limit: number, window: string) => ({
        type: "fixed",
        limit,
        window,
      })
    );

    constructor(options: unknown) {
      mocks.ratelimitConstructor(options);
    }

    limit(identifier: string) {
      return mocks.limit(identifier);
    }
  },
}));

import { POST } from "./route";

const validPayload = {
  projeto: "SAFE FOOD AI",
  nome: "Cliente Teste",
  plataforma: "iFood",
  restaurante: "Restaurante Exemplo",
  pedido: "12345",
  especificacao: "Tenho alergia ao leite.",
  avisoAlimentar: "Possível alergia alimentar.",
  sugestaoIA: "Confirmar ingredientes com o restaurante.",
  selo: "POSSÍVEL ALERGIA",
  mensagem: "Cliente informa alergia ao leite.",
};

function createRequest(ip = "192.0.2.10") {
  return new Request(
    "http://localhost:3000/api/restaurant-alert",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": ip,
      },
      body: JSON.stringify(validPayload),
    }
  );
}

function allowed() {
  return {
    success: true,
    limit: 10,
    remaining: 9,
    reset: Date.now() + 60000,
    pending: Promise.resolve(),
  };
}

function blocked() {
  return {
    success: false,
    limit: 10,
    remaining: 0,
    reset: Date.now() + 60000,
    pending: Promise.resolve(),
  };
}

describe("SAFE FOOD AI — Proteção da API", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.stubEnv(
      "UPSTASH_REDIS_REST_URL",
      "https://redis.example.test"
    );
    vi.stubEnv(
      "UPSTASH_REDIS_REST_TOKEN",
      "test-token"
    );
    vi.stubEnv(
      "MAKE_WEBHOOK_URL",
      "https://make.example.test/webhook"
    );

    mocks.redisSet.mockResolvedValue("OK");
    mocks.limit.mockResolvedValue(allowed());

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("Accepted", { status: 200 })
      )
    );
  });

  it("aceita uma solicitação dentro dos limites", async () => {
    const response = await POST(createRequest());
    const data = await response.json();

    expect(response.status).toBe(202);
    expect(data.received).toBe(true);
    expect(data.status).toBe("PROCESSANDO");
    expect(data.requestId).toEqual(expect.any(String));

    expect(mocks.redisSet).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("configura o limite individual de 10 solicitações por minuto", async () => {
    const { Ratelimit } = await import("@upstash/ratelimit");

    await POST(createRequest());

    expect(Ratelimit.slidingWindow).toHaveBeenCalledWith(
      10,
      "1 m"
    );
  });

  it("configura o limite global de 30 solicitações por dia", async () => {
    const { Ratelimit } = await import("@upstash/ratelimit");

    await POST(createRequest());

    expect(Ratelimit.fixedWindow).toHaveBeenCalledWith(
      30,
      "1 d"
    );
  });

  it("bloqueia quando o limite individual é atingido", async () => {
    mocks.limit.mockResolvedValueOnce(blocked());

    const response = await POST(createRequest());
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.received).toBe(false);
    expect(response.headers.get("Retry-After")).toBeTruthy();

    expect(mocks.redisSet).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("bloqueia quando o limite global é atingido", async () => {
    mocks.limit
      .mockResolvedValueOnce(allowed())
      .mockResolvedValueOnce(blocked());

    const response = await POST(createRequest());
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.error).toContain("limite diário");

    expect(mocks.redisSet).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("usa o IP do cliente para identificar o limite individual", async () => {
    await POST(createRequest("203.0.113.25"));

    expect(mocks.limit).toHaveBeenNthCalledWith(
      1,
      "203.0.113.25"
    );

    expect(mocks.limit).toHaveBeenNthCalledWith(
      2,
      "demo"
    );
  });

  it("não envia pedidos ao Make quando a proteção falha", async () => {
    mocks.limit.mockRejectedValueOnce(
      new Error("Redis indisponível")
    );

    const response = await POST(createRequest());

    expect(response.status).toBe(503);
    expect(mocks.redisSet).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("rejeita dados inválidos antes de consultar os limites", async () => {
    const request = new Request(
      "http://localhost:3000/api/restaurant-alert",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projeto: "SAFE FOOD AI",
        }),
      }
    );

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(mocks.limit).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });
});

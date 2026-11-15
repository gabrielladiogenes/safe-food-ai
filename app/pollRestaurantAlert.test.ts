
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  bindPollDeadline,
  nextPollDelay,
  pollRestaurantAlert,
  POLL_FAILURE_MESSAGE,
  POLL_TIMEOUT_MESSAGE,
  POLL_INTERRUPTED_MESSAGE,
  sleepWithSignal,
} from "./pollRestaurantAlert";

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

function mockResponse(
  status: string,
  mensagemIA?: string
): Response {
  return {
    ok: true,
    status: 200,
    json: async () => ({ status, mensagemIA }),
  } as Response;
}

describe("SAFE FOOD AI — Restaurant Alert Polling", () => {
  it("returns the Gemini message on success", async () => {
    const fetchImpl = vi.fn(async () =>
      mockResponse(
        "GERADO_PELO_GEMINI",
        "Aviso gerado com sucesso"
      )
    );

    const result = await pollRestaurantAlert({
      requestId: "test-123",
      signal: new AbortController().signal,
      sleep: async () => {},
      fetchImpl,
    });

    expect(result).toBe("Aviso gerado com sucesso");

    expect(fetchImpl).toHaveBeenCalledWith(
      "/api/restaurant-alert/test-123",
      expect.objectContaining({
        method: "GET",
        cache: "no-store",
      })
    );
  });

  it("stops polling after the 90-second deadline", async () => {
    let currentTime = 0;

    const fetchImpl = vi.fn(async () =>
      mockResponse("PROCESSANDO")
    );

    await expect(
      pollRestaurantAlert({
        requestId: "timeout-test",
        signal: new AbortController().signal,
        sleep: async (ms) => {
          currentTime += ms;
        },
        fetchImpl,
        now: () => currentTime,
        deadlineMs: 90_000,
        intervalMs: 3000,
      })
    ).rejects.toThrow(POLL_TIMEOUT_MESSAGE);

    expect(currentTime).toBe(90_000);
    expect(fetchImpl).toHaveBeenCalledTimes(29);
  });

  it("aborts a pending request when the deadline expires", async () => {
    vi.useFakeTimers();

    const controller = new AbortController();
    const stopDeadline = bindPollDeadline(
      controller,
      90_000
    );

    const fetchImpl = vi.fn(
      (_input: string, init: RequestInit): Promise<Response> =>
        new Promise((_resolve, reject) => {
          init.signal?.addEventListener(
            "abort",
            () => {
              reject(
                new DOMException(
                  "The operation was aborted",
                  "AbortError"
                )
              );
            },
            { once: true }
          );
        })
    );

    try {
      const polling = pollRestaurantAlert({
        requestId: "pending-request",
        signal: controller.signal,
        sleep: sleepWithSignal,
        fetchImpl,
      });

      const assertion = expect(polling).rejects.toThrow(
        POLL_TIMEOUT_MESSAGE
      );

      await vi.advanceTimersByTimeAsync(3000);

      expect(fetchImpl).toHaveBeenCalledTimes(1);

      await vi.advanceTimersByTimeAsync(87_000);

      await assertion;

      expect(controller.signal.aborted).toBe(true);
      expect(controller.signal.reason).toBe("deadline");
    } finally {
      stopDeadline();
    }
  });

  it("stops when processing reports failure", async () => {
    const fetchImpl = vi.fn(async () =>
      mockResponse("FALHA")
    );

    await expect(
      pollRestaurantAlert({
        requestId: "failed-request",
        signal: new AbortController().signal,
        sleep: async () => {},
        fetchImpl,
      })
    ).rejects.toThrow(POLL_FAILURE_MESSAGE);

    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("recovers after a temporary network failure", async () => {
    const warning = vi
      .spyOn(console, "warn")
      .mockImplementation(() => {});

    const fetchImpl = vi
      .fn<(_: string, __: RequestInit) => Promise<Response>>()
      .mockRejectedValueOnce(
        new Error("Temporary network failure")
      )
      .mockResolvedValueOnce(
        mockResponse(
          "GERADO_PELO_GEMINI",
          "Pedido processado"
        )
      );

    const result = await pollRestaurantAlert({
      requestId: "retry-request",
      signal: new AbortController().signal,
      sleep: async () => {},
      fetchImpl,
    });

    expect(result).toBe("Pedido processado");
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(warning).toHaveBeenCalled();
  });

  it("continues polling while processing", async () => {
    const fetchImpl = vi
      .fn<(_: string, __: RequestInit) => Promise<Response>>()
      .mockResolvedValueOnce(
        mockResponse("PROCESSANDO")
      )
      .mockResolvedValueOnce(
        mockResponse(
          "GERADO_PELO_GEMINI",
          "Concluído"
        )
      );

    const result = await pollRestaurantAlert({
      requestId: "processing-request",
      signal: new AbortController().signal,
      sleep: async () => {},
      fetchImpl,
    });

    expect(result).toBe("Concluído");
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("stops when the request is interrupted", async () => {
    const controller = new AbortController();

    await expect(
      pollRestaurantAlert({
        requestId: "interrupted-request",
        signal: controller.signal,
        sleep: async () => {
          controller.abort("unmount");
        },
        fetchImpl: vi.fn(),
      })
    ).rejects.toThrow(POLL_INTERRUPTED_MESSAGE);
  });

  it("calculates the remaining polling interval", () => {
    expect(
      nextPollDelay(0, 90_000, 3000)
    ).toBe(3000);

    expect(
      nextPollDelay(89_000, 90_000, 3000)
    ).toBe(1000);

    expect(
      nextPollDelay(90_000, 90_000, 3000)
    ).toBeNull();
  });
});

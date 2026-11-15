export const POLL_DEADLINE_MS = 90_000;

export const POLLING_INTERVAL_MS = 3000;

export const POLL_TIMEOUT_MESSAGE =
  "O aviso está demorando mais que o esperado. Não foi possível confirmar a conclusão do processamento.";

export const POLL_FAILURE_MESSAGE =
  "Não foi possível concluir a geração do aviso alimentar.";

export const POLL_INTERRUPTED_MESSAGE = "Consulta interrompida.";

export function nextPollDelay(
  now: number,
  deadline: number,
  interval: number
): number | null {
  const remaining = deadline - now;

  if (remaining <= 0) {
    return null;
  }

  return Math.min(interval, remaining);
}

export type PollFetch = (
  input: string,
  init: RequestInit
) => Promise<Response>;

export type PollSleep = (
  ms: number,
  signal: AbortSignal
) => Promise<void>;

type PollStatus = {
  status?: string;
  mensagemIA?: string | null;
  error?: string;
};

export function sleepWithSignal(
  ms: number,
  signal: AbortSignal
): Promise<void> {
  return new Promise((resolve) => {
    if (signal.aborted) {
      resolve();
      return;
    }

    const timeoutId = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);

    function onAbort() {
      clearTimeout(timeoutId);
      resolve();
    }

    signal.addEventListener("abort", onAbort, { once: true });
  });
}

export function bindPollDeadline(
  controller: AbortController,
  ms = POLL_DEADLINE_MS
): () => void {
  const timeoutId = setTimeout(() => {
    if (!controller.signal.aborted) {
      controller.abort("deadline");
    }
  }, ms);

  return () => {
    clearTimeout(timeoutId);
  };
}

function throwForSignal(signal: AbortSignal): never {
  if (signal.reason === "deadline") {
    throw new Error(POLL_TIMEOUT_MESSAGE);
  }

  throw new Error(POLL_INTERRUPTED_MESSAGE);
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

export async function pollRestaurantAlert(options: {
  requestId: string;
  signal: AbortSignal;
  sleep: PollSleep;
  fetchImpl?: PollFetch;
  now?: () => number;
  deadlineMs?: number;
  intervalMs?: number;
}): Promise<string> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const now = options.now ?? Date.now;
  const interval = options.intervalMs ?? POLLING_INTERVAL_MS;
  const deadline = now() + (options.deadlineMs ?? POLL_DEADLINE_MS);

  while (true) {
    if (options.signal.aborted) {
      throwForSignal(options.signal);
    }

    const delay = nextPollDelay(now(), deadline, interval);

    if (delay === null) {
      throw new Error(POLL_TIMEOUT_MESSAGE);
    }

    await options.sleep(delay, options.signal);

    if (options.signal.aborted) {
      throwForSignal(options.signal);
    }

    if (nextPollDelay(now(), deadline, interval) === null) {
      throw new Error(POLL_TIMEOUT_MESSAGE);
    }

    let response: Response;

    try {
      response = await fetchImpl(
        `/api/restaurant-alert/${encodeURIComponent(options.requestId)}`,
        {
          method: "GET",
          cache: "no-store",
          signal: options.signal,
        }
      );
    } catch (error) {
      if (options.signal.aborted || isAbortError(error)) {
        if (options.signal.reason === "deadline") {
          throw new Error(POLL_TIMEOUT_MESSAGE);
        }

        throw new Error(POLL_INTERRUPTED_MESSAGE);
      }

      console.warn(
        "[SAFE FOOD AI] Consulta temporariamente indisponível:",
        error
      );
      continue;
    }

    if (response.status >= 500) {
      continue;
    }

    let data: PollStatus;

    try {
      data = await response.json();
    } catch {
      continue;
    }

    if (!response.ok) {
      throw new Error(
        data.error || "Não foi possível consultar a solicitação."
      );
    }

    if (data.status === "GERADO_PELO_GEMINI") {
      if (
        typeof data.mensagemIA === "string" &&
        data.mensagemIA.trim()
      ) {
        return data.mensagemIA;
      }

      throw new Error(
        "O Gemini concluiu a solicitação sem uma mensagem válida."
      );
    }

    if (data.status === "ERRO" || data.status === "FALHA") {
      throw new Error(POLL_FAILURE_MESSAGE);
    }

    if (data.status !== "PROCESSANDO") {
      throw new Error(
        "O servidor retornou um estado de processamento desconhecido."
      );
    }
  }
}


"use client";

import { useEffect, useRef, useState } from "react";
import { interpretarPedido } from "../interpretOrder";

const meals = ["café", "almoço", "lanche", "janta"];

type SendStatus = "idle" | "sending" | "success" | "error";

type ChatMessage = {
  id: number;
  text: string;
  time: string;
};

type ApiResponse = {
  received?: boolean;
  requestId?: string;
  status?: string;
  mensagemIA?: string | null;
  error?: string;
};

const POLLING_INTERVAL_MS = 3000;

function WhatsAppText({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*[^*\n]+\*)/g).map((part, index) =>
        part.startsWith("*") &&
        part.endsWith("*") &&
        part.length > 2 ? (
          <strong key={index}>{part.slice(1, -1)}</strong>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </>
  );
}

function SignalIcon() {
  return (
    <svg
      width="18"
      height="13"
      viewBox="0 0 18 13"
      fill="none"
      aria-hidden="true"
    >
      <rect x="1" y="9" width="3" height="3" rx="0.7" fill="currentColor" />
      <rect x="5.5" y="7" width="3" height="5" rx="0.7" fill="currentColor" />
      <rect x="10" y="4" width="3" height="8" rx="0.7" fill="currentColor" />
      <rect x="14.5" y="1" width="3" height="11" rx="0.7" fill="currentColor" />
    </svg>
  );
}

function WifiIcon() {
  return (
    <svg
      width="17"
      height="13"
      viewBox="0 0 17 13"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M1 4.5C5 1 12 1 16 4.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M4 7C6.5 5 10.5 5 13 7"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <circle cx="8.5" cy="10.5" r="1.4" fill="currentColor" />
    </svg>
  );
}

function BatteryIcon() {
  return (
    <svg
      width="25"
      height="13"
      viewBox="0 0 25 13"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="1"
        y="1"
        width="20"
        height="11"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <rect
        x="3"
        y="3"
        width="15"
        height="7"
        rx="1.5"
        fill="currentColor"
      />
      <path
        d="M23 4.5C24.5 5.5 24.5 7.5 23 8.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg
      width="19"
      height="25"
      viewBox="0 0 19 25"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M14 4L5 12.5L14 21"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg
      width="23"
      height="23"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="2"
        y="6"
        width="14"
        height="12"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M16 10L22 7V17L16 14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 3H9L11 8L8.5 10.5C9.7 13 11 14.3 13.5 15.5L16 13L21 15V19C21 20.1 20.1 21 19 21C10.2 21 3 13.8 3 5C3 3.9 3.9 3 5 3Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 4V20M4 12H20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 8H7L9 5H15L17 8H21V19H3V8Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="13"
        r="3.2"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="9"
        y="3"
        width="6"
        height="12"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M6 11C6 15 8.5 18 12 18C15.5 18 18 15 18 11"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M12 18V21M9 21H15"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IPhone({
  messages,
  sending,
}: {
  messages: ChatMessage[];
  sending: boolean;
}) {
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const chat = chatRef.current;

    if (chat) {
      chat.scrollTo({
        top: chat.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, sending]);

  return (
    <div className="mx-auto w-full max-w-[410px] min-w-0">
      <div className="relative w-full rounded-[44px] border-[6px] border-[#17181c] bg-[#17181c] p-[3px] shadow-[0_0_0_1px_#57585e,0_18px_35px_rgba(0,0,0,0.16),0_40px_85px_rgba(0,0,0,0.18)] sm:rounded-[56px] sm:border-[7px]">
        {/* Botões físicos decorativos */}
        <div className="pointer-events-none absolute -left-[9px] top-[17%] h-[5%] w-[3px] rounded-l bg-[#484950]" />
        <div className="pointer-events-none absolute -left-[9px] top-[25%] h-[9%] w-[3px] rounded-l bg-[#484950]" />
        <div className="pointer-events-none absolute -left-[9px] top-[36%] h-[9%] w-[3px] rounded-l bg-[#484950]" />
        <div className="pointer-events-none absolute -right-[9px] top-[29%] h-[12%] w-[3px] rounded-r bg-[#484950]" />

        <div className="relative flex aspect-[440/956] min-h-0 flex-col overflow-hidden rounded-[36px] bg-[#f6f6f6] sm:rounded-[48px]">
          {/* Barra de status */}
          <div className="relative z-10 flex h-[13%] min-h-0 shrink-0 items-center justify-between bg-[#f6f6f6] px-[7%] pt-[2%] text-black">
            <span className="text-[clamp(10px,3vw,13px)] font-semibold tracking-tight">
              9:41
            </span>

            <div className="absolute left-1/2 top-[15%] h-[48%] w-[29%] -translate-x-1/2 rounded-full bg-[#050505] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]" />

            <div className="flex shrink-0 items-center gap-1 scale-[0.8] origin-right sm:scale-100">
              <SignalIcon />
              <WifiIcon />
              <BatteryIcon />
            </div>
          </div>

          {/* Cabeçalho do WhatsApp simulado */}
          <div className="flex h-[10%] min-h-0 shrink-0 items-center gap-2 border-b border-[#e5e5e5] bg-[#f6f6f6] px-[3%]">
            <span
              className="flex shrink-0 items-center text-[#007aff]"
              aria-hidden="true"
            >
              <BackIcon />
            </span>

            <div className="flex aspect-square w-[11%] shrink-0 items-center justify-center rounded-full bg-[#D71943] text-[clamp(9px,2.5vw,12px)] font-bold text-white">
              SF
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-[clamp(11px,2.8vw,14px)] font-semibold text-black">
                SAFE FOOD AI
              </p>
              <p className="truncate text-[clamp(9px,2.3vw,11px)] text-[#777]">
                Avisos alimentares
              </p>
            </div>

            <div
              className="flex shrink-0 items-center gap-2 text-[#007aff] scale-[0.85] origin-right sm:scale-100"
              aria-hidden="true"
            >
              <VideoIcon />
              <PhoneIcon />
            </div>
          </div>

          {/* Conversa */}
          <div
            ref={chatRef}
            className="flex min-h-0 flex-1 flex-col gap-3 overflow-x-hidden overflow-y-auto px-[4%] py-[4%]"
            style={{
              backgroundColor: "#eae6df",
              backgroundImage:
                "radial-gradient(rgba(170,160,148,0.18) 0.7px, transparent 0.7px)",
              backgroundSize: "20px 20px",
            }}
          >
            <div className="mx-auto shrink-0 rounded-lg bg-[#d9f2fb] px-3 py-2 text-center text-[10px] leading-relaxed text-[#54656f] shadow-sm">
              SIMULAÇÃO DE WHATSAPP
            </div>

            <div className="mx-auto shrink-0 rounded-md bg-white/80 px-3 py-1 text-[10px] font-medium text-[#667781]">
              Hoje
            </div>

            {messages.length === 0 && !sending && (
              <div className="my-auto text-center text-xs text-[#667781]">
                Aguardando aviso alimentar...
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className="w-fit max-w-[95%] shrink-0 self-start rounded-[14px] rounded-tl-[4px] bg-white px-3 py-3 text-[12px] leading-[1.6] text-[#17212b] shadow-sm"
              >
                <p className="whitespace-pre-wrap break-words">
                  <WhatsAppText text={message.text} />
                </p>

                <p className="mt-2 text-right text-[10px] text-[#87939b]">
                  {message.time}
                </p>
              </div>
            ))}

            {sending && (
              <div className="w-fit shrink-0 animate-pulse rounded-xl bg-white px-4 py-3 text-xs text-[#667781] shadow-sm">
                Recebendo aviso alimentar...
              </div>
            )}
          </div>

          {/* Barra ilustrativa */}
          <div className="flex h-[10%] min-h-0 shrink-0 items-center gap-2 border-t border-[#e9e9e9] bg-[#f6f6f6] px-[3%]">
            <span
              className="flex shrink-0 items-center text-[#007aff]"
              aria-hidden="true"
            >
              <PlusIcon />
            </span>

            <div className="flex min-w-0 flex-1 items-center justify-between rounded-full border border-[#dedede] bg-white px-3 py-[2%]">
              <span className="truncate text-[clamp(11px,2.8vw,13px)] text-[#aaa]">
                Mensagem
              </span>

              <span
                className="ml-2 shrink-0 text-[#999]"
                aria-hidden="true"
              >
                <CameraIcon />
              </span>
            </div>

            <span
              className="flex shrink-0 items-center text-[#007aff]"
              aria-hidden="true"
            >
              <MicIcon />
            </span>
          </div>

          <div className="flex h-[4%] min-h-0 shrink-0 items-center justify-center bg-[#f6f6f6]">
            <div className="h-[5px] w-[30%] rounded-full bg-black" />
          </div>
        </div>
      </div>

      <p className="mt-4 text-center text-xs leading-5 text-slate-500">
        Simulação visual do recebimento pelo restaurante
      </p>
    </div>
  );
}

export default function DemoPage() {
  const [name, setName] = useState("");
  const [restriction, setRestriction] = useState("");
  const [platform, setPlatform] = useState("iFood");
  const [restaurant, setRestaurant] = useState("");
  const [order, setOrder] = useState("");

  const [mealIndex, setMealIndex] = useState(0);
  const [sendStatus, setSendStatus] = useState<SendStatus>("idle");
  const [feedback, setFeedback] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const nextIdRef = useRef(1);
  const sendingRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setMealIndex((previous) => (previous + 1) % meals.length);
    }, 1200);

    return () => window.clearInterval(interval);
  }, []);

  // Aguarda sem limite artificial de tempo.
  // Apenas erros reais do backend encerram o processamento.
  async function waitForGemini(requestId: string): Promise<string> {
    while (mountedRef.current) {
      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, POLLING_INTERVAL_MS);
      });

      if (!mountedRef.current) {
        throw new Error("Consulta interrompida.");
      }

      let response: Response;

      try {
        response = await fetch(
          `/api/restaurant-alert/${encodeURIComponent(requestId)}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );
      } catch (error) {
        console.warn(
          "[SAFE FOOD AI] Consulta temporariamente indisponível:",
          error
        );
        continue;
      }

      if (response.status >= 500) {
        continue;
      }

      let data: ApiResponse;

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
        throw new Error(
          "Não foi possível concluir a geração do aviso alimentar."
        );
      }

      if (data.status !== "PROCESSANDO") {
        throw new Error(
          "O servidor retornou um estado de processamento desconhecido."
        );
      }
    }

    throw new Error("Consulta interrompida.");
  }

  async function generateMessage() {
    if (sendingRef.current) return;

    setFeedback("");

    if (
      !name.trim() ||
      !restriction.trim() ||
      !restaurant.trim() ||
      !order.trim()
    ) {
      setSendStatus("error");
      setFeedback("Preencha todos os campos para continuar.");
      return;
    }

    sendingRef.current = true;
    setSendStatus("sending");

    try {
      const result = interpretarPedido(restriction);

      const payload = {
        projeto: "SAFE FOOD AI",
        nome: name.trim(),
        plataforma: platform,
        restaurante: restaurant.trim(),
        pedido: order.trim(),
        especificacao: restriction.trim(),
        avisoAlimentar: result.avisoAlimentar,
        sugestaoIA: result.sugestaoIA,
        selo: result.selo,
        mensagem: [
          `Cliente: ${name.trim()}`,
          `Plataforma: ${platform}`,
          `Restaurante: ${restaurant.trim()}`,
          `Pedido: ${order.trim()}`,
          `Especificação: ${restriction.trim()}`,
          `Classificação inicial: ${result.selo}`,
        ].join("\n"),
      };

      const response = await fetch("/api/restaurant-alert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      });

      const data: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Não foi possível enviar o aviso alimentar."
        );
      }

      if (
        response.status !== 202 ||
        data.status !== "PROCESSANDO" ||
        !data.requestId
      ) {
        throw new Error(
          "O servidor não devolveu um identificador válido."
        );
      }

      const mensagemIA = await waitForGemini(data.requestId);

      if (!mountedRef.current) return;

      const time = new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });

      setMessages((previous) => [
        ...previous,
        {
          id: nextIdRef.current++,
          text: mensagemIA,
          time,
        },
      ]);

      setSendStatus("success");
      setFeedback(
        "O aviso alimentar foi gerado pela inteligência artificial e está disponível na simulação de recebimento pelo restaurante."
      );
    } catch (error) {
      if (!mountedRef.current) return;

      setSendStatus("error");
      setFeedback(
        error instanceof Error
          ? error.message
          : "Ocorreu um erro ao gerar o aviso alimentar."
      );
    } finally {
      sendingRef.current = false;
    }
  }

  const inputStyle =
    "block w-full min-w-0 rounded-2xl border border-slate-200 " +
    "bg-white px-4 py-3 text-slate-900 " +
    "shadow-sm outline-none transition-all duration-200 " +
    "placeholder:text-slate-400 " +
    "focus:border-[#D71943] focus:ring-2 focus:ring-rose-100";

  return (
    <main className="min-h-screen overflow-x-clip bg-[#f8f9fb] px-4 py-8 text-slate-900 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
      <div className="mx-auto grid w-full max-w-[1200px] grid-cols-1 items-start gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-12 xl:gap-16">

        {/* VISÃO DO CLIENTE */}
        <div className="mx-auto w-full min-w-0 max-w-[650px]">
          <header className="mb-8 text-center sm:mb-10">
            <h1 className="flex flex-col items-center text-[clamp(28px,6vw,48px)] font-bold tracking-tight leading-tight">
              <span className="flex h-14 w-full items-center justify-center sm:h-16">
                <span
                  key={mealIndex}
                  className="inline-block animate-pulse text-[#D71943]"
                  aria-live="off"
                >
                  {meals[mealIndex]}
                </span>
              </span>

              <span className="block text-center">
                do seu jeitinho.
              </span>
            </h1>

            <p className="mx-auto mt-4 max-w-[440px] text-sm leading-6 text-slate-600 sm:text-base">
              envie as especificações do seu pedido para restaurantes a qualquer hora do dia.
            </p>
          </header>

          <section className="w-full min-w-0 rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_8px_32px_rgba(0,0,0,0.06)] sm:rounded-[30px] sm:p-8 xl:p-9">
            <h2 className="mb-2 text-xl font-bold tracking-tight sm:text-2xl">
              Informações do pedido
            </h2>

            <p className="mb-7 text-sm text-slate-500">
              Preencha os dados abaixo para gerar seu aviso.
            </p>

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium"
                >
                  Seu nome
                </label>

                <input
                  id="name"
                  className={inputStyle}
                  placeholder="Ex.: Gabriella"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>

              <div>
                <label
                  htmlFor="restriction"
                  className="mb-2 block text-sm font-medium"
                >
                  Restrição ou preferência alimentar
                </label>

                <textarea
                  id="restriction"
                  className={inputStyle}
                  rows={3}
                  placeholder="Ex.: Tenho alergia à proteína do leite"
                  value={restriction}
                  onChange={(event) => setRestriction(event.target.value)}
                />
              </div>

              <div>
                <label
                  htmlFor="platform"
                  className="mb-2 block text-sm font-medium"
                >
                  Plataforma de delivery
                </label>

                <select
                  id="platform"
                  className={inputStyle}
                  value={platform}
                  onChange={(event) => setPlatform(event.target.value)}
                >
                  <option>iFood</option>
                  <option>Rappi</option>
                  <option>Outra plataforma</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="restaurant"
                  className="mb-2 block text-sm font-medium"
                >
                  Nome do restaurante
                </label>

                <input
                  id="restaurant"
                  className={inputStyle}
                  placeholder="Ex.: Restaurante Exemplo"
                  value={restaurant}
                  onChange={(event) => setRestaurant(event.target.value)}
                />
              </div>

              <div>
                <label
                  htmlFor="order"
                  className="mb-2 block text-sm font-medium"
                >
                  Número do pedido
                </label>

                <input
                  id="order"
                  className={inputStyle}
                  placeholder="Ex.: 12345"
                  value={order}
                  onChange={(event) => setOrder(event.target.value)}
                />
              </div>

              <button
                type="button"
                onClick={generateMessage}
                disabled={sendStatus === "sending"}
                className="w-full rounded-2xl bg-[#D71943] px-5 py-4 font-semibold text-white transition-colors duration-200 hover:bg-[#B91538] active:bg-[#A90E30] disabled:cursor-wait disabled:opacity-70"
              >
                {sendStatus === "sending"
                  ? "Gerando aviso..."
                  : "Gerar aviso alimentar"}
              </button>
            </div>
          </section>

          {sendStatus === "success" && (
            <section
              className="mt-6 rounded-[28px] border border-rose-200 bg-white p-6 text-center shadow-[0_8px_30px_rgba(120,20,45,0.07)] sm:p-8"
              role="status"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-2xl font-bold text-[#D71943]">
                ✓
              </div>

              <h2 className="text-xl font-bold tracking-tight text-[#A90E30]">
                Especificação recebida!
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                {feedback}
              </p>
            </section>
          )}

          {sendStatus === "error" && (
            <section
              className="mt-6 rounded-[28px] border border-red-200 bg-white p-6 text-center shadow-[0_8px_30px_rgba(120,20,45,0.07)]"
              role="alert"
            >
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-red-200 bg-rose-50 text-xl font-bold text-[#D71943]">
                !
              </div>

              <p className="text-sm font-medium leading-6 text-red-800">
                {feedback}
              </p>
            </section>
          )}

          <footer className="mt-8 text-center text-xs leading-6 text-slate-500">
            <p>
              Protótipo integrado com Next.js, Make, Google Gemini
              e GREEN-API.
            </p>

            <p className="mt-2">
              O aviso gerado pela IA é exibido no simulador e
              encaminhado para um WhatsApp de teste pelo fluxo de automação.
            </p>

            <p className="mt-2">
              O SAFE FOOD AI não verifica a composição real dos
              alimentos, o contato cruzado ou a segurança do preparo.
              A confirmação deve ser realizada com o estabelecimento.
            </p>
          </footer>
        </div>

        {/* VISÃO DO RESTAURANTE */}
        <div className="flex w-full min-w-0 flex-col items-center lg:sticky lg:top-8">
          <div className="mb-7 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Visão do restaurante
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Mensagem gerada por IA em tempo real
            </p>

            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-600">
              <span
                className="h-2 w-2 rounded-full bg-green-500"
                aria-hidden="true"
              />
              <span>Integração com WhatsApp de teste</span>
            </div>
          </div>

          <div className="w-full max-w-[410px] min-w-0 px-1 sm:px-0">
            <IPhone
              messages={messages}
              sending={sendStatus === "sending"}
            />
          </div>

          <button
            type="button"
            onClick={() => {
              setMessages([]);
              setSendStatus("idle");
              setFeedback("");
            }}
            disabled={
              messages.length === 0 ||
              sendStatus === "sending"
            }
            className="mt-4 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 shadow-sm transition-colors hover:border-[#D71943] hover:text-[#D71943] disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Limpar conversa simulada do restaurante"
          >
            Limpar conversa
          </button>
        </div>
      </div>
    </main>
  );
}

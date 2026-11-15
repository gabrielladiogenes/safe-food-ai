
"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { interpretarPedido } from "../interpretOrder";
import {
  bindPollDeadline,
  pollRestaurantAlert,
  sleepWithSignal,
} from "../pollRestaurantAlert";

const meals = ["café", "almoço", "lanche", "janta"];

// Identidade visual SAFE FOOD AI
const BRAND_RED = "#E10600";
const BRAND_RED_HOVER = "#C70500";
const BRAND_RED_DARK = "#AD0400";

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
    <svg width="17" height="13" viewBox="0 0 18 13" fill="none" aria-hidden="true">
      <rect x="1" y="9" width="3" height="3" rx=".7" fill="currentColor" />
      <rect x="5.5" y="7" width="3" height="5" rx=".7" fill="currentColor" />
      <rect x="10" y="4" width="3" height="8" rx=".7" fill="currentColor" />
      <rect x="14.5" y="1" width="3" height="11" rx=".7" fill="currentColor" />
    </svg>
  );
}

function WifiIcon() {
  return (
    <svg width="16" height="13" viewBox="0 0 17 13" fill="none" aria-hidden="true">
      <path d="M1 4.5C5 1 12 1 16 4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M4 7C6.5 5 10.5 5 13 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="8.5" cy="10.5" r="1.4" fill="currentColor" />
    </svg>
  );
}

function BatteryIcon() {
  return (
    <svg width="24" height="13" viewBox="0 0 25 13" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="20" height="11" rx="3" stroke="currentColor" strokeWidth="1.2" />
      <rect x="3" y="3" width="15" height="7" rx="1.5" fill="currentColor" />
      <path d="M23 4.5C24.5 5.5 24.5 7.5 23 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg width="16" height="21" viewBox="0 0 19 25" fill="none" aria-hidden="true">
      <path d="M14 4L5 12.5L14 21" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="6" width="14" height="12" rx="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16 10L22 7V17L16 14" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 3H9L11 8L8.5 10.5C9.7 13 11 14.3 13.5 15.5L16 13L21 15V19C21 20.1 20.1 21 19 21C10.2 21 3 13.8 3 5C3 3.9 3.9 3 5 3Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 8H7L9 5H15L17 8H21V19H3V8Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="3.2" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="9" y="3" width="6" height="12" rx="3" stroke="currentColor" strokeWidth="1.7" />
      <path d="M6 11C6 15 8.5 18 12 18C15.5 18 18 15 18 11" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M12 18V21M9 21H15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
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
    <div className="mx-auto w-full max-w-[340px] min-w-0">
      <div className="relative aspect-[393/852] w-full rounded-[48px] border-[5px] border-[#202125] bg-[#202125] p-[3px] shadow-[0_0_0_1px_#55565b,0_18px_38px_rgba(0,0,0,0.17),0_35px_70px_rgba(0,0,0,0.10)]">
        {/* Botões laterais */}
        <div className="pointer-events-none absolute -left-[8px] top-[17%] h-[4%] w-[3px] rounded-l bg-[#55565c]" />
        <div className="pointer-events-none absolute -left-[8px] top-[25%] h-[8%] w-[3px] rounded-l bg-[#55565c]" />
        <div className="pointer-events-none absolute -left-[8px] top-[35%] h-[8%] w-[3px] rounded-l bg-[#55565c]" />
        <div className="pointer-events-none absolute -right-[8px] top-[28%] h-[11%] w-[3px] rounded-r bg-[#55565c]" />

        {/* Tela */}
        <div
          className="relative flex h-full min-h-0 w-full flex-col overflow-hidden rounded-[40px] bg-[#f7f7f7]"
          style={{ containerType: "inline-size" }}
        >
          {/* Dynamic Island */}
          <div
            className="pointer-events-none absolute left-1/2 top-[1.4%] z-30 h-[3.1%] w-[24%] -translate-x-1/2 rounded-full bg-black"
            aria-hidden="true"
          />

          {/* Status */}
          <div className="relative z-20 flex h-[7.3%] shrink-0 items-center justify-between bg-[#f7f7f7] px-[8%] pt-[1%] text-black">
            <span
              className="font-semibold tracking-tight"
              style={{ fontSize: "clamp(10px, 3.6cqw, 14px)" }}
            >
              9:41
            </span>

            <div className="flex shrink-0 items-center gap-[2px]">
              <span className="scale-[0.72]"><SignalIcon /></span>
              <span className="scale-[0.72]"><WifiIcon /></span>
              <span className="scale-[0.72]"><BatteryIcon /></span>
            </div>
          </div>

          {/* Cabeçalho do WhatsApp */}
          <div className="relative z-10 flex h-[8.8%] shrink-0 items-center gap-[2%] border-b border-[#e8e8e8] bg-[#f7f7f7] px-[3%]">
            <span className="flex shrink-0 items-center text-[#007aff]" aria-hidden="true">
              <BackIcon />
            </span>

            {/* Logo oficial SAFE FOOD AI */}
            <div className="relative aspect-square w-[12%] shrink-0 overflow-hidden rounded-full bg-white">
              <Image
                src="/images/1.jpg"
                alt="Logo SAFE FOOD AI"
                fill
                sizes="48px"
                className="object-contain p-[3px]"
                priority
              />
            </div>

            <div className="min-w-0 flex-1">
              <p
                className="truncate font-semibold leading-tight text-[#171717]"
                style={{ fontSize: "clamp(10px, 3.6cqw, 14px)" }}
              >
                SAFE FOOD AI
              </p>

              <p
                className="mt-[3px] truncate leading-tight text-[#777]"
                style={{ fontSize: "clamp(9px, 2.8cqw, 11px)" }}
              >
                Avisos alimentares
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-[3px] text-[#007aff]" aria-hidden="true">
              <span className="scale-[0.78]"><VideoIcon /></span>
              <span className="scale-[0.78]"><PhoneIcon /></span>
            </div>
          </div>

          {/* Conversa */}
          <div
            ref={chatRef}
            className="flex min-h-0 flex-1 flex-col gap-3 overflow-x-hidden overflow-y-auto px-[4%] py-[4%]"
            style={{
              backgroundColor: "#eae6df",
              backgroundImage:
                "radial-gradient(rgba(170,160,148,0.15) 0.7px, transparent 0.7px)",
              backgroundSize: "20px 20px",
            }}
          >
            <div className="mx-auto shrink-0 rounded-md bg-white/85 px-3 py-1 text-[10px] font-medium text-[#667781] shadow-sm">
              Hoje
            </div>

            {messages.length === 0 && !sending && (
              <div className="my-auto px-2 text-center text-[11px] text-[#667781]">
                Aguardando aviso alimentar...
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className="w-fit max-w-[95%] shrink-0 self-start rounded-[13px] rounded-tl-[4px] bg-white px-3 py-3 text-[12px] leading-[1.6] text-[#17212b] shadow-sm"
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
              <div className="w-fit shrink-0 animate-pulse rounded-xl bg-white px-3 py-3 text-[11px] text-[#667781] shadow-sm">
                Recebendo aviso alimentar...
              </div>
            )}
          </div>

          {/* Entrada de mensagem */}
          <div className="flex h-[7.6%] shrink-0 items-center gap-[2%] border-t border-[#e9e9e9] bg-[#f7f7f7] px-[3%]">
            <span className="flex shrink-0 items-center text-[#007aff]" aria-hidden="true">
              <PlusIcon />
            </span>

            <div className="flex min-w-0 flex-1 items-center justify-between rounded-full border border-[#dedede] bg-white px-[4%] py-[3%]">
              <span
                className="truncate text-[#aaa]"
                style={{ fontSize: "clamp(10px, 3cqw, 13px)" }}
              >
                Mensagem
              </span>

              <span className="ml-1 shrink-0 scale-[0.85] text-[#999]" aria-hidden="true">
                <CameraIcon />
              </span>
            </div>

            <span className="flex shrink-0 items-center text-[#007aff]" aria-hidden="true">
              <MicIcon />
            </span>
          </div>

          {/* Indicador inferior */}
          <div className="flex h-[3.3%] shrink-0 items-center justify-center bg-[#f7f7f7]">
            <div className="h-[4px] w-[33%] rounded-full bg-black" />
          </div>
        </div>
      </div>
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
  const pollAbortRef = useRef<AbortController | null>(null);
  const stopPollDeadlineRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      pollAbortRef.current?.abort("unmount");
      stopPollDeadlineRef.current?.();
      stopPollDeadlineRef.current = null;
    };
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setMealIndex((previous) => (previous + 1) % meals.length);
    }, 1200);

    return () => window.clearInterval(interval);
  }, []);

  async function waitForGemini(requestId: string): Promise<string> {
    const controller = new AbortController();
    const stopDeadline = bindPollDeadline(controller);

    pollAbortRef.current = controller;
    stopPollDeadlineRef.current = stopDeadline;

    try {
      return await pollRestaurantAlert({
        requestId,
        signal: controller.signal,
        sleep: sleepWithSignal,
      });
    } finally {
      stopDeadline();

      if (stopPollDeadlineRef.current === stopDeadline) {
        stopPollDeadlineRef.current = null;
      }

      if (pollAbortRef.current === controller) {
        pollAbortRef.current = null;
      }
    }
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
    "focus:border-[#E10600] focus:ring-2 focus:ring-red-100";

  return (
    <main className="min-h-screen overflow-x-clip bg-[#f8f9fb] px-4 py-8 text-slate-900 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
      <div className="mx-auto grid w-full max-w-[1200px] grid-cols-1 items-start gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-12 xl:gap-16">

        {/* VISÃO DO CLIENTE */}
        <div className="mx-auto w-full min-w-0 max-w-[650px]">
          <header className="mb-10 text-center sm:mb-12">
            <h1 className="flex flex-col items-center text-[44px] font-bold leading-[1.08] tracking-tight sm:text-[54px] lg:text-[52px] xl:text-[62px]">
              <span className="flex h-[1.2em] w-full items-center justify-center">
                <span
                  key={mealIndex}
                  className="inline-block animate-pulse"
                  style={{ color: BRAND_RED }}
                  aria-live="off"
                >
                  {meals[mealIndex]}
                </span>
              </span>

              <span className="block text-center">
                do seu jeitinho.
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-[440px] text-sm leading-6 text-slate-600 sm:text-base">
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
                <label htmlFor="name" className="mb-2 block text-sm font-medium">
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
                <label htmlFor="restriction" className="mb-2 block text-sm font-medium">
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
                <label htmlFor="platform" className="mb-2 block text-sm font-medium">
                  Plataforma de delivery
                </label>

                <div className="relative">
                  <select
                    id="platform"
                    className={`${inputStyle} h-[50px] appearance-none pr-11`}
                    value={platform}
                    onChange={(event) => setPlatform(event.target.value)}
                  >
                    <option value="iFood">iFood</option>
                    <option value="Rappi">Rappi</option>
                    <option value="Uber Eats">Uber Eats</option>
                  </select>

                  <svg
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M6 9L12 15L18 9"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              <div>
                <label htmlFor="restaurant" className="mb-2 block text-sm font-medium">
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
                <label htmlFor="order" className="mb-2 block text-sm font-medium">
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
                className="w-full rounded-2xl px-5 py-4 font-semibold text-white transition-colors duration-200 disabled:cursor-wait disabled:opacity-70"
                style={{
                  backgroundColor: BRAND_RED,
                }}
                onMouseEnter={(event) => {
                  if (sendStatus !== "sending") {
                    event.currentTarget.style.backgroundColor = BRAND_RED_HOVER;
                  }
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.backgroundColor = BRAND_RED;
                }}
                onMouseDown={(event) => {
                  if (sendStatus !== "sending") {
                    event.currentTarget.style.backgroundColor = BRAND_RED_DARK;
                  }
                }}
                onMouseUp={(event) => {
                  event.currentTarget.style.backgroundColor = BRAND_RED_HOVER;
                }}
              >
                {sendStatus === "sending"
                  ? "Gerando aviso..."
                  : "Gerar aviso alimentar"}
              </button>
            </div>
          </section>

          {sendStatus === "success" && (
            <section
              className="mt-6 rounded-[28px] border border-red-200 bg-white p-6 text-center shadow-[0_8px_30px_rgba(120,20,45,0.07)] sm:p-8"
              role="status"
            >
              <div
                className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-red-200 bg-red-50 text-2xl font-bold"
                style={{ color: BRAND_RED }}
              >
                ✓
              </div>

              <h2
                className="text-xl font-bold tracking-tight"
                style={{ color: BRAND_RED_DARK }}
              >
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
              <div
                className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-red-200 bg-red-50 text-xl font-bold"
                style={{ color: BRAND_RED }}
              >
                !
              </div>

              <p className="text-sm font-medium leading-6 text-red-800">
                {feedback}
              </p>
            </section>
          )}

          <footer className="mt-8 text-center text-xs leading-6 text-slate-500">
            <p>
              Protótipo integrado com Next.js, Make, Google Gemini e GREEN-API.
            </p>

            <p className="mt-2 font-bold text-slate-600">
              O aviso gerado pela IA é exibido no simulador e encaminhado
              simultaneamente para um WhatsApp de teste pelo fluxo de automação.
            </p>

            <p className="mt-2">
              O SAFE FOOD AI não verifica a composição real dos alimentos,
              o contato cruzado ou a segurança do preparo.
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

          <div className="w-full min-w-0 px-1 sm:px-0">
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
            disabled={messages.length === 0 || sendStatus === "sending"}
            className="mt-4 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 shadow-sm transition-colors hover:border-red-500 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Limpar conversa simulada do restaurante"
          >
            Limpar conversa
          </button>
        </div>
      </div>
    </main>
  );
}

 
"use client";

import { useEffect, useState } from "react";
import { interpretarPedido } from "./interpretOrder";

const meals = ["café", "almoço", "lanche", "janta"];

type SendStatus = "idle" | "sending" | "success" | "error";

export default function Home() {
  const [name, setName] = useState("");
  const [restriction, setRestriction] = useState("");
  const [platform, setPlatform] = useState("iFood");
  const [restaurant, setRestaurant] = useState("");
  const [order, setOrder] = useState("");
  const [mealIndex, setMealIndex] = useState(0);
  const [sendStatus, setSendStatus] =
    useState<SendStatus>("idle");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const interval = window.setInterval(() => {
      setMealIndex((previous) => (previous + 1) % meals.length);
    }, 1200);

    return () => window.clearInterval(interval);
  }, []);

  async function generateMessage() {
    if (sendStatus === "sending") return;

    setSendStatus("idle");
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

    const result = interpretarPedido(restriction);

    const generatedMessage =
      `⚠️ ATENÇÃO: ESPECIFICAÇÃO ALIMENTAR\n\n` +
      `Cliente: ${name.trim()}\n` +
      `Plataforma: ${platform}\n` +
      `Restaurante: ${restaurant.trim()}\n` +
      `Pedido: ${order.trim()}\n\n` +
      `Especificação informada:\n` +
      `${result.avisoAlimentar}\n\n` +
      (result.selo !== "SEM SELO"
        ? `🚨 ${result.selo}\n\n`
        : "") +
      `💡 ORIENTAÇÕES PARA O RESTAURANTE:\n` +
      `${result.sugestaoIA}\n\n` +
      `Solicitamos atenção às especificações ` +
      `informadas e a verificação da possibilidade ` +
      `de atendê-las antes do preparo. Caso não ` +
      `seja possível, utilize os canais disponíveis ` +
      `na plataforma do pedido para orientar o cliente.`;

    setSendStatus("sending");

    try {
      const response = await fetch("/api/restaurant-alert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projeto: "SAFE FOOD AI",
          nome: name.trim(),
          plataforma: platform,
          restaurante: restaurant.trim(),
          pedido: order.trim(),
          especificacao: restriction.trim(),
          avisoAlimentar: result.avisoAlimentar,
          sugestaoIA: result.sugestaoIA,
          selo: result.selo,
          mensagem: generatedMessage,
        }),
      });

      if (!response.ok) {
        throw new Error("Falha no encaminhamento.");
      }

      setSendStatus("success");
      setFeedback(
        "Sua solicitação alimentar foi recebida " +
        "pelo sistema e será encaminhada ao " +
        "restaurante com um alerta sobre suas " +
        "especificações, acompanhado de sugestões " +
        "personalizadas de preparo, montagem, " +
        "embalagem e cuidados preventivos."
      );
    } catch {
      setSendStatus("error");
      setFeedback(
        "Não foi possível encaminhar sua " +
        "solicitação. Tente novamente."
      );
    }
  }

  const inputStyle =
    "w-full rounded-2xl border border-slate-200 " +
    "bg-white px-4 py-3 text-slate-900 " +
    "shadow-sm outline-none transition-all duration-200 " +
    "placeholder:text-slate-400 " +
    "focus:border-[#D71943] focus:ring-2 focus:ring-rose-100";

  return (
    <main className="min-h-screen bg-white px-5 py-10 text-slate-900">
      <div className="mx-auto max-w-2xl">
        <header className="mb-10 text-center">
          <h1 className="flex flex-col items-center text-4xl font-bold tracking-tight sm:text-5xl">
            <span className="flex h-14 w-full items-center justify-center sm:h-16">
              <span
                key={mealIndex}
                className="inline-block animate-pulse text-[#D71943]"
                aria-live="off"
              >
                {meals[mealIndex]}
              </span>
            </span>

            <span className="block whitespace-nowrap">
              do seu jeitinho.
            </span>
          </h1>

          <p className="mt-4 text-slate-600">
            envie as especificações do seu pedido
            para restaurantes a qualquer hora do dia.
          </p>
        </header>

        {/* Formulário */}
        <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_8px_32px_rgba(0,0,0,0.06)] sm:p-9">
          <h2 className="mb-2 text-2xl font-bold tracking-tight">
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
                onChange={(event) =>
                  setName(event.target.value)
                }
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
                onChange={(event) =>
                  setRestriction(event.target.value)
                }
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
                onChange={(event) =>
                  setPlatform(event.target.value)
                }
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
                onChange={(event) =>
                  setRestaurant(event.target.value)
                }
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
                onChange={(event) =>
                  setOrder(event.target.value)
                }
              />
            </div>

            {/* Botão vermelho sólido, sem reflexos */}
            <button
              type="button"
              onClick={generateMessage}
              disabled={sendStatus === "sending"}
              className="w-full rounded-2xl bg-[#D71943] px-5 py-4 font-semibold text-white transition-colors duration-200 hover:bg-[#B91538] active:bg-[#A90E30] disabled:cursor-wait disabled:opacity-70"
            >
              {sendStatus === "sending"
                ? "Encaminhando solicitação..."
                : "Gerar aviso alimentar"}
            </button>
          </div>
        </section>

        {/* Balão de confirmação */}
        {sendStatus === "success" && (
          <section
            className="mt-6 rounded-[28px] border border-rose-200 bg-white p-8 text-center shadow-[0_8px_30px_rgba(120,20,45,0.07)]"
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

        {/* Balão de erro */}
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
          Protótipo demonstrativo. O SAFE FOOD AI não
          verifica ingredientes, contaminação cruzada
          ou segurança do preparo. A confirmação deve
          ser obtida diretamente com o estabelecimento.
        </footer>
      </div>
    </main>
  );
}


import {
  foodAnalysisSchema,
  type FoodAnalysis,
} from "./foodAnalysis";

type Selo = FoodAnalysis["selo"];

type AnaliseInterna = {
  selo: Selo;
  suspeita: boolean;
  suspeitaAlergia: boolean;
  suspeitaIntolerancia: boolean;
  conflito: boolean;
};

function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function dividirFrases(texto: string): string[] {
  return normalizar(texto)
    .split(/[.!?;\n]+/)
    .map((frase) => frase.trim())
    .filter(Boolean);
}

// Reconhece expressões que indicam incerteza.
function temSuspeita(frase: string): boolean {
  return /\b(?:acho que|suspeito|suspeita|talvez|pode ser|nao sei se|nao tenho certeza|desconfio|possivelmente|aparentemente)\b/.test(
    frase
  );
}

// Remove declarações explicitamente negadas.
function removerNegacoes(frase: string): string {
  return frase
    .replace(
      /\b(?:nao tenho|nao possuo|nao apresento|sem)\s+(?:(?:nenhum[ao]?|qualquer|uma?|de)\s+)?(?:alergia|alergic[oa]|intolerancia|intolerante)(?:\s+(?:alimentar|alimentares))?(?:\s+(?:nem|ou|e)\s+(?:alergia|alergic[oa]|intolerancia|intolerante)(?:\s+(?:alimentar|alimentares))?)*\b/g,
      ""
    )
    .replace(
      /\bnao sou\s+(?:alergic[oa]|intolerante)(?:\s+(?:nem|ou|e)\s+(?:alergic[oa]|intolerante))*\b/g,
      ""
    )
    .replace(
      /\bsem\s+(?:(?:nenhum[ao]?|qualquer|uma?)\s+)?(?:alergia|intolerancia)\b/g,
      ""
    );
}

// Identifica exclusões e restrições solicitadas.
function temRestricaoInformada(texto: string): boolean {
  const normalizado = normalizar(texto);

  return /\b(?:sem|retirar|remover|excluir|evitar|nao colocar|nao adicionar|nao incluir|substituir|trocar|separado|a parte|nao pode conter)\s+(?:o |a |os |as |um |uma |de |do |da )*[a-z]/.test(
    normalizado
  );
}

function identificarCondicao(texto: string): AnaliseInterna {
  const frases = dividirFrases(texto);

  let alergia = false;
  let intolerancia = false;
  let suspeitaAlergia = false;
  let suspeitaIntolerancia = false;

  for (const fraseOriginal of frases) {
    const frase = removerNegacoes(fraseOriginal);

    const mencionaAlergia =
      /\b(?:alergia|alergic[oa])\b/.test(frase);

    const mencionaIntolerancia =
      /\b(?:intolerancia|intolerante)\b/.test(frase);

    if (!mencionaAlergia && !mencionaIntolerancia) {
      continue;
    }

    if (temSuspeita(fraseOriginal)) {
      if (mencionaAlergia) {
        suspeitaAlergia = true;
      }

      if (mencionaIntolerancia) {
        suspeitaIntolerancia = true;
      }

      continue;
    }

    if (mencionaAlergia) {
      alergia = true;
    }

    if (mencionaIntolerancia) {
      intolerancia = true;
    }
  }

  const selo: Selo = alergia
    ? "ALERGIA DECLARADA"
    : intolerancia
      ? "INTOLERÂNCIA DECLARADA"
      : temRestricaoInformada(texto)
        ? "RESTRIÇÃO INFORMADA"
        : "SEM SELO";

  return {
    selo,
    suspeita: suspeitaAlergia || suspeitaIntolerancia,
    suspeitaAlergia,
    suspeitaIntolerancia,
    conflito: false,
  };
}

// Identifica situações em que o cliente solicita
// um ingrediente e relata dúvida sobre consumi-lo.
function identificarConflito(texto: string): boolean {
  const normalizado = normalizar(texto);

  const indicaDuvida =
    /\b(?:acho que|suspeito|talvez|nao sei se|nao tenho certeza|me faz mal|passo mal|desconfio)\b/.test(
      normalizado
    );

  if (!indicaDuvida) {
    return false;
  }

  const ingredientes = [
    "leite",
    "queijo",
    "camarao",
    "amendoim",
    "ovo",
    "gluten",
    "trigo",
    "soja",
  ];

  return ingredientes.some((ingrediente) => {
    const solicitaIngrediente = new RegExp(
      `\\b(?:com|adicionar|colocar|incluir)\\s+(?:(?:um|uma|pouco|pouca|mais|menos|de)\\s+)*${ingrediente}\\b`
    ).test(normalizado);

    return solicitaIngrediente;
  });
}

function gerarOrientacoes(
  texto: string,
  analise: AnaliseInterna
): string {
  const normalizado = normalizar(texto);

  // PRIORIDADE 1: conflito entre solicitação e preocupação.
  if (analise.conflito) {
    return (
      "CONFIRMAÇÃO HUMANA OBRIGATÓRIA ANTES DO PREPARO. " +
      "Foi identificada uma possível contradição entre " +
      "um ingrediente solicitado e uma preocupação alimentar " +
      "relatada pelo cliente. " +
      "Não iniciar o preparo até que o restaurante esclareça " +
      "a solicitação diretamente com o cliente pelos canais " +
      "da plataforma. " +
      "Não remover, substituir, reduzir ou manter o ingrediente " +
      "por decisão automática. " +
      "Somente após o esclarecimento o estabelecimento poderá " +
      "avaliar a possibilidade de atender ao pedido."
    );
  }

  // PRIORIDADE 2: suspeita de alergia.
  if (analise.suspeitaAlergia) {
    return (
      "CONFIRMAÇÃO HUMANA OBRIGATÓRIA ANTES DO PREPARO. " +
      "O cliente relatou suspeita de alergia alimentar, " +
      "sem confirmação de diagnóstico. " +
      "O restaurante deve esclarecer a solicitação " +
      "diretamente com o cliente pelos canais da plataforma. " +
      "Verifique os ingredientes envolvidos, incluindo " +
      "molhos, acompanhamentos e componentes do prato, " +
      "bem como possíveis fontes de contato cruzado " +
      "em utensílios, superfícies e equipamentos. " +
      "Preserve as exclusões solicitadas e não faça " +
      "substituições sem autorização do cliente. " +
      "A equipe deve avaliar se consegue atender ao pedido " +
      "antes de iniciar o preparo. " +
      "Não presumir diagnóstico nem garantir ausência de riscos."
    );
  }

  // PRIORIDADE 3: orientações gerais e contextuais.
  let orientacao =
    "Confira as especificações informadas pelo cliente " +
    "durante o preparo, a montagem, a identificação, " +
    "a embalagem e o transporte do pedido.";

  // Pizza com parte sem queijo.
  if (
    normalizado.includes("pizza") &&
    normalizado.includes("sem queijo")
  ) {
    orientacao =
      "Identifique claramente a parte da pizza solicitada " +
      "sem queijo. Se houver outra metade com queijo, " +
      "avalie a separação das partes durante o preparo, " +
      "a montagem e o transporte. Divisórias ou embalagens " +
      "separadas podem ajudar a reduzir a transferência " +
      "entre os alimentos, mas não garantem ausência " +
      "de contato cruzado.";
  }

  // Esfihas com e sem queijo.
  else if (
    (normalizado.includes("esfiha") ||
      normalizado.includes("esfirra")) &&
    normalizado.includes("sem queijo")
  ) {
    orientacao =
      "Identifique as unidades solicitadas sem queijo " +
      "e avalie embalagens separadas para reduzir " +
      "o contato entre os alimentos durante a montagem " +
      "e o transporte.";
  }

  // Exclusão de camarão.
  else if (
    normalizado.includes("camarao") &&
    (normalizado.includes("sem camarao") ||
      normalizado.includes("nao colocar camarao") ||
      normalizado.includes("nao pode conter camarao"))
  ) {
    orientacao =
      "Verifique os ingredientes e possíveis componentes " +
      "que contenham camarão. Confira também utensílios, " +
      "superfícies, equipamentos e procedimentos que possam " +
      "provocar contato cruzado. Identifique o pedido " +
      "e mantenha os cuidados durante a embalagem " +
      "e o transporte.";
  }

  // Declaração afirmativa de alergia.
  if (analise.selo === "ALERGIA DECLARADA") {
    orientacao +=
      " ATENÇÃO ADICIONAL: o cliente declarou alergia. " +
      "É necessária verificação humana dos ingredientes, " +
      "das possibilidades de contato cruzado e da capacidade " +
      "do estabelecimento de atender à solicitação. " +
      "Não afirmar que o alimento é seguro ou livre de riscos.";
  }

  // Declaração afirmativa de intolerância.
  if (analise.selo === "INTOLERÂNCIA DECLARADA") {
    orientacao +=
      " ATENÇÃO ADICIONAL: o cliente declarou intolerância. " +
      "Verifique os ingredientes relacionados à condição " +
      "informada e confirme a possibilidade de atendimento. " +
      "Não presumir que ingredientes diferentes " +
      "sejam equivalentes.";
  }

  // Suspeita de intolerância, sem declaração afirmativa.
  if (analise.suspeitaIntolerancia) {
    orientacao +=
      " ATENÇÃO: o cliente relatou suspeita de intolerância. " +
      "Não presumir diagnóstico. " +
      "CONFIRMAÇÃO HUMANA OBRIGATÓRIA ANTES DO PREPARO " +
      "quando a dúvida afetar a composição do pedido. " +
      "O estabelecimento deve esclarecer a solicitação " +
      "pelos canais disponíveis na plataforma.";
  }

  return orientacao;
}

export function interpretarPedido(
  especificacao: string
): FoodAnalysis {
  const texto = especificacao.trim();

  if (!texto) {
    throw new Error(
      "Informe a especificação alimentar."
    );
  }

  const condicao = identificarCondicao(texto);

  const analise: AnaliseInterna = {
    ...condicao,
    conflito: identificarConflito(texto),
  };

  const resultado: FoodAnalysis = {
    avisoAlimentar: texto,
    sugestaoIA: gerarOrientacoes(texto, analise),
    selo: analise.selo,
    precisaConfirmacao:
      analise.selo !== "SEM SELO" ||
      analise.suspeita ||
      analise.conflito,
  };

  return foodAnalysisSchema.parse(resultado);
}


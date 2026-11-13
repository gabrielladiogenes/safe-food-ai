
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
  preocupacaoIncerta: boolean;
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
    .split(/[.!?;\n]+|\s+\bmas\b\s+|\s+\bporem\b\s+/)
    .map((frase) => frase.trim())
    .filter(Boolean);
}

const EXPRESSAO_SUSPEITA =
  /\b(?:acho que|suspeito|suspeita|talvez|pode ser|nao sei se|nao tenho certeza|desconfio|possivelmente|aparentemente)\b/;

const EXPRESSAO_REACAO =
  /\b(?:me faz mal|me fazem mal|passo mal|me causa reacao|tenho reacao|me da reacao)\b/;

const ALERGIA =
  /\b(?:alergia|alergias|alergic[oa]s?)\b/;

const INTOLERANCIA =
  /\b(?:intolerancia|intolerancias|intolerantes?)\b/;

function removerNegacoes(frase: string): string {
  return frase
    .replace(
      /\b(?:nao tenho|nao possuo|nao apresento|sem)\s+(?:(?:nenhum[ao]s?|qualquer|uma?|de)\s+)?(?:alergias?|alergic[oa]s?|intolerancias?|intolerantes?)(?:\s+(?:alimentar|alimentares))?(?:\s+(?:nem|ou|e)\s+(?:alergias?|alergic[oa]s?|intolerancias?|intolerantes?)(?:\s+(?:alimentar|alimentares))?)*\b/g,
      ""
    )
    .replace(
      /\bnao sou\s+(?:alergic[oa]s?|intolerantes?)(?:\s+(?:nem|ou|e)\s+(?:alergic[oa]s?|intolerantes?))*\b/g,
      ""
    );
}

function temRestricaoInformada(texto: string): boolean {
  const frases = dividirFrases(texto);

  const padraoExclusao =
    /\b(?:sem|retirar|remover|excluir|evitar|nao colocar|nao adicionar|nao incluir|substituir|trocar|separado|a parte|nao pode conter)\s+(?:(?:o|a|os|as|um|uma|de|do|da)\s+)*[a-z]/;

  const padraoNegacaoDeAlteracao =
    /\b(?:nao preciso|nao quero|nao desejo|nao necessito|nao precisa|nao e necessario|nao vou)\s+(?:de\s+)?(?:retirar|remover|excluir|evitar|substituir|trocar)\b/;

  return frases.some((fraseOriginal) => {
    const frase = removerNegacoes(fraseOriginal)
      .replace(padraoNegacaoDeAlteracao, "")
      .trim();

    return padraoExclusao.test(frase);
  });
}

function identificarCondicao(
  texto: string
): AnaliseInterna {
  const frases = dividirFrases(texto);

  let alergia = false;
  let intolerancia = false;
  let suspeitaAlergia = false;
  let suspeitaIntolerancia = false;
  let preocupacaoIncerta = false;

  for (const fraseOriginal of frases) {
    const frase = removerNegacoes(fraseOriginal);

    const mencionaAlergia = ALERGIA.test(frase);
    const mencionaIntolerancia =
      INTOLERANCIA.test(frase);

    const temDuvida = EXPRESSAO_SUSPEITA.test(frase);
    const temReacao = EXPRESSAO_REACAO.test(frase);

    if (temDuvida || temReacao) {
      if (mencionaAlergia) {
        suspeitaAlergia = true;
      }

      if (mencionaIntolerancia) {
        suspeitaIntolerancia = true;
      }

      if (
        temReacao ||
        (temDuvida &&
          (mencionaAlergia || mencionaIntolerancia))
      ) {
        preocupacaoIncerta = true;
      }

      if (temDuvida) {
        continue;
      }
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
    suspeita:
      suspeitaAlergia ||
      suspeitaIntolerancia ||
      preocupacaoIncerta,
    suspeitaAlergia,
    suspeitaIntolerancia,
    preocupacaoIncerta,
    conflito: false,
  };
}

const INGREDIENTES = [
  "leite",
  "queijo",
  "camarao",
  "amendoim",
  "ovo",
  "gluten",
  "trigo",
  "soja",
];

function ingredienteDeclarado(
  texto: string,
  ingrediente: string
): boolean {
  const padrao = new RegExp(
    `\\b(?:alergia|alergico|alergica)\\s+(?:(?:a|ao|aos|de|do|da)\\s+)?${ingrediente}\\b`
  );

  return dividirFrases(texto).some((frase) => {
    const semNegacao = removerNegacoes(frase);

    return (
      !EXPRESSAO_SUSPEITA.test(semNegacao) &&
      padrao.test(semNegacao)
    );
  });
}

function ingredienteSolicitado(
  texto: string,
  ingrediente: string
): boolean {
  const padrao = new RegExp(
    `\\b(?:com|adicionar|colocar|incluir|quero|pedir|mais|extra)\\s+(?:(?:um|uma|pouco|pouca|mais|menos|de|do|da|o|a)\\s+)*${ingrediente}\\b|\\b${ingrediente}\\s+extra\\b`
  );

  const exclusao = new RegExp(
    `\\b(?:sem|nao colocar|nao adicionar|nao incluir|retirar|remover|excluir)\\s+(?:(?:o|a|de|do|da)\\s+)*${ingrediente}\\b`
  );

  return (
    !exclusao.test(texto) &&
    padrao.test(texto)
  );
}

// NOVA LÓGICA:
// Classifica a atribuição de cada solicitação,
// em vez de excluir globalmente um ingrediente
// quando aparece a expressão "outra pessoa".

type Destinatario =
  | "PROPRIO_CLIENTE"
  | "OUTRA_PESSOA"
  | "INDEFINIDO";

function identificarDestinatario(
  frase: string
): Destinatario {
  const referenciaOutraPessoa =
    /\b(?:outra pessoa|outro cliente|para meu amigo|para minha amiga|para meu marido|para minha esposa)\b/;

  const referenciaProprioCliente =
    /\b(?:meu|meus|minha|minhas|para mim|pra mim|eu vou comer|eu quero comer)\b/;

  const outraPessoa =
    referenciaOutraPessoa.test(frase);

  const proprioCliente =
    referenciaProprioCliente.test(frase);

  // Se a frase mencionar ambos, não presumimos
  // automaticamente a quem pertence o ingrediente.
  if (outraPessoa && proprioCliente) {
    return "INDEFINIDO";
  }

  if (outraPessoa) {
    return "OUTRA_PESSOA";
  }

  if (proprioCliente) {
    return "PROPRIO_CLIENTE";
  }

  return "INDEFINIDO";
}

function solicitacoesDoIngrediente(
  texto: string,
  ingrediente: string
): Destinatario[] {
  const frases = dividirFrases(texto);

  return frases
    .filter((frase) =>
      ingredienteSolicitado(frase, ingrediente)
    )
    .map((frase) =>
      identificarDestinatario(frase)
    );
}

function identificarConflito(
  texto: string
): boolean {
  const normalizado = normalizar(texto);
  const frases = dividirFrases(normalizado);

  // Verifica cada solicitação individualmente.
  // A existência de um item para outra pessoa
  // não pode ocultar um conflito do próprio cliente.

  const conflitoAlergia = INGREDIENTES.some(
    (ingrediente) => {
      const alergiaDeclarada =
        ingredienteDeclarado(
          normalizado,
          ingrediente
        );

      if (!alergiaDeclarada) {
        return false;
      }

      const solicitacoes =
        solicitacoesDoIngrediente(
          normalizado,
          ingrediente
        );

      if (solicitacoes.length === 0) {
        return false;
      }

      // Existe conflito quando há solicitação
      // atribuída ao cliente alérgico.
      if (
        solicitacoes.includes("PROPRIO_CLIENTE")
      ) {
        return true;
      }

      // Se todas as solicitações forem claramente
      // destinadas a outra pessoa, não identificamos
      // contradição direta com o cliente alérgico.
      if (
        solicitacoes.every(
          (destinatario) =>
            destinatario === "OUTRA_PESSOA"
        )
      ) {
        return false;
      }

      // Solicitações sem destinatário explícito
      // continuam sendo tratadas como possível
      // contradição, exigindo esclarecimento.
      return true;
    }
  );

  if (conflitoAlergia) {
    return true;
  }

  const temPreocupacao =
    EXPRESSAO_SUSPEITA.test(normalizado) ||
    EXPRESSAO_REACAO.test(normalizado);

  if (!temPreocupacao) {
    return false;
  }

  return INGREDIENTES.some((ingrediente) => {
    const mencionaIngredienteComPreocupacao =
      frases.some(
        (frase) =>
          new RegExp(
            `\\b${ingrediente}\\b`
          ).test(frase) &&
          (EXPRESSAO_SUSPEITA.test(frase) ||
            EXPRESSAO_REACAO.test(frase))
      );

    if (!mencionaIngredienteComPreocupacao) {
      return false;
    }

    const solicitacoes =
      solicitacoesDoIngrediente(
        normalizado,
        ingrediente
      );

    return solicitacoes.some(
      (destinatario) =>
        destinatario !== "OUTRA_PESSOA"
    );
  });
}

function gerarOrientacoes(
  texto: string,
  analise: AnaliseInterna
): string {
  const normalizado = normalizar(texto);

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

  let orientacao =
    "Confira as especificações informadas pelo cliente " +
    "durante o preparo, a montagem, a identificação, " +
    "a embalagem e o transporte do pedido.";

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
  } else if (
    (normalizado.includes("esfiha") ||
      normalizado.includes("esfirra")) &&
    normalizado.includes("sem queijo")
  ) {
    orientacao =
      "Identifique as unidades solicitadas sem queijo " +
      "e avalie embalagens separadas para reduzir " +
      "o contato entre os alimentos durante a montagem " +
      "e o transporte.";
  } else if (
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

  if (analise.selo === "ALERGIA DECLARADA") {
    orientacao +=
      " ATENÇÃO ADICIONAL: o cliente declarou alergia. " +
      "É necessária verificação humana dos ingredientes, " +
      "das possibilidades de contato cruzado e da capacidade " +
      "do estabelecimento de atender à solicitação. " +
      "Não afirmar que o alimento é seguro ou livre de riscos.";
  }

  if (analise.selo === "INTOLERÂNCIA DECLARADA") {
    orientacao +=
      " ATENÇÃO ADICIONAL: o cliente declarou intolerância. " +
      "Verifique os ingredientes relacionados à condição " +
      "informada e confirme a possibilidade de atendimento. " +
      "Não presumir que ingredientes diferentes " +
      "sejam equivalentes.";
  }

  if (analise.suspeitaIntolerancia) {
    orientacao +=
      " ATENÇÃO: o cliente relatou suspeita de intolerância. " +
      "Não presumir diagnóstico. " +
      "CONFIRMAÇÃO HUMANA OBRIGATÓRIA ANTES DO PREPARO " +
      "quando a dúvida afetar a composição do pedido. " +
      "O estabelecimento deve esclarecer a solicitação " +
      "pelos canais disponíveis na plataforma.";
  }

  if (
    analise.preocupacaoIncerta &&
    !analise.suspeitaAlergia &&
    !analise.suspeitaIntolerancia
  ) {
    orientacao +=
      " ATENÇÃO: o cliente relatou uma possível reação " +
      "alimentar sem declarar uma condição específica. " +
      "CONFIRMAÇÃO HUMANA OBRIGATÓRIA ANTES DO PREPARO. " +
      "Esclarecer a solicitação com o cliente. " +
      "Não presumir diagnóstico nem garantir segurança.";
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

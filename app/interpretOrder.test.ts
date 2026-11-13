
import { describe, expect, it } from "vitest";
import { interpretarPedido } from "./interpretOrder";

describe("SAFE FOOD AI — Classificação alimentar", () => {
  // ==========================================
  // BLOCO 1 — TESTES ORIGINAIS
  // ==========================================

  it("identifica alergia declarada", () => {
    const resultado = interpretarPedido(
      "Tenho alergia a amendoim."
    );

    expect(resultado.selo).toBe("ALERGIA DECLARADA");
    expect(resultado.precisaConfirmacao).toBe(true);
  });

  it("identifica intolerância declarada", () => {
    const resultado = interpretarPedido(
      "Tenho intolerância à lactose."
    );

    expect(resultado.selo).toBe("INTOLERÂNCIA DECLARADA");
  });

  it("identifica exclusão sem presumir alergia", () => {
    const resultado = interpretarPedido(
      "Quero um hambúrguer sem queijo."
    );

    expect(resultado.selo).toBe("RESTRIÇÃO INFORMADA");
  });

  it("não cria condição alimentar quando negada", () => {
    const resultado = interpretarPedido(
      "Não tenho alergia nem intolerância."
    );

    expect(resultado.selo).toBe("SEM SELO");
  });

  it("não confunde ausência de alteração com restrição", () => {
    const resultado = interpretarPedido(
      "Não tenho alergias nem intolerâncias. Não preciso retirar nenhum ingrediente."
    );

    expect(resultado.selo).toBe("SEM SELO");
  });

  it("não transforma suspeita em alergia declarada", () => {
    const resultado = interpretarPedido(
      "Acho que tenho alergia a leite."
    );

    expect(resultado.selo).toBe("SEM SELO");
    expect(resultado.precisaConfirmacao).toBe(true);
  });

  it("mantém alergia afirmativa mesmo com suspeita de intolerância", () => {
    const resultado = interpretarPedido(
      "Tenho alergia a amendoim, mas acho que também tenho intolerância à lactose."
    );

    expect(resultado.selo).toBe("ALERGIA DECLARADA");
  });

  it("prioriza alergia quando há duas condições declaradas", () => {
    const resultado = interpretarPedido(
      "Tenho alergia a camarão e intolerância à lactose."
    );

    expect(resultado.selo).toBe("ALERGIA DECLARADA");
  });

  it("identifica conflito explícito com ingrediente solicitado", () => {
    const resultado = interpretarPedido(
      "Tenho alergia a queijo, mas quero queijo extra."
    );

    expect(resultado.selo).toBe("ALERGIA DECLARADA");
    expect(resultado.precisaConfirmacao).toBe(true);
    expect(resultado.sugestaoIA).toContain(
      "CONFIRMAÇÃO HUMANA OBRIGATÓRIA"
    );
  });

  it("não inventa conflito entre ingredientes diferentes", () => {
    const resultado = interpretarPedido(
      "Tenho alergia a amendoim. Quero hambúrguer com queijo."
    );

    expect(resultado.selo).toBe("ALERGIA DECLARADA");
    expect(resultado.sugestaoIA).not.toContain(
      "Foi identificada uma possível contradição"
    );
  });

  it("mantém SEM SELO quando há dúvida sem exclusão", () => {
    const resultado = interpretarPedido(
      "Quero queijo extra, mas acho que queijo me faz mal."
    );

    expect(resultado.selo).toBe("SEM SELO");
    expect(resultado.precisaConfirmacao).toBe(true);
  });

  it("rejeita especificação vazia", () => {
    expect(() => interpretarPedido("   ")).toThrow(
      "Informe a especificação alimentar."
    );
  });

  // ==========================================
  // BLOCO 2 — REGRESSÃO AVANÇADA
  // ==========================================

  it("não confunde ausência de alergias com alergia declarada", () => {
    const resultado = interpretarPedido(
      "Não tenho alergias alimentares e não preciso de nenhuma alteração."
    );

    expect(resultado.selo).toBe("SEM SELO");
  });

  it("reconhece alergia afirmativa após uma negação", () => {
    const resultado = interpretarPedido(
      "Não tenho intolerância à lactose, mas tenho alergia a camarão."
    );

    expect(resultado.selo).toBe("ALERGIA DECLARADA");
  });

  it("não transforma uma suspeita em diagnóstico declarado", () => {
    const resultado = interpretarPedido(
      "Talvez eu tenha intolerância à lactose."
    );

    expect(resultado.selo).toBe("SEM SELO");
    expect(resultado.precisaConfirmacao).toBe(true);
  });

  it("não cria conflito com ingrediente diferente", () => {
    const resultado = interpretarPedido(
      "Tenho alergia a amendoim. Quero queijo extra no hambúrguer."
    );

    expect(resultado.selo).toBe("ALERGIA DECLARADA");
    expect(resultado.sugestaoIA).not.toContain(
      "Foi identificada uma possível contradição"
    );
  });

  it("reconhece restrição em pedido com múltiplos itens", () => {
    const resultado = interpretarPedido(
      "Quero dois hambúrgueres: o primeiro sem queijo e o segundo completo."
    );

    expect(resultado.selo).toBe("RESTRIÇÃO INFORMADA");
  });

  it("não considera alergia de uma pessoa como contradição no pedido de outra", () => {
    const resultado = interpretarPedido(
      "Tenho alergia a queijo. O primeiro hambúrguer é meu e deve ser sem queijo. O segundo é para outra pessoa e deve ter queijo extra."
    );

    expect(resultado.selo).toBe("ALERGIA DECLARADA");
    expect(resultado.sugestaoIA).not.toContain(
      "Foi identificada uma possível contradição"
    );
  });

  it("não interpreta negação de alergia como declaração afirmativa", () => {
    const resultado = interpretarPedido(
      "Não tenho alergia a amendoim. Quero um hambúrguer com amendoim."
    );

    expect(resultado.selo).toBe("SEM SELO");
  });

  it("exige confirmação quando existe reação alimentar incerta", () => {
    const resultado = interpretarPedido(
      "Quero queijo extra, mas acho que queijo me faz mal."
    );

    expect(resultado.selo).toBe("SEM SELO");
    expect(resultado.precisaConfirmacao).toBe(true);
    expect(resultado.sugestaoIA).toContain(
      "CONFIRMAÇÃO HUMANA OBRIGATÓRIA"
    );
  });
  it("não oculta conflito real quando existe outro consumidor", () => {
    const resultado = interpretarPedido(
      "Tenho alergia a queijo. Quero queijo extra no meu hambúrguer. O segundo hambúrguer é para outra pessoa e também terá queijo extra."
    );

    expect(resultado.selo).toBe("ALERGIA DECLARADA");
    expect(resultado.precisaConfirmacao).toBe(true);

    expect(resultado.sugestaoIA).toContain(
      "Foi identificada uma possível contradição"
    );

    expect(resultado.sugestaoIA).toContain(
      "CONFIRMAÇÃO HUMANA OBRIGATÓRIA"
    );
  });

});

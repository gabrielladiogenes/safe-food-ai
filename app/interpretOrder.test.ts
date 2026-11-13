
import { describe, expect, it } from "vitest";
import { interpretarPedido } from "./interpretOrder";

describe("SAFE FOOD AI — Classificação alimentar", () => {
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
});

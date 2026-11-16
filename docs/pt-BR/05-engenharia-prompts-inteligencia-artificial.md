
# 05 — Engenharia de Prompts e Inteligência Artificial Aplicada

O desenvolvimento da inteligência artificial do SAFE FOOD AI evoluiu de uma abordagem de geração contextual de recomendações para um fluxo orientado por **engenharia avançada de prompts, regras de negócio e critérios explícitos de segurança**.

O objetivo foi direcionar o Google Gemini para produzir orientações individualizadas e preventivas, preservando as informações declaradas pelo consumidor e os limites de atuação da IA.

## 5.1 Engenharia avançada de prompts

A evolução das instruções do sistema, documentada até a versão **3.0**, consolidou diretrizes para controlar o comportamento do modelo generativo.

A estrutura contempla:

- **Definição de papel e contexto:** atuação como assistente de comunicação alimentar preventiva, com foco nas particularidades de cada pedido.
- **Instruções e restrições explícitas:** preservação de itens, quantidades, modificações e condições declaradas, sem inferências clínicas.
- **Geração contextual:** recomendações específicas para preparo, montagem, identificação, embalagem e transporte, mesmo quando não há restrição alimentar declarada.
- **Tratamento de ambiguidades:** reconhecimento de informações insuficientes e direcionamento para confirmação humana.

Essa abordagem estabelece uma separação entre **informações fornecidas pelo consumidor, interpretação determinística e conteúdo gerado pela IA**.

## 5.2 Evolução das regras de interpretação

O refinamento funcional, consolidado na versão **1.5**, priorizou a precisão das classificações e a prevenção de interpretações indevidas.

| Situação identificada | Comportamento definido |
|---|---|
| Alergia declarada afirmativamente | Identificação como **POSSÍVEL ALERGIA** |
| Intolerância declarada afirmativamente | Identificação como **POSSÍVEL INTOLERÂNCIA** |
| Exclusão ou preferência sem condição declarada | Preservação da solicitação, sem classificação clínica |
| Declarações simultâneas de alergia e intolerância | Preservação de ambas, com prioridade visual para alergia |
| Informações ambíguas ou insuficientes | Necessidade de esclarecimento ou confirmação humana |

As regras foram refinadas para manter a associação entre ingredientes e itens específicos, inclusive em pedidos com múltiplas modificações.

## 5.3 Controle e responsabilidade da IA

A evolução do sistema também envolveu ajustes nas instruções, na estrutura das respostas e na comunicação entre Gemini e Make, buscando maior consistência no processamento.

O modelo foi direcionado a **sugerir cuidados, não certificar segurança alimentar**. Suas respostas não comprovam disponibilidade de ingredientes, condições operacionais do estabelecimento ou ausência de contato cruzado.

A abordagem combina **IA generativa, lógica determinística e supervisão humana**, estabelecendo limites claros para a automação e uma base para futuras avaliações de qualidade e confiabilidade.

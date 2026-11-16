
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

| Situação identificada | Comportamento definido 
|---|---|
| "Tenho alergia a camarão" | Alergia declarada |
| "Tenho intolerância à lactose" | Intolerância declarada |
| "Sem camarão" | Exclusão de ingrediente, sem inferir alergia |
| "Sem queijo" | Exclusão de ingrediente, sem inferir intolerância |


As regras foram refinadas para manter a associação entre ingredientes e itens específicos, inclusive em pedidos com múltiplas modificações.

## 5.3 Controle e responsabilidade da IA

A evolução do sistema também envolveu ajustes nas instruções, na estrutura das respostas e na comunicação entre Gemini e Make, buscando maior consistência no processamento.

O modelo foi direcionado a **sugerir cuidados, não certificar segurança alimentar**. Suas respostas não comprovam disponibilidade de ingredientes, condições operacionais do estabelecimento ou ausência de contato cruzado.

A abordagem combina **IA generativa, lógica determinística e supervisão humana**, estabelecendo limites claros para a automação e uma base para futuras avaliações de qualidade e confiabilidade.


## 5.4 Refinamento Iterativo e Qualidade das Respostas

O desenvolvimento adotou uma abordagem iterativa de engenharia de prompts, com ajustes progressivos nas instruções do modelo a partir de comportamentos identificados durante os testes.

Os refinamentos priorizaram três critérios:

- **Fidelidade:** preservar informações declaradas, evitando alterações ou inferências indevidas.
- **Relevância contextual:** gerar recomendações específicas para cada solicitação, reduzindo orientações genéricas ou redundantes.
- **Confiabilidade:** reconhecer incertezas, respeitar restrições operacionais e preservar a necessidade de confirmação humana.

Essa evolução estabeleceu uma base para avaliações futuras de consistência, precisão das interpretações e qualidade das recomendações geradas.


## 5.5 Orquestração entre Regras de Negócio e IA Generativa

O SAFE FOOD AI combina regras determinísticas de interpretação com a capacidade generativa do Google Gemini, estabelecendo responsabilidades distintas no processamento das solicitações.

- **Regras de negócio:** orientam a identificação de condições declaradas, a preservação das informações e a aplicação dos critérios de classificação.
- **IA generativa:** produz recomendações contextuais considerando os itens, modificações e necessidades específicas de cada pedido.
- **Supervisão humana:** permanece necessária quando as informações disponíveis não permitem uma orientação suficientemente confiável.

Essa separação reduz a dependência de interpretações exclusivamente generativas e favorece maior previsibilidade, controle e manutenção do produto.


## 5.6 Evolução da Confiabilidade e Integração com IA

A evolução do SAFE FOOD AI incluiu o refinamento do fluxo de processamento para lidar com limitações operacionais de modelos generativos e integrações externas.

Entre os principais desafios técnicos abordados estão:

- **Latência da IA:** identificação de respostas do Gemini que excediam o tempo de espera da aplicação, motivando a adoção de um fluxo assíncrono.
- **Orquestração:** integração entre Next.js, Make, Gemini e Redis para processamento e acompanhamento das solicitações.
- **Resiliência:** tratamento de falhas de comunicação, validação de entradas e respostas e cenários de indisponibilidade.
- **Entrega automatizada:** validação do fluxo demonstrativo até o recebimento de notificações em um WhatsApp de teste.

Essas melhorias representam a evolução de uma funcionalidade generativa para um fluxo de IA integrado a processos de negócio, com maior atenção à confiabilidade e à continuidade operacional.


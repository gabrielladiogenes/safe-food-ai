
# 06 — Testes, Validação e Qualidade

A validação do SAFE FOOD AI foi conduzida de forma incremental, combinando **testes manuais, testes automatizados, cenários funcionais e verificações de integração**.

O processo teve como objetivo avaliar não apenas a execução técnica do MVP, mas também a fidelidade das interpretações, a qualidade das recomendações geradas por IA e a capacidade do sistema de lidar com falhas e situações ambíguas.

A estratégia adotada diferenciou **correção técnica, comportamento funcional e confiabilidade das respostas generativas**, permitindo identificar problemas que não seriam necessariamente detectados por testes tradicionais de software.
 

## 6.1 Evolução da Estratégia de Testes

### Validação manual inicial

Antes da implementação da suíte automatizada com Vitest, o SAFE FOOD AI passou por uma etapa de **3 baterias de 12 testes manuais executados no ambiente de desenvolvimento do VS Code**.

Essa etapa teve como objetivo observar o comportamento real da aplicação, identificar inconsistências e orientar os primeiros refinamentos funcionais.

As verificações contemplaram aspectos como:

- **Interpretação das solicitações:** identificação de informações alimentares declaradas e distinção entre restrições e exclusões de ingredientes.
- **Preservação do contexto:** associação correta entre itens, ingredientes e modificações específicas de cada pedido.
- **Comportamento da IA:** análise da relevância das recomendações geradas e da fidelidade às informações fornecidas.
- **Tratamento de ambiguidades:** identificação de situações que exigiam esclarecimento ou confirmação humana.
- **Fluxo funcional:** observação do processamento das solicitações e da apresentação dos resultados.

Os comportamentos observados contribuíram para o refinamento das regras de negócio e das instruções do modelo, estabelecendo uma base para a posterior estruturação dos testes automatizados.

### Automação e evolução da cobertura

A suíte de testes foi posteriormente estruturada com **Vitest**, ampliando a capacidade de executar verificações reproduzíveis e identificar regressões durante a evolução do código.

A cobertura contemplou regras de interpretação, validação de entradas, proteção das APIs e acompanhamento de solicitações assíncronas.

| Indicador | Resultado registrado |
|---|---|
| Testes automatizados | 37/37 aprovados |
| Framework | Vitest 3.2.7 |
| Verificação TypeScript | Aprovada |
| Build de produção | Aprovado |
| Simulação de indisponibilidade do Redis | Comportamento esperado validado |

A evolução dos testes priorizou três dimensões:

- **Integridade dos dados:** preservação das informações originais do pedido, incluindo ingredientes, quantidades, exclusões e modificações.
- **Consistência das regras:** prevenção de classificações indevidas e validação dos comportamentos definidos para diferentes declarações alimentares.
- **Resiliência operacional:** verificação de respostas a entradas inválidas, falhas de comunicação e indisponibilidade de dependências externas.

A utilização de dependências simuladas permitiu avaliar comportamentos específicos de forma isolada, sem exigir chamadas reais aos serviços externos durante todos os testes.

## 6.2 Validação Funcional e Casos de Uso

A validação funcional contemplou **10 cenários documentados**, incluindo situações com múltiplas instruções, restrições declaradas e pedidos que exigiam interpretação contextual.

O registro consolidado apresentou **quatro cenários aprovados sem ressalvas e seis com ressalvas**, utilizados como referência para novos refinamentos.

| Cenário | Comportamento avaliado |
|---|---|
| Alergia declarada | Identificação da condição sem alterar as informações originais |
| Intolerância declarada | Diferenciação entre intolerância e outras restrições |
| Exclusão de ingrediente | Preservação da exclusão sem inferência clínica |
| Pedidos com múltiplos itens | Associação correta das modificações a cada item |
| Pizza com metades diferentes | Preservação de ingredientes e exclusões específicos de cada metade |
| Solicitações ambíguas | Reconhecimento de informações insuficientes e necessidade de confirmação |

Um dos casos de maior relevância envolveu uma pizza com composições diferentes em cada metade. A IA sugeriu preservar a associação entre ingredientes e partes do pedido, evitando que uma exclusão específica fosse interpretada como uma restrição aplicável ao produto inteiro.

Esse tipo de validação e elovução contribuiu para identificar limitações na interpretação de linguagem natural e orientar refinamentos nas instruções e regras do sistema.


## 6.3 Avaliação das Respostas Generativas

Além da execução das funcionalidades, o processo de testes considerou a qualidade das recomendações produzidas pelo Google Gemini.

A análise foi orientada por quatro critérios:

- **Fidelidade:** correspondência entre a solicitação original e as informações utilizadas na resposta.
- **Relevância:** adequação das orientações ao contexto específico do pedido.
- **Consistência:** respeito às regras de negócio e aos limites estabelecidos para o modelo.
- **Segurança comunicacional:** ausência de garantias indevidas sobre preparo, ingredientes ou prevenção de contato cruzado.

Os comportamentos identificados durante os testes orientaram ajustes iterativos nos prompts, com foco na redução de recomendações genéricas, interpretações incorretas e afirmações excessivamente conclusivas.

Essa avaliação foi qualitativa e orientada por cenários, não constituindo uma certificação estatística.


## 6.4 Testes de Integração e Tratamento de Falhas

O desenvolvimento também envolveu a validação do fluxo demonstrativo entre **Next.js, Make, Google Gemini, GREEN-API e WhatsApp**, incluindo o recebimento de notificações em um ambiente de teste.

Os principais desafios técnicos abordados incluíram:

- **Latência:** identificação de respostas do Gemini que ultrapassavam o tempo de espera da aplicação.
- **Processamento assíncrono:** evolução do fluxo para reduzir a dependência de respostas imediatas de serviços externos.
- **Comunicação entre serviços:** ajustes de autenticação, estrutura de dados e mapeamento das respostas.
- **Indisponibilidade:** verificação do comportamento da aplicação diante de falhas simuladas em dependências externas.

A integração com Redis contribuiu para a estrutura de acompanhamento das solicitações, enquanto os testes automatizados permitiram verificar comportamentos específicos sem depender continuamente dos serviços conectados.


## 6.5 Resultados e Limitações da Validação

O processo de testes contribuiu para a evolução do SAFE FOOD AI em três aspectos principais:

1. **Maior previsibilidade:** consolidação de regras de interpretação e comportamentos esperados.
2. **Melhoria contínua:** utilização de falhas e inconsistências identificadas para orientar ajustes técnicos e refinamentos de prompts.
3. **Confiabilidade operacional:** desenvolvimento de mecanismos de validação e tratamento de falhas em um fluxo integrado de IA.


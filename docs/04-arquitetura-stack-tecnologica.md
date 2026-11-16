
# 04 — Arquitetura e Stack Tecnológica

**SAFE FOOD AI — Estrutura da aplicação, integração de inteligência artificial e automação de processos**

O SAFE FOOD AI foi desenvolvido como uma aplicação web que combina **desenvolvimento de software, interpretação estruturada de informações, inteligência artificial generativa e automação de processos**.

A arquitetura foi concebida para transformar solicitações alimentares individuais em avisos organizados, conectando a interface do consumidor a um fluxo automatizado de processamento e comunicação.

O MVP utiliza uma estrutura modular, separando a experiência do usuário, as regras de interpretação, a comunicação com serviços externos e a apresentação dos resultados. Essa divisão permite compreender as responsabilidades de cada componente, testar comportamentos específicos e identificar oportunidades de evolução.

Este capítulo apresenta a arquitetura implementada, as tecnologias utilizadas, o fluxo de dados, as decisões técnicas e as limitações conhecidas da solução.


---

## 4.1 Visão geral da arquitetura

A arquitetura do SAFE FOOD AI integra quatro camadas principais:

1. **Interface e experiência:** aplicação web responsável pela interação com o consumidor e pela visualização demonstrativa do estabelecimento.
2. **Interpretação e processamento:** regras de negócio e rotas de API responsáveis por estruturar solicitações, validar dados e coordenar o processamento.
3. **Inteligência artificial e automação:** fluxo externo utilizando Make e Google Gemini para gerar orientações complementares.
4. **Comunicação e apresentação:** disponibilização do resultado na interface demonstrativa e envio a um destino de testes no WhatsApp.

O processamento combina regras determinísticas e inteligência artificial generativa. Essa separação busca preservar a fidelidade às informações fornecidas pelo consumidor, enquanto a IA acrescenta orientações contextuais sem assumir decisões que dependem de avaliação humana.

### 4.1.1 Fluxo conceitual

```text
CONSUMIDOR
    |
    v
INTERFACE WEB
Next.js + React + TypeScript
    |
    v
INTERPRETAÇÃO DO PEDIDO
Regras de negócio
    |
    v
API DA APLICAÇÃO
Validação e controle de solicitações
    |
    v
MAKE
Orquestração da automação
    |
    v
GOOGLE GEMINI
Geração de orientações complementares
    |
    v
RESULTADO ESTRUTURADO
    |
    +----> Interface demonstrativa do restaurante
    |
    +----> WhatsApp de teste
```


Esse fluxo representa a arquitetura funcional do protótipo, e não uma integração comercial com restaurantes ou plataformas de delivery.

---


## 4.2 Stack tecnológica

As tecnologias foram utilizadas de acordo com suas responsabilidades no desenvolvimento, processamento, automação, testes e disponibilização do MVP.

| Tecnologia | Categoria | Aplicação no projeto |
|---|---|---|
| <img src="https://cdn.simpleicons.org/nextdotjs" width="22" height="22" alt="Next.js"> **Next.js 16** | Framework web | Estrutura da aplicação, páginas e rotas de API |
| <img src="https://cdn.simpleicons.org/react" width="22" height="22" alt="React"> **React** | Interface | Construção de componentes e gerenciamento da interação |
| <img src="https://cdn.simpleicons.org/typescript" width="22" height="22" alt="TypeScript"> **TypeScript** | Linguagem | Tipagem e organização da lógica da aplicação |
| <img src="https://cdn.simpleicons.org/tailwindcss" width="22" height="22" alt="Tailwind CSS"> **Tailwind CSS** | Estilização | Desenvolvimento da interface visual e responsiva |
| <img src="https://cdn.simpleicons.org/googlegemini" width="22" height="22" alt="Google Gemini"> **Google Gemini** | IA generativa | Geração de orientações complementares para solicitações alimentares |
| <img src="https://cdn.simpleicons.org/make" width="22" height="22" alt="Make"> **Make** | Automação | Orquestração do fluxo entre aplicação, IA e destinos de comunicação |
| <img src="https://cdn.simpleicons.org/zod" width="22" height="22" alt="Zod"> **Zod** | Validação | Validação estruturada dos dados recebidos pela API |
| <img src="https://cdn.simpleicons.org/upstash" width="22" height="22" alt="Upstash"> **Upstash Redis** | Infraestrutura | Controle de solicitações e apoio ao processamento assíncrono |
| <img src="https://cdn.simpleicons.org/vitest" width="22" height="22" alt="Vitest"> **Vitest** | Testes | Execução de testes automatizados |
| <img src="https://cdn.simpleicons.org/vercel" width="22" height="22" alt="Vercel"> **Vercel** | Hospedagem | Deploy da aplicação web |
| <img src="https://cdn.simpleicons.org/git" width="22" height="22" alt="Git"> **Git** / <img src="https://cdn.simpleicons.org/github" width="22" height="22" alt="GitHub"> **GitHub** | Versionamento | Controle de versões e documentação técnica |

O WhatsApp foi utilizado como **destino de testes da comunicação automatizada**,representando uma integração oficial com estabelecimento cadastrados.

---

## 4.3 Arquitetura da aplicação web

O núcleo do SAFE FOOD AI foi construído utilizando Next.js com App Router, React e TypeScript.

Essa combinação permite reunir interface, lógica de aplicação e endpoints de comunicação em um mesmo projeto, mantendo responsabilidades separadas.



### 4.3.1 Front-end

A camada de apresentação é responsável por coletar as informações do consumidor, comunicar o andamento da solicitação e apresentar os resultados disponíveis.

Entre suas responsabilidades estão:

- Coleta dos itens, quantidades, modificações e necessidades informadas.
- Apresentação dos estados de processamento.
- Exibição de mensagens de conclusão ou falha.
- Visualização demonstrativa das informações destinadas ao estabelecimento.

A interface foi desenvolvida considerando os princípios de UX e UI documentados no Capítulo 03.



### 4.3.2 Regras de interpretação

A aplicação possui uma camada de interpretação determinística, separada da geração de texto por IA.

Essa camada estabelece distinções importantes entre preferências, exclusões de ingredientes e condições alimentares declaradas.

Por exemplo, uma solicitação para retirar determinado ingrediente não deve ser automaticamente interpretada como uma declaração de alergia ou intolerância.

Essa decisão reduz a dependência de inferências generativas para classificar informações sensíveis.


### 4.3.3 API e validação

As rotas de API atuam como intermediárias entre a interface e os serviços de automação.

A validação com Zod contribui para verificar a estrutura das informações recebidas antes de encaminhá-las ao fluxo externo.

O projeto também incorpora mecanismos de controle de solicitações e tratamento de estados assíncronos, permitindo acompanhar o processamento sem depender exclusivamente de uma resposta imediata.


---


## 4.4 Integração com inteligência artificial generativa

O Google Gemini participa do fluxo como componente responsável pela geração de orientações complementares relacionadas à solicitação alimentar.

A inteligência artificial atua como uma **camada de cuidado e atenção às particularidades de cada solicitação alimentar**, utilizando o contexto informado pelo consumidor para gerar sugestões preventivas e orientações complementares ao estabelecimento.

Independentemente do alimento solicitado, a IA busca identificar oportunidades de cuidado durante o preparo, a montagem, a identificação, a embalagem e o transporte, considerando as especificidades de cada pedido.

Sua abordagem foi projetada para priorizar uma comunicação **atenciosa, personalizada e responsável**, valorizando as necessidades individuais do consumidor sem substituir a avaliação humana ou os protocolos de segurança alimentar do estabelecimento.


### 4.4.1 Separação entre regras e geração

Uma decisão central da arquitetura foi distinguir dois tipos de processamento:

**Processamento determinístico:** aplica regras explícitas para interpretar informações declaradas e preservar distinções importantes, como exclusões de ingredientes e condições alimentares afirmativamente informadas.

**Processamento generativo:** utiliza o contexto estruturado para produzir orientações complementares relacionadas ao preparo, à montagem, à identificação, à embalagem e ao transporte.

Essa divisão permite utilizar a flexibilidade da IA sem delegar integralmente a ela a interpretação de informações críticas.

 
### 4.4.2 Limites da inteligência artificial

O resultado gerado não constitui confirmação de que o restaurante possui os ingredientes adequados, dispõe de condições apropriadas de preparo ou consegue evitar contato cruzado.

Quando informações são insuficientes ou dependem das condições reais do estabelecimento, a comunicação deve preservar a necessidade de confirmação humana.

Os critérios de interpretação, as instruções utilizadas e os mecanismos de avaliação da IA serão aprofundados no Capítulo 05.

 
---

## 4.5 Automação e comunicação entre serviços

O Make foi utilizado para conectar a aplicação ao processamento generativo e aos destinos de comunicação demonstrativos.

A integração permite que uma solicitação iniciada na interface percorra um fluxo automatizado, reduzindo a necessidade de transferir manualmente informações entre sistemas.

 
### 4.5.1 Orquestração

O fluxo de automação contempla o recebimento das informações encaminhadas pela aplicação, o processamento com Gemini e a comunicação dos resultados.

A integração foi testada de ponta a ponta em ambiente de demonstração, incluindo a apresentação do resultado na aplicação e seu encaminhamento a um WhatsApp de teste.

Isso demonstra a comunicação entre diferentes componentes, mas não equivale à operação pública com restaurantes reais.

---

## 4.6 Persistência e gerenciamento de solicitações

O MVP foi desenvolvido sem exigir cadastro, autenticação do consumidor ou manutenção de um perfil alimentar permanente.

Cada solicitação possui contexto próprio, evitando que preferências ou exclusões informadas em um pedido sejam automaticamente aplicadas a solicitações futuras.

A infraestrutura utiliza Upstash Redis como apoio ao gerenciamento de solicitações e ao processamento assíncrono.

Essa utilização não deve ser confundida com a criação de um histórico alimentar persistente para o consumidor.

O comportamento de armazenamento e retenção dos serviços externos precisa ser considerado separadamente na avaliação de privacidade do sistema.

---

## 4.7 Deploy e ambiente de desenvolvimento

O desenvolvimento foi realizado em ambiente local, com utilização de VS CODE, ferramentas de programação, testes e versionamento.

A aplicação foi disponibilizada por meio da **Vercel**, permitindo acessar e demonstrar o MVP em ambiente web.

 
---


## 4.8 Decisões arquiteturais e justificativas

As principais decisões técnicas refletem o objetivo de construir um MVP funcional, demonstrável e com responsabilidades identificáveis.

| Decisão | Justificativa |
|---|---|
| Aplicação web com Next.js | Reunir interface e rotas de aplicação em uma estrutura integrada |
| TypeScript | Favorecer organização e consistência dos dados |
| Interpretação determinística | Evitar que classificações críticas dependam apenas de inferência generativa |
| Gemini para orientações complementares | Utilizar IA generativa em uma função delimitada |
| Make para automação | Conectar componentes e serviços externos |
| Processamento assíncrono | Lidar com a duração variável das operações externas |
| Solicitações independentes | Evitar pressupor preferências permanentes do consumidor |
| Simulação de restaurante e WhatsApp de teste | Demonstrar o fluxo sem depender de integração comercial |

Essas escolhas priorizaram a construção de uma solução verificável dentro do escopo do MVP.


## 4.11 Síntese técnica

O SAFE FOOD AI demonstra a integração entre **desenvolvimento web, regras de negócio, inteligência artificial generativa, APIs e automação de processos** em uma solução voltada a um problema de comunicação alimentar.

A arquitetura procura estabelecer limites claros entre informações declaradas pelo consumidor, interpretação estruturada, orientações produzidas por IA e decisões que permanecem sob responsabilidade humana.

Mais do que conectar ferramentas, o desenvolvimento envolveu decisões sobre separação de responsabilidades, tratamento de erros, experiência do usuário e delimitação do papel da inteligência artificial.

 

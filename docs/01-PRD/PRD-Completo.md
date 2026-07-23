# PRD Completo — Diário Inteligente: Pesquisa de Convocação
**Sistema Inteligente de Monitoramento de Diários Oficiais para Concursos Públicos**

**Versão:** 1.0  
**Data:** Julho/2026  
**Autor:** Jucivaldo Souza dos Santos  
**Status:** Em planejamento  

---

## Sumário

1. [Visão Geral](#1-visão-geral)
2. [Problema a Resolver](#2-problema-a-resolver)
3. [Objetivos do Produto](#3-objetivos-do-produto)
4. [Público-Alvo](#4-público-alvo)
5. [Personas](#5-personas)
6. [Funcionalidades Detalhadas](#6-funcionalidades-detalhadas)
7. [Regras de Negócio](#7-regras-de-negócio)
8. [Requisitos Funcionais](#8-requisitos-funcionais)
9. [Requisitos Não-Funcionais](#9-requisitos-não-funcionais)
10. [Casos de Uso](#10-casos-de-uso)
11. [Jornada do Usuário](#11-jornada-do-usuário)
12. [Diários Monitorados](#12-diários-monitorados)
13. [Módulos do Sistema](#13-módulos-do-sistema)
14. [Integrações Externas](#14-integrações-externas)
15. [Limitações e Restrições](#15-limitações-e-restrições)
16. [Métricas de Sucesso](#16-métricas-de-sucesso)
17. [Roadmap](#17-roadmap)
18. [Riscos e Mitigações](#18-riscos-e-mitigações)
19. [Glossário](#19-glossário)

---

## 1. Visão Geral

### 1.1 Descrição do Produto

O **Diário Inteligente** é um sistema web de monitoramento automatizado de Diários Oficiais desenvolvido para candidatos de concursos públicos. O sistema realiza buscas diárias e automáticas em Diários Oficiais, identifica citações relevantes ao usuário e envia notificações imediatas, eliminando a necessidade de consultas manuais em centenas de páginas de PDFs.

### 1.2 Proposta de Valor

| Problema Atual | Solução Proposta |
|---|---|
| Verificar manualmente dezenas de PDFs por dia | Sistema automatizado que faz isso em segundos |
| Perder prazos de convocação por não ver o diário | Notificação imediata via Telegram e e-mail |
| Buscar em páginas confusas de portais | Interface limpa e intuitiva |
| Histórico perdido de pesquisas passadas | Histórico permanente com busca retroativa |
| Difícil entender o contexto de uma citação | Resumo gerado por IA explicando o trecho |

### 1.3 Missão

> "Garantir que nenhum candidato perca uma convocação, nomeação ou prazo importante por falta de monitoramento dos Diários Oficiais."

### 1.4 Visão

Tornar-se a principal plataforma de monitoramento de Diários Oficiais do Brasil, atendendo concurseiros, advogados, contadores e empresas com cobertura de todos os estados.

---

## 2. Problema a Resolver

### 2.1 Contexto

No Brasil, todos os atos administrativos de efeito público são obrigatoriamente publicados nos Diários Oficiais (federal, estaduais e municipais). Para candidatos de concursos públicos, isso significa que convocações, nomeações, eliminações, recursos e outros atos são publicados exclusivamente nesses documentos.

### 2.2 Dor do Usuário

**Situação atual:**
- O candidato precisa acessar diariamente os portais dos Diários Oficiais
- Baixar PDFs que podem ter centenas de páginas
- Buscar manualmente seu nome em cada documento
- Repetir esse processo para diferentes diários (federal, estadual, municipal, da justiça, etc.)
- Sem garantia de que não perdeu nenhuma edição

**Consequências:**
- Perda de prazos para apresentação de documentos
- Eliminação por não comparecimento à posse
- Perda de vagas em concursos aprovados
- Stress e ansiedade diários
- Tempo desperdiçado em pesquisas manuais

### 2.3 Dados do Problema

- Um candidato típico participa de **5 a 20 concursos simultâneos**
- O Diário Oficial da Bahia pode ter **50 a 300 páginas por edição**
- O Diário Oficial da União pode ter **200 a 500 páginas por edição**
- São publicadas edições **todos os dias úteis**
- Prazos de apresentação geralmente são de **15 a 30 dias**
- Uma convocação não vista pode significar **perda da vaga definitivamente**

---

## 3. Objetivos do Produto

### 3.1 Objetivos Primários

- **OBJ-01:** Automatizar o download diário de Diários Oficiais
- **OBJ-02:** Extrair e indexar texto de todos os PDFs baixados
- **OBJ-03:** Pesquisar automaticamente o nome e dados do usuário
- **OBJ-04:** Enviar notificação imediata quando encontrar resultado
- **OBJ-05:** Manter histórico completo de todas as pesquisas

### 3.2 Objetivos Secundários

- **OBJ-06:** Fornecer resumo em linguagem natural do trecho encontrado
- **OBJ-07:** Permitir busca retroativa em diários anteriores
- **OBJ-08:** Possibilitar visualização do PDF diretamente na página encontrada
- **OBJ-09:** Dashboard com estatísticas e status do sistema

### 3.3 Objetivos de Negócio (Versão Futura)

- Escalar para múltiplos usuários com plano de assinatura
- Cobrir todos os estados brasileiros
- Oferecer API para integrações

---

## 4. Público-Alvo

### 4.1 Versão 1.0 — Uso Pessoal

**Perfil:** Candidato a concursos públicos que participou de múltiplos processos seletivos e precisa monitorar seus resultados diariamente.

**Características:**
- Nome: Jucivaldo Souza dos Santos
- Concursos participados: TJBA, Polícia Civil BA, INSS, Correios, EMBASA, IBGE, Receita Federal
- Acesso: Computador desktop e smartphone
- Familiaridade técnica: Intermediária

### 4.2 Versões Futuras

| Perfil | Necessidade |
|---|---|
| Concurseiros em geral | Monitorar múltiplos concursos |
| Advogados | Monitorar publicações processuais |
| Contadores | Monitorar atos societários e fiscais |
| Empresas | Monitorar licitações e contratos |
| Órgãos Públicos | Monitorar publicações próprias |

---

## 5. Personas

### 5.1 Persona Principal — O Concurseiro Dedicado

**Nome:** Jucivaldo  
**Idade:** 35 anos  
**Profissão:** Servidor público em cargo temporário  
**Objetivo:** Ser aprovado em um concurso efetivo

**Contexto:**
- Participa de 10+ concursos simultaneamente
- Dedica 4h por dia aos estudos
- Acessa o computador todos os dias pela manhã
- Usa Telegram como principal canal de comunicação

**Frustrações:**
- "Todo dia tenho que lembrar de verificar o diário manualmente"
- "Já quase perdi um prazo por ter esquecido de olhar"
- "Os PDFs são enormes e difíceis de navegar"

**Motivações:**
- Não perder nenhuma convocação
- Ter tranquilidade durante os estudos
- Receber alertas automáticos

**Citação:**
> "Quero acordar e receber no celular uma notificação se meu nome aparecer em algum diário. Não quero mais ficar preocupado com isso enquanto estudo."

---

## 6. Funcionalidades Detalhadas

### 6.1 Módulo de Cadastro

#### 6.1.1 Dados Pessoais
O usuário cadastra seus dados de identificação que serão usados nas pesquisas:

**Campos obrigatórios:**
- Nome completo (ex: Jucivaldo Souza dos Santos)

**Campos opcionais:**
- CPF (formatado: 000.000.000-00)
- RG
- E-mail para notificação
- Token do bot Telegram

**Variações de nome geradas automaticamente:**
O sistema gera automaticamente as seguintes variações para pesquisa:
1. Nome completo: `Jucivaldo Souza dos Santos`
2. Primeiro nome + sobrenome: `Jucivaldo Santos`
3. Primeiro nome: `Jucivaldo`
4. Últimos sobrenomes: `Souza dos Santos`
5. Nome abreviado: `J. Souza dos Santos`
6. Iniciais: `J. S. Santos`

O usuário pode adicionar variações personalizadas adicionais.

#### 6.1.2 Configurações de Pesquisa
- Horário diário de execução (padrão: 06:00)
- Frequência alternativa (a cada 6h, 12h)
- Diários a monitorar (seleção múltipla)

### 6.2 Módulo de Concursos

#### 6.2.1 Cadastro de Concurso
Cada concurso contém os seguintes campos:

| Campo | Tipo | Obrigatoriedade |
|---|---|---|
| Nome do órgão | Texto | Obrigatório |
| Cargo pleiteado | Texto | Obrigatório |
| Ano do concurso | Número | Obrigatório |
| Situação atual | Enum | Obrigatório |
| Número de inscrição | Texto | Opcional |
| Banca organizadora | Texto | Opcional |
| Edital (link) | URL | Opcional |
| Observações | Texto longo | Opcional |
| Ativo? | Boolean | Obrigatório |

**Situações possíveis:**
- Aguardando resultado
- Classificado — aguardando convocação
- Convocado
- Em posse
- Eliminado
- Encerrado

**Concursos pré-cadastrados para o usuário:**
- TJBA (Tribunal de Justiça da Bahia)
- Polícia Civil BA
- INSS
- Correios (ECT)
- EMBASA
- IBGE
- Receita Federal (ESAF/CEBRASPE)

#### 6.2.2 Pesquisa por Período
Alternativa ao cadastro manual: o usuário informa um período (ex: 2023 a 2025) e o sistema usa as palavras-chave e o nome para identificar menções automaticamente.

### 6.3 Módulo de Palavras-chave

#### 6.3.1 Palavras-chave Padrão (pré-configuradas)
- Convocação
- Nomeação
- Homologação
- Resultado Final
- Posse
- Cadastro Reserva
- Classificação
- Eliminação
- Recursos
- Prazo
- Aprovado
- Habilitado

#### 6.3.2 Gerenciamento de Palavras-chave
- Adicionar novas palavras
- Desativar palavras sem excluir
- Excluir permanentemente
- Definir prioridade (alta, média, baixa)
- Categorizar por tipo (positivo, negativo, neutro)

### 6.4 Módulo de Download de Diários

#### 6.4.1 Fontes de Download

**Diário Oficial da Bahia (DOBA):**
- URL base: `https://www.diariooficial.ba.gov.br/`
- Formato: PDF
- Publicação: Dias úteis, geralmente entre 05:00 e 08:00
- Edições especiais: quando necessário

**Diário Oficial da União (DOU):**
- URL base: `https://www.in.gov.br/`
- Seções: Seção 1, Seção 2, Seção 3, Extra
- Formato: PDF + HTML (Inquerido)
- Publicação: Dias úteis

#### 6.4.2 Fluxo de Download
```
Verificar URL do dia
  → URL acessível?
    → Sim: Baixar PDF
      → Salvar em storage local
      → Registrar metadados (data, tamanho, páginas)
    → Não: Registrar log de erro
      → Tentar novamente em 30min (até 3 tentativas)
      → Alertar usuário se falhar todas
```

#### 6.4.3 Armazenamento
- PDFs armazenados em pasta local organizada por data
- Metadados salvos no banco de dados
- Limpeza automática configurável (ex: manter últimos 90 dias)

### 6.5 Módulo de Extração de Texto (OCR)

#### 6.5.1 Processo de Extração

**Fase 1 — Extração direta (PyMuPDF / pdfplumber):**
- Tenta extrair texto diretamente do PDF
- Funciona para PDFs com texto selecionável
- Rápido: ~1-5 segundos por página

**Fase 2 — OCR (Tesseract):**
- Acionado quando a extração direta retorna texto vazio ou ininteligível
- Converte página em imagem e aplica OCR
- Mais lento: ~5-30 segundos por página
- Necessário para PDFs escaneados

**Fase 3 — Pós-processamento:**
- Normalização de espaços e quebras de linha
- Correção de erros comuns de OCR (ex: "0" por "O")
- Indexação por página e posição

#### 6.5.2 Controle de Qualidade
- Pontuação de confiança do OCR por página
- Páginas com baixa confiança são marcadas para revisão manual
- Log de erros de extração

### 6.6 Módulo de Pesquisa

#### 6.6.1 Algoritmo de Busca

**Nível 1 — Correspondência Exata:**
- Busca exata do nome completo
- Sensibilidade a acentos configurável
- Case-insensitive

**Nível 2 — Correspondência por Variações:**
- Todas as variações do nome geradas
- Variações personalizadas do usuário
- CPF nos formatos: 000.000.000-00 e 00000000000

**Nível 3 — Busca por Proximidade:**
- Nome + palavra-chave na mesma frase
- Nome + concurso na mesma frase
- Tolerância a erros de digitação (distância Levenshtein ≤ 2)

**Nível 4 — Busca Contextual:**
- Seções do diário relacionadas ao cargo
- Blocos de convocação por órgão

#### 6.6.2 Scoring dos Resultados
Cada resultado recebe uma pontuação:
- Nome exato encontrado: 100 pontos
- Palavra-chave na mesma frase: +30 pontos
- Concurso mencionado próximo: +20 pontos
- CPF encontrado: +50 pontos
- Resultado: relevância (alta/média/baixa)

### 6.7 Módulo de Histórico

#### 6.7.1 Dados Registrados por Pesquisa
- Data e hora da execução
- Diário pesquisado
- Número de páginas analisadas
- Tempo de execução
- Resultados encontrados (sim/não)
- Detalhes de cada resultado

#### 6.7.2 Dados por Resultado
- Diário de origem
- Data da edição
- Número de página
- Trecho encontrado (contexto de 300 caracteres)
- Palavra-chave que ativou o alerta
- Nível de relevância
- Status da notificação enviada
- Resumo gerado pela IA

### 6.8 Módulo de Notificações

#### 6.8.1 Telegram
**Configuração:**
- Criar bot via @BotFather
- Obter token do bot
- Obter chat_id do usuário

**Formato da mensagem:**
```
🚨 ALERTA — DIÁRIO INTELIGENTE

📰 Diário: Diário Oficial da Bahia
📅 Edição: 22/07/2026
📄 Página: 52
🔍 Palavra-chave: Convocação

Trecho encontrado:
"...Jucivaldo Souza dos Santos, CPF 000.000.000-00, 
fica CONVOCADO para apresentação de documentos..."

⏱️ Prazo: 30 dias a partir desta data.

🔗 Ver PDF completo: [link]
📊 Ver no sistema: [link]
```

#### 6.8.2 E-mail
**Formato:** HTML responsivo com:
- Cabeçalho com nome do sistema e alerta visual
- Detalhes do resultado (diário, data, página)
- Trecho encontrado destacado
- Resumo da IA
- Botão de acesso ao sistema
- Botão de download do PDF

#### 6.8.3 Controle de Notificações
- Evitar duplicatas (mesmo resultado, mesma edição)
- Limite de notificações por dia (configurável)
- Modo silencioso por período (ex: fins de semana)
- Histórico de todas as notificações enviadas

### 6.9 Módulo de Resumo por IA

#### 6.9.1 Funcionamento
Quando um resultado é encontrado, a IA analisa o trecho e gera um resumo em linguagem simples:

**Entrada:** Trecho de 500-2000 caracteres do diário

**Saída esperada:**
```
✅ Foi localizada uma CONVOCAÇÃO com seu nome.

📋 Resumo:
Você foi convocado para apresentação de documentos 
para o cargo de [cargo] no [órgão].

⏰ Prazo: 30 dias a partir de 22/07/2026 
         (até 21/08/2026)

📎 Documentos solicitados:
• RG (original e cópia)
• CPF (original e cópia)  
• Comprovante de residência
• Diploma ou certificado de escolaridade

📍 Local de apresentação:
[endereço mencionado no diário]

⚠️ Atenção:
[outros alertas ou condições]
```

#### 6.9.2 Integração com IA
- Utilizar API da OpenAI (GPT-4o-mini para custo-benefício)
- Prompt otimizado para diários oficiais brasileiros
- Fallback: Groq API ou Google Gemini

### 6.10 Dashboard

#### 6.10.1 Cards de Status
- **Total de pesquisas realizadas** — contador desde o início
- **Resultados encontrados** — total de matches
- **Último diário analisado** — nome + data
- **Próxima verificação** — countdown para próxima execução
- **PDFs baixados** — total e tamanho em GB
- **Status do sistema** — online/offline/processando

#### 6.10.2 Linha do Tempo
- Gráfico de pesquisas por dia (últimos 30 dias)
- Marcação visual de dias com resultados

#### 6.10.3 Últimos Resultados
- Lista dos 5 últimos resultados encontrados
- Acesso rápido para visualização

---

## 7. Regras de Negócio

### 7.1 Regras de Download

| ID | Regra |
|---|---|
| RN-01 | O sistema tentará baixar o diário diariamente às 06:00 |
| RN-02 | Se o diário não estiver disponível às 06:00, tentará novamente às 07:00 e 08:00 |
| RN-03 | Após 3 tentativas falhas, o sistema enviará notificação de falha ao usuário |
| RN-04 | Diários já baixados não serão baixados novamente (verificação por hash) |
| RN-05 | Fins de semana e feriados nacionais não haverá download (exceto se configurado) |

### 7.2 Regras de Pesquisa

| ID | Regra |
|---|---|
| RN-06 | A pesquisa será executada logo após a conclusão do download |
| RN-07 | A pesquisa manual pode ser executada a qualquer momento pelo usuário |
| RN-08 | Resultados duplicados (mesmo diário, mesma página, mesmo nome) não serão duplicados no banco |
| RN-09 | Variações de nome devem ter pelo menos 4 caracteres para evitar falsos positivos |
| RN-10 | O sistema deve preservar o contexto de 300 caracteres antes e depois de cada match |

### 7.3 Regras de Notificação

| ID | Regra |
|---|---|
| RN-11 | Notificações só são enviadas quando um novo resultado é encontrado |
| RN-12 | O mesmo resultado não deve gerar mais de uma notificação |
| RN-13 | O usuário pode desativar notificações temporariamente |
| RN-14 | Em caso de falha na notificação, o sistema deve retentar 3 vezes com intervalo de 5 minutos |

### 7.4 Regras de Dados

| ID | Regra |
|---|---|
| RN-15 | CPF deve ser armazenado criptografado |
| RN-16 | PDFs devem ser armazenados em pasta segura, não acessível publicamente |
| RN-17 | O histórico de pesquisas deve ser mantido indefinidamente (exceto se o usuário excluir) |
| RN-18 | Logs do sistema devem ser mantidos por 30 dias |

---

## 8. Requisitos Funcionais

### 8.1 Autenticação

| ID | Requisito |
|---|---|
| RF-001 | O sistema deve permitir login com e-mail e senha |
| RF-002 | O sistema deve suportar autenticação via Google OAuth |
| RF-003 | O sistema deve ter recuperação de senha por e-mail |
| RF-004 | Sessão deve expirar após 24 horas de inatividade |
| RF-005 | O sistema deve suportar múltiplas sessões simultâneas |

### 8.2 Cadastro e Perfil

| ID | Requisito |
|---|---|
| RF-010 | O usuário deve poder cadastrar nome completo |
| RF-011 | O sistema deve gerar automaticamente variações do nome |
| RF-012 | O usuário deve poder adicionar/remover variações de nome |
| RF-013 | O usuário deve poder cadastrar CPF (opcional) |
| RF-014 | O usuário deve poder configurar Telegram (opcional) |
| RF-015 | O usuário deve poder configurar e-mail de notificação |

### 8.3 Concursos

| ID | Requisito |
|---|---|
| RF-020 | O usuário deve poder cadastrar concursos manualmente |
| RF-021 | O usuário deve poder editar dados de um concurso |
| RF-022 | O usuário deve poder desativar/reativar um concurso |
| RF-023 | O usuário deve poder excluir um concurso |
| RF-024 | O sistema deve permitir filtrar concursos por situação |
| RF-025 | O sistema deve exibir lista de concursos com status |

### 8.4 Palavras-chave

| ID | Requisito |
|---|---|
| RF-030 | O sistema deve ter palavras-chave padrão pré-configuradas |
| RF-031 | O usuário deve poder adicionar novas palavras-chave |
| RF-032 | O usuário deve poder desativar palavras-chave |
| RF-033 | O usuário deve poder excluir palavras-chave |

### 8.5 Download e Extração

| ID | Requisito |
|---|---|
| RF-040 | O sistema deve baixar automaticamente os diários configurados |
| RF-041 | O sistema deve extrair texto dos PDFs |
| RF-042 | O sistema deve aplicar OCR quando necessário |
| RF-043 | O sistema deve registrar metadados dos PDFs baixados |
| RF-044 | O sistema deve exibir progresso do download em tempo real |

### 8.6 Pesquisa

| ID | Requisito |
|---|---|
| RF-050 | O sistema deve pesquisar automaticamente após cada download |
| RF-051 | O usuário deve poder iniciar pesquisa manual a qualquer momento |
| RF-052 | O sistema deve pesquisar por todas as variações de nome configuradas |
| RF-053 | O sistema deve registrar todos os resultados encontrados |
| RF-054 | O sistema deve permitir busca retroativa por período |
| RF-055 | O sistema deve exibir o trecho contextual de cada resultado |

### 8.7 Notificações

| ID | Requisito |
|---|---|
| RF-060 | O sistema deve enviar notificação via Telegram quando encontrar resultado |
| RF-061 | O sistema deve enviar notificação por e-mail quando encontrar resultado |
| RF-062 | O sistema deve registrar histórico de notificações enviadas |
| RF-063 | O usuário deve poder ativar/desativar cada canal de notificação |

### 8.8 Histórico e Visualização

| ID | Requisito |
|---|---|
| RF-070 | O sistema deve exibir histórico completo de pesquisas |
| RF-071 | O sistema deve permitir filtrar histórico por data, diário e resultado |
| RF-072 | O sistema deve exibir resumo gerado pela IA para cada resultado |
| RF-073 | O sistema deve permitir visualizar o PDF na página do resultado |
| RF-074 | O sistema deve destacar o nome encontrado no PDF |
| RF-075 | O sistema deve permitir download do PDF |

---

## 9. Requisitos Não-Funcionais

### 9.1 Performance

| ID | Requisito | Meta |
|---|---|---|
| RNF-001 | Tempo de resposta da interface | < 2 segundos |
| RNF-002 | Tempo de extração por página (texto nativo) | < 5 segundos |
| RNF-003 | Tempo de extração por página (OCR) | < 30 segundos |
| RNF-004 | Tempo total de pesquisa em diário de 100 páginas | < 10 minutos |
| RNF-005 | Delay máximo para envio de notificação | < 1 minuto após encontrar resultado |

### 9.2 Disponibilidade

| ID | Requisito | Meta |
|---|---|---|
| RNF-010 | Disponibilidade do sistema | 99% (uso pessoal) |
| RNF-011 | O sistema deve funcionar mesmo com internet lenta | Timeout de 60s por PDF |
| RNF-012 | Reinicialização automática em caso de erro | Background job reinicia em 5min |

### 9.3 Segurança

| ID | Requisito |
|---|---|
| RNF-020 | Senhas armazenadas com bcrypt (salt rounds ≥ 12) |
| RNF-021 | CPF armazenado criptografado (AES-256) |
| RNF-022 | Comunicação via HTTPS |
| RNF-023 | Tokens de API armazenados como variáveis de ambiente |
| RNF-024 | PDFs armazenados fora do diretório público |
| RNF-025 | Rate limiting nas rotas de autenticação |

### 9.4 Usabilidade

| ID | Requisito |
|---|---|
| RNF-030 | Interface responsiva (desktop, tablet, mobile) |
| RNF-031 | Suporte a tema claro e escuro |
| RNF-032 | Mensagens de erro claras e compreensíveis em PT-BR |
| RNF-033 | Feedback visual para todas as ações do usuário |
| RNF-034 | Carregamento progressivo para listas longas |

### 9.5 Manutenibilidade

| ID | Requisito |
|---|---|
| RNF-040 | Código documentado com docstrings |
| RNF-041 | Testes automatizados com cobertura ≥ 70% |
| RNF-042 | Logs estruturados (JSON) para todas as operações críticas |
| RNF-043 | Variáveis de configuração centralizadas em .env |

---

## 10. Casos de Uso

### UC-01 — Verificação Diária Automática

**Ator:** Sistema (automatizado)  
**Trigger:** Cron job às 06:00  
**Fluxo principal:**
1. Sistema verifica horário configurado
2. Identifica diários a monitorar (DOBA, DOU)
3. Para cada diário:
   a. Verifica se edição do dia já existe no banco
   b. Se não existe, baixa o PDF
   c. Extrai texto do PDF
   d. Executa pesquisa com todas as configurações do usuário
   e. Salva resultados
   f. Envia notificações se houver resultados
4. Atualiza dashboard com resultados da pesquisa
5. Registra log da execução

**Fluxo alternativo — Diário indisponível:**
1. Sistema registra tentativa falha
2. Agenda nova tentativa em 1 hora
3. Após 3 tentativas, envia notificação de falha

### UC-02 — Pesquisa Manual

**Ator:** Usuário  
**Trigger:** Usuário clica em "Pesquisar Agora"  
**Fluxo principal:**
1. Usuário acessa dashboard
2. Clica em "Pesquisar Agora"
3. Seleciona período ou diário específico (opcional)
4. Sistema inicia pesquisa imediata
5. Interface exibe progresso em tempo real
6. Sistema exibe resultados ao final

### UC-03 — Configuração de Alerta

**Ator:** Usuário  
**Trigger:** Usuário acessa Configurações > Notificações  
**Fluxo principal:**
1. Usuário informa token do bot Telegram
2. Sistema envia mensagem de teste
3. Usuário confirma recebimento
4. Sistema salva configuração
5. A partir daí, todos os alertas são enviados via Telegram

### UC-04 — Visualização de Resultado

**Ator:** Usuário  
**Trigger:** Usuário clica em resultado no histórico  
**Fluxo principal:**
1. Usuário acessa Histórico
2. Clica em um resultado
3. Sistema exibe:
   - Trecho contextual destacado
   - Resumo gerado pela IA
   - Visualizador do PDF na página correta
   - Botão de download
4. Usuário pode navegar pelas páginas do PDF

### UC-05 — Pesquisa Retroativa

**Ator:** Usuário  
**Trigger:** Usuário seleciona período para reprocessar  
**Fluxo principal:**
1. Usuário acessa Pesquisa > Retroativa
2. Seleciona período (ex: últimos 30 dias)
3. Seleciona diários a incluir
4. Sistema identifica PDFs já baixados nesse período
5. Executa pesquisa em todos eles
6. Exibe resultados agrupados por data

---

## 11. Jornada do Usuário

### 11.1 Primeiro Acesso

```
Acessar sistema
    ↓
Criar conta (e-mail + senha)
    ↓
Tela de boas-vindas
    ↓
Assistente de configuração inicial:
    Passo 1: Informar nome completo
    Passo 2: Revisar variações geradas
    Passo 3: Adicionar concursos
    Passo 4: Configurar Telegram (opcional)
    Passo 5: Definir horário de pesquisa
    ↓
Dashboard principal
    ↓
Executar primeira pesquisa manual
    ↓
Ver resultados (ou "Nenhum resultado")
    ↓
Sistema em modo automático
```

### 11.2 Uso Diário

```
07:00 — Usuário acorda
    ↓
Verificar celular — notificação Telegram?
    ↓
Sim → Ver detalhes → Providenciar documentos
    ↓
Não → Confirmar no dashboard que pesquisa foi executada
    ↓
Continuar estudos com tranquilidade
```

---

## 12. Diários Monitorados

### 12.1 Versão 1.0

| Diário | Sigla | URL | Frequência | Formato |
|---|---|---|---|---|
| Diário Oficial do Estado da Bahia | DOBA | diariooficial.ba.gov.br | Dias úteis | PDF |
| Diário Oficial da União | DOU | in.gov.br | Dias úteis | PDF |

### 12.2 Versão 2.0 (Planejado)

| Diário | Sigla |
|---|---|
| Diário da Justiça do Trabalho (TRT 5ª Região) | DJe-TRT5 |
| Diário do TCE-BA | DTCE |
| Diário do MP-BA | DMP |
| Diário dos Municípios Baianos | DMB |
| Diário da Câmara | DIAP |

---

## 13. Módulos do Sistema

```
┌─────────────────────────────────────────────┐
│              DIÁRIO INTELIGENTE              │
├──────────────┬──────────────────────────────┤
│  FRONTEND    │         BACKEND               │
│  (Next.js)   │         (FastAPI)             │
├──────────────┼──────────────────────────────┤
│ Dashboard    │ Módulo Download               │
│ Histórico    │ Módulo OCR/Extração           │
│ Concursos    │ Módulo Pesquisa               │
│ Configuração │ Módulo Notificações           │
│ Visualizador │ Módulo IA (Resumo)            │
│ Perfil       │ Scheduler (APScheduler)       │
└──────────────┴──────────────────────────────┘
         │                    │
         └────────────────────┘
                    │
         ┌──────────────────────┐
         │   Supabase/PostgreSQL │
         │   Storage (PDFs)      │
         └──────────────────────┘
```

---

## 14. Integrações Externas

| Serviço | Finalidade | Versão |
|---|---|---|
| Telegram Bot API | Notificações push | V1 |
| SendGrid / SMTP | E-mail de alertas | V1 |
| OpenAI API | Resumo de resultados | V1 |
| Tesseract OCR | Extração de texto de PDFs escaneados | V1 |
| Supabase | Banco de dados + autenticação | V1 |
| Google OAuth | Login social | V2 |
| WhatsApp Cloud API | Notificações WhatsApp | V2 |

---

## 15. Limitações e Restrições

### 15.1 Limitações Técnicas
- PDFs com DRM (proteção) não podem ser processados
- OCR tem ~85-95% de precisão em documentos escaneados de baixa qualidade
- Portais que requerem CAPTCHA para download precisam de solução alternativa
- Alguns diários publicam edições com atraso (às vezes no dia seguinte)

### 15.2 Limitações Legais
- O sistema acessa apenas conteúdo público dos diários
- Não há scraping de conteúdo protegido por direitos autorais
- Dados pessoais do usuário são usados apenas para as buscas configuradas

### 15.3 Restrições de Escopo (V1)
- Apenas uso pessoal (1 usuário)
- Apenas DOBA e DOU
- Sem aplicativo mobile nativo (apenas web responsiva)
- Sem múltiplos perfis de busca

---

## 16. Métricas de Sucesso

| Métrica | Meta | Forma de Medir |
|---|---|---|
| Taxa de detecção | 99% dos resultados relevantes encontrados | Teste manual periódico |
| Falsos positivos | < 5% dos alertas | Acompanhar retornos do usuário |
| Tempo de notificação | < 30 min após publicação do diário | Log de timestamps |
| Disponibilidade | 99% dos dias úteis | Log de execuções |
| Satisfação pessoal | "Não preciso mais verificar manualmente" | Uso diário |

---

## 17. Roadmap

### Versão 1.0 — MVP Pessoal (3-4 semanas)
- [x] Setup do ambiente
- [ ] Autenticação básica
- [ ] Cadastro de perfil e concursos
- [ ] Download automático DOBA e DOU
- [ ] Extração de texto (PyMuPDF + pdfplumber)
- [ ] Pesquisa por nome e variações
- [ ] Notificação Telegram
- [ ] Dashboard básico
- [ ] Histórico de pesquisas

### Versão 1.1 — Melhorias (2-3 semanas)
- [ ] OCR com Tesseract para PDFs escaneados
- [ ] Resumo por IA
- [ ] Visualizador de PDF embutido
- [ ] Busca retroativa
- [ ] Notificação por e-mail
- [ ] Tema escuro

### Versão 2.0 — Multi-usuário (2-3 meses)
- [ ] Sistema de autenticação robusto
- [ ] Planos de assinatura
- [ ] Mais diários (TRT, TCE, MP)
- [ ] API pública
- [ ] App Android (React Native ou PWA)

### Versão 3.0 — IA Avançada (6+ meses)
- [ ] Leitura e interpretação de editais
- [ ] Monitoramento de bancas organizadoras
- [ ] Monitoramento de portais de concursos
- [ ] Reconhecimento de documentos
- [ ] Previsão de convocação baseada em IA

---

## 18. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Portal do diário sai do ar | Média | Alto | Múltiplas tentativas + notificação de falha |
| PDF com formato incomum | Alta | Médio | Múltiplos parsers + fallback OCR |
| Mudança na URL do diário | Baixa | Alto | Configuração editável de URLs |
| Falso negativo (nome não encontrado) | Baixa | Alto | Múltiplas variações + busca aproximada |
| API de IA fora do ar | Baixa | Baixo | Resumo omitido; resultado ainda notificado |
| Custo de API de IA elevado | Média | Médio | Usar modelos menores (GPT-4o-mini, Gemini Flash) |

---

## 19. Glossário

| Termo | Definição |
|---|---|
| DOBA | Diário Oficial do Estado da Bahia |
| DOU | Diário Oficial da União |
| OCR | Optical Character Recognition — extração de texto de imagens |
| Convocação | Ato que chama o candidato aprovado para apresentar documentos |
| Nomeação | Ato que efetiva o candidato em cargo público |
| Homologação | Validação oficial de resultado de concurso |
| Posse | Ato de tomada de cargo pelo candidato nomeado |
| Cadastro Reserva | Aprovados além das vagas, que podem ser chamados futuramente |
| Match | Ocorrência do nome ou dado do usuário encontrado no diário |
| Scraper | Componente responsável por baixar e extrair dados dos diários |
| Scheduler | Agendador de tarefas automáticas |
| Hash | Código único gerado a partir do conteúdo de um arquivo |

---

*Documento gerado em: Julho/2026*  
*Próxima revisão: após MVP Versão 1.0*

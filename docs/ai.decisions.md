# Catálogo de Decisões e Uso Pedagógico da IA (AI-LOG)

Documento gerado e sincronizado automaticamente com os registros de prompts, respostas, códigos e reflexões críticas do projeto **PeerViewRev**.

## Índice de Tópicos

1. [Eu criei a pasta docs refêrencia. Preciso que vocẽ crie o seguint](#1-eu-criei-a-pasta-docs-referencia-preciso-que-voce-)
2. [o que é a Máquina de Estados na programação?](#2-o-que-e-a-maquina-de-estados-na-programacao)
3. [Como aplicar Máquina de estado no meu projeto?](#3-como-aplicar-maquina-de-estado-no-meu-projeto)
4. [Blind Review](#4-blind-review)
5. [ACID no prisma](#5-acid-no-prisma)

---

## 1. Eu criei a pasta docs refêrencia. Preciso que vocẽ crie o seguint

### 1. Pergunta / Prompt Enviado para a IA

Eu criei a pasta docs refêrencia. Preciso que vocẽ crie o seguinte sistema dentro dela.. 

O professor pediu o seguinte: 
- eu envio prompt para a IA
- eu coloco a resposta da IA
- depois eu coloco o código (caso haja na resposta)
- depois eu faço uma reflexão a respeito do código da IA e o que eu entendi.

Por isso, eu gostaria que você criasse uma página HTML unica com js e css imbutida. Onde o seguinte acontece: 

A página deve ser uma tela branca responsiva scrolavel. Deve ter um botão de + no canto

ao clicar eu adiciono 4 text áreas simples uma embaixo da outra 

1 onde uma é a pergunta que eu fiz para a IA
2 Coloco a resposta da IA
3 opcional porém aparece com muita frequência. uma parte para código onde a formatação do código seja igual a de uma IDE
4- espaço para que eu crie uma reflexão através da resposta da IA.

e sempre em um canto deve haver um botão de + para adicionar outro campo. Ao clicar em + deve perguntar se conterá código, então caso sim ative a pergunta opcional, caso não terá apenas o passo 1, 2, 4.

Além disso, sempre que eu criar um documento desse tipo. Ele deve ser automaticamente convertido para .MD e automaticamente inserido na minha pasta docs. Que está na raiz do projeto. Mas além disso. Deve sempre ficar a motras em uma aba lateral as que eu criei. Além de ser possivel exibir todos já criados em ordem de tópicos e enumerados.

Este projeto é para me ajudar a organizar o trabalho do professor. Portanto faça algo simples e objetivo

### 2. Resposta da IA

Pronto! Criei o sistema completo dentro da pasta DocsReferencia:

index.html — Página HTML única (com CSS e JS embutidos) limpa, branca, responsiva e rolável.
server.js — Servidor local leve (já iniciado em segundo plano em http://localhost:3456
) que converte automaticamente tudo o que você digita em Markdown e salva na pasta docs/.
Como acessar e usar

Você pode abrir de duas formas:

Pelo navegador em http://localhost:3456
Ou dando duplo clique direto no arquivo DocsReferencia/index.html
Funcionalidades incluídas:
Botão + flutuante no canto inferior direito (e no topo):
Ao clicar em +, abre um modal perguntando se a resposta conterá código (Sim, conterá código ou Não, apenas texto).
4 campos empilhados um embaixo do outro:
Pergunta que fiz para a IA (Prompt)
Resposta da IA
Código da Resposta (Opcional — Estilo IDE): janela escura estilo VS Code com numeração de linhas automática, suporte à tecla Tab para indentação, seletor de linguagem (TypeScript, SQL, Prisma, etc.) e botão de copiar.
Minha Reflexão Crítica e Refatoração
Aba Lateral (Sidebar):
Lista todos os tópicos criados enumerados (1, 2, 3...).
Permite clicar em um tópico específico para focar nele ou clicar em "📋 Exibir Todos (Enumerados)" para ver todos em sequência na tela.
Conversão e Gravação Automática em /docs:
A cada alteração, o sistema gera e atualiza automaticamente:
O documento consolidado docs/ai.decisions.md com índice e todos os tópicos enumerados;
Arquivos .md individuais por tópico dentro de docs/ (ex: docs/topico-01-....md).
Modern Web Guidance
dialog: Usei o elemento nativo <dialog> aberto via showModal(), apliquei overscroll-behavior: contain em dialog:modal e dialog::backdrop para conter a rolagem sem remover a barra da página, e limpei o valor de retorno no evento close para evitar valores residuais ao fechar com Esc ("read dialog.returnValue in a close listener to learn which button was used, then reset it with dialog.returnValue = ''").
light-dismiss-a-dialog: Configurei closedby="any" nos modais e adicionei o fallback de verificação de coordenadas via getBoundingClientRect() para navegadores sem suporte nativo, evitando fechamento acidental ao clicar no preenchimento interno do modal ("For browsers that do not yet support closedby, you must implement a fallback for light-dismiss by checking if a click occurred outside the dialog content's boundaries").
form-fields-automatically-fit-contents: Apliquei field-sizing: content com height: auto, min-block-size e max-block-size, mantendo width: 100% nas <textarea> para que cresçam verticalmente conforme você digita sem encolher na horizontal ("apply an explicit width (like width: 100%) to the textarea. This forces the textarea to maintain a stable horizontal width while still auto-sizing vertically as content wraps.").

### 3. Código Gerado pela IA

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Catálogo de Prompts & Reflexões IA — PeerViewRev</title>
  <style>
    :root {
      --bg-page: #ffffff;
      --bg-sidebar: #f8fafc;
      --bg-card: #ffffff;
      --bg-subtle: #f1f5f9;
      --border-color: #e2e8f0;
      --border-focus: #2563eb;
      --text-main: #0f172a;
      --text-muted: #64748b;
      --primary: #2563eb;
      --primary-hover: #1d4ed8;
      --danger: #dc2626;
      --success: #16a34a;
      --ide-bg: #1e1e2e;
      --ide-header: #181825;
      --ide-gutter: #11111b;
      --ide-text: #cdd6f4;
      --ide-line-num: #6c7086;
      --ide-border: #313244;
      --radius: 10px;
      --shadow-sm: 0 1px 3px rgba(15, 23, 42, 0.06);
      --shadow-md: 0 4px 12px rgba(15, 23, 42, 0.08);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html, body {
      height: 100%;
      background-color: var(--bg-page);
      color: var(--text-main);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, Helvetica, Arial, sans-serif;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }

    /* Layout Principal */
    .app-layout {
      display: grid;
      grid-template-columns: 300px 1fr;
      min-height: 100vh;
      background: var(--bg-page);
    }

    /* Aba Lateral (Sidebar) */
    .sidebar {
      background: var(--bg-sidebar);
      border-right: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      height: 100vh;
      position: sticky;
      top: 0;
      overflow: hidden;
    }

    .sidebar-header {
      padding: 1.25rem 1rem 1rem;
      border-bottom: 1px solid var(--border-color);
      background: #ffffff;
    }

    .sidebar-title {
      font-size: 1rem;
      font-weight: 700;
      color: var(--text-main);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
    }

    .sidebar-subtitle {
      font-size: 0.78rem;
      color: var(--text-muted);
      margin-top: 0.25rem;
    }

    .sync-status {
      margin-top: 0.75rem;
      padding: 0.45rem 0.65rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 0.45rem;
      background: #f0fdf4;
      color: #166534;
      border: 1px solid #bbf7d0;
    }

    .sync-status.offline {
      background: #fffbeb;
      color: #92400e;
      border-color: #fde68a;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--success);
      flex-shrink: 0;
    }

    .sync-status.offline .status-dot {
      background: #d97706;
    }

    .sidebar-actions {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
    }

    .btn-mode {
      width: 100%;
      text-align: left;
      padding: 0.55rem 0.75rem;
      border-radius: 7px;
      border: 1px solid var(--border-color);
      background: #ffffff;
      color: var(--text-main);
      font-size: 0.84rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      transition: all 0.15s ease;
    }

    .btn-mode:hover {
      border-color: #cbd5e1;
      background: var(--bg-subtle);
    }

    .btn-mode.active {
      background: #eff6ff;
      border-color: #93c5fd;
      color: var(--primary);
    }

    .badge-count {
      background: var(--bg-subtle);
      color: var(--text-muted);
      padding: 0.1rem 0.45rem;
      border-radius: 999px;
      font-size: 0.72rem;
      font-weight: 700;
    }

    .btn-mode.active .badge-count {
      background: var(--primary);
      color: #ffffff;
    }

    .topic-list-container {
      flex: 1;
      overflow-y: auto;
      padding: 0.75rem 0.75rem 1.5rem;
    }

    .topic-list-label {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      padding: 0 0.35rem 0.5rem;
    }

    .topic-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .topic-nav-item {
      display: flex;
      align-items: center;
      gap: 0.55rem;
      width: 100%;
      padding: 0.55rem 0.65rem;
      border-radius: 7px;
      border: 1px solid transparent;
      background: transparent;
      color: var(--text-main);
      font-size: 0.84rem;
      text-align: left;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .topic-nav-item:hover {
      background: #e2e8f0;
    }

    .topic-nav-item.active {
      background: #ffffff;
      border-color: var(--border-color);
      box-shadow: var(--shadow-sm);
      font-weight: 600;
      color: var(--primary);
    }

    .topic-num {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 24px;
      height: 24px;
      padding: 0 6px;
      border-radius: 6px;
      background: #e2e8f0;
      color: #334155;
      font-size: 0.75rem;
      font-weight: 700;
      flex-shrink: 0;
    }

    .topic-nav-item.active .topic-num {
      background: var(--primary);
      color: #ffffff;
    }

    .topic-nav-text {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1;
    }

    .topic-code-tag {
      font-size: 0.65rem;
      padding: 1px 5px;
      border-radius: 4px;
      background: #1e1e2e;
      color: #a6e3a1;
      font-family: monospace;
      flex-shrink: 0;
    }

    .sidebar-footer {
      padding: 0.75rem 1rem;
      border-top: 1px solid var(--border-color);
      background: #ffffff;
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
    }

    .btn-secondary {
      width: 100%;
      padding: 0.5rem 0.75rem;
      border-radius: 6px;
      border: 1px solid var(--border-color);
      background: #ffffff;
      color: var(--text-main);
      font-size: 0.8rem;
      font-weight: 500;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      transition: background 0.15s ease;
    }

    .btn-secondary:hover {
      background: var(--bg-subtle);
    }

    /* Área Principal Branca e Rolável */
    .main-area {
      background: #ffffff;
      min-height: 100vh;
      padding: 2rem 2.5rem 6rem;
      overflow-y: auto;
    }

    .main-container {
      max-width: 920px;
      margin: 0 auto;
    }

    .page-topbar {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
      padding-bottom: 1.5rem;
      margin-bottom: 2rem;
      border-bottom: 1px solid var(--border-color);
      flex-wrap: wrap;
    }

    .page-heading h1 {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-main);
    }

    .page-heading p {
      font-size: 0.9rem;
      color: var(--text-muted);
      margin-top: 0.25rem;
    }

    .topbar-controls {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    .btn-primary {
      background: var(--primary);
      color: #ffffff;
      border: none;
      padding: 0.6rem 1.1rem;
      border-radius: 8px;
      font-size: 0.88rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      box-shadow: var(--shadow-sm);
      transition: background 0.15s ease;
    }

    .btn-primary:hover {
      background: var(--primary-hover);
    }

    /* Lista de Cards de Tópicos */
    .topics-stream {
      display: flex;
      flex-direction: column;
      gap: 2.25rem;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 1.5rem;
      border: 2px dashed var(--border-color);
      border-radius: var(--radius);
      background: #fafafa;
    }

    .empty-state h2 {
      font-size: 1.15rem;
      color: var(--text-main);
      margin-bottom: 0.5rem;
    }

    .empty-state p {
      font-size: 0.9rem;
      color: var(--text-muted);
      max-width: 460px;
      margin: 0 auto 1.25rem;
    }

    /* Card de Registro (As 4 Áreas Uma Embaixo da Outra) */
    .topic-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius);
      box-shadow: var(--shadow-sm);
      overflow: hidden;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .topic-card:focus-within {
      border-color: #93c5fd;
      box-shadow: var(--shadow-md);
    }

    .topic-card-header {
      background: var(--bg-sidebar);
      padding: 0.9rem 1.25rem;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .topic-header-left {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex: 1;
      min-width: 240px;
    }

    .topic-badge {
      background: var(--primary);
      color: #ffffff;
      font-weight: 700;
      font-size: 0.8rem;
      padding: 0.25rem 0.65rem;
      border-radius: 6px;
      white-space: nowrap;
    }

    .topic-title-input {
      flex: 1;
      border: 1px solid transparent;
      background: transparent;
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-main);
      padding: 0.3rem 0.5rem;
      border-radius: 6px;
      width: 100%;
    }

    .topic-title-input:hover {
      background: #ffffff;
      border-color: var(--border-color);
    }

    .topic-title-input:focus {
      outline: none;
      background: #ffffff;
      border-color: var(--border-focus);
    }

    .topic-header-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-chip {
      padding: 0.3rem 0.65rem;
      font-size: 0.76rem;
      font-weight: 600;
      border-radius: 6px;
      border: 1px solid var(--border-color);
      background: #ffffff;
      color: var(--text-main);
      cursor: pointer;
    }

    .btn-chip:hover {
      background: var(--bg-subtle);
    }

    .btn-chip.danger {
      color: var(--danger);
      border-color: #fecaca;
    }

    .btn-chip.danger:hover {
      background: #fef2f2;
    }

    .topic-card-body {
      padding: 1.35rem 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .field-block {
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
    }

    .field-label {
      font-size: 0.86rem;
      font-weight: 700;
      color: var(--text-main);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .field-step-tag {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
    }

    .step-number {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #eff6ff;
      color: var(--primary);
      font-size: 0.75rem;
      font-weight: 700;
      border: 1px solid #bfdbfe;
    }

    .field-hint {
      font-size: 0.75rem;
      font-weight: 400;
      color: var(--text-muted);
    }

    /* Textareas Simples com Auto-ajuste (field-sizing: content) */
    .simple-textarea {
      field-sizing: content;
      height: auto;
      width: 100%;
      min-block-size: 4lh;
      max-block-size: 22lh;
      padding: 0.75rem 0.9rem;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      background: #ffffff;
      color: var(--text-main);
      font-family: inherit;
      font-size: 0.92rem;
      line-height: 1.55;
      resize: vertical;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }

    .simple-textarea:focus {
      outline: none;
      border-color: var(--border-focus);
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
    }

    /* Área 3: Editor de Código Estilo IDE */
    .ide-wrapper {
      border-radius: 9px;
      overflow: hidden;
      border: 1px solid var(--ide-border);
      background: var(--ide-bg);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
    }

    .ide-topbar {
      background: var(--ide-header);
      padding: 0.5rem 0.85rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--ide-border);
    }

    .ide-dots {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .ide-dot {
      width: 11px;
      height: 11px;
      border-radius: 50%;
    }

    .ide-dot.red { background: #f38ba8; }
    .ide-dot.yellow { background: #f9e2af; }
    .ide-dot.green { background: #a6e3a1; }

    .ide-filename {
      font-family: "JetBrains Mono", "Fira Code", Consolas, Monaco, monospace;
      font-size: 0.75rem;
      color: #a6adc8;
      margin-left: 0.5rem;
    }

    .ide-controls {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .ide-lang-select {
      background: #313244;
      color: #cdd6f4;
      border: 1px solid #45475a;
      border-radius: 5px;
      padding: 0.2rem 0.5rem;
      font-size: 0.75rem;
      font-family: inherit;
      cursor: pointer;
    }

    .ide-copy-btn {
      background: #313244;
      color: #cdd6f4;
      border: 1px solid #45475a;
      border-radius: 5px;
      padding: 0.2rem 0.55rem;
      font-size: 0.74rem;
      cursor: pointer;
    }

    .ide-copy-btn:hover {
      background: #45475a;
    }

    .ide-editor-body {
      display: grid;
      grid-template-columns: 44px 1fr;
      position: relative;
      min-height: 160px;
    }

    .ide-line-numbers {
      background: var(--ide-gutter);
      color: var(--ide-line-num);
      padding: 0.85rem 0.5rem;
      text-align: right;
      font-family: "JetBrains Mono", "Fira Code", "Cascadia Code", Consolas, Monaco, monospace;
      font-size: 0.86rem;
      line-height: 1.6;
      user-select: none;
      border-right: 1px solid var(--ide-border);
      white-space: pre;
      overflow: hidden;
    }

    .ide-textarea {
      field-sizing: content;
      height: auto;
      width: 100%;
      min-block-size: 7lh;
      max-block-size: 28lh;
      background: var(--ide-bg);
      color: var(--ide-text);
      border: none;
      padding: 0.85rem 1rem;
      font-family: "JetBrains Mono", "Fira Code", "Cascadia Code", Consolas, Monaco, monospace;
      font-size: 0.86rem;
      line-height: 1.6;
      tab-size: 2;
      white-space: pre;
      overflow-x: auto;
      resize: vertical;
    }

    .ide-textarea:focus {
      outline: none;
    }

    .ide-textarea::placeholder {
      color: #585b70;
    }

    /* Botão Flutuante (+) Sempre no Canto */
    .fab-add {
      position: fixed;
      right: 2rem;
      bottom: 2rem;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: var(--primary);
      color: #ffffff;
      border: none;
      font-size: 2rem;
      font-weight: 400;
      line-height: 1;
      cursor: pointer;
      box-shadow: 0 8px 24px rgba(37, 99, 235, 0.35);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.15s ease, background 0.15s ease;
      z-index: 50;
    }

    .fab-add:hover {
      background: var(--primary-hover);
      transform: scale(1.06);
    }

    .fab-add:active {
      transform: scale(0.97);
    }

    /* Dialog Nativo (<dialog>) com Regras Modernas */
    dialog {
      margin: auto;
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 0;
      max-width: 520px;
      width: calc(100% - 2rem);
      background: #ffffff;
      color: var(--text-main);
      box-shadow: 0 20px 40px rgba(15, 23, 42, 0.2);
    }

    dialog:modal {
      overscroll-behavior: contain;
    }

    dialog::backdrop {
      overflow: hidden;
      overscroll-behavior: contain;
      background-color: rgba(15, 23, 42, 0.45);
      backdrop-filter: blur(2px);
    }

    .dialog-box {
      padding: 1.5rem;
    }

    .dialog-box h2 {
      font-size: 1.15rem;
      font-weight: 700;
      margin-bottom: 0.4rem;
    }

    .dialog-box p {
      font-size: 0.9rem;
      color: var(--text-muted);
      margin-bottom: 1.1rem;
    }

    .dialog-input-group {
      margin-bottom: 1.2rem;
    }

    .dialog-input-group label {
      display: block;
      font-size: 0.8rem;
      font-weight: 600;
      margin-bottom: 0.35rem;
      color: var(--text-main);
    }

    .dialog-text-input {
      width: 100%;
      padding: 0.6rem 0.75rem;
      border: 1px solid var(--border-color);
      border-radius: 7px;
      font-size: 0.9rem;
    }

    .dialog-text-input:focus {
      outline: none;
      border-color: var(--border-focus);
    }

    .dialog-choices {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .choice-btn {
      padding: 0.9rem 0.75rem;
      border-radius: 9px;
      border: 2px solid var(--border-color);
      background: #ffffff;
      cursor: pointer;
      text-align: left;
      transition: all 0.15s ease;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .choice-btn:hover {
      border-color: var(--primary);
      background: #eff6ff;
    }

    .choice-btn strong {
      font-size: 0.9rem;
      color: var(--text-main);
    }

    .choice-btn span {
      font-size: 0.76rem;
      color: var(--text-muted);
    }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
    }

    /* Dialog de Visualização Markdown */
    #mdPreviewDialog {
      max-width: 780px;
    }

    .md-preview-area {
      width: 100%;
      min-height: 360px;
      max-height: 60vh;
      padding: 1rem;
      border-radius: 8px;
      background: #0f172a;
      color: #e2e8f0;
      font-family: "JetBrains Mono", Consolas, monospace;
      font-size: 0.82rem;
      line-height: 1.55;
      white-space: pre-wrap;
      overflow-y: auto;
      margin-bottom: 1rem;
      border: 1px solid #334155;
    }

    @media (max-width: 820px) {
      .app-layout {
        grid-template-columns: 1fr;
      }
      .sidebar {
        height: auto;
        position: static;
      }
      .main-area {
        padding: 1.25rem 1rem 5rem;
      }
      .dialog-choices {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="app-layout">
    <!-- Aba Lateral -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="sidebar-title">
          <span>📚 Catálogo IA (PPW2)</span>
        </div>
        <p class="sidebar-subtitle">Conversão automática para <code>/docs/*.md</code></p>
        <div id="syncBadge" class="sync-status">
          <span class="status-dot"></span>
          <span id="syncText">Sincronizado com /docs</span>
        </div>
      </div>

      <div class="sidebar-actions">
        <button type="button" id="btnShowAll" class="btn-mode active">
          <span>📋 Exibir Todos (Enumerados)</span>
          <span id="totalBadge" class="badge-count">0</span>
        </button>
      </div>

      <div class="topic-list-container">
        <div class="topic-list-label">Tópicos Criados</div>
        <ul id="sidebarTopicList" class="topic-list"></ul>
      </div>

      <div class="sidebar-footer">
        <button type="button" id="btnPreviewMd" class="btn-secondary">
          👁️ Ver Arquivo .MD Gerado
        </button>
        <button type="button" id="btnDownloadMd" class="btn-secondary">
          ⬇️ Baixar ai.decisions.md
        </button>
      </div>
    </aside>

    <!-- Tela Branca Principal Scrolável -->
    <main class="main-area">
      <div class="main-container">
        <header class="page-topbar">
          <div class="page-heading">
            <h1 id="viewTitle">Todos os Tópicos Registrados</h1>
            <p id="viewSubtitle">
              Registre seus prompts, respostas da IA, códigos gerados e sua reflexão crítica. Tudo é salvo em <code>docs/ai.decisions.md</code>.
            </p>
          </div>
          <div class="topbar-controls">
            <button type="button" id="btnTopAdd" class="btn-primary">
              + Novo Registro
            </button>
          </div>
        </header>

        <section id="topicsContainer" class="topics-stream"></section>
      </div>
    </main>
  </div>

  <!-- Botão Flutuante + no Canto -->
  <button
    type="button"
    id="fabAddBtn"
    class="fab-add"
    title="Adicionar novo tópico de IA"
    aria-label="Adicionar novo tópico de IA"
  >
    +
  </button>

  <!-- Modal Perguntando se Conterá Código -->
  <dialog id="addTopicDialog" closedby="any" aria-labelledby="addDialogTitle">
    <form method="dialog" class="dialog-box">
      <h2 id="addDialogTitle">Novo Registro de Uso da IA</h2>
      <p>Este registro conterá um trecho de código na resposta da IA?</p>

      <div class="dialog-input-group">
        <label for="newTopicTitleInput">Título do Tópico / Desafio (opcional):</label>
        <input
          type="text"
          id="newTopicTitleInput"
          class="dialog-text-input"
          placeholder="Ex: Algoritmo de Distribuição Cega sem Conflito de Instituição"
          autofocus
        />
      </div>

      <div class="dialog-choices">
        <button type="submit" value="with-code" class="choice-btn">
          <strong>💻 Sim, conterá código</strong>
          <span>Ativa os passos 1, 2, 3 (Editor IDE) e 4 (Reflexão)</span>
        </button>
        <button type="submit" value="no-code" class="choice-btn">
          <strong>📝 Não, apenas texto</strong>
          <span>Ativa apenas os passos 1 (Pergunta), 2 (Resposta) e 4 (Reflexão)</span>
        </button>
      </div>

      <div class="dialog-footer">
        <button type="submit" value="cancel" class="btn-chip">Cancelar</button>
      </div>
    </form>
  </dialog>

  <!-- Modal para Visualizar o Markdown Gerado -->
  <dialog id="mdPreviewDialog" closedby="any" aria-labelledby="mdPreviewTitle">
    <form method="dialog" class="dialog-box">
      <h2 id="mdPreviewTitle">Pré-visualização do Markdown (<code>docs/ai.decisions.md</code>)</h2>
      <p>Este conteúdo é gravado automaticamente na pasta <code>docs/</code> na raiz do seu projeto.</p>
      <pre id="mdPreviewContent" class="md-preview-area"></pre>
      <div class="dialog-footer" style="gap: 0.5rem;">
        <button type="button" id="btnCopyMd" class="btn-chip">📋 Copiar Markdown</button>
        <button type="submit" value="close" class="btn-primary">Fechar</button>
      </div>
    </form>
  </dialog>

  <script>
    const API_URL = 'http://localhost:3456/api/docs';
    const STORAGE_KEY = 'peerviewrev_ai_docs_v1';

    let items = [];
    let currentFilterId = 'ALL'; // 'ALL' ou id de um tópico específico
    let syncTimer = null;

    const sidebarTopicList = document.getElementById('sidebarTopicList');
    const topicsContainer = document.getElementById('topicsContainer');
    const totalBadge = document.getElementById('totalBadge');
    const btnShowAll = document.getElementById('btnShowAll');
    const viewTitle = document.getElementById('viewTitle');
    const viewSubtitle = document.getElementById('viewSubtitle');
    const syncBadge = document.getElementById('syncBadge');
    const syncText = document.getElementById('syncText');

    const addTopicDialog = document.getElementById('addTopicDialog');
    const newTopicTitleInput = document.getElementById('newTopicTitleInput');
    const mdPreviewDialog = document.getElementById('mdPreviewDialog');
    const mdPreviewContent = document.getElementById('mdPreviewContent');

    // Fallback para light-dismiss em navegadores sem suporte nativo a closedby="any"
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      for (const dlg of document.querySelectorAll('dialog[closedby="any"]')) {
        dlg.addEventListener('click', (event) => {
          if (event.target !== dlg) return;
          const rect = dlg.getBoundingClientRect();
          const inside =
            rect.top <= event.clientY &&
            event.clientY <= rect.top + rect.height &&
            rect.left <= event.clientX &&
            event.clientX <= rect.left + rect.width;
          if (!inside) dlg.close();
        });
      }
    }

    function generateId() {
      return 'topic_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
    }

    function getDisplayTitle(item, idx) {
      if (item.title && item.title.trim()) return item.title.trim();
      if (item.prompt && item.prompt.trim()) {
        const firstLine = item.prompt.trim().split('\n')[0];
        return firstLine.length > 52 ? firstLine.slice(0, 52) + '...' : firstLine;
      }
      return `Tópico ${idx + 1}`;
    }

    function buildMarkdown(list) {
      let md = `# Catálogo de Decisões e Uso Pedagógico da IA (AI-LOG)\n\n`;
      md += `Documento gerado e sincronizado automaticamente com os registros de prompts, respostas, códigos e reflexões críticas do projeto **PeerViewRev**.\n\n`;

      if (list.length === 0) {
        md += `_Nenhum tópico registrado ainda._\n`;
        return md;
      }

      list.forEach((item, idx) => {
        const num = idx + 1;
        const title = getDisplayTitle(item, idx);
        md += `## ${num}. ${title}\n\n`;
        md += `> **Data/Hora:** ${item.createdAt || ''}\n\n`;
        md += `### 1. Pergunta / Prompt Enviado para a IA\n\n`;
        md += `${item.prompt && item.prompt.trim() ? item.prompt.trim() : '_Não preenchido_'}\n\n`;
        md += `### 2. Resposta da IA\n\n`;
        md += `${item.response && item.response.trim() ? item.response.trim() : '_Não preenchido_'}\n\n`;

        if (item.hasCode) {
          const lang = item.language || 'typescript';
          md += `### 3. Código Gerado pela IA\n\n`;
          md += `\`\`\`${lang}\n${item.code ? item.code : '// Sem código'}\n\`\`\`\n\n`;
        }

        md += `### ${item.hasCode ? '4' : '3'}. Reflexão e Crítica do Aluno\n\n`;
        md += `${item.reflection && item.reflection.trim() ? item.reflection.trim() : '_Não preenchido_'}\n\n`;
        md += `---\n\n`;
      });

      return md;
    }

    async function loadInitialData() {
      try {
        const res = await fetch(API_URL);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.items) && data.items.length > 0) {
            items = data.items;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
            setSyncState(true, 'Sincronizado com /docs');
            renderAll();
            return;
          }
        }
      } catch (_) {}

      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          items = JSON.parse(saved);
        } catch (_) {
          items = [];
        }
      }
      renderAll();
      triggerSync();
    }

    function setSyncState(online, message) {
      if (online) {
        syncBadge.classList.remove('offline');
      } else {
        syncBadge.classList.add('offline');
      }
      syncText.textContent = message;
    }

    function triggerSync() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      setSyncState(true, 'Salvando em /docs...');

      if (syncTimer) clearTimeout(syncTimer);
      syncTimer = setTimeout(async () => {
        try {
          const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items }),
          });
          if (res.ok) {
            setSyncState(true, `Salvo em /docs (${items.length} tópico${items.length === 1 ? '' : 's'})`);
          } else {
            throw new Error('Status ' + res.status);
          }
        } catch (err) {
          setSyncState(false, 'Salvo localmente (use Baixar .MD)');
        }
      }, 250);
    }

    function renderSidebar() {
      totalBadge.textContent = String(items.length);
      btnShowAll.classList.toggle('active', currentFilterId === 'ALL');

      sidebarTopicList.innerHTML = '';
      items.forEach((item, index) => {
        const li = document.createElement('li');
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'topic-nav-item' + (currentFilterId === item.id ? ' active' : '');

        const numSpan = document.createElement('span');
        numSpan.className = 'topic-num';
        numSpan.textContent = String(index + 1);

        const textSpan = document.createElement('span');
        textSpan.className = 'topic-nav-text';
        textSpan.textContent = getDisplayTitle(item, index);

        btn.appendChild(numSpan);
        btn.appendChild(textSpan);

        if (item.hasCode) {
          const codeTag = document.createElement('span');
          codeTag.className = 'topic-code-tag';
          codeTag.textContent = '</>';
          btn.appendChild(codeTag);
        }

        btn.addEventListener('click', () => {
          currentFilterId = item.id;
          renderAll();
        });

        li.appendChild(btn);
        sidebarTopicList.appendChild(li);
      });
    }

    function updateLineNumbers(textarea, gutter) {
      const lines = (textarea.value || '').split('\n').length;
      let nums = '';
      for (let i = 1; i <= Math.max(1, lines); i++) {
        nums += i + '\n';
      }
      gutter.textContent = nums;
    }

    function renderTopics() {
      topicsContainer.innerHTML = '';

      if (items.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.innerHTML = `
          <h2>Nenhum registro de IA criado ainda</h2>
          <p>Clique no botão <strong>+</strong> no canto da tela para adicionar sua primeira pergunta para a IA, a resposta, o código (opcional) e sua reflexão.</p>
        `;
        const startBtn = document.createElement('button');
        startBtn.type = 'button';
        startBtn.className = 'btn-primary';
        startBtn.textContent = '+ Criar Primeiro Tópico';
        startBtn.addEventListener('click', openAddModal);
        empty.appendChild(startBtn);
        topicsContainer.appendChild(empty);
        return;
      }

      const visibleItems =
        currentFilterId === 'ALL'
          ? items.map((item, idx) => ({ item, idx }))
          : items
              .map((item, idx) => ({ item, idx }))
              .filter((entry) => entry.item.id === currentFilterId);

      if (currentFilterId === 'ALL') {
        viewTitle.textContent = 'Todos os Tópicos Registrados (Em Ordem)';
        viewSubtitle.textContent = `Exibindo ${items.length} tópico(s) enumerados e sincronizados automaticamente com a pasta /docs.`;
      } else if (visibleItems.length > 0) {
        const { item, idx } = visibleItems[0];
        viewTitle.textContent = `Tópico #${idx + 1}: ${getDisplayTitle(item, idx)}`;
        viewSubtitle.textContent = 'Visualizando tópico individual. Clique em "Exibir Todos" na aba lateral para ver a lista completa.';
      }

      visibleItems.forEach(({ item, idx }) => {
        const card = document.createElement('article');
        card.className = 'topic-card';
        card.id = 'card-' + item.id;

        // Cabeçalho do Card
        const header = document.createElement('div');
        header.className = 'topic-card-header';

        const left = document.createElement('div');
        left.className = 'topic-header-left';

        const badge = document.createElement('span');
        badge.className = 'topic-badge';
        badge.textContent = `Tópico #${idx + 1}`;

        const titleInput = document.createElement('input');
        titleInput.type = 'text';
        titleInput.className = 'topic-title-input';
        titleInput.placeholder = `Título do Tópico #${idx + 1} (ex: Regra de Conflito de Revisores)...`;
        titleInput.value = item.title || '';
        titleInput.addEventListener('input', () => {
          item.title = titleInput.value;
          renderSidebar();
          triggerSync();
        });

        left.appendChild(badge);
        left.appendChild(titleInput);

        const actions = document.createElement('div');
        actions.className = 'topic-header-actions';

        const toggleCodeBtn = document.createElement('button');
        toggleCodeBtn.type = 'button';
        toggleCodeBtn.className = 'btn-chip';
        toggleCodeBtn.textContent = item.hasCode ? '💻 Ocultar Campo de Código' : '💻 + Adicionar Campo de Código';
        toggleCodeBtn.addEventListener('click', () => {
          item.hasCode = !item.hasCode;
          renderAll();
          triggerSync();
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'btn-chip danger';
        deleteBtn.textContent = 'Excluir';
        deleteBtn.addEventListener('click', () => {
          if (confirm(`Deseja realmente excluir o Tópico #${idx + 1}?`)) {
            items = items.filter((i) => i.id !== item.id);
            if (currentFilterId === item.id) currentFilterId = 'ALL';
            renderAll();
            triggerSync();
          }
        });

        actions.appendChild(toggleCodeBtn);
        actions.appendChild(deleteBtn);

        header.appendChild(left);
        header.appendChild(actions);

        // Corpo com os 4 campos um embaixo do outro
        const body = document.createElement('div');
        body.className = 'topic-card-body';

        // 1. Pergunta para a IA
        const step1 = document.createElement('div');
        step1.className = 'field-block';
        step1.innerHTML = `
          <label class="field-label">
            <span class="field-step-tag">
              <span class="step-number">1</span>
              Pergunta que eu fiz para a IA (Prompt Utilizado)
            </span>
            <span class="field-hint">O prompt exato enviado</span>
          </label>
        `;
        const promptArea = document.createElement('textarea');
        promptArea.className = 'simple-textarea';
        promptArea.placeholder = 'Cole ou digite aqui a pergunta exata que você enviou para a IA...';
        promptArea.value = item.prompt || '';
        promptArea.addEventListener('input', () => {
          item.prompt = promptArea.value;
          renderSidebar();
          triggerSync();
        });
        step1.appendChild(promptArea);
        body.appendChild(step1);

        // 2. Resposta da IA
        const step2 = document.createElement('div');
        step2.className = 'field-block';
        step2.innerHTML = `
          <label class="field-label">
            <span class="field-step-tag">
              <span class="step-number">2</span>
              Resposta da IA (Explicação Bruta)
            </span>
            <span class="field-hint">O que a IA respondeu</span>
          </label>
        `;
        const responseArea = document.createElement('textarea');
        responseArea.className = 'simple-textarea';
        responseArea.placeholder = 'Cole aqui a resposta textual dada pela IA...';
        responseArea.value = item.response || '';
        responseArea.addEventListener('input', () => {
          item.response = responseArea.value;
          triggerSync();
        });
        step2.appendChild(responseArea);
        body.appendChild(step2);

        // 3. Código da IA (Opcional - Estilo IDE)
        if (item.hasCode) {
          const step3 = document.createElement('div');
          step3.className = 'field-block';
          step3.innerHTML = `
            <label class="field-label">
              <span class="field-step-tag">
                <span class="step-number">3</span>
                Código da Resposta da IA (Formato IDE)
              </span>
              <span class="field-hint">Suporta Tab e numeração de linhas</span>
            </label>
          `;

          const ideWrapper = document.createElement('div');
          ideWrapper.className = 'ide-wrapper';

          const ideTopbar = document.createElement('div');
          ideTopbar.className = 'ide-topbar';
          ideTopbar.innerHTML = `
            <div class="ide-dots">
              <span class="ide-dot red"></span>
              <span class="ide-dot yellow"></span>
              <span class="ide-dot green"></span>
              <span class="ide-filename">ia-suggestion.${item.language === 'sql' ? 'sql' : 'ts'}</span>
            </div>
          `;

          const ideControls = document.createElement('div');
          ideControls.className = 'ide-controls';

          const langSelect = document.createElement('select');
          langSelect.className = 'ide-lang-select';
          ['typescript', 'javascript', 'sql', 'prisma', 'json', 'bash', 'html'].forEach((lang) => {
            const opt = document.createElement('option');
            opt.value = lang;
            opt.textContent = lang.toUpperCase();
            if ((item.language || 'typescript') === lang) opt.selected = true;
            langSelect.appendChild(opt);
          });

          const copyCodeBtn = document.createElement('button');
          copyCodeBtn.type = 'button';
          copyCodeBtn.className = 'ide-copy-btn';
          copyCodeBtn.textContent = 'Copiar Código';

          ideControls.appendChild(langSelect);
          ideControls.appendChild(copyCodeBtn);
          ideTopbar.appendChild(ideControls);

          const ideBody = document.createElement('div');
          ideBody.className = 'ide-editor-body';

          const gutter = document.createElement('div');
          gutter.className = 'ide-line-numbers';
          gutter.textContent = '1\n';

          const codeArea = document.createElement('textarea');
          codeArea.className = 'ide-textarea';
          codeArea.spellcheck = false;
          codeArea.placeholder = '// Cole aqui o código gerado pela IA...';
          codeArea.value = item.code || '';

          updateLineNumbers(codeArea, gutter);

          codeArea.addEventListener('input', () => {
            item.code = codeArea.value;
            updateLineNumbers(codeArea, gutter);
            triggerSync();
          });

          // Suporte à tecla Tab igual a uma IDE
          codeArea.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
              e.preventDefault();
              const start = codeArea.selectionStart;
              const end = codeArea.selectionEnd;
              codeArea.value = codeArea.value.substring(0, start) + '  ' + codeArea.value.substring(end);
              codeArea.selectionStart = codeArea.selectionEnd = start + 2;
              item.code = codeArea.value;
              updateLineNumbers(codeArea, gutter);
              triggerSync();
            }
          });

          langSelect.addEventListener('change', () => {
            item.language = langSelect.value;
            triggerSync();
          });

          copyCodeBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(codeArea.value || '');
            copyCodeBtn.textContent = '✔ Copiado!';
            setTimeout(() => (copyCodeBtn.textContent = 'Copiar Código'), 1500);
          });

          ideBody.appendChild(gutter);
          ideBody.appendChild(codeArea);
          ideWrapper.appendChild(ideTopbar);
          ideWrapper.appendChild(ideBody);
          step3.appendChild(ideWrapper);
          body.appendChild(step3);
        }

        // 4. Reflexão e Crítica do Aluno
        const step4 = document.createElement('div');
        step4.className = 'field-block';
        const stepNum4 = item.hasCode ? '4' : '3';
        step4.innerHTML = `
          <label class="field-label">
            <span class="field-step-tag">
              <span class="step-number">${stepNum4}</span>
              Minha Reflexão Crítica e Refatoração
            </span>
            <span class="field-hint">O que a IA errou/limitou, o que você entendeu e como adaptou</span>
          </label>
        `;
        const reflectionArea = document.createElement('textarea');
        reflectionArea.className = 'simple-textarea';
        reflectionArea.placeholder = 'Descreva aqui sua análise crítica sobre a resposta da IA: quais problemas você identificou (ex: falta de transação, acoplamento, erro de regra de negócio) e o que você aprendeu ou alterou...';
        reflectionArea.value = item.reflection || '';
        reflectionArea.addEventListener('input', () => {
          item.reflection = reflectionArea.value;
          triggerSync();
        });
        step4.appendChild(reflectionArea);
        body.appendChild(step4);

        card.appendChild(header);
        card.appendChild(body);
        topicsContainer.appendChild(card);
      });
    }

    function renderAll() {
      renderSidebar();
      renderTopics();
    }

    function openAddModal() {
      newTopicTitleInput.value = '';
      addTopicDialog.returnValue = '';
      addTopicDialog.showModal();
    }

    addTopicDialog.addEventListener('close', () => {
      const choice = addTopicDialog.returnValue;
      addTopicDialog.returnValue = '';

      if (choice !== 'with-code' && choice !== 'no-code') return;

      const newItem = {
        id: generateId(),
        title: newTopicTitleInput.value.trim(),
        prompt: '',
        response: '',
        hasCode: choice === 'with-code',
        language: 'typescript',
        code: '',
        reflection: '',
        createdAt: new Date().toLocaleString('pt-BR'),
      };

      items.push(newItem);
      currentFilterId = 'ALL';
      renderAll();
      triggerSync();

      setTimeout(() => {
        const el = document.getElementById('card-' + newItem.id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          const firstTextarea = el.querySelector('textarea');
          if (firstTextarea) firstTextarea.focus();
        }
      }, 60);
    });

    document.getElementById('fabAddBtn').addEventListener('click', openAddModal);
    document.getElementById('btnTopAdd').addEventListener('click', openAddModal);

    btnShowAll.addEventListener('click', () => {
      currentFilterId = 'ALL';
      renderAll();
    });

    document.getElementById('btnPreviewMd').addEventListener('click', () => {
      mdPreviewContent.textContent = buildMarkdown(items);
      mdPreviewDialog.showModal();
    });

    document.getElementById('btnCopyMd').addEventListener('click', (e) => {
      navigator.clipboard.writeText(buildMarkdown(items));
      e.target.textContent = '✔ Markdown Copiado!';
      setTimeout(() => (e.target.textContent = '📋 Copiar Markdown'), 1500);
    });

    document.getElementById('btnDownloadMd').addEventListener('click', () => {
      const md = buildMarkdown(items);
      const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ai.decisions.md';
      a.click();
      URL.revokeObjectURL(url);
    });

    loadInitialData();
  </script>
</body>
</html>

```

### 4. Reflexão e Crítica do Aluno

Criei este projeto. Pois desta forma fica mais fácil de visualizar e então possibilita eu terminar a atividade com uma cadência maior e uma organização que evite blocos de notas extremamente grande e mal formatados. Além disso, existe a conversão automática para arquivo .MD que possibilita a entrega ao professor de forma automatizada.

---

## 2. o que é a Máquina de Estados na programação?

### 1. Pergunta / Prompt Enviado para a IA

o que é a Máquina de Estados na programação?

### 2. Resposta da IA

Uma Máquina de Estados (ou FSM — Finite State Machine) é um modelo computacional usado para projetar sistemas que podem estar em exatamente um de um número finito de estados em qualquer momento dado. O sistema evolui de um estado para outro em resposta a entradas, eventos ou condições específicas.

Em termos práticos de programação, é um padrão de projeto que organiza a lógica de comportamento de um componente ou sistema de forma previsível e controlada. 

Componentes Fundamentais

Uma máquina de estados é composta por quatro elementos principais:

    Estado (State): A condição ou situação atual em que o sistema se encontra (ex: Desligado, Ligado, Carregando, Erro).

    Evento (Event / Trigger): O gatilho externo ou interno que sinaliza que algo aconteceu (ex: botão_ligar_pressionado, resposta_http_recebida).

    Transição (Transition): A regra que define a mudança do estado atual para um novo estado em resposta a um evento.

    Ação (Action): O código executado como consequência de uma transição (ex: acender uma luz, salvar dados no banco).


Exemplo Prático: Um Pedido de E-commerceImagine o ciclo de vida de um pedido em um sistema de vendas. Sem uma máquina de estados, o código costuma se perder em dezenas de if/else e flags booleanas espalhadas. Com uma máquina de estados, o fluxo é estritamente mapeado:Estados: Criado, AguardandoPagamento, Pago, Enviado, Entregue, Cancelado.Transições e Regras:Estando em Criado + evento pagamento_aprovado  -> vai para Pago.Estando em Pago + evento produto_despachado -> vai para Enviado.Estando em AguardandoPagamento + evento timeout  -> vai para Cancelado.Nesse modelo, transições inválidas são impossíveis por design (por exemplo, o sistema impede diretamente que um pedido vá do estado Criado direto para Entregue sem passar por Pago e Enviado).

### 3. Reflexão e Crítica do Aluno

Eu inferi que a state machine é um conceito que garante consistência alta ao sistema. Pois, com elas é possível organizar o sistema para sempre garantir resultados previsíveis em um ciclo fechado. Além disso, tem uma capacidade de manutenção e escalabilidade extremamente maior, pois evita-se que milhares de IFs sejam criados.

---

## 3. Como aplicar Máquina de estado no meu projeto?

### 1. Pergunta / Prompt Enviado para a IA

Como eu aplico maquina de estado no meu projeto de atribuição de artigos científicos?

### 2. Resposta da IA

A aplicação de uma Máquina de Estados Finita (FSM - Finite State Machine) em um sistema de submissão e atribuição de artigos científicos (como um sistema de Peer Review) é ideal para modelar com segurança o ciclo de vida do manuscrito, garantindo que regras acadêmicas estritas sejam respeitadas e transições ilegais sejam impedidas por design.

1. Modelagem dos Estados e Eventos do Artigo Científico

Em um fluxo de revisão por pares, um artigo científico percorre um ciclo de vida bem delimitado:

Estados Finitos (𝑆 S):

PENDENTE / SUBMETIDO: Artigo recém-enviado pelo autor, aguardando um editor assumir e designar revisores.
EM_REVISAO: Artigo possui revisores designados e está em período de avaliação.
REVISADO: Todos os pareceres foram entregues; pronto para decisão editorial.
ACEITO: Estado terminal; artigo aprovado para publicação (bloqueado para edições).
REJEITADO: Estado terminal; artigo recusado (bloqueado para edições).

Eventos / Gatilhos (𝐸 E):

ATRIBUIR_REVISOR: Editor associa um revisor ao manuscrito.
DESATRIBUIR_REVISOR: Revisor é removido do manuscrito antes de emitir parecer.
ENVIAR_PARECER: Revisor submete sua avaliação.
DECIDIR_STATUS: Editor emite o veredito final (Aceitar ou Rejeitar).

2. Tabela de Transições e Regras de Guarda (Guards)

| Estado Atual    | Evento                                     | Próximo Estado                        | Guardas / Regras de Negócio |
| ---                     | ---                                          | ---                                               | ---                                                                   |
| PENDENTE     | `ATRIBUIR_REVISOR`        | `EM_REVISAO`                          | Pelo menos um revisor associado.                      |
| EM_REVISAO | `DESATRIBUIR_REVISOR` | `PENDENTE`                             | Disparado se todos os revisores forem desatribuídos. |
| EM_REVISAO | `ENVIAR_PARECER`           | `EM_REVISAO` / `REVISADO` | Só é aceito de revisores previamente convidados. |
| EM_REVISAO | `DECIDIR_STATUS`             | `ACEITO` ou `REJEITADO`       | Guarda: Proibido se houver revisões pendentes. |
| ACEITO           | Qualquer evento                    | Bloqueado                                 | Estado imutável (rejeita novas edições ou revisões). |
| REJEITADO    | Qualquer evento                    | Bloqueado                                  | Estado imutável.                                                         |

### 3. Código Gerado pela IA

```typescript
// 1. Definição formal dos estados e eventos
export enum StatusArtigo {
  PENDENTE = 'PENDENTE',
  EM_REVISAO = 'EM_REVISAO',
  ACEITO = 'ACEITO',
  REJEITADO = 'REJEITADO',
}

export type EventoArtigo = 
  | { tipo: 'ATRIBUIR_REVISOR'; revisorId: string }
  | { tipo: 'DESATRIBUIR_REVISOR'; revisorId: string }
  | { tipo: 'SUBMETER_REVISAO'; revisorId: string; parecer: string }
  | { tipo: 'DECIDIR_VEREDITO'; veredito: StatusArtigo.ACEITO | StatusArtigo.REJEITADO };

// 2. Máquina de Estados / Entidade de Domínio
export class ArtigoStateMachine {
  private _status: StatusArtigo = StatusArtigo.PENDENTE;
  private _revisoresIds: Set<string> = new Set();
  private _revisoesRecebidas: Map<string, string> = new Map();

  get status(): StatusArtigo {
    return this._status;
  }

  public dispatch(evento: EventoArtigo): void {
    // Regra Global: Estados terminais rejeitam qualquer ação
    if (this._status === StatusArtigo.ACEITO || this._status === StatusArtigo.REJEITADO) {
      throw new Error(`Transição inválida: artigo já finalizado com status ${this._status}.`);
    }

    switch (evento.tipo) {
      case 'ATRIBUIR_REVISOR':
        this._revisoresIds.add(evento.revisorId);
        // Transição: PENDENTE -> EM_REVISAO
        if (this._status === StatusArtigo.PENDENTE) {
          this._status = StatusArtigo.EM_REVISAO;
        }
        break;

      case 'DESATRIBUIR_REVISOR':
        if (this._revisoesRecebidas.has(evento.revisorId)) {
          throw new Error('Não é permitido desatribuir revisor que já emitiu parecer.');
        }
        this._revisoresIds.delete(evento.revisorId);
        // Transição de Retorno: Se não restarem revisores, volta para PENDENTE
        if (this._revisoresIds.size === 0 && this._status === StatusArtigo.EM_REVISAO) {
          this._status = StatusArtigo.PENDENTE;
        }
        break;

      case 'SUBMETER_REVISAO':
        if (!this._revisoresIds.has(evento.revisorId)) {
          throw new Error('Apenas revisores atribuídos podem submeter parecer.');
        }
        this._revisoesRecebidas.set(evento.revisorId, evento.parecer);
        break;

      case 'DECIDIR_VEREDITO':
        // Guarda de consistência acadêmica
        if (this._revisoesRecebidas.size === 0) {
          throw new Error('Artigo não pode ser julgado sem ao menos um parecer.');
        }
        if (this._revisoesRecebidas.size < this._revisoresIds.size) {
          throw new Error('Aguarde o parecer de todos os revisores antes do veredito final.');
        }

        // Transição para Estado Terminal
        this._status = evento.veredito;
        break;

      default:
        throw new Error('Evento não reconhecido na máquina de estados.');
    }
  }
}
```

### 4. Reflexão e Crítica do Aluno

Desta forma o sistema fica mais organizado e reconhecível, assim como fizemos em sala de aula. É tranquilo perceber como a máquina de estado age e orquestra suas mudanças, já que criando os valores PENDENTE, EM_REVISAO etc, permite que não se use booleanos de forma incorreta e a todo momento. Dessa forma, eu compreendi que a máquina de estado garante consistência a lógica do projeto

---

## 4. Blind Review

### 1. Pergunta / Prompt Enviado para a IA

Considere que você é uma IA me respondendo a respeito do meu projeto.

O que é Blind Review? E como eu faço para aplicar isto em um projeto de peer review de artigos cientificos em Next, NestJS.

### 2. Resposta da IA

O que é Blind Review (Revisão às Cegas)?

O Blind Review é o método usado na academia para garantir imparcialidade na avaliação de artigos científicos, ocultando identidades para evitar vieses (de prestígio da instituição, gênero, nacionalidade ou conflitos pessoais). Existem três modelos principais:

Single-Blind (Simples-Cego): O avaliador (revisor) sabe quem é o autor, mas o autor não sabe quem o avaliou.
Double-Blind (Duplo-Cego): Nem o autor sabe quem é o revisor, nem o revisor sabe quem escreveu o artigo (o mais comum em conferências e periódicos).
Triple-Blind (Triplo-Cego): Até mesmo o editor/coordenador que gerencia a submissão desconhece a identidade dos autores durante a triagem.
Como aplicar isso no seu projeto em Next.js?

Para implementar um Double-Blind Review real em uma aplicação, não basta esconder o nome na tela com CSS ou if no frontend — se você enviar os dados do autor na resposta da API, qualquer revisor consegue abrir a aba Network (Inspeção do navegador) e ver quem escreveu.

Aqui estão os 4 pilares técnicos para implementar isso com segurança:

1. Sanitização no Backend / BFF (Server Components ou API)

A regra de ouro é: o payload JSON que chega ao navegador do revisor nunca deve conter dados sensíveis. No Next.js (usando Server Components ou Route Handlers) ou diretamente no seu backend (via DTOs/Interceptors), filtre os dados de acordo com o papel (role) do usuário logado:

(Techo de código)

2. Submissão de Arquivos (O Problema do PDF)

No mundo real de artigos científicos, a identidade vaza no arquivo PDF (na capa ou nos metadados ocultos do arquivo). Para resolver isso no seu projeto:

Abordagem Prática (Acadêmica/MVP): No formulário de submissão do Next.js, crie dois campos de upload separados:

Manuscrito Anonimizado (PDF): Onde o próprio autor sobe o PDF sem nomes/afiliações (é esse link que o revisor baixa).
Folha de Rosto / Versão Identificada: Visível apenas para o Editor.
Toque Extra (Limpeza de Metadados): Quando o autor salva um PDF no Word/LaTeX, o nome dele fica gravado nas propriedades do arquivo (Author nos metadados do PDF). Você pode usar a biblioteca pdf-lib no Node/Next.js durante o upload para limpar os metadados (pdfDoc.setAuthor(''), pdfDoc.setCreator('')) antes de salvar no storage.

3. Prevenção de Conflito de Interesses (COI) no Sorteio de Revisores

Mesmo sem o revisor ver o nome do autor, ele pode reconhecer o trabalho de um colega de laboratório.

No cadastro do usuário, guarde o domínio do e-mail institucional (ex: @usp.br, @unicamp.br) ou a instituição.
Na lógica de atribuição de revisores, bloqueie automaticamente que um artigo de um autor da instituição X seja atribuído a um revisor da mesma instituição X, ou que o próprio autor seja listado para revisar o próprio artigo.
4. Máquina de Estados da Submissão (Reveal / Desanonimização)

O anonimato do autor geralmente tem prazo de validade (até o artigo ser aceito e publicado):

Crie um campo status na submissão: SUBMITTED -> UNDER_REVIEW -> DECISION_MADE -> PUBLISHED.
Enquanto o status for UNDER_REVIEW, o middleware/serializer aplica o filtro cego. Quando mudar para PUBLISHED, a visualização pública passa a exibir os autores reais, mantendo os revisores anônimos (ou abertos, se o sistema tiver opção de Open Peer Review).

### 3. Código Gerado pela IA

```typescript
// Exemplo em um Server Component ou camada de serviço no Next.js
export async function getSubmissionForUser(submissionId: string, currentUser: User) {
  const submission = await db.submission.findUnique({
    where: { id: submissionId },
    include: { author: true, reviews: { include: { reviewer: true } } },
  });

  // 1. Se quem está vendo é um REVISOR (Double-Blind):
  if (currentUser.role === 'REVIEWER') {
    return {
      id: submission.id,
      title: submission.title,
      abstract: submission.abstract,
      fileUrl: submission.anonymizedFileUrl, // PDF sem nomes!
      author: null, // Oculta completamente o autor da rede
    };
  }

  // 2. Se quem está vendo é o AUTOR (vendo os pareceres):
  if (currentUser.id === submission.authorId) {
    return {
      ...submission,
      reviews: submission.reviews.map((review, index) => ({
        id: review.id,
        score: review.score,
        comments: review.comments,
        reviewerName: `Revisor #${index + 1}`, // Mascaramento de identidade
      })),
    };
  }

  // 3. Se for EDITOR / CHAIR, retorna tudo (caso seja Double-Blind e não Triple-Blind)
  return submission;
}
```

### 4. Reflexão e Crítica do Aluno

Analisando o a resposta pude inferir como funciona a blind review, além de seus 3 modos
Single-blind review
Double-blind review
Triple-blind review
E em minha opinião prosseguir com Double-blind review seria o mais adequado pois garante a imparcialidade completa dos revisores e o autor. 

Além do conceito, a parte de implementação é bem técnica e difícil. Pois não se pode em hipótese alguma deixar vazar o nome do autor do projeto, portanto a IA sugere as seguintes necessidades:

1) Sanitização no Backend / BFF (Server Components ou API)
A respeito desse tópico eu entendi que a sanitização é  limpar a entrada de dados, garantindo que haja confidencialidade e segurança
Além do BFF: que é Backend for Frontend  uma camada que centraliza os micro-serviços  para uma interface expecifica garantindo que não seja responsabilidade do front-ent esconder os dados. Mas sim o back-end  envia apenas o necessário para fazer a requisição

2) Geralmente os PDF de artigos cientificos sempre veem com nome, instituição e etc. por isso para garantir anonimidade . Por isso, será necessário a criação de 1 campo extra onde será enviado o PDF de anônimo que será o link que o revisor baixara
e a versão identificavel ainda assim continua. Porém será entregue apenas ao editor.

Além disso, vou implementar a biblioteca pdf-lib no Node/Next.js durante o upload para limpar os metadados (pdfDoc.setAuthor(''), pdfDoc.setCreator('')) antes de salvar no storage. Dessa forma, os meta dados com nome de quem cria ou criará será limpo. Garantindo anonimicidade 100%

3) O terceiro tópico é uma regra de negócio extremamente importante, pois coloca identificação por email institucional garante que pessoas do mesmo campus não possam analisar seus projetos. Dessa maneira, mesmo que você tenha diversos companheiros de pesquisa ou laboratório, sempre será pessoas diferentes que serão analisadas. Portanto, para executar isso, existirá uma trava lógica que não permitira o editor atribuir uma pessoa que enviou um artigo com mesmo email institucional que um revisor

4) na maquina de estado será aplicado SUBMITTED -> UNDER_REVIEW -> DECISION_MADE -> PUBLISHED. Com objetivo de garantir consistência as outras regras e evitar que tópicos sejam quebrados.

Porém, analisando o código que a IA gerou, eu percebi dois problemas que precisei corrigir para adaptar ao meu projeto

5) O primeiro erro da IA foi na arquitetura. Ela colocou a chamada do banco de dados (db.submission.findUnique) direto como se fosse no Next.js, mas no meu projeto o banco de dados fica separado no backend em NestJS com Prisma (ppw_server).

6) O segundo problema é uma falha de segurança e validação no código dela. Primeiro que ela nem verificou se o artigo realmente existe no banco antes de acessar as propriedades (se o findUnique retornar null, o sistema quebra). Além disso, na parte do REVISOR, ela apenas checou se o cargo é 'REVIEWER', mas esqueceu de validar se aquele revisor realmente foi atribuído para avaliar aquele artigo específico. asdasd

---

## 5. ACID no prisma

### 1. Pergunta / Prompt Enviado para a IA

_Não preenchido_

### 2. Resposta da IA

1. Como funcionam transações ACID no Prisma ($transaction)

Quando você executa queries dentro de uma transação no Prisma com PostgreSQL, o motor do banco garante as 4 propriedades:

Atomicidade (Atomicity): Todas as queries executadas dentro da transação formam um bloco "tudo ou nada" (BEGIN ... COMMIT). Se atualizar artigos funcionar, mas o INSERT em audit_logs falhar (por erro de chave estrangeira, validação ou queda de conexão), o PostgreSQL executa ROLLBACK e o status do artigo permanece inalterado.
Consistência (Consistency): O banco só confirma a transação se todas as constraints (FKs, NOT NULL, UNIQUE, enums como StatusArtigo) forem satisfeitas ao final do bloco.
Isolamento (Isolation): Outras requisições simultâneas não enxergam a atualização do Artigo sem o respectivo AuditLog antes do COMMIT. No PostgreSQL, o padrão é Read Committed, mas o Prisma permite elevar para RepeatableRead ou Serializable quando há risco de conflito de leitura/escrita.
Durabilidade (Durability): Após o COMMIT, o registro é persistido no WAL (Write-Ahead Log) do PostgreSQL e não se perde mesmo se o servidor reiniciar logo em seguida.
Os dois modos do Prisma e qual usar aqui
Sequencial / Batch ($transaction([p1, p2])): recebe um array de PrismaPromise e executa em sequência numa mesma conexão. É simples, mas limitado: você não consegue fazer leituras no meio, aplicar condicionais em TypeScript ou checar count de linhas afetadas entre uma query e outra.
Interativa ($transaction(async (tx) => { ... }, options)): recebe uma função assíncrona com o cliente transacional tx. É a recomendada para máquina de estados + auditoria porque permite:
ler/validar estado ou checar Optimistic Locking dentro da transação;
atualizar tx.artigo e gravar tx.auditLog com dados derivados da própria operação;
abortar e disparar ROLLBACK automático ao lançar qualquer Error dentro da callback.
Regras críticas ao usar $transaction interativo
Use sempre tx, nunca this.prisma, dentro da callback: se você chamar this.prisma.auditLog.create(...) dentro de this.prisma.$transaction(async (tx) => ...), a query roda em outra conexão fora da transação — quebrando a atomicidade e podendo causar deadlock se tentar acessar a mesma linha travada por tx.
Não engula exceções dentro da callback: um try/catch sem throw faz a callback resolver normalmente e o Prisma envia COMMIT mesmo que parte da operação tenha falhado.
Não faça I/O externo dentro da transação: chamadas de rede, geração/sanitização de PDF (PdfSanitizerService) ou envio de e-mail devem ocorrer fora do $transaction, pois transações interativas têm timeout padrão de 5 segundos e seguram conexões do pool e locks no banco.
2. Como aplicar no NestJS sem acoplar a entidade de domínio ao Prisma

Analisando seu projeto atual:

A entidade artigo.entity.ts e a porta artigo.write.repository.ts são 100% livres de Prisma e NestJS.
O schema.prisma já possui o model Artigo (com status e versao Int @default(1)) e o model AuditLog (artigoId, estadoAnterior, novoEstado, autorId, justificativa, timestamp), além do prisma.service.ts.
Porém, em package.json, @prisma/client e @prisma/adapter-pg ainda não estão instalados em node_modules, e submissao.module.ts ainda usa ArtigoInMemoryWriteRepository.

Para integrar o Prisma sem vazar infraestrutura para o domínio, o padrão mais limpo para esse caso é Persistência Orientada a Agregado com Registro de Auditoria (ou Domain Events):

Passo 1 — O Domínio continua puro (e registra a transição)

Em vez de a ArtigoEntity saber que existe uma tabela audit_logs, ela apenas executa a regra da máquina de estados e pode retornar (ou acumular internamente como evento de domínio) um objeto puro descrevendo a mudança de estado:

(TRECHO DE CÓDIGO 1*)

Na ArtigoEntity (ou no serviço de aplicação capturando o estado antes de artigo.decidirStatus(...)), você preserva a invariante de negócio antes da persistência. Se quiser ir além com Domain Events, a própria ArtigoEntity pode guardar um array privado eventosAuditoria: RegistroAuditoriaTransicao[] preenchido dentro de decidirStatus(), publicar(), atribuirRevisor(), etc., e expor um método consumirEventosAuditoria() para o repositório persistir e limpar.

Além disso, vale adicionar versao: number em ArtigoProps (espelhando versao Int @default(1) do seu schema.prisma) para permitir Optimistic Locking e evitar que duas decisões concorrentes sobrescrevam o status uma da outra.

Passo 2 — A Porta (ArtigoWriteRepository) define o contrato atômico sem mencionar Prisma

Em artigo.write.repository.ts, você declara que salvar uma transição + auditoria é uma operação única do repositório:

(TRECHO DE CÓDIGO 2)

Repare que:

Nem PrismaClient nem Prisma.TransactionClient aparecem na interface.
O ArtigoInMemoryWriteRepository continua funcionando nos testes unitários (gravando em memória o artigo e, se quiser, um array de logs em InMemoryArtigoStore).
Passo 3 — A Aplicação (Service) orquestra o caso de uso

No decidir.status.artigo.service.ts, o serviço não sabe que existe $transaction:

(TRECHO DE CÓDIGO 3)

Passo 4 — A Infraestrutura (ArtigoPrismaWriteRepository) executa o $transaction

É aqui (na camada infrastructure/adapters/) que o Prisma aparece, usando o PrismaService e o Mapper:

(TRECHO DE CÓDIGO 4)

Por que o updateMany com versao dentro do $transaction é tão importante? Imagine dois editores clicando em "Aceitar" e "Rejeitar" no mesmo milissegundo. Sem checar versao (ou sem SELECT ... FOR UPDATE), ambos leriam EM_REVISAO, ambos atualizariam a mesma linha por id e gravariam dois AuditLog dizendo estadoAnterior: EM_REVISAO. Com where: { id, versao }, o segundo recebe count === 0, lança erro, a transação sofre ROLLBACK automático e nenhum AuditLog falso é gravado.

E quando mais de um repositório separado precisa compartilhar a mesma transação?

Se um caso de uso precisar coordenar vários repositórios distintos na mesma transação (ex.: ArtigoWriteRepository + UsuarioRepository + AuditLogRepository), você evita acoplar os repositórios ao Prisma usando o padrão Unit of Work (UoW):

Porta UnitOfWork (no domínio/aplicação): runInTransaction<T>(fn: () => Promise<T>): Promise<T>.
Implementação PrismaUnitOfWork (na infraestrutura): usa AsyncLocalStorage (nativo do Node.js) + this.prisma.$transaction(async (tx) => storage.run(tx, fn)).
Repositórios Prisma: usam um helper this.prisma.getClient() que lê o tx ativo do AsyncLocalStorage se houver uma transação em curso, ou retorna this.prisma caso contrário. Assim, a assinatura dos repositórios nunca recebe tx por parâmetro.

Para o seu caso atual (Artigo + AuditLog), porém, o salvarComAuditoria no ArtigoPrismaWriteRepository (ou UnitOfWork se você quiser separar AuditLogRepository) já resolve sem complexidade desnecessária.

3. Pontos de atenção específicos que já existem no seu código/schema

Ao integrar isso no PeerViewRev, vale corrigir três detalhes importantes já visíveis nos arquivos atuais:

onDelete: Cascade em AuditLog contradiz a imutabilidade: Em schema.prisma, AuditLog tem onDelete: Cascade tanto para artigo quanto para autor. Se um artigo ou usuário for deletado com DELETE, o PostgreSQL apagará os logs de auditoria em cascata. Para histórico imutável, o recomendado é usar onDelete: Restrict (bloqueando exclusão física e usando soft delete como deletedAt), além de não criar métodos update/delete no repositório para AuditLog.
Falta o atorId nos casos de uso de decisão e publicação: O model AuditLog exige autorId (o ID do usuário que disparou a transição), mas hoje DecidirStatusArtigoUseCase recebe apenas (artigoId, status) e PublicarArtigoUseCase recebe apenas (artigoId). No SubmissaoController, será preciso extrair o ID do usuário autenticado (ou do header/token usado pelo projeto) e passá-lo ao caso de uso para preencher AuditLog.autorId.
Dependências e troca de adaptador no módulo: Como prisma.service.ts usa @prisma/client e @prisma/adapter-pg (Prisma 7) mas ambos ainda não constam em package.json, será necessário instalá-los, gerar o client (prisma generate) e trocar os providers em submissao.module.ts de ArtigoInMemory*Repository para os adaptadores Prisma quando for ativar o PostgreSQL.

Se quiser, posso implementar agora o adaptador ArtigoPrismaWriteRepository (com salvarComAuditoria e Optimistic Locking) ou estruturar o padrão UnitOfWork com AsyncLocalStorage no ppw_server.

### 3. Código Gerado pela IA

```typescript
//----------------------------------TRECHO DE CÓDIGO 1----------------------------------------------
// domain/types/registro-auditoria.ts (100% TypeScript puro, sem Prisma)
import { StatusArtigoEnum } from '../value-objects/status.value.object';

export interface RegistroAuditoriaTransicao {
  estadoAnterior: StatusArtigoEnum | null;
  novoEstado: StatusArtigoEnum;
  atorId: string;
  justificativa?: string;
}


//----------------------------------TRECHO DE CÓDIGO 2----------------------------------------------
export interface ArtigoWriteRepository {
  salvar(artigo: ArtigoEntity): Promise<void>;
  salvarComAuditoria(
    artigo: ArtigoEntity,
    auditoria: RegistroAuditoriaTransicao,
  ): Promise<void>;
  excluir(id: string): Promise<void>;
}

//----------------------------------TRECHO DE CÓDIGO 3----------------------------------------------
async execute(
  artigoId: string,
  status: 'ACEITO' | 'REJEITADO',
  atorId: string,
  justificativa?: string,
): Promise<DecidirStatusResponse> {
  const artigo = await this.readRepository.buscarPorId(artigoId);
  if (!artigo) {
    throw new NotFoundException('Artigo não encontrado.');
  }

  const estadoAnterior = artigo.status.getValue();

  try {
    artigo.decidirStatus(status as StatusArtigoEnum.ACEITO | StatusArtigoEnum.REJEITADO);
  } catch (error: any) {
    throw new BadRequestException(error.message);
  }

  await this.writeRepository.salvarComAuditoria(artigo, {
    estadoAnterior,
    novoEstado: artigo.status.getValue(),
    atorId,
    justificativa,
  });

  return {
    mensagem: 'Status do artigo decidido',
    artigoId: artigo.id,
    status: artigo.status.getValue(),
  };
}

//----------------------------------TRECHO DE CÓDIGO 4----------------------------------------------
@Injectable()
export class ArtigoPrismaWriteRepository implements ArtigoWriteRepository {
  constructor(private readonly prisma: PrismaService) {}

  async salvarComAuditoria(
    artigo: ArtigoEntity,
    auditoria: RegistroAuditoriaTransicao,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // 1. Atualiza com Optimistic Locking usando o campo `versao` do schema.prisma
      const resultado = await tx.artigo.updateMany({
        where: {
          id: artigo.id,
          versao: artigo.versao,
        },
        data: {
          status: artigo.status.getValue(), // mapeado para enum do Prisma
          editorId: artigo.editorId ?? null,
          versao: { increment: 1 },
        },
      });

      if (resultado.count === 0) {
        throw new Error(
          'Conflito de concorrência: o artigo foi modificado por outra operação.',
        );
      }

      // 2. Grava o histórico imutável na mesma transação
      await tx.auditLog.create({
        data: {
          artigoId: artigo.id,
          estadoAnterior: auditoria.estadoAnterior,
          novoEstado: auditoria.novoEstado,
          autorId: auditoria.atorId,
          justificativa: auditoria.justificativa ?? null,
        },
      });
    });
  }

  // salvar() e excluir()...
}


```

### 4. Reflexão e Crítica do Aluno

Analisando a resposta da IA, eu compreendi que a transação ACID com o $transaction do Prisma funciona como uma trava de segurança do tipo "tudo ou nada" no banco de dados. Isso é fundamental no meu projeto porque toda vez que o artigo muda de estado na Máquina de Estados (por exemplo, de PENDENTE para EM_REVISAO, ou de EM_REVISAO para ACEITO/REJEITADO), eu sou obrigado a gravar um AuditLog. Se o update do artigo funcionasse mas a gravação do log desse erro, o sistema ficaria inconsistente e sem rastreabilidade. Com o $transaction, se qualquer etapa falhar, o banco dá rollback automático e desfaz a mudança de status.

Sobre a arquitetura, ficou muito claro como manter o padrão que vimos em aula sem sujar a minha ArtigoEntity com coisas do Prisma:
1) A ArtigoEntity continua 100% pura no domínio, cuidando só das regras da máquina de estados.
2) A interface ArtigoWriteRepository (porta do domínio) só define o contrato salvarComHistorico recebendo a entidade e os dados básicos do log.
3) O Prisma ($transaction) fica isolado apenas lá na camada de infrastructure, dentro do repositório do Prisma, usando o cliente transacional "tx" para garantir que o update do artigo e o create do AuditLog rodem na mesma conexão.

Porém, analisando o código sugerido pela IA e comparando com os arquivos atuais do meu projeto (ppw_server), identifiquei três pontos importantes que preciso ajustar e refatorar:

1) Problema de concorrência no update simples da IA: No código da IA, ela fez apenas tx.artigo.update({ where: { id: artigo.id } }). Se dois editores tentarem decidir o mesmo artigo ao mesmo tempo, o segundo vai sobrescrever a decisão do primeiro. Como no meu schema.prisma eu já tenho o campo "versao", o mais seguro é validar a versão atual na cláusula where (controle de concorrência otimista) junto com o incremento de versão, abortando a transação se outro usuário já tiver alterado aquele artigo.

2) Cuidado com a imutabilidade real no schema.prisma: A IA explicou que o AuditLog é imutável porque só fazemos create (Append-Only) no repositório. Porém, olhando meu schema.prisma atual, percebi que a relação do AuditLog estava com "onDelete: Cascade". Isso significa que se alguém apagasse um artigo ou usuário, o banco apagaria todo o histórico de auditoria junto. Para garantir imutabilidade de verdade, preciso trocar para "onDelete: Restrict" (ou impedir exclusão física de artigos que já entraram no fluxo de revisão).

3) Adaptação nos meus Cases/Controllers atuais: Hoje o meu endpoint e o DecidirStatusArtigoUseCase recebem apenas o artigoId e o status, mas a tabela AuditLog exige o autorId (quem executou a ação) e permite uma justificativa. Portanto, para integrar isso de fato no projeto, preciso passar o ID do usuário logado (ex: via header x-user-id / contexto de autenticação) e a justificativa no DTO da requisição até o Service.

---


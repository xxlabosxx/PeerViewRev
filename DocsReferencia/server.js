const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3456;
const ROOT_DIR = path.resolve(__dirname, '..');
const DOCS_DIR = path.join(ROOT_DIR, 'docs');
const ATIVIDADE_DIR = path.join(DOCS_DIR, 'atividade');
const DATA_FILE = path.join(DOCS_DIR, '.ai-catalog-data.json');
const MAIN_MD_FILE = path.join(DOCS_DIR, 'ai.decisions.md');

if (!fs.existsSync(DOCS_DIR)) {
  fs.mkdirSync(DOCS_DIR, { recursive: true });
}
if (!fs.existsSync(ATIVIDADE_DIR)) {
  fs.mkdirSync(ATIVIDADE_DIR, { recursive: true });
}

function slugify(text) {
  return (
    (text || 'topico')
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 50) || 'topico'
  );
}

function generateItemMarkdown(item, index) {
  const num = index + 1;
  const title =
    item.title && item.title.trim()
      ? item.title.trim()
      : item.prompt && item.prompt.trim()
        ? item.prompt.trim().split('\n')[0].slice(0, 65)
        : `Tópico ${num}`;

  let md = `## ${num}. ${title}\n\n`;
  md += `### 1. Pergunta / Prompt Enviado para a IA\n\n`;
  md += `${item.prompt && item.prompt.trim() ? item.prompt.trim() : '_Não preenchido_'}\n\n`;
  md += `### 2. Resposta da IA\n\n`;
  md += `${item.response && item.response.trim() ? item.response.trim() : '_Não preenchido_'}\n\n`;

  if (item.hasCode) {
    const lang = item.language || 'typescript';
    md += `### 3. Código Gerado pela IA\n\n`;
    md += `\`\`\`${lang}\n${item.code ? item.code.replace(/\r\n/g, '\n') : '// Sem código'}\n\`\`\`\n\n`;
  }

  md += `### ${item.hasCode ? '4' : '3'}. Reflexão e Crítica do Aluno\n\n`;
  md += `${item.reflection && item.reflection.trim() ? item.reflection.trim() : '_Não preenchido_'}\n\n`;
  md += `---\n`;
  return { md, title, num };
}

let lastJson = '';
if (fs.existsSync(DATA_FILE)) {
  try {
    lastJson = fs.readFileSync(DATA_FILE, 'utf8');
  } catch (_) {}
}

function syncDocsToDisk(items) {
  if (!fs.existsSync(DOCS_DIR)) {
    fs.mkdirSync(DOCS_DIR, { recursive: true });
  }
  if (!fs.existsSync(ATIVIDADE_DIR)) {
    fs.mkdirSync(ATIVIDADE_DIR, { recursive: true });
  }

  const currentJson = JSON.stringify(items, null, 2);
  // Se o conteúdo não mudou nada e o arquivo principal existe, evita reescrever em loop
  if (currentJson === lastJson && fs.existsSync(MAIN_MD_FILE)) {
    return ['ai.decisions.md (sem alterações)'];
  }
  lastJson = currentJson;

  // Salva o estado estruturado para recarregar ao abrir a página
  fs.writeFileSync(DATA_FILE, currentJson, 'utf8');

  // Limpa arquivos topico-*.md antigos tanto de docs quanto de docs/atividade
  [DOCS_DIR, ATIVIDADE_DIR].forEach((dir) => {
    if (fs.existsSync(dir)) {
      const existingFiles = fs.readdirSync(dir);
      for (const file of existingFiles) {
        if (/^topico-\d+-.*\.md$/.test(file)) {
          try {
            fs.unlinkSync(path.join(dir, file));
          } catch (_) {}
        }
      }
    }
  });

  let consolidatedMd = `# Catálogo de Decisões e Uso Pedagógico da IA (AI-LOG)\n\n`;
  consolidatedMd += `Documento gerado e sincronizado automaticamente com os registros de prompts, respostas, códigos e reflexões críticas do projeto **PeerViewRev**.\n\n`;

  const createdFiles = ['ai.decisions.md'];

  if (items.length === 0) {
    consolidatedMd += `_Nenhum tópico registrado ainda._\n`;
  } else {
    consolidatedMd += `## Índice de Tópicos\n\n`;
    items.forEach((item, idx) => {
      const num = idx + 1;
      const title =
        item.title && item.title.trim()
          ? item.title.trim()
          : item.prompt && item.prompt.trim()
            ? item.prompt.trim().split('\n')[0].slice(0, 65)
            : `Tópico ${num}`;
      consolidatedMd += `${num}. [${title}](#${num}-${slugify(title)})\n`;
    });
    consolidatedMd += `\n---\n\n`;

    items.forEach((item, idx) => {
      const { md, title, num } = generateItemMarkdown(item, idx);
      consolidatedMd += md + '\n';

      // Cria o arquivo .md individual dentro da pasta docs/atividade/
      const paddedNum = String(num).padStart(2, '0');
      const fileName = `topico-${paddedNum}-${slugify(title)}.md`;
      const singleFileContent = `# Tópico ${paddedNum}: ${title}\n\n` + md;
      fs.writeFileSync(path.join(ATIVIDADE_DIR, fileName), singleFileContent, 'utf8');
      createdFiles.push(`atividade/${fileName}`);
    });
  }

  fs.writeFileSync(MAIN_MD_FILE, consolidatedMd, 'utf8');
  return createdFiles;
}

// Garante que ai.decisions.md já exista inicialmente se houver dados salvos
if (fs.existsSync(DATA_FILE)) {
  try {
    const initialItems = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    syncDocsToDisk(initialItems);
  } catch (_) {}
} else if (!fs.existsSync(MAIN_MD_FILE) || fs.statSync(MAIN_MD_FILE).size === 0) {
  syncDocsToDisk([]);
}

const server = http.createServer((req, res) => {
  // Headers CORS + Private Network Access (necessário quando index.html é aberto via file://)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Private-Network', 'true');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
    const htmlPath = path.join(__dirname, 'index.html');
    if (fs.existsSync(htmlPath)) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(fs.readFileSync(htmlPath, 'utf8'));
    } else {
      res.writeHead(404);
      res.end('index.html not found');
    }
    return;
  }

  if (req.method === 'GET' && req.url === '/api/docs') {
    let items = [];
    if (fs.existsSync(DATA_FILE)) {
      try {
        items = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      } catch (_) {
        items = [];
      }
    }
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: true, items, docsPath: DOCS_DIR }));
    return;
  }

  if (req.method === 'POST' && req.url === '/api/docs') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const items = Array.isArray(payload.items) ? payload.items : [];
        const files = syncDocsToDisk(items);
        console.log(`[${new Date().toLocaleTimeString('pt-BR')}] Sincronizados ${items.length} tópico(s) em /docs:`, files.join(', '));
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(
          JSON.stringify({
            ok: true,
            message: 'Sincronizado na pasta /docs com sucesso!',
            count: items.length,
            files,
            docsPath: DOCS_DIR,
          }),
        );
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: false, error: err.message }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Servidor DocsReferencia rodando em http://localhost:${PORT}`);
  console.log(`Sincronizando automaticamente com: ${DOCS_DIR}`);
});

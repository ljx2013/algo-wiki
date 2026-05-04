import express from 'express';
import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, basename } from 'path';
import { watch } from 'chokidar';
import matter from 'gray-matter';
import { marked } from 'marked';
import hljs from 'highlight.js';

const app = express();
const PORT = 5000;

const DOCS_PATH = './docs';
const DB_FILE = './server/db.json';

let solutions = [];

marked.setOptions({
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    return hljs.highlightAuto(code).value;
  }
});

function parseFrontmatter(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const { data, content: markdown } = matter(content);
    const html = marked.parse(markdown);

    return {
      id: basename(filePath, '.md'),
      title: data.title || basename(filePath, '.md'),
      category: data.category || '未分类',
      difficulty: data.difficulty || '普及/提高-',
      tags: data.tags || [],
      date: data.date || new Date().toISOString().split('T')[0],
      source: data.source || '',
      content: html,
      rawContent: markdown
    };
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error);
    return null;
  }
}

function scanDocs() {
  const solutions = [];

  if (!existsSync(DOCS_PATH)) {
    console.log('Docs folder does not exist, creating...');
    return solutions;
  }

  function scanDirectory(dir) {
    try {
      const files = readdirSync(dir);

      for (const file of files) {
        const filePath = join(dir, file);
        const stat = statSync(filePath);

        if (stat.isDirectory()) {
          scanDirectory(filePath);
        } else if (file.endsWith('.md')) {
          const solution = parseFrontmatter(filePath);
          if (solution) {
            solutions.push(solution);
          }
        }
      }
    } catch (error) {
      console.error(`Error scanning directory ${dir}:`, error);
    }
  }

  scanDirectory(DOCS_PATH);
  return solutions;
}

function initializeWatcher() {
  const watcher = watch(DOCS_PATH, {
    ignored: /(^|[\/\\])\../,
    persistent: true,
    ignoreInitial: true
  });

  watcher
    .on('add', (path) => {
      console.log(`File added: ${path}`);
      const solution = parseFrontmatter(path);
      if (solution) {
        solutions.push(solution);
        broadcastUpdate();
      }
    })
    .on('change', (path) => {
      console.log(`File changed: ${path}`);
      const index = solutions.findIndex(s => s.id === basename(path, '.md'));
      const solution = parseFrontmatter(path);
      if (solution) {
        if (index !== -1) {
          solutions[index] = solution;
        } else {
          solutions.push(solution);
        }
        broadcastUpdate();
      }
    })
    .on('unlink', (path) => {
      console.log(`File removed: ${path}`);
      const id = basename(path, '.md');
      solutions = solutions.filter(s => s.id !== id);
      broadcastUpdate();
    })
    .on('error', (error) => {
      console.error('Watcher error:', error);
    });

  console.log('File watcher initialized');
}

let clients = [];

function broadcastUpdate() {
  const data = JSON.stringify({ type: 'update', solutions });
  clients.forEach(client => {
    client.write(`data: ${data}\n\n`);
  });
}

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get('/api/solutions', (req, res) => {
  res.json(solutions);
});

app.get('/api/solutions/:id', (req, res) => {
  const solution = solutions.find(s => s.id === req.params.id);
  if (solution) {
    res.json(solution);
  } else {
    res.status(404).json({ error: 'Solution not found' });
  }
});

app.get('/api/categories', (req, res) => {
  const categories = [...new Set(solutions.map(s => s.category))];
  res.json(categories);
});

app.get('/api/difficulties', (req, res) => {
  const difficulties = [...new Set(solutions.map(s => s.difficulty))];
  res.json(difficulties);
});

app.get('/api/search', (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.json([]);
  }

  const query = q.toLowerCase();
  const results = solutions.filter(s =>
    s.title.toLowerCase().includes(query) ||
    s.category.toLowerCase().includes(query) ||
    s.tags.some(tag => tag.toLowerCase().includes(query)) ||
    s.rawContent.toLowerCase().includes(query)
  );

  res.json(results);
});

app.get('/api/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  clients.push(res);

  req.on('close', () => {
    clients = clients.filter(client => client !== res);
  });
});

function initializeServer() {
  solutions = scanDocs();
  console.log(`Loaded ${solutions.length} solutions`);

  initializeWatcher();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

initializeServer();
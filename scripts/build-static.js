import { readFileSync, readdirSync, statSync, existsSync, mkdirSync, writeFileSync } from 'fs'
import { join, basename } from 'path'
import matter from 'gray-matter'
import { marked } from 'marked'
import hljs from 'highlight.js'

const DOCS_PATH = './docs'
const OUTPUT_PATH = './public/data'

marked.setOptions({
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value
    }
    return hljs.highlightAuto(code).value
  }
})

function parseFrontmatter(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8')
    const { data, content: markdown } = matter(content)
    const html = marked.parse(markdown)

    return {
      id: basename(filePath, '.md'),
      title: data.title || basename(filePath, '.md'),
      category: data.category || '未分类',
      difficulty: data.difficulty || '普及/提高-',
      tags: data.tags || [],
      date: data.date || new Date().toISOString().split('T')[0],
      source: data.source || '',
      content: html,
      rawContent: markdown.slice(0, 200)
    }
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error)
    return null
  }
}

function scanDocs() {
  const solutions = []

  if (!existsSync(DOCS_PATH)) {
    console.log('Docs folder does not exist')
    return solutions
  }

  function scanDirectory(dir) {
    try {
      const files = readdirSync(dir)

      for (const file of files) {
        const filePath = join(dir, file)
        const stat = statSync(filePath)

        if (stat.isDirectory()) {
          scanDirectory(filePath)
        } else if (file.endsWith('.md')) {
          const solution = parseFrontmatter(filePath)
          if (solution) {
            solutions.push(solution)
          }
        }
      }
    } catch (error) {
      console.error(`Error scanning directory ${dir}:`, error)
    }
  }

  scanDirectory(DOCS_PATH)
  return solutions
}

function buildStatic() {
  console.log('Building static data...')

  if (!existsSync(OUTPUT_PATH)) {
    mkdirSync(OUTPUT_PATH, { recursive: true })
  }

  const solutions = scanDocs()
  const output = { solutions }

  writeFileSync(
    join(OUTPUT_PATH, 'solutions.json'),
    JSON.stringify(output, null, 2),
    'utf-8'
  )

  console.log(`Built ${solutions.length} solutions to ${OUTPUT_PATH}/solutions.json`)
}

buildStatic()
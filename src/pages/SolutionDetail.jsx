import React, { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import './SolutionDetail.css'

function SolutionDetail({ solutions }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const contentRef = useRef(null)
  const [solution, setSolution] = useState(null)
  const [copyStatus, setCopyStatus] = useState('')

  useEffect(() => {
    const found = solutions.find(s => s.id === id)
    setSolution(found || null)
    window.scrollTo(0, 0)
  }, [id, solutions])

  useEffect(() => {
    if (solution && contentRef.current) {
      const codeBlocks = contentRef.current.querySelectorAll('pre code')
      codeBlocks.forEach(block => {
        block.parentElement.addEventListener('click', handleCodeCopy)
      })
    }
  }, [solution])

  function handleCodeCopy(e) {
    const code = e.target.textContent
    navigator.clipboard.writeText(code).then(() => {
      setCopyStatus('已复制!')
      setTimeout(() => setCopyStatus(''), 2000)
    })
  }

  if (!solution) {
    return (
      <div className="solution-detail">
        <div className="not-found">
          <h2>题解未找到</h2>
          <p>该题解可能已被删除或移动</p>
          <Link to="/" className="back-btn">返回列表</Link>
        </div>
      </div>
    )
  }

  const currentIndex = solutions.findIndex(s => s.id === id)
  const prevSolution = currentIndex > 0 ? solutions[currentIndex - 1] : null
  const nextSolution = currentIndex < solutions.length - 1 ? solutions[currentIndex + 1] : null

  return (
    <div className="solution-detail">
      <article className="detail-article">
        <header className="detail-header">
          <div className="breadcrumb">
            <Link to="/">首页</Link>
            <span> / </span>
            <Link to={`/category/${encodeURIComponent(solution.category)}`}>
              {solution.category}
            </Link>
            <span> / </span>
            <span className="current">{solution.title}</span>
          </div>

          <h1 className="detail-title">{solution.title}</h1>

          <div className="detail-meta">
            <span className={`difficulty-badge ${getDifficultyClass(solution.difficulty)}`}>
              {solution.difficulty}
            </span>
            <span className="category">{solution.category}</span>
            <span className="date">📅 {solution.date}</span>
            {solution.source && <span className="source">📌 {solution.source}</span>}
          </div>

          <div className="detail-tags">
            {solution.tags.map(tag => (
              <Link
                key={tag}
                to={`/search?q=${encodeURIComponent(tag)}`}
                className="tag"
              >
                {tag}
              </Link>
            ))}
          </div>
        </header>

        <div
          ref={contentRef}
          className="detail-content"
          dangerouslySetInnerHTML={{ __html: solution.content }}
        />

        <footer className="detail-footer">
          <div className="copy-status">{copyStatus}</div>
        </footer>
      </article>

      <nav className="detail-nav">
        {prevSolution ? (
          <Link to={`/solution/${prevSolution.id}`} className="nav-btn prev">
            ← {prevSolution.title}
          </Link>
        ) : <div />}
        {nextSolution && (
          <Link to={`/solution/${nextSolution.id}`} className="nav-btn next">
            {nextSolution.title} →
          </Link>
        )}
      </nav>
    </div>
  )
}

function getDifficultyClass(difficulty) {
  if (difficulty.includes('入门') || difficulty.includes('普及-')) return 'easy'
  if (difficulty.includes('普及+/提高') || difficulty.includes('提高+/省选')) return 'hard'
  if (difficulty.includes('省选') || difficulty.includes('NOI')) return 'extreme'
  return 'medium'
}

export default SolutionDetail
import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import './SolutionCard.css'

function SolutionCard({ solution, style }) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const cardRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    )

    if (cardRef.current) {
      observer.observe(cardRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const getDifficultyClass = (difficulty) => {
    if (difficulty.includes('入门') || difficulty.includes('普及-')) return 'easy'
    if (difficulty.includes('普及+/提高') || difficulty.includes('提高+/省选')) return 'hard'
    if (difficulty.includes('省选') || difficulty.includes('NOI')) return 'extreme'
    return 'medium'
  }

  return (
    <article
      ref={cardRef}
      className={`solution-card ${isVisible ? 'visible' : ''} ${isLoaded ? 'loaded' : ''}`}
      style={style}
    >
      <Link to={`/solution/${solution.id}`} className="card-link">
        <div className="card-header">
          <span className={`difficulty-badge ${getDifficultyClass(solution.difficulty)}`}>
            {solution.difficulty}
          </span>
          <span className="category-tag">{solution.category}</span>
        </div>

        <h3 className="card-title">{solution.title}</h3>

        <div className="card-meta">
          <span className="date">📅 {solution.date}</span>
          {solution.source && (
            <span className="source">📌 {solution.source}</span>
          )}
        </div>

        <div className="card-tags">
          {solution.tags.slice(0, 3).map(tag => (
            <span key={tag} className="tag">{tag}</span>
          ))}
          {solution.tags.length > 3 && (
            <span className="tag more">+{solution.tags.length - 3}</span>
          )}
        </div>

        <div className="card-footer">
          <span className="read-more">阅读题解 →</span>
        </div>
      </Link>
    </article>
  )
}

export default React.memo(SolutionCard)
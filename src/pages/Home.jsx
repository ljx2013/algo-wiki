import React, { useState, useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import SolutionCard from '../components/SolutionCard'
import './Home.css'

function Home({ solutions }) {
  const { category } = useParams()
  const [filterDifficulty, setFilterDifficulty] = useState('全部')
  const [sortBy, setSortBy] = useState('date')
  const [visibleCount, setVisibleCount] = useState(12)

  const difficulties = ['全部', '入门', '普及-', '普及/提高-', '普及+/提高', '提高+/省选-', '省选/NOI-', 'NOI/NOI+/CTSC']

  const filteredSolutions = useMemo(() => {
    let filtered = solutions

    if (category) {
      filtered = filtered.filter(s => s.category === decodeURIComponent(category))
    }

    if (filterDifficulty !== '全部') {
      filtered = filtered.filter(s => s.difficulty === filterDifficulty)
    }

    filtered = [...filtered].sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date) - new Date(a.date)
      } else if (sortBy === 'title') {
        return a.title.localeCompare(b.title, 'zh-CN')
      } else if (sortBy === 'difficulty') {
        const difficultyOrder = difficulties.indexOf(a.difficulty) - difficulties.indexOf(b.difficulty)
        return difficultyOrder
      }
      return 0
    })

    return filtered
  }, [solutions, category, filterDifficulty, sortBy])

  const visibleSolutions = filteredSolutions.slice(0, visibleCount)

  const loadMore = () => {
    setVisibleCount(prev => prev + 12)
  }

  useEffect(() => {
    setVisibleCount(12)
  }, [category, filterDifficulty, sortBy])

  if (!solutions.length) {
    return (
      <div className="home">
        <div className="empty-state">
          <h2>暂无题解</h2>
          <p>请在 docs 文件夹中添加题解文件</p>
        </div>
      </div>
    )
  }

  return (
    <div className="home">
      <section className="hero">
        <h1>📖 洛谷题解集</h1>
        <p>记录算法竞赛的每一步成长</p>
      </section>

      <section className="filters">
        <div className="filter-group">
          <label>分类：</label>
          <span className="current-filter">
            {category ? decodeURIComponent(category) : '全部'}
          </span>
        </div>

        <div className="filter-group">
          <label>难度：</label>
          <div className="filter-buttons">
            {difficulties.map(diff => (
              <button
                key={diff}
                className={`filter-btn ${filterDifficulty === diff ? 'active' : ''}`}
                onClick={() => setFilterDifficulty(diff)}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <label>排序：</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="date">按时间</option>
            <option value="title">按标题</option>
            <option value="difficulty">按难度</option>
          </select>
        </div>
      </section>

      <section className="stats">
        <div className="stat-item">
          <span className="stat-value">{filteredSolutions.length}</span>
          <span className="stat-label">题解总数</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">
            {[...new Set(solutions.map(s => s.category))].length}
          </span>
          <span className="stat-label">分类数量</span>
        </div>
      </section>

      <div className="solutions-grid">
        {visibleSolutions.map((solution, index) => (
          <SolutionCard
            key={solution.id}
            solution={solution}
            style={{ animationDelay: `${index * 50}ms` }}
          />
        ))}
      </div>

      {visibleCount < filteredSolutions.length && (
        <div className="load-more-container">
          <button className="load-more-btn" onClick={loadMore}>
            加载更多
            <span className="load-more-hint">
              ({visibleCount}/{filteredSolutions.length})
            </span>
          </button>
        </div>
      )}
    </div>
  )
}

export default Home
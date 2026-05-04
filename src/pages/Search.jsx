import React, { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useDebounce } from '../hooks/useSolutions'
import SolutionCard from '../components/SolutionCard'
import './Search.css'

function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [inputValue, setInputValue] = useState(query)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const debouncedQuery = useDebounce(inputValue, 300)

  useEffect(() => {
    if (debouncedQuery) {
      performSearch(debouncedQuery)
    } else {
      setResults([])
    }
  }, [debouncedQuery])

  async function performSearch(q) {
    setLoading(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      if (response.ok) {
        const data = await response.json()
        setResults(data)
      }
    } catch (error) {
      console.error('Search failed:', error)
      setResults([])
    }
    setLoading(false)
  }

  function handleInputChange(e) {
    const value = e.target.value
    setInputValue(value)
    if (value) {
      setSearchParams({ q: value })
    } else {
      setSearchParams({})
    }
  }

  return (
    <div className="search-page">
      <section className="search-hero">
        <h1>🔍 题解搜索</h1>
        <p>输入关键词查找相关题解</p>
      </section>

      <div className="search-container">
        <div className="search-input-wrapper">
          <input
            type="text"
            className="search-input-large"
            placeholder="搜索题目名称、标签、内容..."
            value={inputValue}
            onChange={handleInputChange}
            autoFocus
          />
          {inputValue && (
            <button
              className="clear-btn"
              onClick={() => {
                setInputValue('')
                setSearchParams({})
              }}
            >
              ✕
            </button>
          )}
        </div>

        {loading && (
          <div className="search-loading">
            <div className="spinner"></div>
            <span>搜索中...</span>
          </div>
        )}

        {!loading && inputValue && (
          <div className="search-results-info">
            找到 <strong>{results.length}</strong> 个相关题解
          </div>
        )}

        <div className="search-results">
          {!loading && results.map((solution, index) => (
            <SolutionCard
              key={solution.id}
              solution={solution}
              style={{ animationDelay: `${index * 50}ms` }}
            />
          ))}
        </div>

        {!loading && inputValue && results.length === 0 && (
          <div className="no-results">
            <h3>未找到相关题解</h3>
            <p>请尝试其他关键词</p>
          </div>
        )}

        {!inputValue && (
          <div className="search-tips">
            <h3>💡 搜索提示</h3>
            <ul>
              <li>支持按题目名称搜索</li>
              <li>支持按标签搜索（如：DP、贪心、搜索）</li>
              <li>支持按分类搜索</li>
              <li>支持按内容关键词搜索</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default Search
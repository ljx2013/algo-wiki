import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDebounce } from '../hooks/useSolutions'
import './Header.css'

function Header() {
  const [searchQuery, setSearchQuery] = useState('')
  const [categories, setCategories] = useState([])
  const [showCategories, setShowCategories] = useState(false)
  const navigate = useNavigate()
  const debouncedQuery = useDebounce(searchQuery, 300)

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (debouncedQuery) {
      navigate(`/search?q=${encodeURIComponent(debouncedQuery)}`)
    }
  }, [debouncedQuery, navigate])

  async function fetchCategories() {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  function handleSearchSubmit(e) {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          <span className="logo-icon">📚</span>
          <span className="logo-text">洛谷题解 Wiki</span>
        </Link>

        <nav className="nav">
          <Link to="/" className="nav-link">题解列表</Link>
          <div
            className="nav-dropdown"
            onMouseEnter={() => setShowCategories(true)}
            onMouseLeave={() => setShowCategories(false)}
          >
            <span className="nav-link">分类导航 ▾</span>
            {showCategories && (
              <div className="dropdown-menu">
                {categories.map(category => (
                  <Link
                    key={category}
                    to={`/category/${encodeURIComponent(category)}`}
                    className="dropdown-item"
                  >
                    {category}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        <form className="search-form" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            className="search-input"
            placeholder="搜索题解..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="search-button">
            🔍
          </button>
        </form>
      </div>
    </header>
  )
}

export default Header
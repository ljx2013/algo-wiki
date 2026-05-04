import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import SolutionDetail from './pages/SolutionDetail'
import Search from './pages/Search'
import Header from './components/Header'
import { useSolutions } from './hooks/useSolutions'

function App() {
  const { solutions, loading, error } = useSolutions()

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>加载中...</p>
          </div>
        )}
        {error && <div className="error-message">{error}</div>}
        {!loading && !error && (
          <Routes>
            <Route path="/" element={<Home solutions={solutions} />} />
            <Route path="/solution/:id" element={<SolutionDetail solutions={solutions} />} />
            <Route path="/search" element={<Search />} />
            <Route path="/category/:category" element={<Home solutions={solutions} />} />
          </Routes>
        )}
      </main>
      <footer className="footer">
        <p>© 2024 洛谷题解 Wiki - 基于文件系统的题解管理</p>
      </footer>
    </div>
  )
}

export default App
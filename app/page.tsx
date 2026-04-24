'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const SIZES = ['PP', 'P', 'M', 'G', 'GG', 'XGG']

export default function Home() {
  const [nome, setNome] = useState('')
  const [setor, setSetor] = useState('')
  const [tamanho, setTamanho] = useState('')
  const [quantidade, setQuantidade] = useState(1)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const canSubmit = nome.trim() && tamanho && !loading

  async function handleSubmit() {
    if (!canSubmit) return
    setLoading(true)
    setError('')
    const { error: err } = await supabase.from('pedidos').insert({
      nome: nome.trim(),
      setor: setor.trim(),
      tamanho,
      quantidade,
    })
    if (err) {
      setError('Erro ao registrar pedido. Tente novamente.')
      setLoading(false)
      return
    }
    setLoading(false)
    setSubmitted(true)
  }

  function reset() {
    setNome(''); setSetor(''); setTamanho(''); setQuantidade(1)
    setSubmitted(false); setError('')
  }

  return (
    <>
      <nav className="nav">
        <div className="nav-brand">
          <span className="copa-badge">COPA 2026</span>
          <span className="nav-title">Bemol Futebol Clube</span>
        </div>
        <Link href="/admin" className="nav-link">Admin</Link>
      </nav>

      {!submitted ? (
        <>
          <img
            src="https://i.imgur.com/placeholder.jpg"
            alt="Camisa Bemol Copa 2026"
            className="hero-img"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
          <div className="hero-overlay">
            <span className="hero-tag">EDIÇÃO LIMITADA · COPA 2026</span>
            <h1>Camisa Oficial Bemol FC</h1>
            <p>Azul Brasil · Bege · Dourado — Tecido Jacquard 100% Poliéster</p>
          </div>

          <div className="container">
            <div className="shirt-preview">
              <img
                src="https://i.imgur.com/placeholder2.jpg"
                alt="Vista da camisa"
                className="shirt-thumb"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
              <div className="shirt-info">
                <h3>Camisa Oficial 2026 — I</h3>
                <p>Gola retrô em ribana premium, escudo bordado alto relevo, numeração bordada aplicada.</p>
                <div className="shirt-tags">
                  <span className="stag">Dry Touch</span>
                  <span className="stag">Alta respirabilidade</span>
                  <span className="stag">Sublimação cores vivas</span>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="field">
                <label>Nome completo *</label>
                <input type="text" placeholder="Seu nome" value={nome} onChange={e => setNome(e.target.value)} />
              </div>
              <div className="field">
                <label>Setor / Área</label>
                <input type="text" placeholder="Ex: Marketing, TI, Comercial..." value={setor} onChange={e => setSetor(e.target.value)} />
              </div>
              <div className="field">
                <label>Tamanho *</label>
                <div className="size-grid">
                  {SIZES.map(s => (
                    <button key={s} className={`size-btn${tamanho === s ? ' selected' : ''}`} onClick={() => setTamanho(s)}>{s}</button>
                  ))}
                </div>
              </div>
              <div className="field">
                <label>Quantidade</label>
                <div className="qty-row">
                  <b

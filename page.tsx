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
          <span className="nav-title">Camisa do Time Bemol</span>
        </div>
        <Link href="/admin" className="nav-link">Admin</Link>
      </nav>

      <div className="container">
        {!submitted ? (
          <>
            <div className="hero">
              <span className="hero-tag">PRÉ-PEDIDO</span>
              <h1>Registre seu pedido de camisa</h1>
              <p>Sem compromisso agora. Você será contactado para pagamento quando a produção for confirmada.</p>
            </div>

            <div className="card">
              <div className="field">
                <label>Nome completo *</label>
                <input
                  type="text"
                  placeholder="Seu nome"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                />
              </div>

              <div className="field">
                <label>Setor / Área</label>
                <input
                  type="text"
                  placeholder="Ex: Marketing, TI, Comercial..."
                  value={setor}
                  onChange={e => setSetor(e.target.value)}
                />
              </div>

              <div className="field">
                <label>Tamanho *</label>
                <div className="size-grid">
                  {SIZES.map(s => (
                    <button
                      key={s}
                      className={`size-btn${tamanho === s ? ' selected' : ''}`}
                      onClick={() => setTamanho(s)}
                    >{s}</button>
                  ))}
                </div>
              </div>

              <div className="field">
                <label>Quantidade</label>
                <div className="qty-row">
                  <button className="qty-btn" onClick={() => setQuantidade(q => Math.max(1, q - 1))}>−</button>
                  <span className="qty-val">{quantidade}</span>
                  <button className="qty-btn" onClick={() => setQuantidade(q => Math.min(10, q + 1))}>+</button>
                </div>
              </div>

              {nome && tamanho && (
                <div className="preview">
                  <strong>Resumo do pedido</strong><br />
                  Nome: <strong>{nome}</strong><br />
                  {setor && <>Setor: <strong>{setor}</strong><br /></>}
                  Tamanho: <strong>{tamanho}</strong><br />
                  Quantidade: <strong>{quantidade} camisa{quantidade > 1 ? 's' : ''}</strong>
                </div>
              )}

              {error && <p className="error-msg">{error}</p>}

              <button
                className="btn-primary"
                onClick={handleSubmit}
                disabled={!canSubmit}
              >
                {loading ? 'Registrando...' : 'Registrar pedido'}
              </button>
            </div>
          </>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '40px 28px' }}>
            <div className="success-icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0a6c3e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="bebas" style={{ fontSize: 28, color: 'var(--green)', marginBottom: 6, letterSpacing: '0.02em' }}>Pedido registrado!</h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 0 }}>
              Quando a produção for confirmada, você receberá as instruções de pagamento.
            </p>
            <div className="success-detail">
              Nome: <strong>{nome}</strong><br />
              {setor && <>Setor: <strong>{setor}</strong><br /></>}
              Tamanho: <strong>{tamanho}</strong><br />
              Quantidade: <strong>{quantidade} camisa{quantidade > 1 ? 's' : ''}</strong>
            </div>
            <button className="btn-secondary" onClick={reset}>Registrar outro pedido</button>
          </div>
        )}
      </div>
    </>
  )
}

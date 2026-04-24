'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { supabase, type Pedido } from '@/lib/supabase'

const SIZES = ['PP', 'P', 'M', 'G', 'GG', 'XGG']
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'bemol2026'

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [pwd, setPwd] = useState('')
  const [pwdError, setPwdError] = useState(false)
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(false)

  const fetchPedidos = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('pedidos')
      .select('*')
      .order('created_at', { ascending: false })
    setPedidos(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    if (authed) fetchPedidos()
  }, [authed, fetchPedidos])

  function login() {
    if (pwd === ADMIN_PASSWORD) {
      setAuthed(true)
      setPwdError(false)
    } else {
      setPwdError(true)
      setTimeout(() => setPwdError(false), 1500)
    }
  }

  const totalCamisas = pedidos.reduce((a, p) => a + p.quantidade, 0)
  const setores = new Set(pedidos.map(p => p.setor).filter(Boolean)).size
  const sizeCounts: Record<string, number> = {}
  SIZES.forEach(s => { sizeCounts[s] = 0 })
  pedidos.forEach(p => { sizeCounts[p.tamanho] = (sizeCounts[p.tamanho] || 0) + p.quantidade })
  const maxCount = Math.max(...Object.values(sizeCounts), 1)
  const topSize = SIZES.reduce((a, b) => sizeCounts[a] >= sizeCounts[b] ? a : b)

  function exportCSV() {
    const header = 'Nome,Setor,Tamanho,Quantidade,Data'
    const rows = pedidos.map(p => {
      const date = p.created_at ? new Date(p.created_at).toLocaleDateString('pt-BR') : '—'
      return `${p.nome},${p.setor || ''},${p.tamanho},${p.quantidade},${date}`
    })
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'pedidos-camisa-copa.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  function heatColor(size: string) {
    const v = sizeCounts[size]
    if (v === 0) return { bg: '#f3f4f0', szColor: '#9ca3af', valColor: '#9ca3af' }
    const intensity = v / maxCount
    const alpha = 0.15 + 0.75 * intensity
    return {
      bg: `rgba(26,58,107,${alpha.toFixed(2)})`,
      szColor: intensity > 0.5 ? 'rgba(255,255,255,0.75)' : '#1a3a6b',
      valColor: intensity > 0.5 ? '#fff' : '#1a3a6b',
    }
  }

  if (!authed) {
    return (
      <>
        <nav className="nav">
          <div className="nav-brand">
            <span className="copa-badge">COPA 2026</span>
            <span className="nav-title">Bemol Futebol Clube</span>
          </div>
          <Link href="/" className="nav-link">← Formulário</Link>
        </nav>
        <div className="login-wrap">
          <div className="login-card">
            <h2>Painel Admin</h2>
            <p>Acesso restrito a organizadores.</p>
            <div className="field">
              <label>Senha</label>
              <input
                type="password"
                placeholder="••••••"
                value={pwd}
                onChange={e => setPwd(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && login()}
                style={pwdError ? { borderColor: '#dc2626' } : {}}
              />
              {pwdError && <p className="error-msg">Senha incorreta</p>}
            </div>
            <button className="btn-primary" onClick={login}>Entrar</button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <nav className="nav">
        <div className="nav-brand">
          <span className="copa-badge">COPA 2026</span>
          <span className="nav-title">Painel Administrativo</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={fetchPedidos} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
            {loading ? 'Atualizando...' : 'Atualizar'}
          </button>
          <Link href="/" className="nav-link">← Formulário</Link>
        </div>
      </nav>

      <div className="container-wide">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 className="bebas" style={{ fontSize: 32, color: '#1a3a6b' }}>Pedidos de Camisa</h1>
            <p style={{ fontSize: 14, color: '#6b7280' }}>Copa do Mundo 2026 — Bemol FC</p>
          </div>
          <button className="btn-outline" onClick={exportCSV}>Exportar CSV</button>
        </div>

        <div className="stats-grid">
          <div className="stat-card"><div className="stat-label">Pedidos</div><div className="st

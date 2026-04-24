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
      bg: `rgba(10,108,62,${alpha.toFixed(2)})`,
      szColor: intensity > 0.5 ? 'rgba(255,255,255,0.75)' : 'var(--green)',
      valColor: intensity > 0.5 ? '#fff' : 'var(--green)',
    }
  }

  if (!authed) {
    return (
      <>
        <nav className="nav">
          <div className="nav-brand">
            <span className="copa-badge">COPA 2026</span>
            <span className="nav-title">Camisa do Time Bemol</span>
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
                style={pwdError ? { borderColor: '#dc2626', boxShadow: '0 0 0 3px rgba(220,38,38,0.1)' } : {}}
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
          <button className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', fontSize: 13 }} onClick={fetchPedidos}>
            {loading ? 'Atualizando...' : 'Atualizar'}
          </button>
          <Link href="/" className="nav-link">← Formulário</Link>
        </div>
      </nav>

      <div className="container-wide">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 className="bebas" style={{ fontSize: 32, color: 'var(--green)', letterSpacing: '0.02em' }}>Pedidos de Camisa</h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Copa do Mundo 2026 — Bemol</p>
          </div>
          <button className="btn-outline" onClick={exportCSV}>Exportar CSV</button>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Pedidos</div>
            <div className="stat-val">{pedidos.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total camisas</div>
            <div className="stat-val">{totalCamisas}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Maior demanda</div>
            <div className="stat-val">{totalCamisas > 0 ? topSize : '—'}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Setores</div>
            <div className="stat-val">{setores}</div>
          </div>
        </div>

        <div className="section-label">Distribuição por tamanho</div>
        <div className="size-heatmap">
          {SIZES.map(s => {
            const { bg, szColor, valColor } = heatColor(s)
            return (
              <div key={s} className="heat-cell" style={{ background: bg }}>
                <div className="heat-sz" style={{ color: szColor }}>{s}</div>
                <div className="heat-val" style={{ color: valColor }}>{sizeCounts[s]}</div>
              </div>
            )
          })}
        </div>

        <div className="section-label">Todos os pedidos</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Nome</th>
                <th>Setor</th>
                <th>Tamanho</th>
                <th>Qtd</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: 14 }}>
                    {loading ? 'Carregando...' : 'Nenhum pedido registrado ainda.'}
                  </td>
                </tr>
              ) : (
                pedidos.map((p, i) => (
                  <tr key={p.id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{pedidos.length - i}</td>
                    <td style={{ fontWeight: 500 }}>{p.nome}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{p.setor || '—'}</td>
                    <td><span className="badge">{p.tamanho}</span></td>
                    <td>{p.quantidade}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                      {p.created_at ? new Date(p.created_at).toLocaleDateString('pt-BR') : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

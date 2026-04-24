import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Bemol Copa 2026 — Pedido de Camisa',
  description: 'Registre seu pedido de camisa do time Bemol para a Copa do Mundo 2026.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}

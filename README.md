# Bemol Copa 2026 — Camisa do Time

App de pré-pedido de camisa para funcionários da Bemol. Coleta nome, setor, tamanho e quantidade antes da produção.

---

## Stack

- **Next.js 14** (App Router)
- **Supabase** (banco PostgreSQL, gratuito)
- **Vercel** (deploy)

---

## 1. Supabase — criar o banco

1. Acesse [supabase.com](https://supabase.com) e crie um projeto grátis
2. Vá em **SQL Editor** e rode:

```sql
create table pedidos (
  id uuid default gen_random_uuid() primary key,
  nome text not null,
  setor text,
  tamanho text not null,
  quantidade int not null default 1,
  created_at timestamptz default now()
);

-- Permitir inserções públicas (formulário)
alter table pedidos enable row level security;

create policy "Inserção pública" on pedidos
  for insert with check (true);

create policy "Leitura autenticada" on pedidos
  for select using (true);
```

3. Copie **Project URL** e **anon public key** em Settings > API

---

## 2. Variáveis de ambiente

```bash
cp .env.local.example .env.local
```

Edite `.env.local` com seus valores do Supabase e a senha do admin.

---

## 3. Rodar localmente

```bash
npm install
npm run dev
```

Acesse:
- Formulário público: `http://localhost:3000`
- Painel admin: `http://localhost:3000/admin`

---

## 4. Deploy na Vercel

```bash
# Instale a CLI da Vercel (uma vez)
npm i -g vercel

# Deploy
vercel

# Siga as instruções e adicione as variáveis de ambiente quando solicitado
```

Ou conecte o repositório GitHub diretamente em [vercel.com](https://vercel.com) e adicione as variáveis em **Settings > Environment Variables**.

---

## Rotas

| Rota | Descrição |
|------|-----------|
| `/` | Formulário público de pedido |
| `/admin` | Painel com login, métricas, tabela e export CSV |

---

## Trocar a senha do admin

No `.env.local` (local) e nas variáveis da Vercel:

```
NEXT_PUBLIC_ADMIN_PASSWORD=sua_nova_senha
```

> Nota: a senha fica no client-side. Para uma versão mais segura no futuro, mova a autenticação para uma API route com Supabase Auth.

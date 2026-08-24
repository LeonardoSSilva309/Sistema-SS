# Sweet Secrets — Sistema do Clube

Sistema interno para gerenciar o clube Sweet Secrets: reservas de mesa,
agenda semanal com eventos internos e externos, e avisos automáticos por
e-mail para os membros.

## Funcionalidades

- **Login com papéis**: Administrador, Equipe e Membro, cada um com sua área.
- **Reservas**: equipe cria/confirma/cancela reservas; membros solicitam
  reservas pelo portal, que ficam pendentes até confirmação da equipe.
- **Mesas**: cadastro de mesas do salão com capacidade e localização.
- **Agenda / Eventos**: eventos internos (feitos pela casa) e externos
  (espaço locado), com opção de exibir ou não para os membros.
- **Portal do membro**: mostra a agenda dos próximos 7 dias e a próxima
  reserva do próprio membro.
- **Resumo semanal por e-mail**: envia aos membros ativos um e-mail com os
  eventos da semana. Pode ser disparado manualmente pela equipe ou
  automaticamente via cron (toda segunda-feira).
- **Gestão de membros e equipe**: cadastro, desativação e histórico de
  reservas por membro.

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript + Tailwind CSS
- [Prisma](https://www.prisma.io) + PostgreSQL
- [NextAuth.js](https://authjs.dev) (credenciais + sessão JWT)
- [Resend](https://resend.com) para envio de e-mails

## Rodando localmente

### Pré-requisitos

- Node.js 20+
- Um banco PostgreSQL (local ou na nuvem)

### Passos

```bash
npm install
cp .env.example .env
# edite o .env com sua DATABASE_URL/DIRECT_URL e demais variáveis

npx prisma migrate dev   # cria as tabelas
npm run db:seed          # cria usuários e dados de exemplo

npm run dev
```

Acesse `http://localhost:3000`.

### Contas criadas pelo seed (apenas para desenvolvimento)

| Papel  | E-mail                     | Senha      |
| ------ | --------------------------- | ---------- |
| Admin  | admin@sweetsecrets.com      | admin123   |
| Equipe | staff@sweetsecrets.com      | staff123   |
| Membro | membro@sweetsecrets.com     | membro123  |

**Troque essas senhas (ou remova essas contas) antes de usar em produção.**

## Variáveis de ambiente

Veja `.env.example`. Resumo:

| Variável | Descrição |
| --- | --- |
| `DATABASE_URL` | String de conexão do PostgreSQL (via pooler, se aplicável) |
| `DIRECT_URL` | Conexão direta/sem pooler, usada só para rodar migrations. Necessária ao usar Supabase (veja seção própria abaixo) |
| `AUTH_SECRET` | Segredo do NextAuth — gere com `openssl rand -base64 32` |
| `RESEND_API_KEY` | Chave da API do Resend (para enviar e-mails) |
| `EMAIL_FROM` | Remetente dos e-mails, ex: `Sweet Secrets <avisos@seudominio.com>` |
| `CRON_SECRET` | Segredo para autorizar a chamada do cron de resumo semanal |
| `NEXT_PUBLIC_APP_URL` | URL pública do site (usada em links dos e-mails) |

Sem `RESEND_API_KEY` configurada, o sistema funciona normalmente mas os
e-mails apenas são registrados no log do servidor (não são enviados de
verdade) — útil para desenvolver sem custo.

## Scripts

```bash
npm run dev         # ambiente de desenvolvimento
npm run build       # aplica migrations pendentes (prisma migrate deploy) e builda
npm run start       # roda o build de produção
npm run lint        # checagem de lint
npm run db:migrate  # cria uma nova migration a partir de mudanças no schema
npm run db:seed     # popula o banco com dados de exemplo
npm run db:studio   # abre o Prisma Studio (interface do banco)
```

`npm run build` já aplica as migrations pendentes antes de compilar — por
isso precisa de `DATABASE_URL`/`DIRECT_URL` configuradas mesmo só para
buildar. É esse mesmo comando que a Vercel roda a cada deploy.

## Implantação (deploy) recomendada

Sugestão simples e de baixo custo:

1. **Hospedagem da aplicação**: [Vercel](https://vercel.com) — conecte o
   repositório do GitHub e o deploy acontece a cada push.
2. **Banco de dados**: um Postgres gerenciado, por exemplo
   [Neon](https://neon.tech) ou [Supabase](https://supabase.com) (ambos têm
   planos gratuitos suficientes para o início).
3. **E-mails**: crie uma conta no [Resend](https://resend.com), verifique
   seu domínio e gere uma API key.
4. Configure as variáveis de ambiente do passo anterior no painel do Vercel
   (Project Settings → Environment Variables).
5. As migrations rodam automaticamente a cada deploy: o script `build`
   (`package.json`) já executa `prisma migrate deploy && next build`. Não é
   necessário rodar nada manualmente após configurar as variáveis de
   ambiente — basta fazer o deploy (ou um redeploy) que as tabelas são
   criadas/atualizadas sozinhas.
6. O resumo semanal já está configurado em `vercel.json` para rodar toda
   **segunda-feira às 11:00 UTC** (ajuste o horário no arquivo conforme o
   fuso desejado). A Vercel envia automaticamente o cabeçalho
   `Authorization: Bearer $CRON_SECRET`, que a rota valida.

### Usando Supabase como banco de dados

O Supabase coloca o Postgres atrás de um connection pooler (Supavisor).
Para funcionar bem com o Prisma em uma plataforma serverless como a Vercel,
configure **duas** variáveis de ambiente (em vez de só `DATABASE_URL`):

No painel do projeto Supabase: **Project Settings → Database → Connection
string**, aba **Connection pooling**. Monte as duas URLs assim:

```
# Usada em runtime pela aplicação — modo "Transaction" (porta 6543)
DATABASE_URL="postgresql://postgres.<ref>:<senha>@aws-0-<regiao>.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Usada só para rodar as migrations — modo "Session" (porta 5432, mesmo host do pooler)
DIRECT_URL="postgresql://postgres.<ref>:<senha>@aws-0-<regiao>.pooler.supabase.com:5432/postgres"
```

Troque `<ref>`, `<senha>` e `<regiao>` pelos valores do seu projeto. Não use
a conexão "direct" (`db.<ref>.supabase.co:5432`) em produção na Vercel —
ela normalmente só é acessível via IPv6 e falha em muitos ambientes; as
duas URLs do pooler acima (portas 6543 e 5432) resolvem isso.

Depois de configurar as duas variáveis na Vercel e fazer o deploy, rode o
seed **uma única vez**, a partir de um computador com acesso normal à
internet (a sua máquina, por exemplo — não precisa ser o servidor de
produção):

```bash
git clone https://github.com/LeonardoSSilva309/Sistema-SS
cd Sistema-SS
npm install
echo 'DATABASE_URL="<a mesma URL configurada na Vercel>"' > .env
npm run db:seed
```

### Rodando em um computador/servidor próprio do restaurante

Também é possível rodar tudo localmente na rede da casa, sem depender de
serviços externos pagos:

- Instale PostgreSQL e Node.js na máquina.
- Configure o `.env` apontando para o Postgres local.
- Rode `npm run build && npm run start` (ou use um gerenciador de processos
  como `pm2` para manter o serviço no ar).
- Como não há Vercel Cron nesse cenário, agende o envio do resumo semanal
  com um `cron` do sistema operacional chamando:
  `curl -H "Authorization: Bearer $CRON_SECRET" https://SEU-ENDERECO/api/cron/weekly-digest`
  — ou simplesmente use o botão **"Enviar resumo semanal agora"** na tela
  de Agenda / Eventos do painel.
- Sem uma chave do Resend, os avisos por e-mail não serão enviados de
  verdade; nesse caso, os avisos aos membros continuam sendo feitos pelos
  canais atuais (WhatsApp, redes sociais etc.), com a agenda sempre
  disponível no portal do membro.

## Estrutura do projeto

```
src/
  app/
    (público)         página inicial, /login
    admin/             painel da equipe (reservas, eventos, membros, equipe)
    portal/            área do membro (agenda da semana, minhas reservas)
    api/
      auth/            rotas do NextAuth
      cron/             endpoint do resumo semanal
  lib/                  Prisma client, autenticação, e-mail, resumo semanal
prisma/
  schema.prisma         modelo de dados
  seed.ts                dados de exemplo para desenvolvimento
```

## Próximos passos sugeridos

- Definir política de reenvio de senha (hoje, contas são criadas pela
  equipe com senha aleatória — falta um fluxo de "esqueci minha senha").
  A senha inicial precisa ser comunicada ao membro por fora do sistema.
- Ajustar o horário/fuso do cron semanal (`vercel.json`) para o horário
  local do restaurante.
- Personalizar o domínio de e-mail no Resend para melhorar a entregabilidade.

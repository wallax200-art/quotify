# Guia de Deploy do Quotify no Railway

Este guia fornece instruções passo a passo para fazer o deploy permanente do Quotify no Railway, com banco de dados MySQL integrado e domínio customizado.

## Pré-requisitos

- Conta no Railway (railway.app)
- Domínio `quantify.click` já registrado
- Acesso ao Cloudflare (para apontar o domínio)
- GitHub conectado ao Railway (para CI/CD automático)

## Passo 1: Criar Projeto no Railway

1. Acesse [railway.app](https://railway.app) e faça login
2. Clique em **"New Project"**
3. Selecione **"Deploy from GitHub"**
4. Conecte seu repositório `wallax200-art/quotify`
5. Selecione a branch `main`
6. Clique em **"Deploy"**

O Railway vai começar a fazer o build automaticamente.

## Passo 2: Adicionar Banco de Dados MySQL

1. No dashboard do Railway, clique em **"+ New"**
2. Selecione **"Database"** → **"MySQL"**
3. Aguarde o banco ser provisionado (leva ~2 minutos)
4. O Railway vai criar automaticamente a variável `DATABASE_URL`

## Passo 3: Configurar Variáveis de Ambiente

No dashboard do Railway, vá para **"Variables"** e adicione as seguintes variáveis:

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `NODE_ENV` | `production` | Ambiente de produção |
| `VITE_APP_ID` | `seu_app_id_manus` | ID da aplicação Manus OAuth |
| `OAUTH_SERVER_URL` | `https://api.manus.im` | URL do servidor OAuth |
| `VITE_OAUTH_PORTAL_URL` | `https://portal.manus.im` | URL do portal OAuth |
| `JWT_SECRET` | `gerar_uma_chave_aleatoria_segura` | Chave para assinar sessões |
| `OWNER_NAME` | `Seu Nome` | Nome do proprietário |
| `OWNER_OPEN_ID` | `seu_open_id` | Open ID do proprietário |
| `BUILT_IN_FORGE_API_URL` | `https://api.manus.im` | URL da API Manus |
| `BUILT_IN_FORGE_API_KEY` | `sua_chave_api` | Chave da API Manus |
| `VITE_FRONTEND_FORGE_API_URL` | `https://api.manus.im` | URL da API para frontend |
| `VITE_FRONTEND_FORGE_API_KEY` | `sua_chave_frontend` | Chave da API para frontend |
| `VITE_APP_TITLE` | `Quotify` | Título da aplicação |
| `VITE_APP_LOGO` | `https://seu-cdn.com/logo.png` | URL do logo |

**Nota:** O `DATABASE_URL` é criado automaticamente pelo Railway quando você adiciona o MySQL.

## Passo 4: Configurar Domínio Customizado

1. No Railway, vá para **"Settings"** do projeto
2. Clique em **"Domains"**
3. Clique em **"+ Add Domain"**
4. Digite `quantify.click`
5. O Railway vai gerar um CNAME como: `railway-xxx.railway.app`

## Passo 5: Apontar Domínio no Cloudflare

1. Acesse [cloudflare.com](https://cloudflare.com) e faça login
2. Selecione o domínio `quantify.click`
3. Vá para **"DNS"**
4. Clique em **"+ Add Record"**
5. Configure assim:
   - **Type:** CNAME
   - **Name:** @ (ou deixe em branco para raiz)
   - **Target:** `railway-xxx.railway.app` (o CNAME do Railway)
   - **TTL:** Auto
   - **Proxy status:** Proxied (nuvem laranja)

6. Clique em **"Save"**

Aguarde 5-10 minutos para o DNS se propagar. Depois acesse `https://quantify.click` para verificar.

## Passo 6: Migrar Dados do Banco Antigo (Opcional)

Se você quer migrar os usuários existentes do banco Manus para o Railway:

1. Exporte os dados do banco antigo:
```bash
mysqldump -h gateway04.us-east-1.prod.aws.tidbcloud.com \
  -u 2pUNe727c8yqxdN.root \
  -p'IsLZXG1984TrSkY1P7ry' \
  ji3XHgPR7e79CMEH66Wkcf > backup.sql
```

2. Importe no novo banco Railway:
```bash
mysql -h seu-railway-host.railway.app \
  -u root \
  -p'sua-senha' \
  seu-banco < backup.sql
```

## Passo 7: Verificar Deploy

1. Acesse `https://quantify.click` no navegador
2. Faça login com uma conta de teste
3. Verifique se todos os dados estão carregando corretamente
4. Teste a criação de um orçamento

## Troubleshooting

**O site não carrega:**
- Verifique se o DNS se propagou (pode levar até 24h)
- Confirme que o CNAME no Cloudflare está correto
- Verifique os logs no Railway: **"Logs"** no dashboard

**Erro de banco de dados:**
- Confirme que `DATABASE_URL` está configurada
- Verifique se o MySQL foi criado no Railway
- Rode as migrações: `pnpm db:push`

**OAuth não funciona:**
- Confirme que `VITE_APP_ID` e `OAUTH_SERVER_URL` estão corretos
- Verifique se a URL de callback está registrada no Manus

## Próximas Etapas

- Configure backups automáticos do banco no Railway
- Monitore o uso de recursos (CPU, memória, banda)
- Configure alertas para downtime
- Implemente logs centralizados (Sentry, LogRocket)

## Suporte

Para dúvidas sobre Railway, consulte a [documentação oficial](https://docs.railway.app).
Para dúvidas sobre o Quotify, verifique o repositório: https://github.com/wallax200-art/quotify

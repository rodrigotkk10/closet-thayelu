# Closet Thay & Lú — catálogo virtual

Catálogo responsivo com sacola, encaminhamento de pedidos para WhatsApp e painel administrativo protegido pelo Supabase. O painel permite cadastrar, editar, ocultar, excluir produtos e enviar fotos para o Storage.

## Configuração local

1. Instale Node.js LTS e execute `npm install`.
2. Copie `.env.example` para `.env` e preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` usando apenas a chave pública anon/publishable.
3. Execute todo o arquivo `supabase/schema.sql` no SQL Editor do Supabase.
4. Em Authentication → Users, crie os usuários administrativos e confirme os e-mails.
5. Em Authentication → URL Configuration, defina o Site URL como o endereço final da Vercel e adicione também `https://seu-dominio.vercel.app/**` em Redirect URLs.
6. Execute `npm run dev`.

## Vercel

Importe o repositório, configure as duas variáveis de ambiente para Production, Preview e Development e faça um novo deploy. O arquivo `vercel.json` mantém o funcionamento das rotas e links de autenticação em hospedagem estática.

## Segurança

Nunca publique `.env`, senhas, tokens ou a chave `service_role`. O frontend usa somente a chave pública. Desative o cadastro público de usuários e crie apenas os administradores necessários. As políticas RLS e Storage devem ser aplicadas pelo SQL incluído neste projeto.

Os valores iguais a zero aparecem como “Consulte o valor”. Pedidos são montados no navegador e encaminhados ao WhatsApp; não há cobrança online nem registro central de pedidos.

# Closet Thay & Lú — catálogo virtual

Primeira versão responsiva de catálogo, sacola e encaminhamento de pedidos para WhatsApp. Inclui painel administrativo com login Supabase e envio de fotos.

## Tecnologias
- React + Vite
- Supabase: banco de dados, autenticação e armazenamento de fotos
- GitHub Pages ou Vercel para hospedagem estática

## Rodar localmente
1. Instale Node.js LTS.
2. Na pasta do projeto, execute `npm install`.
3. Copie `.env.example` para `.env` e preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` com os valores do projeto Supabase.
4. No SQL Editor do Supabase, execute o conteúdo de `supabase/schema.sql`.
5. No Supabase Authentication, crie dois usuários autorizados, um para Thaysa e outro para Luciana. Desative o cadastro público de usuários (sign-ups).
6. Execute `npm run dev` e abra o endereço local indicado pelo Vite.

Sem as variáveis do Supabase, o site abre em modo de demonstração com produtos de exemplo, mas não salva alterações nem habilita autenticação.

## Publicar gratuitamente na Vercel
1. Suba esta pasta para um repositório GitHub.
2. Importe o repositório na Vercel.
3. Configure as variáveis de ambiente `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` nas configurações do projeto.
4. Faça o deploy. O domínio gerado poderá ser colocado na bio do Instagram `@closetthayelu` e nos Stories.

Também é possível usar GitHub Pages, mas a Vercel costuma ser mais simples para deploy contínuo de projetos Vite.

## Segurança importante
- Use somente a chave `anon`/public do Supabase no frontend. **Nunca coloque a `service_role` no código do site ou no GitHub.**
- As políticas de linha (RLS) devem permanecer habilitadas.
- Crie apenas os dois usuários administrativos autorizados e use senhas fortes e únicas.
- O SQL permite que qualquer usuário autenticado gerencie produtos; portanto, não habilite cadastro público e não compartilhe contas. Se a loja crescer, recomenda-se restringir as permissões por usuário/role.
- Valores `0` são tratados como “Consulte o valor”. Edite os preços antes de divulgar o catálogo.
- Os pedidos são montados no navegador e enviados como mensagem pré-preenchida ao WhatsApp escolhido; a cliente precisa tocar em enviar. Não há cobrança online nem registro central de pedidos nesta versão.

## WhatsApp
- Thaysa: `+55 83 98644-3504`
- Luciana: `+55 83 98872-5949`

## Personalização
A logo fornecida foi adicionada como `public/logo.png`. As cores iniciais usam vinho, rosa e branco inspirados nela. Ajuste categorias, textos, preços e fotos conforme o catálogo real.
Tentativa de publicação pela Vercel.

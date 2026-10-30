import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import {
  Search,
  ShoppingBag,
  Plus,
  Minus,
  X,
  Instagram,
  MessageCircle,
  LockKeyhole,
  LogOut,
  Pencil,
  Trash2,
  ImagePlus,
  Heart,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import './style.css';

const envReady = Boolean(
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const supabase = envReady
  ? createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY,
      { auth: { flowType: 'pkce', detectSessionInUrl: false } }
    )
  : null;

const sellers = [
  { name: 'Thaysa', phone: '5583986443504' },
  { name: 'Luciana', phone: '5583988725949' }
];

const categories = [
  'Todos',
  'Cuidados íntimos',
  'Corpo e banho',
  'Cabelos',
  'Kits e presentes',
  'Outros'
];

const demoProducts = [
  {
    id: 'demo1',
    name: 'Sabonete íntimo',
    category: 'Cuidados íntimos',
    description: 'Cuidado delicado para sua rotina de autocuidado.',
    price: 0,
    image_url: '',
    active: true
  },
  {
    id: 'demo2',
    name: 'Pomada para massagem',
    category: 'Corpo e banho',
    description: 'Uma opção para complementar seu momento de cuidado.',
    price: 0,
    image_url: '',
    active: true
  },
  {
    id: 'demo3',
    name: 'Esfoliante corporal',
    category: 'Corpo e banho',
    description: 'Ajude a deixar sua rotina de cuidados ainda mais especial.',
    price: 0,
    image_url: '',
    active: true
  },
  {
    id: 'demo4',
    name: 'Hidratante corporal',
    category: 'Corpo e banho',
    description: 'Hidratação e carinho para a pele.',
    price: 0,
    image_url: '',
    active: true
  },
  {
    id: 'demo5',
    name: 'Kit capilar',
    category: 'Cabelos',
    description: 'Cuidados para valorizar seus cabelos.',
    price: 0,
    image_url: '',
    active: true
  },
  {
    id: 'demo6',
    name: 'Body Splash capilar',
    category: 'Cabelos',
    description: 'Perfume e frescor para completar seu visual.',
    price: 0,
    image_url: '',
    active: true
  },
  {
    id: 'demo7',
    name: 'Reparador de pontas Tyrrel 7 ml',
    category: 'Cabelos',
    description: 'Prático para levar com você.',
    price: 0,
    image_url: '',
    active: true
  },
  {
    id: 'demo8',
    name: 'Reparador de pontas Tyrrel 50 ml',
    category: 'Cabelos',
    description: 'Cuidado capilar para a sua rotina.',
    price: 0,
    image_url: '',
    active: true
  }
];

const money = n =>
  Number(n || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });

function App() {
  const [products, setProducts] = useState(demoProducts);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Todos');

  const [cart, setCart] = useState({});
  const [cartOpen, setCartOpen] = useState(false);
  const [seller, setSeller] = useState('');

  const [page, setPage] = useState('catalog');
  const [session, setSession] = useState(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [adminMessage, setAdminMessage] = useState('');

  // Recuperação e redefinição de senha
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [recoveryMessage, setRecoveryMessage] = useState('');
  const [recoveryLoading, setRecoveryLoading] = useState(false);

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: '',
    category: 'Cabelos',
    description: '',
    price: '',
    image_url: '',
    active: true
  });

  // Inicialização do Supabase e detecção do link de recuperação
  useEffect(() => {
    if (!supabase) return;

    let recoveryDetected = false;

    const checkRecoveryUrl = () => {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const queryParams = new URLSearchParams(window.location.search);
      const errorDescription = hashParams.get('error_description') || queryParams.get('error_description');
      const isRecovery = hashParams.get('type') === 'recovery' || queryParams.get('type') === 'recovery';

      if (isRecovery || errorDescription || queryParams.has('code')) {
        recoveryDetected = true;
        setPage('reset');
        if (errorDescription) {
          setRecoveryMessage('O link de recuperação expirou ou é inválido. Solicite um novo e-mail.');
        }
      }
    };

    async function initializeAuth() {
      checkRecoveryUrl();

      // No fluxo PKCE, o e-mail retorna com ?code=... e o código precisa
      // ser trocado por uma sessão antes de updateUser funcionar.
      const code = new URLSearchParams(window.location.search).get('code');
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setRecoveryMessage('O link de recuperação expirou ou já foi utilizado. Solicite um novo e-mail.');
        }
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      // Compatibilidade com links antigos do fluxo implicit, que trazem
      // access_token e refresh_token depois do caractere #.
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });
        if (error) {
          setRecoveryMessage('O link de recuperação expirou ou já foi utilizado. Solicite um novo e-mail.');
        }
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Erro ao recuperar sessão:', error);
        return;
      }

      setSession(data.session);

      if (data.session && !recoveryDetected) {
        setPage(current => current === 'login' ? 'admin' : current);
        loadProducts(true);
      }
    }

    initializeAuth();
    loadProducts();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);

      if (event === 'PASSWORD_RECOVERY') {
        recoveryDetected = true;
        setPage('reset');
        setRecoveryMessage('');
      }

      if (event === 'SIGNED_IN' && !recoveryDetected) {
        setPage(current => current === 'login' ? 'admin' : current);
        loadProducts(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadProducts(includeInactive = false) {
    if (!supabase) return;

    setLoading(true);

    try {
      let request = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (!includeInactive) {
        request = request.eq('active', true);
      }

      const { data, error } = await request;

      if (error) {
        console.error('Erro ao carregar produtos:', error);
      } else if (data) {
        setProducts(data);
      }
    } finally {
      setLoading(false);
    }
  }

  const shown = useMemo(
    () =>
      products.filter(
        p =>
          p.active !== false &&
          (category === 'Todos' || p.category === category) &&
          `${p.name} ${p.description || ''}`
            .toLowerCase()
            .includes(query.toLowerCase())
      ),
    [products, category, query]
  );

  const cartItems = Object.entries(cart)
    .map(([id, qty]) => ({
      product:
        products.find(p => String(p.id) === id) ||
        demoProducts.find(p => String(p.id) === id),
      qty
    }))
    .filter(item => item.product);

  const count = cartItems.reduce((n, item) => n + item.qty, 0);

  const total = cartItems.reduce(
    (n, item) =>
      n + (Number(item.product.price) || 0) * item.qty,
    0
  );

  function changeQty(product, delta) {
    setCart(old => {
      const next = { ...old };
      const qty = (next[product.id] || 0) + delta;

      if (qty <= 0) {
        delete next[product.id];
      } else {
        next[product.id] = qty;
      }

      return next;
    });
  }

  function checkout() {
    if (!seller) {
      alert('Escolha com quem deseja falar: Thaysa ou Luciana.');
      return;
    }

    if (!cartItems.length) return;

    const person = sellers.find(s => s.name === seller);

    const lines = cartItems
      .map(
        ({ product, qty }) =>
          `• ${product.name} — ${qty}x ${
            Number(product.price) > 0
              ? money(product.price)
              : 'consultar valor'
          }`
      )
      .join('\n');

    const totalText = total > 0 ? money(total) : 'a confirmar';

    const message =
      `Olá, ${person.name}! Vim pelo catálogo do Closet Thay & Lú e gostaria de fazer este pedido:\n\n` +
      `${lines}\n\n` +
      `Total estimado: ${totalText}\n` +
      'Podemos confirmar disponibilidade e entrega?';

    window.open(
      `https://wa.me/${person.phone}?text=${encodeURIComponent(message)}`,
      '_blank',
      'noopener,noreferrer'
    );
  }

  // Login administrativo
  async function signIn(e) {
    e.preventDefault();
    setAuthError('');

    if (!supabase) {
      setAuthError(
        'Configure as variáveis do Supabase para ativar o painel.'
      );
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setAuthError(
        error.message?.toLowerCase().includes('email not confirmed')
          ? 'Este e-mail ainda não foi confirmado no Supabase.'
          : 'Não foi possível entrar. Confira o e-mail e a senha.'
      );
    }
  }

  // Enviar e-mail de recuperação de senha
  async function requestPasswordReset(e) {
    e.preventDefault();
    setRecoveryMessage('');

    if (!supabase) {
      setRecoveryMessage(
        'O serviço de autenticação não está configurado.'
      );
      return;
    }

    if (!email.trim()) {
      setRecoveryMessage(
        'Digite o e-mail cadastrado para receber o link de recuperação.'
      );
      return;
    }

    setRecoveryLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/`
        }
      );

      if (error) {
        setRecoveryMessage(
          'Não foi possível enviar o e-mail agora. Tente novamente mais tarde.'
        );
      } else {
        setRecoveryMessage(
          'Se o e-mail estiver cadastrado, você receberá um link para criar uma nova senha. Verifique também o spam.'
        );
      }
    } finally {
      setRecoveryLoading(false);
    }
  }

  // Salvar a nova senha recebida pelo link
  async function saveNewPassword(e) {
    e.preventDefault();
    setRecoveryMessage('');

    if (!supabase) {
      setRecoveryMessage(
        'O serviço de autenticação não está configurado.'
      );
      return;
    }

    if (newPassword.length < 8) {
      setRecoveryMessage(
        'A nova senha precisa ter pelo menos 8 caracteres.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setRecoveryMessage('As senhas digitadas não são iguais.');
      return;
    }

    setRecoveryLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        setRecoveryMessage(
          'Não foi possível alterar a senha. O link pode ter expirado. Solicite outro e-mail de recuperação.'
        );
        return;
      }

      await supabase.auth.signOut();

      setSession(null);
      setPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setRecoveryMessage('');
      setAuthError('Senha alterada com sucesso! Entre com sua nova senha.');
      setPage('login');

      // Remove os tokens da barra de endereço após concluir a recuperação
      window.history.replaceState(
        {},
        document.title,
        window.location.pathname
      );
    } finally {
      setRecoveryLoading(false);
    }
  }

  async function signOut() {
    await supabase?.auth.signOut();
    setSession(null);
    setPage('catalog');
  }

  function startNew() {
    setEditing(null);
    setForm({
      name: '',
      category: 'Cabelos',
      description: '',
      price: '',
      image_url: '',
      active: true
    });
    setAdminMessage('');
  }

  function startEdit(product) {
    setEditing(product.id);

    setForm({
      name: product.name || '',
      category: product.category || 'Outros',
      description: product.description || '',
      price: product.price ?? '',
      image_url: product.image_url || '',
      active: product.active !== false
    });

    setAdminMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function saveProduct(e) {
    e.preventDefault();

    if (!supabase) {
      setAdminMessage(
        'Configure o Supabase para salvar produtos permanentemente.'
      );
      return;
    }

    const payload = {
      name: form.name.trim(),
      category: form.category,
      description: form.description.trim(),
      price: Number(form.price) || 0,
      image_url: form.image_url.trim(),
      active: form.active
    };

    const result = editing
      ? await supabase
          .from('products')
          .update(payload)
          .eq('id', editing)
      : await supabase.from('products').insert(payload);

    if (result.error) {
      setAdminMessage('Erro ao salvar: ' + result.error.message);
      return;
    }

    setAdminMessage('Produto salvo com sucesso.');
    startNew();
    await loadProducts(true);
  }

  async function deleteProduct(id) {
    if (!confirm('Excluir este produto do catálogo?')) return;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      setAdminMessage('Erro ao excluir produto.');
      return;
    }

    await loadProducts(true);
  }

  async function uploadImage(file) {
    if (!file || !supabase) return;

    const ext = file.name.split('.').pop();
    const path =
      `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabase.storage
      .from('product-images')
      .upload(path, file, { upsert: false });

    if (error) {
      setAdminMessage(
        'Falha no envio da foto. Confira as permissões do bucket product-images.'
      );
      return;
    }

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(path);

    setForm(current => ({
      ...current,
      image_url: data.publicUrl
    }));
  }

  const goAdmin = () => {
    setAuthError('');
    setPage(session ? 'admin' : 'login');
    setCartOpen(false);
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <button
          className="brand"
          onClick={() => setPage('catalog')}
          aria-label="Ir para o catálogo"
        >
          <img src="/logo.png" alt="Logo Closet Thay & Lú" />
          <span>
            <b>Closet Thay & Lú</b>
            <small>Seu momento de se cuidar</small>
          </span>
        </button>

        <div className="header-actions">
          <a
            className="instagram"
            href="https://instagram.com/closetthayelu"
            target="_blank"
            rel="noreferrer"
          >
            <Instagram size={17} />
            <span>@closetthayelu</span>
          </a>

          <button
            className="cart-button"
            onClick={() => setCartOpen(true)}
            aria-label="Abrir sacola"
          >
            <ShoppingBag size={19} />
            <span>Sacola</span>
            {count > 0 && <i>{count}</i>}
          </button>
        </div>
      </header>

      {/* CATÁLOGO PÚBLICO */}
      {page === 'catalog' && (
        <>
          <section className="hero">
            <div className="hero-copy">
              <span className="eyebrow">
                <Sparkles size={14} />
                BELEZA, CUIDADO E AUTOESTIMA
              </span>

              <h1>
                Seu cuidado.
                <br />
                <em>Seu momento.</em>
              </h1>

              <p>
                Escolha seus favoritos e faça seu pedido com a gente pelo
                WhatsApp.
              </p>

              <a href="#produtos" className="primary-link">
                Explorar produtos <span>↓</span>
              </a>
            </div>

            <div className="hero-art">
              <div className="hero-circle">
                <img src="/logo.png" alt="Closet Thay & Lú" />
              </div>
              <span className="floating-heart">♡</span>
            </div>
          </section>

          <main id="produtos" className="catalog">
            <div className="section-heading">
              <div>
                <span className="eyebrow">NOSSO CATÁLOGO</span>
                <h2>Encontre seu favorito</h2>
                <p>Um carinho a mais na sua rotina.</p>
              </div>

              <div className="search-box">
                <Search size={18} />
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Buscar produto..."
                  aria-label="Buscar produto"
                />
              </div>
            </div>

            <nav className="category-list" aria-label="Categorias">
              {categories.map(c => (
                <button
                  key={c}
                  className={category === c ? 'active' : ''}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </button>
              ))}
            </nav>

            {!envReady && (
              <div className="setup-note">
                <Sparkles size={18} />
                <span>
                  <b>Prévia do catálogo:</b> conecte o Supabase para
                  cadastrar fotos, preços e produtos reais. Os itens abaixo
                  são exemplos e ainda não têm preço definido.
                </span>
              </div>
            )}

            {loading ? (
              <div className="empty-state">Carregando produtos…</div>
            ) : shown.length === 0 ? (
              <div className="empty-state">
                Não encontramos produtos com essa busca.
              </div>
            ) : (
              <div className="product-grid">
                {shown.map(product => (
                  <article className="product-card" key={product.id}>
                    <div className="product-image">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                        />
                      ) : (
                        <div className="placeholder-product">
                          <span>T&L</span>
                          <small>{product.category}</small>
                        </div>
                      )}

                      <button
                        className="quick-add"
                        onClick={() => changeQty(product, 1)}
                        aria-label={`Adicionar ${product.name}`}
                      >
                        <Plus size={19} />
                      </button>
                    </div>

                    <div className="product-info">
                      <span className="product-category">
                        {product.category}
                      </span>
                      <h3>{product.name}</h3>
                      <p>{product.description}</p>

                      <div className="product-bottom">
                        <b>
                          {Number(product.price) > 0
                            ? money(product.price)
                            : 'Consulte o valor'}
                        </b>

                        <button onClick={() => changeQty(product, 1)}>
                          Adicionar <Plus size={15} />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </main>

          <section className="whatsapp-strip">
            <div className="wa-icon">
              <MessageCircle />
            </div>
            <div>
              <h3>Precisou de ajuda?</h3>
              <p>Escolha uma de nós e vamos te atender com carinho.</p>
            </div>
            <button
              onClick={() => {
                setCartOpen(true);
                setSeller('');
              }}
            >
              Falar com a gente
            </button>
          </section>

          <footer>
            <img src="/logo.png" alt="" />
            <p>Closet Thay & Lú · Se cuida, se ama, se presenteia!</p>
            <small>Feito com carinho para você.</small>
          </footer>
        </>
      )}

      {/* LOGIN ADMINISTRATIVO */}
      {page === 'login' && (
        <main className="admin-wrap">
          <button
            className="back-link"
            onClick={() => {
              setAuthError('');
              setPage('catalog');
            }}
          >
            <ArrowLeft size={16} /> Voltar ao catálogo
          </button>

          <div className="admin-card">
            <div className="admin-logo">
              <img src="/logo.png" alt="Closet Thay & Lú" />
            </div>

            <span className="eyebrow">ÁREA RESTRITA</span>
            <h1>Painel administrativo</h1>
            <p>Entre com seu acesso para gerenciar os produtos da loja.</p>

            <form onSubmit={signIn} className="admin-form">
              <label>
                E-mail
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                />
              </label>

              <label>
                Senha
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Sua senha"
                />
              </label>

              {authError && (
                <p
                  className={
                    authError.startsWith('Senha alterada')
                      ? 'help-text'
                      : 'error-message'
                  }
                >
                  {authError}
                </p>
              )}

              <button className="primary-button" type="submit">
                <LockKeyhole size={17} /> Entrar
              </button>

              <button
                type="button"
                className="back-link"
                onClick={() => {
                  setAuthError('');
                  setRecoveryMessage('');
                  setPage('forgot');
                }}
              >
                Esqueci minha senha
              </button>
            </form>

            {!envReady && (
              <p className="help-text">
                Para ativar o acesso, configure as variáveis do Supabase.
              </p>
            )}
          </div>
        </main>
      )}

      {/* SOLICITAR E-MAIL DE RECUPERAÇÃO */}
      {page === 'forgot' && (
        <main className="admin-wrap">
          <button
            className="back-link"
            onClick={() => {
              setRecoveryMessage('');
              setPage('login');
            }}
          >
            <ArrowLeft size={16} /> Voltar ao login
          </button>

          <div className="admin-card">
            <div className="admin-logo">
              <img src="/logo.png" alt="Closet Thay & Lú" />
            </div>

            <span className="eyebrow">RECUPERAÇÃO DE ACESSO</span>
            <h1>Esqueceu sua senha?</h1>
            <p>
              Digite o e-mail da conta administrativa para receber o link
              de recuperação.
            </p>

            <form
              className="admin-form"
              onSubmit={requestPasswordReset}
            >
              <label>
                E-mail cadastrado
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                />
              </label>

              {recoveryMessage && (
                <p className="help-text">{recoveryMessage}</p>
              )}

              <button
                className="primary-button"
                type="submit"
                disabled={recoveryLoading}
              >
                {recoveryLoading
                  ? 'Enviando...'
                  : 'Enviar link de recuperação'}
              </button>
            </form>
          </div>
        </main>
      )}

      {/* TELA PARA CRIAR A NOVA SENHA */}
      {page === 'reset' && (
        <main className="admin-wrap">
          <div className="admin-card">
            <div className="admin-logo">
              <img src="/logo.png" alt="Closet Thay & Lú" />
            </div>

            <span className="eyebrow">NOVA SENHA</span>
            <h1>Crie sua nova senha</h1>
            <p>
              Escolha uma senha com pelo menos 8 caracteres e confirme
              abaixo.
            </p>

            <form className="admin-form" onSubmit={saveNewPassword}>
              <label>
                Nova senha
                <input
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Digite a nova senha"
                />
              </label>

              <label>
                Confirmar nova senha
                <input
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Digite novamente a senha"
                />
              </label>

              {recoveryMessage && (
                <p className="error-message">{recoveryMessage}</p>
              )}

              <button
                className="primary-button"
                type="submit"
                disabled={recoveryLoading}
              >
                {recoveryLoading
                  ? 'Salvando...'
                  : 'Salvar nova senha'}
              </button>
            </form>
          </div>
        </main>
      )}

      {/* PAINEL DE PRODUTOS */}
      {page === 'admin' && (
        <main className="admin-wrap admin-wide">
          <div className="admin-title">
            <div>
              <span className="eyebrow">GESTÃO DA LOJA</span>
              <h1>Produtos</h1>
              <p>Cadastre e atualize o catálogo do Closet Thay & Lú.</p>
            </div>

            <button className="secondary-button" onClick={signOut}>
              <LogOut size={16} /> Sair
            </button>
          </div>

          <div className="admin-layout">
            <section className="admin-card editor-card">
              <h2>
                {editing ? 'Editar produto' : 'Adicionar produto'}
              </h2>

              <form className="admin-form" onSubmit={saveProduct}>
                <label>
                  Nome do produto
                  <input
                    required
                    value={form.name}
                    onChange={e =>
                      setForm({ ...form, name: e.target.value })
                    }
                    placeholder="Ex.: Hidratante corporal"
                  />
                </label>

                <label>
                  Categoria
                  <select
                    value={form.category}
                    onChange={e =>
                      setForm({ ...form, category: e.target.value })
                    }
                  >
                    {categories
                      .filter(c => c !== 'Todos')
                      .map(c => (
                        <option key={c}>{c}</option>
                      ))}
                  </select>
                </label>

                <label>
                  Descrição
                  <textarea
                    rows="3"
                    value={form.description}
                    onChange={e =>
                      setForm({ ...form, description: e.target.value })
                    }
                    placeholder="Conte um pouco sobre o produto"
                  />
                </label>

                <label>
                  Preço (R$)
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={e =>
                      setForm({ ...form, price: e.target.value })
                    }
                    placeholder="0,00"
                  />
                </label>

                <label>
                  Foto do produto (URL)
                  <input
                    value={form.image_url}
                    onChange={e =>
                      setForm({ ...form, image_url: e.target.value })
                    }
                    placeholder="https://..."
                  />
                </label>

                <label className="upload-button">
                  <ImagePlus size={17} />
                  Enviar foto do dispositivo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => uploadImage(e.target.files?.[0])}
                  />
                </label>

                {form.image_url && (
                  <img
                    className="image-preview"
                    src={form.image_url}
                    alt="Prévia do produto"
                  />
                )}

                <label className="check-label">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={e =>
                      setForm({ ...form, active: e.target.checked })
                    }
                  />
                  Produto disponível no catálogo
                </label>

                {adminMessage && (
                  <p className="help-text">{adminMessage}</p>
                )}

                <div className="form-actions">
                  <button type="submit" className="primary-button">
                    {editing
                      ? 'Salvar alterações'
                      : 'Cadastrar produto'}
                  </button>

                  {editing && (
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={startNew}
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </section>

            <section className="admin-card product-manager">
              <h2>
                Catálogo cadastrado <span>{products.length}</span>
              </h2>

              {!envReady ? (
                <p className="help-text">
                  A lista real aparece após configurar o Supabase.
                </p>
              ) : (
                products.map(product => (
                  <div className="manage-row" key={product.id}>
                    <div className="manage-thumb">
                      {product.image_url ? (
                        <img src={product.image_url} alt="" />
                      ) : (
                        <span>T&L</span>
                      )}
                    </div>

                    <div className="manage-detail">
                      <b>{product.name}</b>
                      <small>
                        {product.category} · {money(product.price)}
                      </small>
                    </div>

                    <button
                      title="Editar"
                      onClick={() => startEdit(product)}
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      title="Excluir"
                      onClick={() => deleteProduct(product.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </section>
          </div>
        </main>
      )}

      {/* ATALHO DA ÁREA ADMINISTRATIVA */}
      {page === 'catalog' && (
        <button
          className="admin-shortcut"
          onClick={goAdmin}
          title="Área administrativa"
        >
          <LockKeyhole size={16} />
        </button>
      )}

      {/* SACOLA DE COMPRAS */}
      {cartOpen && (
        <div
          className="overlay"
          onMouseDown={e => {
            if (e.target === e.currentTarget) setCartOpen(false);
          }}
        >
          <aside className="cart-drawer">
            <div className="drawer-heading">
              <div>
                <span className="eyebrow">SEUS FAVORITOS</span>
                <h2>
                  Sua sacola <span>({count})</span>
                </h2>
              </div>

              <button
                className="icon-button"
                onClick={() => setCartOpen(false)}
                aria-label="Fechar sacola"
              >
                <X />
              </button>
            </div>

            {!cartItems.length ? (
              <div className="empty-cart">
                <ShoppingBag size={34} />
                <h3>Sua sacola está vazia</h3>
                <p>
                  Adicione seus produtos favoritos para continuar.
                </p>
                <button
                  className="primary-button"
                  onClick={() => setCartOpen(false)}
                >
                  Ver produtos
                </button>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cartItems.map(({ product, qty }) => (
                    <div className="cart-item" key={product.id}>
                      <div className="cart-thumb">
                        {product.image_url ? (
                          <img src={product.image_url} alt="" />
                        ) : (
                          <span>T&L</span>
                        )}
                      </div>

                      <div className="cart-item-detail">
                        <b>{product.name}</b>
                        <small>
                          {Number(product.price) > 0
                            ? money(product.price)
                            : 'Valor a confirmar'}
                        </small>

                        <div className="qty-controls">
                          <button
                            onClick={() => changeQty(product, -1)}
                            aria-label="Diminuir quantidade"
                          >
                            <Minus size={14} />
                          </button>

                          <span>{qty}</span>

                          <button
                            onClick={() => changeQty(product, 1)}
                            aria-label="Aumentar quantidade"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>

                      <button
                        className="remove-item"
                        onClick={() => changeQty(product, -qty)}
                        aria-label="Remover produto"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="cart-footer">
                  <div className="total-row">
                    <span>Total estimado</span>
                    <b>{total > 0 ? money(total) : 'A confirmar'}</b>
                  </div>

                  <p>Quem vai te atender?</p>

                  <div className="seller-options">
                    {sellers.map(s => (
                      <button
                        key={s.name}
                        className={seller === s.name ? 'selected' : ''}
                        onClick={() => setSeller(s.name)}
                      >
                        <Heart size={16} />
                        {s.name}
                      </button>
                    ))}
                  </div>

                  <button
                    className="whatsapp-button"
                    onClick={checkout}
                  >
                    <MessageCircle size={19} />
                    Continuar pelo WhatsApp
                  </button>

                  <small>
                    O pedido será enviado para o WhatsApp escolhido.
                    A compra só será confirmada após o atendimento.
                  </small>
                </div>
              </>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);

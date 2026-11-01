import { Canvas } from '@react-three/fiber';
import { motion } from 'framer-motion';
import { Link, NavLink, Route, Routes } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

type Category = { id: number; name: string; slug: string; description?: string | null };
type Plan = { id: number; name: string; slug: string; price: number; currency: string; description: string; features: string };
type Ad = { id: number; title: string; description: string; category_id: number; price: number; location: string; user_id: number; status: string; is_premium: boolean; is_featured: boolean; views: number };
type Business = { id: number; name: string; owner_name: string; category_id: number; description: string; website?: string | null; city: string; is_featured: boolean };

const categoriesSeed = [
  'Imóveis',
  'Automóveis',
  'Telemóveis e computadores',
  'Empregos',
  'Moda',
  'Agricultura',
  'Serviços',
  'Educação',
  'Tecnologia',
  'Música e entretenimento',
];

function HeroScene() {
  return (
    <div className="h-[360px] w-full rounded-[28px] border border-white/10 bg-slate-950/80 p-4">
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
        <ambientLight intensity={1.35} />
        <directionalLight position={[2, 2, 2]} intensity={2.5} />
        <mesh>
          <icosahedronGeometry args={[1.6, 1]} />
          <meshStandardMaterial color="#60a5fa" emissive="#3b82f6" emissiveIntensity={0.45} metalness={0.7} roughness={0.2} />
        </mesh>
        <mesh position={[2.2, 1.4, -1]}>
          <torusKnotGeometry args={[0.7, 0.2, 80, 16]} />
          <meshStandardMaterial color="#a78bfa" emissive="#8b5cf6" emissiveIntensity={0.5} metalness={0.7} roughness={0.2} />
        </mesh>
        <mesh position={[-2.2, -1.2, -1.5]}>
          <octahedronGeometry args={[0.8]} />
          <meshStandardMaterial color="#f5c96f" emissive="#f59e0b" emissiveIntensity={0.5} metalness={0.7} roughness={0.2} />
        </mesh>
      </Canvas>
    </div>
  );
}

function AppLayout() {
  const navItems = [
    { to: '/', label: 'Início' },
    { to: '/marketplace', label: 'Marketplace' },
    { to: '/businesses', label: 'Empresas' },
    { to: '/ai', label: 'YANO AI' },
    { to: '/admin', label: 'Admin' },
    { to: '/dashboard', label: 'Utilizador' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 font-black text-lg text-white shadow-glow">Y</div>
            <div>
              <div className="text-lg font-black tracking-[0.2em] text-white">YANOMIX</div>
              <div className="text-[10px] uppercase tracking-[0.4em] text-slate-400">Business Hub</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `text-sm font-medium transition ${isActive ? 'text-blue-300' : 'text-slate-300 hover:text-white'}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button className="btn-secondary hidden sm:inline-flex">Iniciar sessão</button>
            <button className="btn-primary">Anunciar</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/businesses" element={<BusinessesPage />} />
          <Route path="/ai" element={<AiPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/dashboard" element={<UserDashboard />} />
        </Routes>
      </main>
    </div>
  );
}

function SearchBar() {
  return (
    <div className="panel mt-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex-1">
        <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">Pesquisa inteligente</label>
        <input
          type="text"
          placeholder="Procure imóveis, empregos, serviços, negócios..."
          className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none ring-0 placeholder:text-slate-500"
        />
      </div>
      <div className="flex gap-3">
        <select className="rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none">
          <option>Categoria</option>
          {categoriesSeed.map((category) => (
            <option key={category}>{category}</option>
          ))}
        </select>
        <button className="btn-primary">Buscar</button>
      </div>
    </div>
  );
}

function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/api/categories`).then((r) => r.json()),
      fetch(`${API_URL}/api/plans`).then((r) => r.json()),
      fetch(`${API_URL}/api/ads`).then((r) => r.json()),
    ])
      .then(([cat, plan, ad]) => {
        setCategories(cat);
        setPlans(plan);
        setAds(ad);
      })
      .catch(() => {
        setCategories([
          { id: 1, name: 'Imóveis', slug: 'imoveis' },
          { id: 2, name: 'Automóveis', slug: 'automoveis' },
          { id: 3, name: 'Serviços', slug: 'servicos' },
        ]);
        setPlans([
          { id: 1, name: 'FREE', slug: 'free', price: 0, currency: 'Kz', description: 'Acesso básico', features: '1 anúncio' },
          { id: 2, name: 'STARTER', slug: 'starter', price: 2500, currency: 'Kz', description: 'Para pequenos vendedores', features: '5 anúncios' },
        ]);
        setAds([
          { id: 1, title: 'Apartamento moderno', description: '3 quartos', category_id: 1, price: 5500000, location: 'Luanda', user_id: 1, status: 'approved', is_premium: true, is_featured: true, views: 320 },
          { id: 2, title: 'Marketing para empresas', description: 'Campanhas digitais', category_id: 7, price: 280000, location: 'Benguela', user_id: 2, status: 'approved', is_premium: false, is_featured: false, views: 180 },
        ]);
      });
  }, []);

  const featuredAds = useMemo(() => ads.filter((ad) => ad.is_featured || ad.is_premium).slice(0, 3), [ads]);

  return (
    <div className="space-y-10 pb-16">
      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-blue-200">
            Ecossistema digital para negócios
          </motion.div>
          <h1 className="mt-6 max-w-xl text-4xl font-black leading-tight tracking-tight text-white md:text-6xl">
            YANOMIX <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">Business Hub</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-slate-300">
            O mercado digital premium para anúncios, serviços, oportunidades e crescimento de negócios em Angola e além.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <button className="btn-primary">Anunciar grátis</button>
            <button className="btn-secondary">Vender agora</button>
            <button className="btn-secondary">Contratar talento</button>
          </div>
          <div className="mt-8 grid max-w-lg grid-cols-3 gap-4">
            <div className="panel p-4">
              <div className="text-2xl font-black text-white">25k+</div>
              <div className="mt-1 text-xs uppercase text-slate-400">Anúncios</div>
            </div>
            <div className="panel p-4">
              <div className="text-2xl font-black text-white">1.8k</div>
              <div className="mt-1 text-xs uppercase text-slate-400">Empresas</div>
            </div>
            <div className="panel p-4">
              <div className="text-2xl font-black text-white">98%</div>
              <div className="mt-1 text-xs uppercase text-slate-400">Satisfação</div>
            </div>
          </div>
        </div>

        <HeroScene />
      </section>

      <SearchBar />

      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Categorias principais</h2>
          <Link to="/marketplace" className="text-sm text-blue-300">Ver todas</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {categories.length > 0 ? categories.map((category) => (
            <div key={category.id} className="panel flex h-32 flex-col justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/30 to-violet-500/30 text-xl">✦</div>
              <div>
                <h3 className="font-semibold text-white">{category.name}</h3>
                <p className="text-sm text-slate-400">{category.description || 'Oportunidades em destaque'}</p>
              </div>
            </div>
          )) : categoriesSeed.map((category) => (
            <div key={category} className="panel flex h-32 flex-col justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/30 to-violet-500/30 text-xl">✦</div>
              <div>
                <h3 className="font-semibold text-white">{category}</h3>
                <p className="text-sm text-slate-400">Mercado em destaque</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Anúncios em destaque</h2>
          <button className="btn-secondary">Ver todos</button>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {featuredAds.map((ad) => (
            <div key={ad.id} className="panel overflow-hidden p-0">
              <div className="h-44 bg-gradient-to-br from-blue-700/30 via-indigo-600/10 to-violet-600/20" />
              <div className="p-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="rounded-full border border-yellow-400/30 bg-yellow-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-yellow-200">{ad.is_premium ? 'Premium' : 'Destaque'}</span>
                  <span className="text-sm font-semibold text-emerald-300">{ad.views} views</span>
                </div>
                <h3 className="text-xl font-semibold text-white">{ad.title}</h3>
                <p className="mt-2 text-sm text-slate-300">{ad.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xl font-black text-gold">{ad.price.toLocaleString()} Kz</span>
                  <button className="btn-secondary px-3 py-2 text-sm">Contactar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="panel">
          <h2 className="mb-6 text-2xl font-bold text-white">Empresas recomendadas</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/50 p-4">
                <div>
                  <div className="font-semibold text-white">Apex Growth Studio</div>
                  <div className="text-sm text-slate-400">Marketing digital • Luanda</div>
                </div>
                <button className="btn-secondary px-3 py-2 text-sm">Ver perfil</button>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <h2 className="mb-6 text-2xl font-bold text-white">Planos de monetização</h2>
          <div className="space-y-4">
            {plans.map((plan) => (
              <div key={plan.id} className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                  <span className="text-gold">{plan.price.toLocaleString()} {plan.currency}</span>
                </div>
                <p className="mt-2 text-sm text-slate-400">{plan.description}</p>
                <div className="mt-3 text-sm text-slate-300">{plan.features}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function MarketplacePage() {
  const [ads, setAds] = useState<Ad[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/api/ads`)
      .then((res) => res.json())
      .then((data) => setAds(data))
      .catch(() => setAds([
        { id: 1, title: 'Carro usado premium', description: 'Excelente estado e documentação', category_id: 2, price: 12000000, location: 'Luanda', user_id: 1, status: 'approved', is_premium: true, is_featured: true, views: 467 },
        { id: 2, title: 'Curso de marketing digital', description: 'Conteúdos práticos para vendas online', category_id: 8, price: 65000, location: 'Huambo', user_id: 2, status: 'approved', is_premium: false, is_featured: false, views: 142 },
      ]));
  }, []);

  return (
    <div className="space-y-8">
      <div className="panel flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-blue-300">Marketplace</div>
          <h1 className="mt-2 text-3xl font-black text-white">Classificados e oportunidades</h1>
        </div>
        <button className="btn-primary">Publicar anúncio</button>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {ads.map((ad) => (
          <div key={ad.id} className="panel p-0 overflow-hidden">
            <div className="h-40 bg-gradient-to-br from-slate-800 via-blue-800/30 to-violet-800/30" />
            <div className="p-5">
              <div className="mb-2 flex items-center justify-between">
                <span className="rounded-full border border-blue-400/30 bg-blue-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-blue-200">{ad.status}</span>
                <span className="text-sm text-slate-400">{ad.location}</span>
              </div>
              <h3 className="text-xl font-semibold text-white">{ad.title}</h3>
              <p className="mt-2 text-sm text-slate-300">{ad.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xl font-black text-gold">{ad.price.toLocaleString()} Kz</span>
                <button className="btn-secondary px-3 py-2 text-sm">Detalhes</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/api/businesses`)
      .then((res) => res.json())
      .then((data) => setBusinesses(data))
      .catch(() => setBusinesses([
        { id: 1, name: 'Apex Growth Studio', owner_name: 'Sofia A.', category_id: 8, description: 'Agência completa de marketing digital', website: 'https://example.com', city: 'Luanda', is_featured: true },
        { id: 2, name: 'RuralTech Angola', owner_name: 'Amaro N.', category_id: 6, description: 'Soluções para agronegócio e produção', website: 'https://example.com', city: 'Malanje', is_featured: false },
      ]));
  }, []);

  return (
    <div className="space-y-8">
      <div className="panel flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-violet-200">Diretório de empresas</div>
          <h1 className="mt-2 text-3xl font-black text-white">Negócios confiáveis e em crescimento</h1>
        </div>
        <button className="btn-primary">Registar empresa</button>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {businesses.map((company) => (
          <div key={company.id} className="panel">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white">{company.name}</h3>
                <div className="text-sm text-slate-400">{company.owner_name} • {company.city}</div>
              </div>
              {company.is_featured && <span className="rounded-full border border-yellow-400/30 bg-yellow-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-yellow-200">Featured</span>}
            </div>
            <p className="mt-4 text-slate-300">{company.description}</p>
            <div className="mt-5 flex gap-3">
              <button className="btn-primary px-3 py-2 text-sm">Contactar</button>
              <button className="btn-secondary px-3 py-2 text-sm">Website</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AiPage() {
  const [prompt, setPrompt] = useState('Quero criar um anúncio para uma agência de marketing digital');
  const [response, setResponse] = useState('');

  const generate = async () => {
    const res = await fetch(`${API_URL}/api/ai/business-helper`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    setResponse(data.response);
  };

  return (
    <div className="space-y-8">
      <div className="panel">
        <div className="text-xs uppercase tracking-[0.25em] text-cyan-200">YANO AI BUSINESS</div>
        <h1 className="mt-2 text-3xl font-black text-white">Crie anúncios, ideias e estratégias com IA</h1>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
        <div className="panel">
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            rows={7}
            className="w-full rounded-xl border border-white/10 bg-slate-900/70 p-4 text-white outline-none"
          />
          <div className="mt-4 flex gap-3">
            <button className="btn-primary" onClick={generate}>Gerar estratégia</button>
            <button className="btn-secondary">Sugerir preços</button>
          </div>
        </div>

        <div className="panel">
          <h3 className="text-xl font-semibold text-white">Sugestão da IA</h3>
          <p className="mt-4 text-slate-300">{response || 'A resposta aparecerá aqui com frases persuasivas, estrutura de anúncio e estratégia comercial.'}</p>
        </div>
      </div>
    </div>
  );
}

function AdminPage() {
  const [metrics, setMetrics] = useState({ users: 0, ads: 0, businesses: 0, revenue: 0, featured_ads: 0 });
  const [support, setSupport] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/api/metrics`).then((res) => res.json()),
      fetch(`${API_URL}/api/support`).then((res) => res.json()),
    ])
      .then(([metricsData, supportData]) => {
        setMetrics(metricsData);
        setSupport(supportData);
      })
      .catch(() => {
        setMetrics({ users: 1280, ads: 420, businesses: 205, revenue: 1264000, featured_ads: 18 });
        setSupport([{ id: 1, user_email: 'cliente@teste.com', subject: 'Pagamento pendente', status: 'open' }]);
      });
  }, []);

  return (
    <div className="space-y-8">
      <div className="panel">
        <div className="text-xs uppercase tracking-[0.25em] text-blue-200">Administração</div>
        <h1 className="mt-2 text-3xl font-black text-white">Painel administrativo YANOMIX</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {[
          { label: 'Utilizadores', value: metrics.users },
          { label: 'Anúncios', value: metrics.ads },
          { label: 'Empresas', value: metrics.businesses },
          { label: 'Receita', value: `${metrics.revenue.toLocaleString()} Kz` },
          { label: 'Destaques', value: metrics.featured_ads },
        ].map((stat) => (
          <div key={stat.label} className="panel">
            <div className="text-sm text-slate-400">{stat.label}</div>
            <div className="mt-3 text-3xl font-black text-white">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="panel">
          <h3 className="mb-4 text-xl font-semibold text-white">Receita mensal</h3>
          <div className="flex h-56 items-end gap-3">
            {[50, 70, 90, 120, 130, 160].map((height, index) => (
              <div key={index} className="flex-1 rounded-t-2xl bg-gradient-to-t from-blue-500 to-violet-500" style={{ height: `${height}px` }} />
            ))}
          </div>
        </div>

        <div className="panel">
          <h3 className="mb-4 text-xl font-semibold text-white">Pedidos de suporte</h3>
          <div className="space-y-3">
            {support.map((ticket) => (
              <div key={ticket.id} className="rounded-2xl border border-white/10 bg-slate-900/60 p-3">
                <div className="font-medium text-white">{ticket.subject}</div>
                <div className="text-sm text-slate-400">{ticket.user_email}</div>
                <div className="mt-2 text-xs uppercase tracking-[0.2em] text-amber-200">{ticket.status}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function UserDashboard() {
  const [ads, setAds] = useState<Ad[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/api/ads`)
      .then((res) => res.json())
      .then((data) => setAds(data.slice(0, 3)))
      .catch(() => setAds([
        { id: 1, title: 'Sala comercial em Luanda', description: 'Boa localização', category_id: 1, price: 450000, location: 'Luanda', user_id: 1, status: 'approved', is_premium: true, is_featured: true, views: 612 },
        { id: 2, title: 'Design gráfico para pequenas marcas', description: 'Identidade visual premium', category_id: 8, price: 180000, location: 'Benguela', user_id: 1, status: 'approved', is_premium: false, is_featured: false, views: 245 },
      ]));
  }, []);

  return (
    <div className="space-y-8">
      <div className="panel flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-emerald-200">Área do utilizador</div>
          <h1 className="mt-2 text-3xl font-black text-white">Dashboard pessoal</h1>
        </div>
        <button className="btn-primary">Criar anúncio</button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: 'Anúncios ativos', value: '12' },
          { label: 'Favoritos', value: '36' },
          { label: 'Mensagens', value: '9' },
        ].map((item) => (
          <div key={item.label} className="panel">
            <div className="text-sm text-slate-400">{item.label}</div>
            <div className="mt-3 text-3xl font-black text-white">{item.value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {ads.map((ad) => (
          <div key={ad.id} className="panel">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">{ad.title}</h3>
              <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-emerald-200">{ad.status}</span>
            </div>
            <p className="mt-3 text-slate-300">{ad.description}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xl font-black text-gold">{ad.price.toLocaleString()} Kz</span>
              <span className="text-sm text-slate-400">{ad.views} visualizações</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return <AppLayout />;
}

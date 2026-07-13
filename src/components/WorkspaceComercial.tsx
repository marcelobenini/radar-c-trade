import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Building2,
  MapPin,
  Sparkles,
  Phone,
  Mail,
  Instagram,
  Globe,
  User,
  Briefcase,
  FileText,
  Clock,
  ArrowLeft,
  Linkedin,
  Plus,
  X,
  ChevronRight,
  Copy,
  ExternalLink,
  CheckCircle,
  Package,
  Brain,
  SlidersHorizontal,
  MessageSquare,
  AlertCircle,
  Edit2,
  Target
} from 'lucide-react';

import Button from './ui/Button';
import { Card } from './ui/Card';
import { Badge } from './ui/Feedback';
import FitComercial from './ui/FitComercial';
import { Client, ClientHistoryEvent, RCA } from '../pages/Clientes';

// Helper to validate phone
function isValidPhone(phone: string | null | undefined): boolean {
  if (!phone) return false;
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 11;
}

interface WorkspaceComercialProps {
  client: Client;
  onBack: () => void;
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  rcas: RCA[];
  triggerToast: (type: 'success' | 'info' | 'warning' | 'error', message: string, description: string) => void;
  handleTriggerMockAnalysis: (id: number) => void;
  handleOpenEditModal: (client: Client) => void;
  setIsConversionModalOpen: (open: boolean) => void;
}

interface PotentialProduct {
  category: string;
  brand: string;
  product: string;
  sku: string;
  estimatedRevenue: number;
  priority: 'Alta' | 'Média' | 'Baixa';
  justification: string;
  menuMatch: string;
}

interface AIInsight {
  id: string;
  priority: 'Crítica' | 'Alta' | 'Média';
  type: string;
  title: string;
  description: string;
}

export default function WorkspaceComercial({
  client,
  onBack,
  setClients,
  rcas,
  triggerToast,
  handleTriggerMockAnalysis,
  handleOpenEditModal,
  setIsConversionModalOpen
}: WorkspaceComercialProps) {
  
  // Local filter states for Block 3 (Produtos Potenciais)
  const [wsCategoryFilter, setWsCategoryFilter] = useState('all');
  const [wsBrandFilter, setWsBrandFilter] = useState('all');
  const [wsPriorityFilter, setWsPriorityFilter] = useState('all');
  
  // Interactive additions states
  const [copiedText, setCopiedText] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<PotentialProduct | null>(null);

  // New Contact Form fields
  const [wsIsAddingContact, setWsIsAddingContact] = useState(false);
  const [wsContactName, setWsContactName] = useState('');
  const [wsContactRole, setWsContactRole] = useState('');
  const [wsContactType, setWsContactType] = useState<'Decisor' | 'Influenciador' | 'Operacional'>('Decisor');
  const [wsContactPhone, setWsContactPhone] = useState('');
  const [wsContactEmail, setWsContactEmail] = useState('');
  const [wsContactLinkedin, setWsContactLinkedin] = useState('');
  const [wsContactInstagram, setWsContactInstagram] = useState('');
  const [wsContactNotes, setWsContactNotes] = useState('');

  // Commercial Action Logger fields
  const [wsIsRegisteringHistory, setWsIsRegisteringHistory] = useState(false);
  const [wsHistoryType, setWsHistoryType] = useState<'Ligação realizada' | 'WhatsApp enviado' | 'Visita realizada' | 'Proposta enviada' | 'Cliente convertido'>('Ligação realizada');
  const [wsHistoryNotes, setWsHistoryNotes] = useState('');

  // 1. Structured products for the Portfolio Fit
  const potentialProductsList: PotentialProduct[] = useMemo(() => [
    { 
      category: 'Farinhas Profissionais', 
      brand: 'Molino Caputo', 
      product: 'Farinha Caputo Pizzeria 00', 
      sku: 'Saco 25kg',
      estimatedRevenue: 18000, 
      priority: 'Alta', 
      justification: 'Substituição da farinha nacional atual por Tipo 00 oficial para garantir bordas aeradas e fermentação longa de 48h.',
      menuMatch: 'Seção de Pizzas Clássicas (Margherita e Diavola) - Massas de fermentação natural de 24h a 48h.'
    },
    { 
      category: 'Tomates Italianos', 
      brand: 'Ciao', 
      product: 'Tomate Pelati Campano', 
      sku: 'Lata 800g (Pack c/ 6)',
      estimatedRevenue: 12500, 
      priority: 'Alta', 
      justification: 'Uso imediato no molho base de todas as pizzas tradicionais, eliminando a acidez excessiva encontrada na marca nacional.',
      menuMatch: 'Molho base artesanal de todas as pizzas e pratos de massa vermelha.'
    },
    { 
      category: 'Laticínios Italianos', 
      brand: 'Latteria Sorrentina', 
      product: 'Fiordilatte Bola 1kg', 
      sku: 'Balde de Dreno 1kg',
      estimatedRevenue: 24000, 
      priority: 'Média', 
      justification: 'Ideal para derretimento uniforme sem soltar água excessiva na pizza napolitana, otimizando o tempo de forno.',
      menuMatch: 'Cobertura premium das pizzas do forno a lenha, em especial as de estilo Napolitano.'
    },
    { 
      category: 'Massas Tradicionais', 
      brand: 'Valdigrano', 
      product: 'Spaghetti Bronzo 500g', 
      sku: 'Fardo 12x500g',
      estimatedRevenue: 15000, 
      priority: 'Alta', 
      justification: 'Excelente sinergia com o menu de frutos do mar identificado no cardápio online para ganho imediato de margem e sabor.',
      menuMatch: 'Prato Principal "Spaghetti al Frutti di Mare" e "Spaghetti Cacio e Pepe".'
    },
    { 
      category: 'Azeites e Condimentos', 
      brand: 'Barbera', 
      product: 'Azeite Extra Virgem D.O.P.', 
      sku: 'Garrafa 500ml',
      estimatedRevenue: 8200, 
      priority: 'Baixa', 
      justification: 'Oportunidade secundária para finalização de pratos especiais e serviço de mesa nas mesas de clientes premium.',
      menuMatch: 'Finalização das bruschettas de entrada e serviço de mesa ao cliente.'
    },
    { 
      category: 'Vinhos Importados', 
      brand: 'Cantine San Marzano', 
      product: 'Primitivo di Manduria DOC', 
      sku: 'Caixa c/ 6 Gars',
      estimatedRevenue: 36000, 
      priority: 'Média', 
      justification: 'A carta de vinhos atual apresenta lacunas significativas de rótulos italianos tintos encorpados para harmonização.',
      menuMatch: 'Carta de Vinhos - Seção de Tintos Italianos Encofpados para harmonização de carnes.'
    },
    { 
      category: 'Massas Tradicionais', 
      brand: 'Valdigrano', 
      product: 'Penne Rigate Integral', 
      sku: 'Fardo 12x500g',
      estimatedRevenue: 9500, 
      priority: 'Baixa', 
      justification: 'Atendimento à demanda de opções saudáveis e funcionais identificadas na seção de massas leves do restaurante.',
      menuMatch: 'Seção Fit / Opções Integrais e vegetarianas de massas no cardápio executivo.'
    },
    { 
      category: 'Tomates Italianos', 
      brand: 'Ciao', 
      product: 'Pomodoro d’Oro Amarelo', 
      sku: 'Lata 800g',
      estimatedRevenue: 14000, 
      priority: 'Média', 
      justification: 'Inclusão nas pizzas sazonais gourmet para diferença visual e sabor adocicado exclusivo no mercado local.',
      menuMatch: 'Pizza Especial da Estação / Pratos autorais gourmet de edição limitada.'
    }
  ], []);

  // Set default selected product on mount
  useEffect(() => {
    if (potentialProductsList.length > 0 && !selectedProduct) {
      setSelectedProduct(potentialProductsList[0]);
    }
  }, [potentialProductsList, selectedProduct]);

  // Compute unique dynamic values for filters
  const categories = useMemo(() => ['all', ...Array.from(new Set(potentialProductsList.map(p => p.category)))], [potentialProductsList]);
  const brands = useMemo(() => ['all', ...Array.from(new Set(potentialProductsList.map(p => p.brand)))], [potentialProductsList]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return potentialProductsList.filter(p => {
      const matchCat = wsCategoryFilter === 'all' || p.category === wsCategoryFilter;
      const matchBrand = wsBrandFilter === 'all' || p.brand === wsBrandFilter;
      const matchPrior = wsPriorityFilter === 'all' || p.priority === wsPriorityFilter;
      return matchCat && matchBrand && matchPrior;
    });
  }, [potentialProductsList, wsCategoryFilter, wsBrandFilter, wsPriorityFilter]);

  // 2. Structured insights list strictly answering Commit 5.6 examples
  const aiInsightsList: AIInsight[] = useMemo(() => [
    { 
      id: 'i-1', 
      priority: 'Crítica', 
      type: 'Cardápio', 
      title: 'Novo cardápio publicado', 
      description: 'Cardápio digital atualizado nos canais online há 3 dias. Detectada nova seção dedicada a pratos clássicos italianos e pizzas napolitanas artesanais.' 
    },
    { 
      id: 'i-2', 
      priority: 'Alta', 
      type: 'Equipe', 
      title: 'Mudança de chef', 
      description: 'Identificado novo comando técnico na cozinha. O novo chef executivo possui histórico público de preferência por marcas importadas como Caputo e Ciao.' 
    },
    { 
      id: 'i-3', 
      priority: 'Alta', 
      type: 'Operação', 
      title: 'Expansão da operação', 
      description: 'Mapeamento de inteligência comercial indica abertura de um novo ponto físico no formato Osteria na zona sul da cidade até o fim do trimestre.' 
    },
    { 
      id: 'i-4', 
      priority: 'Média', 
      type: 'Insumos', 
      title: 'Ingredientes predominantes', 
      description: 'Ingredientes tradicionais italianos compõem cerca de 72% do cardápio ativo, atestando o alto fit e o ganho operacional com o portfólio importado.' 
    },
    { 
      id: 'i-5', 
      priority: 'Média', 
      type: 'Sinergia', 
      title: 'Produtos ausentes', 
      description: 'Ausência completa de farinhas italianas de força homologadas e tomates pelati importados de denominação de origem protegida (D.O.P.) nas pizzas.' 
    },
    { 
      id: 'i-6', 
      priority: 'Média', 
      type: 'Foco', 
      title: 'Categorias prioritárias', 
      description: 'As linhas de Farinhas de Panificação e Tomates em Conserva Pelati foram classificadas como foco imediato de conversão devido ao volume de consumo.' 
    }
  ], []);

  // 3. Contacts management synced in local storage per client
  const [localContacts, setLocalContacts] = useState<any[]>(() => {
    const saved = localStorage.getItem(`ctrade_client_contacts_${client.id}`);
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'c-1',
        name: client.responsible || 'Roberto Manzoni',
        role: client.responsibleRole || 'Sócio Proprietário / Chef',
        type: 'Decisor',
        phone: client.phone || '(11) 98111-2233',
        email: client.email || 'roberto@' + (client.website?.replace('www.', '') || 'manzonipizza.com.br'),
        linkedin: 'linkedin.com/in/robertomanzonichef',
        instagram: '@robertomanzoni',
        confidence: 96,
        notes: 'Decisor final em compras e novos contratos de fornecimento técnico.'
      },
      {
        id: 'c-2',
        name: 'Ana Silva',
        role: 'Gerente Comercial de Compras',
        type: 'Influenciador',
        phone: '(11) 98888-7777',
        email: 'compras@' + (client.website?.replace('www.', '') || 'manzonipizza.com.br'),
        linkedin: 'linkedin.com/in/anasilvashopping',
        instagram: '@anasilva_compras',
        confidence: 90,
        notes: 'Responsável pela cotação inicial de preços e validação orçamentária de suprimentos.'
      },
      {
        id: 'c-3',
        name: 'Chef Carlos',
        role: 'Sous Chef de Cozinha',
        type: 'Operacional',
        phone: '(11) 97777-6666',
        email: 'kitchen@' + (client.website?.replace('www.', '') || 'manzonipizza.com.br'),
        linkedin: '',
        instagram: '@chefcarlos_art',
        confidence: 85,
        notes: 'Responsável pelos testes práticos de rendimento de forno e aceitação de insumos.'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem(`ctrade_client_contacts_${client.id}`, JSON.stringify(localContacts));
  }, [localContacts, client.id]);

  // Sort contacts automatically: Decisor (1) > Influenciador (2) > Operacional (3)
  const sortedContacts = useMemo(() => {
    const priorityOrder = { 'Decisor': 1, 'Influenciador': 2, 'Operacional': 3 };
    return [...localContacts].sort((a, b) => {
      const orderA = priorityOrder[a.type as keyof typeof priorityOrder] || 4;
      const orderB = priorityOrder[b.type as keyof typeof priorityOrder] || 4;
      return orderA - orderB;
    });
  }, [localContacts]);

  // Dynamic calculations for Block 1
  const potentialRevenue = useMemo(() => {
    return (client.score * 1200) + 15000;
  }, [client.score]);

  const priorityClass = useMemo(() => {
    if (client.score >= 90) return 'Classe A (Altíssima)';
    if (client.score >= 70) return 'Classe B (Média-Alta)';
    return 'Classe C (Recomendado)';
  }, [client.score]);

  // Suggested Approach message block
  const suggestedMessage = useMemo(() => {
    const contactName = sortedContacts.find(c => c.type === 'Decisor')?.name || client.responsible || 'Roberto';
    return `Olá ${contactName}, tudo bem? Acompanhando o cardápio do ${client.fantasyName || client.name}, notei que vocês oferecem uma culinária fantástica e que têm pratos de altíssimo valor agregado. 

Trabalhamos diretamente com a importação oficial da Farinha Caputo Pizzeria 00 e dos Tomates Pelati Ciao, que elevariam ainda mais a autenticidade e a qualidade dos seus pratos, mantendo um excelente rendimento e custo de fornecimento. 

Gostaria de agendar um rápido café para apresentar nosso catálogo de insumos italianos oficiais e deixar uma amostra física sem compromisso? Um abraço, Marcelo Baquero.`;
  }, [client.fantasyName, client.name, client.responsible, sortedContacts]);

  // Add contact handler
  const handleAddNewContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wsContactName || !wsContactRole) {
      triggerToast('error', 'Campos Obrigatórios', 'Por favor, preencha o Nome e o Cargo do contato.');
      return;
    }
    const newContact = {
      id: 'c-' + Date.now(),
      name: wsContactName,
      role: wsContactRole,
      type: wsContactType,
      phone: wsContactPhone || '(11) 99999-9999',
      email: wsContactEmail || 'contato@estabelecimento.com',
      linkedin: wsContactLinkedin,
      instagram: wsContactInstagram,
      confidence: 88,
      notes: wsContactNotes || 'Contato comercial adicionado manualmente no workspace.'
    };
    setLocalContacts(prev => [...prev, newContact]);
    setWsIsAddingContact(false);
    
    // Reset form
    setWsContactName('');
    setWsContactRole('');
    setWsContactType('Decisor');
    setWsContactPhone('');
    setWsContactEmail('');
    setWsContactLinkedin('');
    setWsContactInstagram('');
    setWsContactNotes('');
    
    // Log as commercial interaction event!
    const todayStr = new Date().toISOString().split('T')[0];
    const todayTime = new Date().toTimeString().slice(0, 5);
    const newEvent: ClientHistoryEvent = {
      id: 'h-sys-cont-' + Date.now(),
      data: todayStr + ' ' + todayTime,
      usuario: 'Marcelo Baquero (Você)',
      acao: `Contato Cadastrado: Adicionado ${newContact.name} como ${newContact.type} (${newContact.role}).`,
      tipo: 'outro'
    };
    
    setClients(prev => prev.map(c => {
      if (c.id === client.id) {
        return {
          ...c,
          historicoCompleto: [...(c.historicoCompleto || []), newEvent],
          dateUpdated: todayStr
        };
      }
      return c;
    }));

    triggerToast('success', 'Contato Adicionado', 'Novo contato salvo e associado à conta.');
  };

  // Add history action log handler
  const handleSaveCommercialHistory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wsHistoryNotes) {
      triggerToast('error', 'Campos Vazios', 'Por favor, escreva as notas do atendimento comercial.');
      return;
    }
    const todayStr = new Date().toISOString().split('T')[0];
    const todayTime = new Date().toTimeString().slice(0, 5);
    
    const newEvent: ClientHistoryEvent = {
      id: 'h-comm-' + Date.now(),
      data: todayStr + ' ' + todayTime,
      usuario: 'Marcelo Baquero (Você)',
      acao: `${wsHistoryType}: ${wsHistoryNotes}`,
      tipo: 'outro'
    };

    setClients(prev => prev.map(c => {
      if (c.id === client.id) {
        return {
          ...c,
          historicoCompleto: [...(c.historicoCompleto || []), newEvent],
          dateUpdated: todayStr
        };
      }
      return c;
    }));

    setWsHistoryNotes('');
    setWsIsRegisteringHistory(false);
    triggerToast('success', 'Atendimento Registrado', 'Ação comercial do time salva no histórico.');
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(suggestedMessage);
    setCopiedText(true);
    triggerToast('success', 'Mensagem Copiada', 'Texto de abordagem copiado para clipboard.');
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleScrollToHistory = () => {
    setWsIsRegisteringHistory(true);
    const el = document.getElementById('block-8-historico');
    if (el) {
      const yOffset = -120;
      const y = el.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // Only team manual actions are displayed in Block 7 (Histórico Comercial)
  const commercialHistoryEvents = useMemo(() => {
    const history = client.historicoCompleto || [];
    // Seed initial historical interactions if none exist to avoid empty state
    if (history.filter(ev => ev.tipo === 'outro' || ev.acao.includes('Ligação') || ev.acao.includes('WhatsApp') || ev.acao.includes('Visita') || ev.acao.includes('Proposta') || ev.acao.includes('convertido')).length === 0) {
      return [
        {
          id: 'h-seed-1',
          data: '2026-07-01 14:30',
          usuario: 'Marcelo Baquero (Você)',
          acao: 'WhatsApp enviado: Primeiro contato para envio do portfólio de importados. Cliente demonstrou interesse em conhecer os preços.',
          tipo: 'outro'
        },
        {
          id: 'h-seed-2',
          data: '2026-07-05 11:00',
          usuario: 'Marcelo Baquero (Você)',
          acao: 'Ligação realizada: Ligação com a gerente Ana Silva. Alinhadas as expectativas de volumes mínimos e agendado teste de forno.',
          tipo: 'outro'
        }
      ];
    }
    
    return history.filter(ev => 
      ev.tipo === 'outro' || ev.acao.includes('Ligação') || ev.acao.includes('WhatsApp') || ev.acao.includes('Visita') || ev.acao.includes('Proposta') || ev.acao.includes('convertido') || ev.acao.includes('Contato Cadastrado') || ev.acao.includes('Status')
    );
  }, [client.historicoCompleto]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6 pb-20"
    >
      {/* Banner do Ciclo de Vida Comercial / Conta */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn text-left">
        <div className="space-y-1 font-sans">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Ciclo de Vida da Conta (CRM & ERP Sync)</span>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-black text-slate-800">
              Status de Conta: <span className={`font-black uppercase ${
                client.statusConta === 'Prospect Radar' ? 'text-amber-600' :
                client.statusConta === 'Cliente Convertido' ? 'text-emerald-600' :
                'text-blue-600'
              }`}>{client.statusConta || 'Prospect Radar'}</span>
            </h3>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span className="text-xs font-semibold text-slate-500">
              ID Radar: <strong className="text-slate-700 font-mono">{client.id_radar || 'Não Gerado'}</strong>
            </span>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span className="text-xs font-semibold text-slate-500">
              ID ERP: <strong className="text-slate-700 font-mono">{client.id_erp || 'Aguardando Conversão'}</strong>
            </span>
          </div>
        </div>
        
        {client.statusConta === 'Prospect Radar' && (
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Sparkles className="h-3.5 w-3.5" />}
            onClick={() => setIsConversionModalOpen(true)}
          >
            Converter em Cliente C-Trade
          </Button>
        )}
      </div>

      {/* Details Page Header Card */}
      <div className="bg-white border border-slate-150 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4 text-left">
          <div className="bg-blue-50/80 text-blue-950 border border-blue-100 p-3.5 rounded-xl shadow-xs shrink-0 flex items-center justify-center">
            <Building2 className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-black text-slate-800 tracking-tight leading-none">
                {client.fantasyName}
              </h2>
              <Badge variant="info">{client.segment}</Badge>
            </div>
            <p className="text-xs font-semibold text-slate-400 flex items-center gap-1">
              <Building2 className="h-3 w-3 text-slate-300" />
              Razão Social: {client.name} {client.cnpj ? `| CNPJ: ${client.cnpj}` : ''}
            </p>
            <p className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-slate-300" />
              {client.city} - {client.state}
            </p>

            <div className="flex flex-wrap gap-2 mt-2 pt-1">
              <Badge
                variant={
                  client.status === 'Entradas'
                    ? 'info'
                    : client.status === 'Autorizados'
                    ? 'success'
                    : 'danger'
                }
              >
                Status: {client.status}
              </Badge>

              <Badge
                variant={
                  client.potential === 'Muito Alto'
                    ? 'primary'
                    : client.potential === 'Alto'
                    ? 'success'
                    : client.potential === 'Médio'
                    ? 'warning'
                    : 'danger'
                }
              >
                Potencial: {client.potential}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 max-w-sm w-full md:w-80">
          <FitComercial 
            score={client.score} 
            variant="card" 
            history={client.fitHistory}
            lastUpdated={client.lastAnalysis || client.dateUpdated}
          />
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="flex flex-wrap gap-3">
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<Edit2 className="h-4 w-4" />}
          onClick={() => handleOpenEditModal(client)}
        >
          Editar Dados de Cadastro
        </Button>
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
          <span className="font-bold text-slate-500">Status:</span>
          <select
            value={client.status}
            onChange={(e) => {
              const newStatus = e.target.value as 'Entradas' | 'Autorizados' | 'Rejeitados';
              const todayStr = new Date().toISOString().split('T')[0];
              setClients(prev => prev.map(c => c.id === client.id ? { 
                ...c, 
                status: newStatus, 
                dateUpdated: todayStr,
                historicoCompleto: [
                  ...(c.historicoCompleto || []),
                  { id: 'h-st-' + Date.now(), data: todayStr + ' 12:00', usuario: 'Marcelo Baquero (Você)', acao: `Status comercial alterado para ${newStatus}.`, tipo: 'atualizacao' }
                ]
              } : c));
              triggerToast('success', 'Status Atualizado', `Status de "${client.name}" alterado para ${newStatus}.`);
            }}
            className="bg-white border border-slate-250 rounded-md px-2 py-1 font-bold text-slate-700 outline-hidden focus:border-blue-500 cursor-pointer"
          >
            <option value="Entradas">Entradas</option>
            <option value="Autorizados">Autorizados</option>
            <option value="Rejeitados">Rejeitados</option>
          </select>
        </div>
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ArrowLeft className="h-4 w-4" />}
          onClick={onBack}
        >
          Voltar para Base Comercial
        </Button>
      </div>

      {/* ==================== WORKSPACE STICKY TOP ANCHOR MENU (5 Anchors Only) ==================== */}
      <div className="sticky top-[73px] z-30 bg-white/95 backdrop-blur-md border-y border-slate-200 py-3.5 px-4 shadow-2xs flex items-center justify-between gap-4 -mx-6 px-6">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5 min-w-0">
          {[
            { label: 'Resumo', targetId: 'block-1-resumo' },
            { label: 'Produtos', targetId: 'block-3-produtos' },
            { label: 'Contatos', targetId: 'block-4-contatos' },
            { label: 'Insights', targetId: 'block-5-insights' },
            { label: 'Histórico', targetId: 'block-8-historico' },
          ].map((item) => (
            <button
              key={item.targetId}
              onClick={() => {
                const el = document.getElementById(item.targetId);
                if (el) {
                  const yOffset = -140; // Spacing for sticky bars
                  const y = el.getBoundingClientRect().top + window.scrollY + yOffset;
                  window.scrollTo({ top: y, behavior: 'smooth' });
                }
              }}
              className="px-4 py-2 rounded-lg text-xs font-black text-slate-600 hover:text-blue-900 hover:bg-slate-50 transition-all shrink-0 cursor-pointer border border-transparent hover:border-slate-200"
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="text-[10px] font-bold text-slate-400 shrink-0 hidden md:block">
          Conta: <strong className="text-slate-700 font-mono font-black">{client.id_radar || 'PROSPECT'}</strong>
        </div>
      </div>

      {/* ==================== WORKSPACE COHESIVE VERTICAL BLOCKS ==================== */}
      <div className="space-y-8">
        
        {/* BLOCK 1: RESUMO EXECUTIVO */}
        <div id="block-1-resumo" className="scroll-mt-36">
          <Card className="border border-slate-200 shadow-2xs p-6 bg-white rounded-2xl text-left">
            <div className="border-b border-slate-100 pb-3.5 mb-4 flex justify-between items-center">
              <h3 className="text-xs font-black uppercase text-slate-850 tracking-wider flex items-center gap-2">
                <span className="text-white bg-blue-600 px-2 py-0.5 rounded text-[9px] font-black">Bloco 1</span>
                Resumo Executivo do Cliente
              </h3>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Sparkles className="h-3.5 w-3.5 animate-pulse" />}
                onClick={() => handleTriggerMockAnalysis(client.id)}
              >
                Atualizar Análise
              </Button>
            </div>

            {/* Structured Executive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-slate-50/70 p-4.5 rounded-xl border border-slate-150 flex flex-col justify-between">
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Nome do Cliente</span>
                <span className="text-xs font-extrabold text-slate-800 block mt-2 leading-tight truncate">{client.fantasyName || client.name}</span>
                <span className="text-[9px] font-bold text-slate-450 mt-1 truncate">{client.name}</span>
              </div>

              <div className="bg-slate-50/70 p-4.5 rounded-xl border border-slate-150 flex flex-col justify-between">
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Segmento Ativo</span>
                <span className="text-xs font-extrabold text-slate-850 block mt-2 leading-tight">{client.segment}</span>
                <span className="text-[9px] font-bold text-blue-600 mt-1 uppercase">Sub-categoria: {client.category}</span>
              </div>

              <div className="bg-slate-50/70 p-4.5 rounded-xl border border-slate-150 flex flex-col justify-between">
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Cidade e Estado</span>
                <span className="text-xs font-extrabold text-slate-850 block mt-2 leading-tight">{client.city} - {client.state}</span>
                <span className="text-[9px] font-bold text-slate-450 mt-1 uppercase">Região Atendida</span>
              </div>

              <div className="bg-slate-50/70 p-4.5 rounded-xl border border-slate-150 flex flex-col justify-between">
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Score Comercial</span>
                <span className="text-2xl font-black text-slate-850 block mt-1.5">{client.score} pts</span>
                <span className="text-[9px] font-black text-slate-500 uppercase mt-1">Sinergia Técnica</span>
              </div>

              <div className="bg-slate-50/70 p-4.5 rounded-xl border border-slate-150 flex flex-col justify-between">
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Receita Potencial</span>
                <span className="text-sm font-black text-emerald-600 block mt-2.5">
                  R$ {potentialRevenue.toLocaleString('pt-BR')} / ano
                </span>
                <span className="text-[9px] font-black text-slate-500 mt-1 uppercase">Margem Estimada: 38%</span>
              </div>

              <div className="bg-slate-50/70 p-4.5 rounded-xl border border-slate-150 flex flex-col justify-between">
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Status do Registro</span>
                <div className="mt-2.5">
                  <Badge variant={client.status === 'Autorizados' ? 'success' : client.status === 'Entradas' ? 'info' : 'danger'}>
                    {client.status}
                  </Badge>
                </div>
                <span className="text-[9px] font-black text-slate-450 mt-1 uppercase">Funil de Homologação</span>
              </div>

              <div className="bg-slate-50/70 p-4.5 rounded-xl border border-slate-150 flex flex-col justify-between">
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Última Atualização</span>
                <span className="text-xs font-bold text-slate-700 block mt-2.5">{client.dateUpdated || 'Aguardando ação'}</span>
                <span className="text-[9px] font-bold text-slate-450 mt-1 uppercase">Pelo Time Comercial</span>
              </div>

              <div className="bg-slate-50/70 p-4.5 rounded-xl border border-slate-150 flex flex-col justify-between">
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Data da Última Análise</span>
                <span className="text-xs font-bold text-slate-700 block mt-2.5">{client.lastAnalysis || 'Análise de IA ativa'}</span>
                <span className="text-[9px] font-bold text-slate-450 mt-1 uppercase">Claude Engine</span>
              </div>
            </div>

            {/* Quick Badges Line */}
            <div className="border-t border-slate-100 pt-4 flex flex-wrap gap-2 text-xs font-semibold">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block w-full mb-1">Badges de Operação Rápida</span>
              
              <div className="bg-blue-50 text-blue-900 border border-blue-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-blue-700 shrink-0" />
                <span>Prioridade: <strong className="font-black">{priorityClass}</strong></span>
              </div>

              <div className="bg-indigo-50 text-indigo-900 border border-indigo-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-indigo-700 shrink-0" />
                <span>Clientes do Grupo: <strong className="font-black">{client.id % 2 === 0 ? 'Sim (Grupo Manzoni)' : 'Não (PDV Independente)'}</strong></span>
              </div>

              <div className="bg-rose-50 text-rose-900 border border-rose-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-rose-700 shrink-0" />
                <span>Restaurantes encontrados: <strong className="font-black">1 PDV Ativo</strong></span>
              </div>

              <div className="bg-teal-50 text-teal-900 border border-teal-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-teal-700 shrink-0" />
                <span>Contatos encontrados: <strong className="font-black">{sortedContacts.length} Cadastrados</strong></span>
              </div>

              <div className="bg-emerald-50 text-emerald-900 border border-emerald-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                <span>Produtos encontrados: <strong className="font-black">{potentialProductsList.length} SKUs Recomendados</strong></span>
              </div>
            </div>
          </Card>
        </div>

        {/* BLOCK 2: DIAGNÓSTICO COMERCIAL (IA COGNITIVE SUMMARY) */}
        <div id="block-2-diagnostico" className="scroll-mt-36">
          <Card className="border border-slate-200 shadow-2xs p-6 bg-white rounded-2xl relative overflow-hidden text-left">
            <div className="absolute top-0 right-0 p-16 bg-blue-50/15 rounded-full blur-3xl -z-10" />
            <div className="border-b border-slate-100 pb-3.5 mb-4 flex justify-between items-center">
              <h3 className="text-xs font-black uppercase text-slate-850 tracking-wider flex items-center gap-2">
                <span className="text-white bg-blue-600 px-2 py-0.5 rounded text-[9px] font-black">Bloco 2</span>
                Diagnóstico Comercial do Estabelecimento
              </h3>
              <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-100">
                Claude Analítico
              </span>
            </div>

            {/* Strictly limited between 8 and 12 lines of text */}
            <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-5 text-xs text-slate-700 leading-relaxed font-semibold">
              <p className="mb-2">
                <strong>Quem é o cliente:</strong> O {client.fantasyName || client.name} é um restaurante/pizzaria de alto nível especializado em gastronomia italiana, localizado em {client.city} ({client.state}).
              </p>
              <p className="mb-2">
                <strong>Por que é interessante & diferencial:</strong> Seu diferencial é o foco em pratos artesanais com alto valor percebido e ticket médio elevado, o que o torna comercialmente interessante para fornecimento premium.
              </p>
              <p className="mb-2">
                <strong>Onde estão as oportunidades:</strong> Identificamos lacunas graves no uso de farinha nacional de baixa hidratação e extrato de tomate comum nas pizzas, criando a oportunidade perfeita para substituição por insumos importados.
              </p>
              <p>
                <strong>Qual o potencial estimado:</strong> O potencial comercial para esta conta está mapeado em R$ {potentialRevenue.toLocaleString('pt-BR')} ao ano, com altíssimo fit técnico para nossas linhas exclusivas de Farinhas Caputo e Tomates Ciao.
              </p>
            </div>

            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Sparkles className="h-4 w-4 text-indigo-600" />}
                onClick={() => {
                  triggerToast('info', 'Análise Técnica Completa', `Compilando dados de sinergia para ${client.fantasyName}.`);
                }}
              >
                Ver análise completa
              </Button>
            </div>
          </Card>
        </div>

        {/* BLOCK 3: PRODUTOS POTENCIAIS */}
        <div id="block-3-produtos" className="scroll-mt-36">
          <Card className="border border-slate-200 shadow-2xs p-6 bg-white rounded-2xl text-left">
            <div className="border-b border-slate-100 pb-3.5 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-xs font-black uppercase text-slate-850 tracking-wider flex items-center gap-2">
                <span className="text-white bg-blue-600 px-2 py-0.5 rounded text-[9px] font-black">Bloco 3</span>
                Produtos Potenciais & Oportunidades Mapeadas
              </h3>
              
              {/* Filters Bar */}
              <div className="flex flex-wrap gap-2">
                <select
                  value={wsCategoryFilter}
                  onChange={(e) => setWsCategoryFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg px-2.5 py-1 text-[10px] font-black text-slate-700 outline-hidden cursor-pointer"
                >
                  <option value="all">📁 Categoria: Todas</option>
                  {categories.filter(c => c !== 'all').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                <select
                  value={wsBrandFilter}
                  onChange={(e) => setWsBrandFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg px-2.5 py-1 text-[10px] font-black text-slate-700 outline-hidden cursor-pointer"
                >
                  <option value="all">🏷️ Marca: Todas</option>
                  {brands.filter(b => b !== 'all').map(brd => (
                    <option key={brd} value={brd}>{brd}</option>
                  ))}
                </select>

                <select
                  value={wsPriorityFilter}
                  onChange={(e) => setWsPriorityFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg px-2.5 py-1 text-[10px] font-black text-slate-700 outline-hidden cursor-pointer"
                >
                  <option value="all">🔥 Prioridade: Todas</option>
                  <option value="Alta">Alta</option>
                  <option value="Média">Média</option>
                  <option value="Baixa">Baixa</option>
                </select>
              </div>
            </div>

            {/* Instruction Banner */}
            <div className="mb-3.5 text-[11px] font-semibold text-slate-400">
              * Clique em qualquer linha de produto para exibir onde ele foi identificado e mapeado no cardápio online do cliente.
            </div>

            {/* Table layout matching the requested exact hierarchy: Categoria -> Marca -> Produto -> SKU -> Receita Potencial -> Prioridade -> Justificativa */}
            <div className="overflow-x-auto border border-slate-150 rounded-xl">
              <table className="w-full text-xs text-left text-slate-700">
                <thead className="bg-slate-50 text-[10px] uppercase font-black text-slate-400 border-b border-slate-150">
                  <tr>
                    <th className="px-4 py-3">Categoria</th>
                    <th className="px-4 py-3">Marca</th>
                    <th className="px-4 py-3">Produto</th>
                    <th className="px-4 py-3">SKU</th>
                    <th className="px-4 py-3 text-right">Receita Potencial</th>
                    <th className="px-4 py-3 text-center">Prioridade</th>
                    <th className="px-4 py-3">Justificativa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-6 text-slate-400 font-bold">
                        Nenhum produto em sinergia localizado para os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p, idx) => {
                      const isSelected = selectedProduct?.product === p.product;
                      return (
                        <tr 
                          key={idx} 
                          onClick={() => setSelectedProduct(p)}
                          className={`hover:bg-slate-50/80 transition-colors font-semibold cursor-pointer ${
                            isSelected ? 'bg-blue-50/40 border-l-4 border-l-blue-600' : ''
                          }`}
                        >
                          <td className="px-4 py-3 text-slate-500 font-bold">{p.category}</td>
                          <td className="px-4 py-3 text-slate-900 font-extrabold">{p.brand}</td>
                          <td className="px-4 py-3 text-slate-900 font-extrabold">{p.product}</td>
                          <td className="px-4 py-3 text-slate-600 font-mono text-[11px]">{p.sku}</td>
                          <td className="px-4 py-3 text-right text-emerald-600 font-black">
                            R$ {p.estimatedRevenue.toLocaleString('pt-BR')} / ano
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border leading-none shrink-0 ${
                              p.priority === 'Alta' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                              p.priority === 'Média' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              'bg-slate-50 text-slate-700 border-slate-200'
                            }`}>
                              {p.priority}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[11px] text-slate-500 leading-normal max-w-xs">{p.justification}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Product Cardapio Identification Panel */}
            {selectedProduct && (
              <div className="mt-4 p-4.5 bg-blue-50/50 border border-blue-100 rounded-xl flex items-start gap-3 animate-fadeIn">
                <Sparkles className="h-5 w-5 text-blue-900 shrink-0 mt-0.5 animate-pulse" />
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-blue-950 uppercase tracking-wider">
                    Identificação no Cardápio: {selectedProduct.product} ({selectedProduct.brand})
                  </h4>
                  <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                    Este item foi mapeado automaticamente no seguinte elemento do cardápio online do cliente: <span className="text-blue-900 font-extrabold font-mono bg-blue-50 px-1.5 py-0.5 rounded border border-blue-150">{selectedProduct.menuMatch}</span>.
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* BLOCK 4: CONTATOS-CHAVE */}
        <div id="block-4-contatos" className="scroll-mt-36">
          <Card className="border border-slate-200 shadow-2xs p-6 bg-white rounded-2xl text-left">
            <div className="border-b border-slate-100 pb-3.5 mb-4 flex justify-between items-center">
              <h3 className="text-xs font-black uppercase text-slate-850 tracking-wider flex items-center gap-2">
                <span className="text-white bg-blue-600 px-2 py-0.5 rounded text-[9px] font-black">Bloco 4</span>
                Contatos-Chave (Organigrama de Decisão)
              </h3>
              <Button
                variant={wsIsAddingContact ? 'secondary' : 'outline'}
                size="sm"
                leftIcon={wsIsAddingContact ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                onClick={() => setWsIsAddingContact(!wsIsAddingContact)}
              >
                {wsIsAddingContact ? 'Cancelar' : 'Novo Contato'}
              </Button>
            </div>

            {/* Add Contact Form */}
            {wsIsAddingContact && (
              <form onSubmit={handleAddNewContact} className="bg-slate-50 border border-slate-200 p-4 rounded-xl mb-6 space-y-3 animate-fadeIn">
                <h4 className="text-xs font-black uppercase text-slate-800">Cadastrar Novo Contato</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Nome Completo *"
                    value={wsContactName}
                    onChange={(e) => setWsContactName(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-hidden text-slate-800"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Cargo / Responsabilidade *"
                    value={wsContactRole}
                    onChange={(e) => setWsContactRole(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-hidden text-slate-800"
                    required
                  />
                  <select
                    value={wsContactType}
                    onChange={(e) => setWsContactType(e.target.value as any)}
                    className="bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-hidden text-slate-800 cursor-pointer"
                  >
                    <option value="Decisor">🟢 Decisor</option>
                    <option value="Influenciador">🟡 Influenciador</option>
                    <option value="Operacional">⚪ Operacional</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <input
                    type="text"
                    placeholder="Telefone"
                    value={wsContactPhone}
                    onChange={(e) => setWsContactPhone(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-hidden text-slate-800"
                  />
                  <input
                    type="email"
                    placeholder="E-mail"
                    value={wsContactEmail}
                    onChange={(e) => setWsContactEmail(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-hidden text-slate-800"
                  />
                  <input
                    type="text"
                    placeholder="LinkedIn"
                    value={wsContactLinkedin}
                    onChange={(e) => setWsContactLinkedin(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-hidden text-slate-800"
                  />
                  <input
                    type="text"
                    placeholder="Instagram handle"
                    value={wsContactInstagram}
                    onChange={(e) => setWsContactInstagram(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-hidden text-slate-800"
                  />
                </div>
                <textarea
                  placeholder="Observações de relacionamento comercial..."
                  value={wsContactNotes}
                  onChange={(e) => setWsContactNotes(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-hidden text-slate-800 w-full"
                  rows={2}
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setWsIsAddingContact(false)}>Cancelar</Button>
                  <Button type="submit" variant="primary" size="sm">Salvar Contato</Button>
                </div>
              </form>
            )}

            {/* Sorted Contacts Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {sortedContacts.map((c, idx) => (
                <div key={idx} className="border border-slate-150 rounded-xl p-4 hover:border-slate-300 transition-colors bg-slate-50/20 space-y-3 font-sans flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div>
                        <h4 className="font-extrabold text-slate-850 text-sm leading-snug">{c.name}</h4>
                        <p className="text-[10px] text-slate-500 font-bold">{c.role}</p>
                      </div>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border leading-none shrink-0 ${
                        c.type === 'Decisor' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                        c.type === 'Influenciador' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                        'bg-slate-50 text-slate-700 border-slate-200'
                      }`}>
                        {c.type === 'Decisor' ? '🟢 Decisor' : c.type === 'Influenciador' ? '🟡 Influenciador' : '⚪ Operacional'}
                      </span>
                    </div>

                    {/* Contact channels list strictly matching requirements */}
                    <div className="space-y-2 text-xs font-semibold text-slate-600 pl-0.5">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>Papel na decisão: <strong className="text-slate-800">{c.type}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>Telefone: <strong className="text-slate-700">{c.phone || 'Não cadastrado'}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">E-mail: <strong className="text-slate-700 font-mono">{c.email || 'Não cadastrado'}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Linkedin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>LinkedIn: {c.linkedin ? (
                          <a 
                            href={c.linkedin.startsWith('http') ? c.linkedin : `https://${c.linkedin}`} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-blue-600 hover:underline inline-flex items-center gap-0.5 font-bold"
                          >
                            Acessar perfil <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        ) : <span className="text-slate-400">Não informado</span>}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Instagram className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>Instagram: <strong className="text-slate-700">{c.instagram || 'Não informado'}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Notes / Relationship details */}
                  <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 space-y-1 text-[11px] leading-relaxed mt-3">
                    <span className="text-[9px] text-indigo-700 font-bold uppercase block">Observação do Relacionamento:</span>
                    <p className="text-slate-500 font-medium leading-normal">{c.notes}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* BLOCK 5: INSIGHTS DA IA */}
        <div id="block-5-insights" className="scroll-mt-36">
          <Card className="border border-slate-200 shadow-2xs p-6 bg-white rounded-2xl text-left">
            <div className="border-b border-slate-100 pb-3.5 mb-4 flex justify-between items-center">
              <h3 className="text-xs font-black uppercase text-slate-850 tracking-wider flex items-center gap-2">
                <span className="text-white bg-blue-600 px-2 py-0.5 rounded text-[9px] font-black">Bloco 5</span>
                Insights Mapeados de IA (Central de Inteligência)
              </h3>
              <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                Aderência de Portfólio
              </span>
            </div>

            {/* List of insights sorted by priority (Critical, High, Medium) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aiInsightsList.map((ins, idx) => (
                <div key={idx} className={`border rounded-xl p-4 flex gap-3 transition-colors ${
                  ins.priority === 'Crítica' ? 'border-rose-200 bg-rose-50/10' :
                  ins.priority === 'Alta' ? 'border-amber-200 bg-amber-50/10' :
                  'border-slate-200 bg-slate-50/20'
                }`}>
                  <div className="shrink-0 mt-0.5">
                    {ins.priority === 'Crítica' ? <AlertCircle className="h-5 w-5 text-rose-500" /> :
                     ins.priority === 'Alta' ? <Sparkles className="h-5 w-5 text-amber-500" /> :
                     <MessageSquare className="h-5 w-5 text-indigo-500" />}
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded border ${
                        ins.priority === 'Crítica' ? 'bg-rose-100 text-rose-800 border-rose-200' :
                        ins.priority === 'Alta' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                        'bg-indigo-100 text-indigo-800 border-indigo-200'
                      }`}>{ins.priority}</span>
                      <span className="text-[10px] text-slate-400 font-extrabold">{ins.type}</span>
                    </div>
                    <h4 className="font-extrabold text-slate-800">{ins.title}</h4>
                    <p className="text-slate-500 leading-normal font-semibold">{ins.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* BLOCK 6: PRÓXIMA AÇÃO (THE CORE FEATURED ACTION BLOCK) */}
        <div id="block-6-proxima-acao" className="scroll-mt-36">
          <Card className="border-2 border-indigo-400 shadow-sm p-6 bg-gradient-to-r from-indigo-50/60 to-white rounded-2xl relative overflow-hidden text-left">
            <div className="absolute top-0 right-0 p-24 bg-indigo-50 rounded-full blur-3xl -z-10" />
            
            <div className="border-b border-indigo-100 pb-3.5 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <h3 className="text-xs font-black uppercase text-indigo-900 tracking-wider flex items-center gap-2.5">
                <span className="text-white bg-indigo-600 px-2 py-0.5 rounded text-[9px] font-black shadow-sm">Bloco 6</span>
                Próxima Ação do RCA (Recomendação Estratégica)
              </h3>
              <span className="bg-amber-100 text-amber-900 text-[10px] font-black uppercase px-2 py-0.5 rounded border border-amber-200 leading-none">
                Ação Prioritária Recomendada
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Context Columns (Required fields automatically calculated) */}
              <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white border border-indigo-100 rounded-xl p-3.5 shadow-3xs">
                    <span className="text-[9px] text-slate-400 font-black block uppercase tracking-wider mb-1">Contato Recomendado</span>
                    <span className="text-slate-800 font-extrabold text-sm flex items-center gap-1.5">
                      <User className="h-4 w-4 text-indigo-600 shrink-0" />
                      {sortedContacts.find(c => c.type === 'Decisor')?.name || client.responsible}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1 font-bold">
                      Papel: <strong className="text-emerald-700 bg-emerald-50 px-1 rounded">Decisor Principal (Sócio/Chef)</strong>
                    </span>
                  </div>

                  <div className="bg-white border border-indigo-100 rounded-xl p-3.5 shadow-3xs">
                    <span className="text-[9px] text-slate-400 font-black block uppercase tracking-wider mb-1">Canal Recomendado</span>
                    <span className="text-slate-800 font-extrabold text-sm flex items-center gap-1.5">
                      <Phone className="h-4 w-4 text-emerald-600 shrink-0" />
                      WhatsApp Comercial
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1 font-bold">
                      Foco: <strong className="text-indigo-700 bg-indigo-50 px-1 rounded">Apresentação Técnica do Portfólio</strong>
                    </span>
                  </div>
                </div>

                <div className="bg-white border border-indigo-100 rounded-xl p-4 shadow-3xs space-y-3.5 text-xs">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-indigo-600 shrink-0" />
                    <span className="font-black text-slate-850 text-[11px] uppercase tracking-wider">Produtos Prioritários de Abordagem</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-black px-2.5 py-1 rounded-lg">
                      Farinha Caputo Pizzeria 00 (SKU Saco 25kg)
                    </span>
                    <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-black px-2.5 py-1 rounded-lg">
                      Tomate Pelati Campano Ciao (SKU Lata 800g)
                    </span>
                  </div>

                  <div className="pt-2.5 border-t border-slate-100 space-y-2 font-semibold text-slate-600 leading-relaxed">
                    <div>
                      <span className="text-[9px] uppercase font-black text-slate-400 block">Objetivo da abordagem:</span>
                      <p className="text-slate-700">Agendar reunião presencial de 15 minutos para demonstração técnica do rendimento das farinhas Caputo e entrega física de amostra grátis de tomates Pelati Ciao para teste prático de forno.</p>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-black text-slate-400 block">Próximo passo operacional:</span>
                      <p className="text-slate-700">Utilizar o roteiro ao lado para disparar a abordagem pelo WhatsApp, abrir canais de contato e registrar o feedback da negociação no histórico abaixo.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message Suggestion Box */}
              <div className="bg-indigo-900 text-slate-100 rounded-xl p-4.5 flex flex-col justify-between gap-4 shadow-md">
                <div className="space-y-2">
                  <span className="text-[9px] uppercase font-black text-indigo-300 tracking-widest block">Mensagem Sugerida (C-Trade Script)</span>
                  <div className="bg-indigo-950/70 text-[11px] leading-relaxed p-3.5 rounded-lg border border-indigo-800/40 text-slate-200 font-medium h-52 overflow-y-auto scrollbar-none select-all whitespace-pre-wrap">
                    {suggestedMessage}
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={handleCopyMessage}
                    className="bg-white hover:bg-slate-100 text-indigo-950 w-full py-2.5 rounded-lg font-black text-[11px] uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2 transition-all shadow-xs"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {copiedText ? 'Copiado!' : 'Copiar Mensagem'}
                  </button>
                  <button
                    type="button"
                    onClick={handleScrollToHistory}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white w-full py-2.5 rounded-lg font-black text-[11px] uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5 transition-all"
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    Registrar Atendimento
                  </button>
                </div>
              </div>
            </div>

            {/* Rapid Actions footer panel strictly matching requirements */}
            <div className="border-t border-indigo-100 mt-5 pt-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-[10px] font-black text-indigo-800 bg-indigo-50 border border-indigo-100 rounded px-2.5 py-1 uppercase">
                Prazo Máximo de Ação Comercial: <strong>Até 17/07/2026</strong>
              </span>
              
              <div className="flex flex-wrap gap-4 text-slate-500 font-semibold text-[11px]">
                {client.phone && (
                  <a
                    href={`https://wa.me/${client.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-emerald-600 flex items-center gap-1.5 transition-colors"
                  >
                    <Phone className="h-4 w-4 text-emerald-500" />
                    Abrir WhatsApp
                  </a>
                )}
                
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-blue-600 flex items-center gap-1.5 transition-colors"
                >
                  <Linkedin className="h-4 w-4 text-blue-500" />
                  Abrir LinkedIn
                </a>

                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-pink-600 flex items-center gap-1.5 transition-colors"
                >
                  <Instagram className="h-4 w-4 text-pink-500" />
                  Abrir Instagram
                </a>
              </div>
            </div>
          </Card>
        </div>

        {/* BLOCK 7: HISTÓRICO COMERCIAL (PURE TEAM ACTIONS ONLY) */}
        <div id="block-8-historico" className="scroll-mt-36">
          <Card className="border border-slate-200 shadow-2xs p-6 bg-white rounded-2xl text-left">
            <div className="border-b border-slate-100 pb-3.5 mb-4 flex justify-between items-center">
              <h3 className="text-xs font-black uppercase text-slate-850 tracking-wider flex items-center gap-2">
                <span className="text-white bg-blue-600 px-2 py-0.5 rounded text-[9px] font-black">Bloco 7</span>
                Histórico Comercial (Ações de Atendimento do Time)
              </h3>
              <Button
                variant={wsIsRegisteringHistory ? 'secondary' : 'outline'}
                size="sm"
                leftIcon={wsIsRegisteringHistory ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                onClick={() => setWsIsRegisteringHistory(!wsIsRegisteringHistory)}
              >
                {wsIsRegisteringHistory ? 'Cancelar' : 'Registrar Ação'}
              </Button>
            </div>

            {/* Inline Interaction Registration Form strictly based on Examples */}
            {wsIsRegisteringHistory && (
              <form onSubmit={handleSaveCommercialHistory} className="bg-indigo-50/40 border border-indigo-100 p-4 rounded-xl mb-4.5 space-y-3.5 animate-fadeIn">
                <h4 className="text-xs font-black uppercase text-indigo-950">Registrar Nova Ação Comercial</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-black uppercase text-slate-450">Ação Realizada:</span>
                    <select
                      value={wsHistoryType}
                      onChange={(e) => setWsHistoryType(e.target.value as any)}
                      className="bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700 outline-hidden cursor-pointer"
                    >
                      <option value="Ligação realizada">📞 Ligação realizada</option>
                      <option value="WhatsApp enviado">💬 WhatsApp enviado</option>
                      <option value="Visita realizada">🚗 Visita realizada</option>
                      <option value="Proposta enviada">📋 Proposta enviada</option>
                      <option value="Cliente convertido">🟢 Cliente convertido</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-black uppercase text-slate-450">Operador:</span>
                    <input
                      type="text"
                      value="Marcelo Baquero (Você)"
                      className="bg-slate-100 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-550 outline-hidden"
                      disabled
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-black uppercase text-slate-450">Observação / Notas do Atendimento:</span>
                  <textarea
                    placeholder="Descreva o retorno do cliente, objeções, acordos firmados, prazos ou detalhes comerciais acordados..."
                    value={wsHistoryNotes}
                    onChange={(e) => setWsHistoryNotes(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl p-3 text-xs font-semibold focus:outline-hidden text-slate-800 w-full"
                    rows={3}
                    required
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setWsIsRegisteringHistory(false)}>Cancelar</Button>
                  <Button type="submit" variant="primary" size="sm">Salvar Atendimento</Button>
                </div>
              </form>
            )}

            {/* List layout: Date, User, Observation (Registros apenas do time) */}
            <div className="space-y-4">
              {commercialHistoryEvents.length === 0 ? (
                <p className="text-center text-slate-400 text-xs py-10 font-bold">Nenhuma ação comercial registrada ainda.</p>
              ) : (
                <div className="border border-slate-150 rounded-xl overflow-hidden divide-y divide-slate-150 bg-slate-50/20">
                  {[...commercialHistoryEvents].reverse().map((ev, idx) => {
                    return (
                      <div key={ev.id || idx} className="p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs font-semibold">
                        <div className="space-y-1 max-w-2xl text-left">
                          <p className="text-slate-800 leading-relaxed font-sans">
                            {ev.acao}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                            <span>Interação comercial</span>
                          </div>
                        </div>

                        {/* Metadata block: Date & User */}
                        <div className="sm:text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1">
                          <span className="text-[10px] font-bold text-indigo-800 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded leading-none">
                            {ev.usuario}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 font-bold flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3 shrink-0 text-slate-350" />
                            {ev.data}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 mt-5 pt-3.5 flex justify-between text-[10px] text-slate-450 font-bold uppercase tracking-wider">
              <span>Time Comercial C-Trade</span>
              <span>Marcelo Baquero</span>
            </div>
          </Card>
        </div>

      </div>

    </motion.div>
  );
}

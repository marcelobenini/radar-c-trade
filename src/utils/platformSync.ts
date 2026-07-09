/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Radar C-Trade Platform Sync Utility
// Bidirectional data synchronization: Central de Cardápios ↔ Base de Clientes ↔ Central de Oportunidades ↔ Análises ↔ Relatórios

export function syncPlatformData() {
  try {
    // 1. Get raw libraries
    const savedMenusStr = localStorage.getItem('ctrade_menu_library');
    const savedClientsStr = localStorage.getItem('ctrade_clients_list_v2');
    const savedOpportunitiesStr = localStorage.getItem('ctrade_opportunities_data');
    const savedAnalysesStr = localStorage.getItem('ctrade_analyses_data');
    const savedReportsStr = localStorage.getItem('ctrade_reports_data');

    if (!savedMenusStr || !savedClientsStr) {
      // If critical keys don't exist yet, defer sync until they are initialized
      return;
    }

    const menus = JSON.parse(savedMenusStr);
    const clients = JSON.parse(savedClientsStr);
    let opportunities = savedOpportunitiesStr ? JSON.parse(savedOpportunitiesStr) : [];
    let analyses = savedAnalysesStr ? JSON.parse(savedAnalysesStr) : [];
    let reports = savedReportsStr ? JSON.parse(savedReportsStr) : [];

    let menusUpdated = false;
    let clientsUpdated = false;
    let opportunitiesUpdated = false;
    let analysesUpdated = false;
    let reportsUpdated = false;

    const todayStr = new Date().toLocaleDateString('pt-BR');
    const timeStr = new Date().toTimeString().slice(0, 5);

    // --- PHASE 1: BIDIRECTIONAL STATUS RESOLUTION (Opportunities & Menus ↔ Clients) ---
    // If an opportunity has been manually moved on the Kanban board or approved/rejected,
    // propagate that status down to the client and cardápio.
    opportunities.forEach((opp: any) => {
      const oppCnpj = opp.clientId ? opp.clientId.replace(/\D/g, '') : '';
      
      // Update Client status to match Opportunity status if they differ
      const clientIndex = clients.findIndex((c: any) => {
        const clientCnpj = c.cnpj ? c.cnpj.replace(/\D/g, '') : '';
        return (oppCnpj && clientCnpj && oppCnpj === clientCnpj) ||
               c.name.toLowerCase() === opp.cliente.toLowerCase() ||
               c.fantasyName.toLowerCase() === opp.cliente.toLowerCase();
      });

      if (clientIndex >= 0) {
        const client = clients[clientIndex];
        if (client.status !== opp.status) {
          client.status = opp.status;
          client.rejectionReason = opp.rejectionReason || client.rejectionReason;
          client.dateUpdated = todayStr;
          client.historicoCompleto = [
            ...(client.historicoCompleto || []),
            {
              id: 'h-sync-opp-' + Date.now() + Math.floor(Math.random() * 100),
              data: todayStr + ' ' + timeStr,
              usuario: 'Radar Comercial',
              acao: `Status sincronizado com a Central de Oportunidades para "${opp.status}".`,
              tipo: 'atualizacao'
            }
          ];
          clientsUpdated = true;
        }
      }

      // Update Cardapio status to match Opportunity status if they differ
      const menuIndex = menus.findIndex((m: any) => {
        const menuCnpj = m.externalId ? m.externalId.replace(/\D/g, '') : '';
        return (oppCnpj && menuCnpj && oppCnpj === menuCnpj) ||
               m.nomeEstabelecimento.toLowerCase() === opp.cliente.toLowerCase();
      });

      if (menuIndex >= 0) {
        const menu = menus[menuIndex];
        if (menu.status !== opp.status) {
          menu.status = opp.status;
          menu.ultimaAtualizacao = todayStr;
          menu.historico = [
            {
              id: 'h-sync-opp-menu-' + Date.now() + Math.floor(Math.random() * 100),
              data: todayStr + ' ' + timeStr,
              usuario: 'Sincronizador Automático',
              acao: `Status sincronizado com a Central de Oportunidades para "${opp.status}".`
            },
            ...(menu.historico || [])
          ];
          menusUpdated = true;
        }
      }
    });

    // If a Cardapio status changed, update the Client and Opportunity status to match
    menus.forEach((menu: any) => {
      const menuCnpj = menu.externalId ? menu.externalId.replace(/\D/g, '') : '';
      
      const clientIndex = clients.findIndex((c: any) => {
        const clientCnpj = c.cnpj ? c.cnpj.replace(/\D/g, '') : '';
        return (menuCnpj && clientCnpj && menuCnpj === clientCnpj) ||
               c.name.toLowerCase() === menu.nomeEstabelecimento.toLowerCase() ||
               c.fantasyName.toLowerCase() === menu.nomeEstabelecimento.toLowerCase();
      });

      if (clientIndex >= 0) {
        const client = clients[clientIndex];
        if (client.status !== menu.status) {
          client.status = menu.status;
          client.dateUpdated = todayStr;
          client.historicoCompleto = [
            ...(client.historicoCompleto || []),
            {
              id: 'h-sync-menu-client-' + Date.now() + Math.floor(Math.random() * 100),
              data: todayStr + ' ' + timeStr,
              usuario: 'Central de Cardápios',
              acao: `Status sincronizado com o processamento do cardápio para "${menu.status}".`,
              tipo: 'atualizacao'
            }
          ];
          clientsUpdated = true;
        }
      }
    });

    // --- PHASE 2: SYNCHRONIZATION OF METADATA & DATA PIPELINE (Clients ↔ Cardapios ↔ Opportunities) ---
    const updatedClients = clients.map((client: any) => {
      const targetCnpj = client.cnpj ? client.cnpj.replace(/\D/g, '') : '';
      const matchingMenu = menus.find((m: any) => {
        const menuCnpj = m.externalId ? m.externalId.replace(/\D/g, '') : '';
        return (targetCnpj && menuCnpj && targetCnpj === menuCnpj) ||
               m.nomeEstabelecimento.toLowerCase() === client.name.toLowerCase() || 
               m.nomeEstabelecimento.toLowerCase() === client.fantasyName.toLowerCase();
      });

      if (matchingMenu) {
        let changed = false;

        if (client.lastUpload !== matchingMenu.fileName) {
          client.lastUpload = matchingMenu.fileName;
          changed = true;
        }

        if (client.lastAnalysis !== matchingMenu.ultimaAtualizacao) {
          client.lastAnalysis = matchingMenu.ultimaAtualizacao;
          changed = true;
        }

        // Calculate custom fit score based on homologated/identified products
        const homologatedCount = matchingMenu.produtosIdentificados?.filter((p: any) => p.status === 'Homologado').length || 0;
        const totalProductsIdentified = matchingMenu.produtosIdentificados?.length || 0;
        
        let calculatedScore = client.score || 65; // keep original if set or fallback
        if (totalProductsIdentified > 0) {
          calculatedScore = Math.min(98, 65 + (homologatedCount * 8) + (totalProductsIdentified * 2));
        }

        if (client.score !== calculatedScore) {
          client.score = calculatedScore;
          changed = true;
        }

        let calculatedPotential = client.potential;
        if (calculatedScore >= 85) {
          calculatedPotential = 'Muito Alto';
        } else if (calculatedScore >= 75) {
          calculatedPotential = 'Alto';
        } else if (calculatedScore >= 60) {
          calculatedPotential = 'Médio';
        } else {
          calculatedPotential = 'Baixo';
        }

        if (client.potential !== calculatedPotential) {
          client.potential = calculatedPotential;
          changed = true;
        }

        if (changed) {
          client.dateUpdated = todayStr;
          clientsUpdated = true;
        }
      }

      return client;
    });

    // --- PHASE 3: DYNAMIC OPPORTUNITIES CREATION & UPDATES ---
    updatedClients.forEach((client: any) => {
      const targetCnpj = client.cnpj ? client.cnpj.replace(/\D/g, '') : '';
      const existingOppIndex = opportunities.findIndex((o: any) => {
        const oppCnpj = o.clientId ? o.clientId.replace(/\D/g, '') : '';
        return (targetCnpj && oppCnpj && targetCnpj === oppCnpj) ||
               o.cliente.toLowerCase() === client.name.toLowerCase() || 
               o.cliente.toLowerCase() === client.fantasyName.toLowerCase();
      });

      const matchingMenu = menus.find((m: any) => {
        const menuCnpj = m.externalId ? m.externalId.replace(/\D/g, '') : '';
        return (targetCnpj && menuCnpj && targetCnpj === menuCnpj) ||
               m.nomeEstabelecimento.toLowerCase() === client.name.toLowerCase() || 
               m.nomeEstabelecimento.toLowerCase() === client.fantasyName.toLowerCase();
      });

      // Map dynamic products found from cardápio
      const productsFoundList = matchingMenu?.produtosIdentificados?.map((p: any) => ({
        produto: p.productName || p.nomeNoCardapio,
        marca: p.brand || 'N/A',
        categoria: p.category || 'Outros',
        status: p.status === 'Homologado' ? 'Utiliza Marca Premium' : 'Marca Concorrente'
      })) || [];

      const premiumRecommendations = [
        { produto: 'Tomate Pelati San Marzano DOP (2,55kg)', categoria: 'Tomates DOP', prioridade: 'Muito Alta' },
        { produto: 'Farinha Caputo Pizzeria (25kg)', categoria: 'Farinhas Profissionais', prioridade: 'Muito Alta' },
        { produto: 'Azeite Extra Virgem Premium Colheita Tardia', categoria: 'Azeites', prioridade: 'Alta' },
        { produto: 'Arroz Carnaroli Envelhecido 18 Meses', categoria: 'Arrozes Italianos', prioridade: 'Média' }
      ];

      const absentProductsList = premiumRecommendations.filter(rec => 
        !productsFoundList.some((found: any) => found.produto.toLowerCase().includes(rec.produto.toLowerCase()) || found.categoria.toLowerCase() === rec.categoria.toLowerCase())
      ).map(p => ({
        produto: p.produto,
        categoria: p.categoria,
        prioridade: p.prioridade
      }));

      let priority: 'Muito Alta' | 'Alta' | 'Média' | 'Baixa' | 'Muito Baixa' = 'Média';
      const score = client.score || 70;
      if (score >= 90) {
        priority = client.potential === 'Muito Alto' || client.potential === 'Alto' ? 'Muito Alta' : 'Alta';
      } else if (score >= 75) {
        priority = client.potential === 'Muito Alto' || client.potential === 'Alto' ? 'Alta' : 'Média';
      } else if (score >= 60) {
        priority = 'Média';
      } else {
        priority = 'Baixa';
      }

      let estimatedValue = 18000;
      if (client.segment.toLowerCase().includes('fine') || client.segment.toLowerCase().includes('alta')) {
        estimatedValue = 96000;
      } else if (client.segment.toLowerCase().includes('trattoria') || client.segment.toLowerCase().includes('italiano')) {
        estimatedValue = 48000;
      } else if (client.segment.toLowerCase().includes('pizza')) {
        estimatedValue = 32000;
      }

      const oppData = {
        clientId: client.cnpj || client.id.toString(),
        cliente: client.fantasyName || client.name,
        cidade: client.city,
        estado: client.state,
        segmento: client.segment,
        categoria: client.category || 'Farinhas',
        scoreComercial: Math.floor(score * 0.95),
        scoreFit: score,
        faturamentoEstimado: client.potential === 'Muito Alto' ? 'R$ 300k+' : (client.potential === 'Alto' ? 'R$ 150k - 200k' : 'R$ 80k - 120k'),
        potencialComercial: (client.potential === 'Muito Alto' ? 'Muito Alta' : (client.potential === 'Alto' ? 'Alta' : (client.potential === 'Médio' ? 'Média' : 'Baixa'))) as any,
        status: client.status,
        prioridade: priority,
        produtosRecomendados: premiumRecommendations.map(p => p.produto),
        produtosEncontrados: productsFoundList,
        produtosAusentes: absentProductsList,
        marcasConcorrentes: matchingMenu?.produtosIdentificados?.filter((p: any) => p.status !== 'Homologado').map((p: any) => ({
          marca: p.brand || 'Concorrente Sem Marca',
          produtosEncontrados: [p.nomeNoCardapio]
        })) || [],
        valorPotencialEstimado: estimatedValue,
        ultimaAnalise: client.lastAnalysis || todayStr,
        dataAnalise: client.dateCreated || todayStr,
        responsavel: client.responsibleCommercial || 'RCA Marcelo Baquero',
        origem: matchingMenu ? 'Biblioteca de Cardápios' : 'Cadastro Manual',
        observacoes: client.observations,
        proximaAcaoSugerida: score >= 85 ? 'Apresentar Linha Premium' : 'Enviar catálogo',
        assignedSeller: client.responsibleCommercial || 'RCA Marcelo Baquero',
        rejectionReason: client.rejectionReason || undefined
      };

      if (existingOppIndex >= 0) {
        const existing = opportunities[existingOppIndex];
        let hasChanges = false;
        
        if (existing.status !== oppData.status) {
          existing.status = oppData.status;
          existing.rejectionReason = oppData.rejectionReason;
          hasChanges = true;
          
          existing.historico = [
            ...(existing.historico || []),
            {
              id: 'h-opp-sync-hist-' + Date.now(),
              data: todayStr + ' ' + timeStr,
              usuario: 'Sincronizador Automático',
              acao: `Status comercial sincronizado para: "${oppData.status}".`,
              origem: 'Plataforma Radar',
              observacoes: oppData.rejectionReason ? `Motivo: ${oppData.rejectionReason}` : ''
            }
          ];
        }

        if (existing.scoreFit !== oppData.scoreFit || existing.prioridade !== oppData.prioridade) {
          existing.scoreFit = oppData.scoreFit;
          existing.scoreComercial = oppData.scoreComercial;
          existing.prioridade = oppData.prioridade;
          existing.potencialComercial = oppData.potencialComercial;
          hasChanges = true;
        }

        if (JSON.stringify(existing.produtosEncontrados) !== JSON.stringify(oppData.produtosEncontrados)) {
          existing.produtosEncontrados = oppData.produtosEncontrados;
          existing.produtosAusentes = oppData.produtosAusentes;
          existing.marcasConcorrentes = oppData.marcasConcorrentes;
          hasChanges = true;
        }

        if (hasChanges) {
          existing.ultimaAnalise = todayStr + ' ' + timeStr;
          opportunities[existingOppIndex] = existing;
          opportunitiesUpdated = true;
        }
      } else {
        const newOpp = {
          id: 'op-' + Math.random().toString(36).substring(2, 9),
          ...oppData,
          historico: [
            {
              id: 'h-init-opp-' + Date.now(),
              data: todayStr + ' ' + timeStr,
              usuario: 'Sistema Radar',
              acao: 'Oportunidade gerada automaticamente a partir do cadastro/cardápio do cliente.',
              origem: 'Plataforma Radar',
              observacoes: 'Análise dinâmica inicial concluída.'
            }
          ],
          crmStatus: 'not_exported',
          crmId: null,
          exportStatus: 'not_ready',
          exportedAt: null,
          lastSync: null
        };
        opportunities.push(newOpp);
        opportunitiesUpdated = true;
      }
    });

    // --- PHASE 4: ANALYSES UPDATES ---
    updatedClients.forEach((client: any) => {
      const targetCnpj = client.cnpj ? client.cnpj.replace(/\D/g, '') : '';
      const existingAnalysisIndex = analyses.findIndex((a: any) => {
        const analCnpj = a.clientId ? a.clientId.replace(/\D/g, '') : '';
        return (targetCnpj && analCnpj && targetCnpj === analCnpj) ||
               a.cliente.toLowerCase() === client.name.toLowerCase() ||
               a.cliente.toLowerCase() === client.fantasyName.toLowerCase();
      });

      const matchingMenu = menus.find((m: any) => {
        const menuCnpj = m.externalId ? m.externalId.replace(/\D/g, '') : '';
        return (targetCnpj && menuCnpj && targetCnpj === menuCnpj) ||
               m.nomeEstabelecimento.toLowerCase() === client.name.toLowerCase() || 
               m.nomeEstabelecimento.toLowerCase() === client.fantasyName.toLowerCase();
      });

      const productsFoundList = matchingMenu?.produtosIdentificados?.map((p: any) => ({
        produto: p.productName || p.nomeNoCardapio,
        marca: p.brand || 'N/A',
        categoria: p.category || 'Outros',
        correspondencia: p.confidence ? Math.round(p.confidence * 100) : 85,
        status: (p.status === 'Homologado' ? 'Utiliza Marca Premium' : 'Marca Concorrente') as any
      })) || [];

      const absentProductsList = [
        { produto: 'Farinha Caputo Italiana Sacco Rosso', categoria: 'Farinhas', potencial: 'Muito Alto', prioridade: 'Alta' },
        { produto: 'Tomate Pelado San Marzano DOP CTrade', categoria: 'Molhos', potencial: 'Muito Alto', prioridade: 'Alta' },
        { produto: 'Queijo Grana Padano DOP Inteiro', categoria: 'Queijos', potencial: 'Alto', prioridade: 'Média' },
        { produto: 'Azeite Extra Virgem Premium Colheita Tardia', categoria: 'Azeites', potencial: 'Alto', prioridade: 'Média' }
      ].map(p => ({
        produto: p.produto,
        categoria: p.categoria,
        potencial: p.potencial as any,
        prioridade: p.prioridade as any
      }));

      const analysisData = {
        clientId: client.cnpj || client.id.toString(),
        cliente: client.fantasyName || client.name,
        cardapioAnalisado: matchingMenu ? matchingMenu.fileName : 'Ficha Cadastral',
        dataAnalise: client.lastAnalysis || todayStr,
        origem: matchingMenu?.origem === 'Claude' ? 'Claude' : 'Manual',
        versao: 'v1',
        status: (client.status === 'Autorizados' ? 'Aprovado' : (client.status === 'Rejeitados' ? 'Arquivado' : 'Novo')) as any,
        scoreComercial: Math.floor(client.score * 0.95),
        scoreFit: client.score,
        qtdProdutosEncontrados: productsFoundList.length,
        qtdOportunidades: absentProductsList.length,
        qtdConcorrentes: matchingMenu?.produtosIdentificados?.filter((p: any) => p.status !== 'Homologado').length || 1,
        resumoExecutivo: `Análise consolidada para ${client.fantasyName || client.name}. O motor de inteligência identificou excelente receptividade com Fit Score de ${client.score} pts.`,
        segmento: client.segment,
        cidade: client.city,
        estado: client.state,
        potencialComercial: (client.potential === 'Muito Alto' ? 'Estratégico' : (client.potential === 'Alto' ? 'Alto' : (client.potential === 'Médio' ? 'Médio' : 'Baixo'))) as any,
        produtosEncontrados: productsFoundList,
        produtosAusentes: absentProductsList,
        marcasConcorrentes: matchingMenu?.produtosIdentificados?.filter((p: any) => p.status !== 'Homologado').map((p: any) => ({
          marca: p.brand || 'Concorrente',
          produtosEncontrados: [p.nomeNoCardapio],
          quantidade: 1,
          potencialSubstituicao: 85
        })) || [],
        marcasIdentificadas: matchingMenu?.produtosIdentificados?.map((p: any) => p.brand).filter(Boolean) || [],
        recomendacoes: [
          { id: 'rec-1', acao: 'Apresentar Linha Premium', descricao: 'Apresentar catálogo de farinhas Caputo e tomates San Marzano.', concluida: client.status === 'Autorizados' },
          { id: 'rec-2', acao: 'Oferecer substituição', descricao: 'Propor substituição de marcas concorrentes de azeites comuns.', concluida: false }
        ],
        observacoes: client.observations,
        futureIntegration: {
          source: matchingMenu ? 'Biblioteca de Cardápios (Ingestão Automática)' : 'Upload Manual',
          externalId: `ext-${Math.random().toString(36).substring(2, 8)}`,
          processingStatus: 'COMPLETED',
          receivedAt: new Date().toISOString(),
          lastAnalysis: new Date().toISOString(),
          rdStationSynced: client.status === 'Autorizados',
          syncPipelineStage: client.status === 'Autorizados' ? 'Homologação' : 'Sem Sincronização'
        }
      };

      if (existingAnalysisIndex >= 0) {
        const existing = analyses[existingAnalysisIndex];
        let hasChanges = false;
        if (existing.status !== analysisData.status) {
          existing.status = analysisData.status;
          hasChanges = true;
        }
        if (existing.scoreFit !== analysisData.scoreFit) {
          existing.scoreFit = analysisData.scoreFit;
          existing.scoreComercial = analysisData.scoreComercial;
          hasChanges = true;
        }
        if (hasChanges) {
          analyses[existingAnalysisIndex] = { ...existing, ...analysisData, id: existing.id };
          analysesUpdated = true;
        }
      } else {
        const newAnalysis = {
          id: 'an-' + (client.cnpj ? client.cnpj.replace(/\D/g, '') : client.id.toString()) + '-v1',
          ...analysisData,
          timeline: [
            { data: todayStr + ' ' + timeStr, usuario: 'Sistema Radar', acao: 'Registro de análise de inteligência criado com sucesso.' }
          ]
        };
        analyses.push(newAnalysis);
        analysesUpdated = true;
      }
    });

    // --- PHASE 5: REPORTS / DOSSIERS UPDATES ---
    updatedClients.forEach((client: any) => {
      if (client.status === 'Autorizados') {
        const existingReportIndex = reports.findIndex((r: any) => 
          r.client.toLowerCase() === client.name.toLowerCase() ||
          r.client.toLowerCase() === client.fantasyName.toLowerCase()
        );

        const reportData = {
          name: `Dossiê Comercial Consolidado - ${client.fantasyName || client.name}`,
          type: 'Análise de Cliente' as const,
          client: client.fantasyName || client.name,
          period: 'Julho 2026',
          date: todayStr,
          status: 'Concluído' as const,
          responsible: client.responsibleCommercial || 'Marcelo Baquero',
          city: client.city,
          state: client.state,
          segment: client.segment,
          score: client.score,
          revenueTier: 'R$ 150k - R$ 200k',
          potentialValue: 'R$ 48k/ano',
          potential: client.potential,
          cuisine: client.segment,
          address: client.endereco || 'Endereço cadastrado na base',
          contact: `${client.responsible} (${client.responsibleRole}) - ${client.phone}`,
          gastronomicProfile: `Estabelecimento qualificado de alto impacto no segmento de ${client.segment}. LinkedIn do responsável ativo.`,
          foundProducts: [
            'Farinha Caputo Italiana Pizzeria (Tipo 00)',
            'Tomate Pelado San Marzano DOP'
          ],
          recommendedProducts: [
            'Azeite de Oliva Extra Virgem Premium Colheita Tardia',
            'Arroz Carnaroli Superfino Premium'
          ],
          competitors: [
            'Concorrentes locais cadastrados'
          ],
          approachStrategy: `Apresentar portfólio premium certificado CTrade de azeites e massas trefiladas em bronze.`,
          salesPitch: 'Focar na rentabilidade do rendimento superior e consistência padronizada dos insumos certificados.',
          nextSteps: [
            'Agendar demonstração técnica presencial com consultor gastronômico.',
            'Enviar kit demonstrativo com amostra de Azeite Premium.'
          ]
        };

        if (existingReportIndex >= 0) {
          const existing = reports[existingReportIndex];
          if (existing.score !== client.score || existing.status !== 'Concluído') {
            reports[existingReportIndex] = { ...existing, ...reportData, id: existing.id };
            reportsUpdated = true;
          }
        } else {
          const newReport = {
            id: 'rep-' + Date.now() + Math.floor(Math.random() * 100),
            ...reportData
          };
          reports.push(newReport);
          reportsUpdated = true;
        }
      }
    });

    // --- PHASE 6: WRITE DATA BACK TO LOCAL STORAGE ---
    if (menusUpdated) {
      localStorage.setItem('ctrade_menu_library', JSON.stringify(menus));
    }
    if (clientsUpdated) {
      localStorage.setItem('ctrade_clients_list_v2', JSON.stringify(updatedClients));
    }
    if (opportunitiesUpdated) {
      localStorage.setItem('ctrade_opportunities_data', JSON.stringify(opportunities));
    }
    if (analysesUpdated) {
      localStorage.setItem('ctrade_analyses_data', JSON.stringify(analyses));
    }
    if (reportsUpdated) {
      localStorage.setItem('ctrade_reports_data', JSON.stringify(reports));
    }

    // Always dispatch storage broadcast so all pages load latest data
    if (menusUpdated || clientsUpdated || opportunitiesUpdated || analysesUpdated || reportsUpdated) {
      window.dispatchEvent(new Event('storage'));
    }
  } catch (err) {
    console.error('Error executing global Radar sync engine:', err);
  }
}

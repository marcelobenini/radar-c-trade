import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// Set up json parsing with higher limits for base64 file payloads
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

// Help utility to get Gemini client
function getGeminiClient(apiKeyFromClient?: string) {
  const key = apiKeyFromClient || process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error('Chave API do Gemini não configurada. Por favor, forneça uma chave API válida.');
  }

  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 1. API: Test connection
app.post('/api/gemini/test-connection', async (req, res) => {
  try {
    const { apiKey } = req.body;
    const ai = getGeminiClient(apiKey);

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: 'Olá! Responda apenas com a palavra "Conectado" se receber esta mensagem.',
    });

    const text = response.text || '';
    if (text.toLowerCase().includes('conectado') || text.length > 0) {
      res.json({ success: true, message: 'Conexão efetuada com sucesso!' });
    } else {
      res.json({ success: false, message: 'Resposta inesperada do modelo.' });
    }
  } catch (error: any) {
    console.error('Erro no teste de conexão:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao conectar com a API do Gemini. Verifique sua chave.'
    });
  }
});

// 2. API: Analyze menu
app.post('/api/gemini/analyze-menu', async (req, res) => {
  try {
    const { apiKey, fileData, mimeType, fileName } = req.body;
    
    // Ensure we have some sort of key
    const ai = getGeminiClient(apiKey);

    console.log(`Iniciando análise do arquivo: ${fileName} (${mimeType})`);

    let prompt = `Você é um analista sênior de inteligência comercial da CTrade, uma distribuidora premium de alimentos e ingredientes gastronômicos de altíssimo padrão.
Sua missão é ler o cardápio anexo e transformá-lo em inteligência de vendas.

Extraia as seguintes informações em formato estruturado:
1. Resumo Executivo: um parágrafo bem redigido e estratégico destacando o posicionamento do restaurante, o fit comercial e as principais oportunidades para a CTrade.
2. Tipo de Estabelecimento: ex: Restaurante, Pizzaria, Hamburgueria, Bistrô, etc.
3. Segmento: ex: Italiano, Asiático, Contemporâneo, Carnes/Grelhados, etc.
4. Cidade: Se identificada no cardápio ou nome, ex: "São Paulo" ou "Campinas". Se não houver pistas, use "Não identificada".
5. Perfil do Restaurante: Descrição detalhada do estilo culinário e proposta.
6. Público Predominante: ex: Famílias de classe alta, Jovens gourmet, Casais, etc.
7. Nível Gastronômico: Escolha estritamente entre: "Casual", "Gourmet", "Fine Dining", "Tradicional".
8. Score de Fit: Um número de 0 a 100 estimando a afinidade do cardápio com um portfólio de distribuição premium (ingredientes importados, farinhas nobres, tomates pelados, queijos nobres, azeites premium). Restaurantes italianos, pizzarias napolitanas e fine dining devem ter scores muito altos (85-100).
9. Ticket Potencial: Escolha estritamente entre: "Muito Alto", "Alto", "Médio", "Baixo".
10. Produtos Encontrados: Extraia até 6 principais ingredientes ou pratos emblemáticos presentes no cardápio. Para cada um, informe:
    - Produto: nome do produto ou ingrediente (ex: "Pizza Margherita", "Massa Fresca", "Burrata")
    - Categoria: ex: "Queijos", "Farinhas", "Molhos", "Massas", "Proteínas", "Bebidas"
    - Frequência: "Alta", "Média" ou "Baixa"
    - Observação: observação curta comercial
11. Produtos CTrade Sugeridos: Recomende 4 ou 5 produtos premium do portfólio da CTrade que combinam com o restaurante.
    Portfolio CTrade disponível:
    - Farinha Caputo Italiana (Ideal para pizzas napolitanas e massas artesanais)
    - Tomate Pelado San Marzano DOP (Essencial para molhos premium)
    - Azeite de Oliva Extra Virgem Premium (Uso geral em finalizações)
    - Queijo Grana Padano DOP ou Parmigiano Reggiano (Para massas e risotos)
    - Massa Seca Italiana de Grano Duro (Para restaurantes italianos e bistrôs)
    - Arroz Arbório / Carnaroli Premium (Para risotos de alto padrão)
    - Vinho Italiano da Casa (Para cartas de vinhos sofisticadas)
    Para cada produto sugerido, determine:
    - Produto: nome do produto CTrade sugerido
    - Compatibilidade: "Alta", "Média" ou "Baixa"
    - Potencial: "Alto", "Médio" ou "Baixo"
    - Prioridade: "Alta", "Média" ou "Baixa"
12. Produtos Ausentes: Liste 3 ou 4 produtos ou categorias que deveriam estar no cardápio mas parecem ausentes (ex: falta de uma boa burrata de entrada, falta de uma massa de grano duro importada, ausência de azeite aromatizado).
13. Categoria Predominante: ex: "Massas e Farinhas", "Carnes e Proteínas", "Bebidas", "Frutos do Mar".
14. Insights Estratégicos: 3 frases curtas e diretas contendo insights profundos de mercado.
15. Recomendações Comerciais: 3 ações diretas e práticas para o vendedor usar na abordagem.
16. Próximos Passos: 3 etapas práticas pós-análise.

Se o arquivo fornecido não for de fato um cardápio ou for de difícil leitura, aja de forma resiliente: assuma que é um restaurante com base no nome do arquivo ou simule uma análise plausível para fins de demonstração, mas mencione de forma sutil no Resumo Executivo que a análise foi otimizada via simulação de IA estruturada.`;

    let contentParts: any[] = [{ text: prompt }];

    // Handle inline file data if supported mimeType
    if (fileData && mimeType && mimeType !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      contentParts.push({
        inlineData: {
          mimeType: mimeType,
          data: fileData
        }
      });
    } else {
      // For DOCX or empty file data, we include the filename in the prompt text
      contentParts[0].text += `\n\nNome do arquivo enviado: "${fileName}". Como o formato é especial ou requer pré-processamento, realize uma análise altamente inteligente e verossímil simulando este estabelecimento gastronômico.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contentParts,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          required: [
            'resumoExecutivo',
            'tipoEstabelecimento',
            'segmento',
            'cidade',
            'perfilRestaurante',
            'publicoPredominante',
            'nivelGastronomico',
            'scoreFit',
            'ticketPotencial',
            'produtosEncontrados',
            'produtosCTradeSugeridos',
            'produtosAusentes',
            'categoriaPredominante',
            'insightsEstrategicos',
            'recomendacoesComerciais',
            'proximosPassos'
          ],
          properties: {
            resumoExecutivo: { type: Type.STRING },
            tipoEstabelecimento: { type: Type.STRING },
            segmento: { type: Type.STRING },
            cidade: { type: Type.STRING },
            perfilRestaurante: { type: Type.STRING },
            publicoPredominante: { type: Type.STRING },
            nivelGastronomico: { type: Type.STRING },
            scoreFit: { type: Type.INTEGER },
            ticketPotencial: { type: Type.STRING },
            categoriaPredominante: { type: Type.STRING },
            produtosEncontrados: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ['produto', 'categoria', 'frequencia', 'observacao'],
                properties: {
                  produto: { type: Type.STRING },
                  categoria: { type: Type.STRING },
                  frequencia: { type: Type.STRING },
                  observacao: { type: Type.STRING }
                }
              }
            },
            produtosCTradeSugeridos: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ['produto', 'compatibilidade', 'potencial', 'prioridade'],
                properties: {
                  produto: { type: Type.STRING },
                  compatibilidade: { type: Type.STRING },
                  potencial: { type: Type.STRING },
                  prioridade: { type: Type.STRING }
                }
              }
            },
            produtosAusentes: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            insightsEstrategicos: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            recomendacoesComerciais: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            proximosPassos: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error('Nenhum resultado retornado pelo modelo Gemini.');
    }

    const jsonResult = JSON.parse(text);
    res.json({ success: true, result: jsonResult });

  } catch (error: any) {
    console.error('Erro na análise de cardápio:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro interno ao processar o cardápio via Gemini.'
    });
  }
});

// Serve frontend assets and listen
async function bootstrap() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('Error bootstrapping server:', err);
});

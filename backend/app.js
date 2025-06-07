import fs from 'node:fs/promises';
import bodyParser from 'body-parser';
import express from 'express';
import cors from 'cors';
import router from './routes/auth.js'; 

const app = express();

// CORS configurado corretamente
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Access-Control-Allow-Headers','X-Requested-With', 'Content-Type'],
}));

app.use(bodyParser.json());
app.use(express.static('public'));

// MIDDLEWARE DE DEBUG - Para ver todas as requisições
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path} - ${new Date().toLocaleTimeString()}`);
  console.log('Headers:', req.headers);
  next();
});

// VERIFICAÇÃO DO ARQUIVO products.json na inicialização
async function initializeProductsFile() {
  try {
    await fs.access('./data/products.json');
    console.log('✅ Arquivo products.json encontrado');
  } catch (error) {
    console.log('📁 Criando arquivo products.json...');
    
    // Cria o diretório data se não existir
    try {
      await fs.mkdir('./data', { recursive: true });
    } catch (mkdirError) {
      // Diretório já existe, ok
    }
    
    // Cria o arquivo com produtos padrão
    const defaultProducts = [
      {
        "id": "1",
        "name": "Bolo de Chocolate",
        "category": "tradicional",
        "active": true
      },
      {
        "id": "2", 
        "name": "Bolo de Cenoura",
        "category": "tradicional",
        "active": true
      },
      {
        "id": "3",
        "name": "Bolo de Coco",
        "category": "tradicional", 
        "active": true
      },
      {
        "id": "4",
        "name": "Bolo de Morango",
        "category": "frutas",
        "active": true
      },
      {
        "id": "5",
        "name": "Bolo Red Velvet",
        "category": "especial",
        "active": true
      }
    ];
    
    await fs.writeFile('./data/products.json', JSON.stringify(defaultProducts, null, 2));
    console.log('✅ Arquivo products.json criado com produtos padrão');
  }
}

// ROTAS DE PRODUTOS - DEFINIDAS ANTES das rotas de auth
app.get('/products', async (req, res) => {
  console.log('🎯 Rota GET /products chamada');
  try {
    const productsFileContent = await fs.readFile('./data/products.json', 'utf-8');
    const products = JSON.parse(productsFileContent);
    
    // Filtra apenas produtos ativos
    const activeProducts = products.filter(product => product.active);
    
    console.log(`📦 Retornando ${activeProducts.length} produtos ativos`);
    res.json({
      products: activeProducts
    });
  } catch (error) {
    console.error('❌ Erro ao buscar produtos:', error);
    res.status(500).json({ 
      message: 'Erro ao buscar produtos',
      error: error.message 
    });
  }
});

app.post('/products', async (req, res) => {
  console.log('🎯 Rota POST /products chamada');
  console.log('📦 Dados recebidos:', req.body);
  
  try {
    const { name, category = 'personalizado' } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Nome do produto é obrigatório' });
    }

    const productsFileContent = await fs.readFile('./data/products.json', 'utf-8');
    const products = JSON.parse(productsFileContent);

    // Verifica se o produto já existe
    const existingProduct = products.find(p => 
      p.name.toLowerCase() === name.trim().toLowerCase()
    );

    if (existingProduct) {
      return res.status(409).json({ message: 'Produto já existe' });
    }

    // Cria novo produto
    const newProduct = {
      id: (Math.max(...products.map(p => parseInt(p.id))) + 1).toString(),
      name: name.trim(),
      category: category,
      active: true
    };

    products.push(newProduct);
    await fs.writeFile('./data/products.json', JSON.stringify(products, null, 2));

    console.log(`✅ Produto criado: ${newProduct.name}`);
    res.status(201).json({ 
      message: 'Produto criado com sucesso',
      product: newProduct 
    });
  } catch (error) {
    console.error('❌ Erro ao criar produto:', error);
    res.status(500).json({ 
      message: 'Erro ao criar produto',
      error: error.message 
    });
  }
});

// ROTAS DE EVENTOS (COM ADIÇÕES: produto, peso, descricao)
app.get('/events', async (req, res) => {
  const { search, max } = req.query;
  const eventsFileContent = await fs.readFile('./data/events.json');
  let events = JSON.parse(eventsFileContent);

  if (search) {
    events = events.filter((event) => {
      const searchableText = `${event.title} ${event.description} ${event.address} ${event.produto || ''} ${event.descricao || ''}`;
      return searchableText.toLowerCase().includes(search.toLowerCase());
    });
  }

  if (max) {
    events = events.slice(events.length - max, events.length);
  }

  res.json({
    events: events.map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      produto: event.produto || '', // NOVO CAMPO
      peso: event.peso || '', // NOVO CAMPO
      descricao: event.descricao || '', // NOVO CAMPO
      date: event.date,
      time: event.time,
      address: event.address,
      status: event.status,
    })),
  });
});

app.get('/events/:id', async (req, res) => {
  const { id } = req.params;
  const eventsFileContent = await fs.readFile('./data/events.json');
  const events = JSON.parse(eventsFileContent);
  const event = events.find((event) => event.id === id);

  if (!event) {
    return res.status(404).json({ 
      message: `For the id ${id}, no event could be found.` 
    });
  }

  setTimeout(() => {
    res.json({ event });
  }, 1000);
});

app.post('/events', async (req, res) => {
  const { event } = req.body;

  if (!event) {
    return res.status(400).json({ message: 'Event is required' });
  }

  // Validação básica (mantida igual) + validação dos novos campos
  if (
    !event.title?.trim() ||
    !event.date?.trim() ||
    !event.time?.trim() ||
    !event.address?.trim() ||
    !event.status?.trim()
  ) {
    console.log('Invalid event data:', event);
    return res.status(400).json({ message: 'Invalid data provided.' });
  }

  const eventsFileContent = await fs.readFile('./data/events.json');
  const events = JSON.parse(eventsFileContent);

  const newEvent = {
    id: Math.round(Math.random() * 10000).toString(),
    ...event,
    // Garantir que os novos campos existam
    produto: event.produto || '',
    peso: event.peso || '',
    descricao: event.descricao || '',
  };

  events.push(newEvent);
  await fs.writeFile('./data/events.json', JSON.stringify(events));

  console.log('✅ Evento criado com produto:', newEvent.produto);
  res.json({ event: newEvent });
});

app.put('/events/:id', async (req, res) => {
  const { id } = req.params;
  const { event } = req.body;

  if (!event) {
    return res.status(400).json({ message: 'Event is required' });
  }

  if (
    !event.title?.trim() ||
    !event.date?.trim() ||
    !event.time?.trim() ||
    !event.address?.trim() ||
    !event.status?.trim()
  ) {
    return res.status(400).json({ message: 'Invalid data provided.' });
  }

  const eventsFileContent = await fs.readFile('./data/events.json');
  const events = JSON.parse(eventsFileContent);

  const eventIndex = events.findIndex((event) => event.id === id);

  if (eventIndex === -1) {
    return res.status(404).json({ message: 'Event not found' });
  }

  // Atualiza o evento mantendo os novos campos
  events[eventIndex] = { 
    id, 
    ...event,
    produto: event.produto || events[eventIndex].produto || '',
    peso: event.peso || events[eventIndex].peso || '',
    descricao: event.descricao || events[eventIndex].descricao || '',
  };
  
  await fs.writeFile('./data/events.json', JSON.stringify(events));

  console.log('✅ Evento atualizado:', events[eventIndex]);
  setTimeout(() => {
    res.json({ event: events[eventIndex] });
  }, 1000);
});

// NOVA ROTA - Atualizar apenas o produto de um evento
app.put('/events/:id/produto', async (req, res) => {
  const { id } = req.params;
  const { produto, peso, descricao } = req.body;

  console.log(`🎯 Atualizando produto do evento ${id}:`, { produto, peso, descricao });

  try {
    const eventsFileContent = await fs.readFile('./data/events.json');
    const events = JSON.parse(eventsFileContent);

    const eventIndex = events.findIndex((event) => event.id === id);

    if (eventIndex === -1) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Atualiza apenas os campos de produto
    events[eventIndex].produto = produto || events[eventIndex].produto || '';
    events[eventIndex].peso = peso || events[eventIndex].peso || '';
    events[eventIndex].descricao = descricao || events[eventIndex].descricao || '';
    
    await fs.writeFile('./data/events.json', JSON.stringify(events));

    console.log('✅ Produto do evento atualizado:', events[eventIndex]);
    res.json({ 
      message: 'Produto atualizado com sucesso',
      event: events[eventIndex] 
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar produto:', error);
    res.status(500).json({ 
      message: 'Erro ao atualizar produto',
      error: error.message 
    });
  }
});

app.delete('/events/:id', async (req, res) => {
  const { id } = req.params;
  const eventsFileContent = await fs.readFile('./data/events.json');
  const events = JSON.parse(eventsFileContent);
  const eventIndex = events.findIndex((event) => event.id === id);

  if (eventIndex === -1) {
    return res.status(404).json({ message: 'Event not found' });
  }

  events.splice(eventIndex, 1);
  await fs.writeFile('./data/events.json', JSON.stringify(events));

  setTimeout(() => {
    res.json({ message: 'Event deleted' });
  }, 1000);
});

app.use(router); 

// MIDDLEWARE para capturar rotas não encontradas
app.use('*', (req, res) => {
  console.log(`❌ Rota não encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    message: 'Rota não encontrada',
    path: req.originalUrl,
    method: req.method
  });
});

// INICIALIZAÇÃO DO SERVIDOR
async function startServer() {
  try {
    await initializeProductsFile();
    
    app.listen(3000, () => {
      console.log('🚀 Server running on port 3000');
      console.log('📋 Rotas disponíveis:');
      console.log('   GET  /products');
      console.log('   POST /products');
      console.log('   GET  /events');
      console.log('   POST /events');
      console.log('   GET  /events/:id');
      console.log('   PUT  /events/:id');
      console.log('   PUT  /events/:id/produto'); // NOVA ROTA
      console.log('   DELETE /events/:id');
      console.log('   POST /signup');
      console.log('   POST /login');
    });
  } catch (error) {
    console.error('❌ Erro ao inicializar servidor:', error);
  }
}

startServer();
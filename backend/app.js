// ADICIONE ESTAS MODIFICAÇÕES ao seu app.js existente

// Nas rotas de eventos, modifique estas funções:

app.get('/events', async (req, res) => {
  const { search, max } = req.query;
  const eventsFileContent = await fs.readFile('./data/events.json');
  let events = JSON.parse(eventsFileContent);

  if (search) {
    events = events.filter((event) => {
      const searchableText = `${event.title} ${event.description} ${event.address}`;
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
      products: event.products || '',
      bolosDetalhados: event.bolosDetalhados || '', // NOVO CAMPO
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
    ...event, // Isso já inclui bolosDetalhados se estiver presente
  };

  // Log para debug
  console.log('📋 Evento sendo salvo:', {
    id: newEvent.id,
    title: newEvent.title,
    products: newEvent.products ? 'SIM' : 'NÃO',
    bolosDetalhados: newEvent.bolosDetalhados ? 'SIM' : 'NÃO'
  });

  events.push(newEvent);
  await fs.writeFile('./data/events.json', JSON.stringify(events));

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

  events[eventIndex] = { id, ...event }; // Isso já inclui bolosDetalhados se estiver presente

  // Log para debug
  console.log('📝 Evento sendo atualizado:', {
    id: id,
    title: events[eventIndex].title,
    products: events[eventIndex].products ? 'SIM' : 'NÃO',
    bolosDetalhados: events[eventIndex].bolosDetalhados ? 'SIM' : 'NÃO'
  });

  await fs.writeFile('./data/events.json', JSON.stringify(events));

  setTimeout(() => {
    res.json({ event: events[eventIndex] });
  }, 1000);
});

// NOVA ROTA para migrar dados antigos (OPCIONAL)
app.post('/migrate-old-events', async (req, res) => {
  try {
    const eventsFileContent = await fs.readFile('./data/events.json');
    const events = JSON.parse(eventsFileContent);
    
    let migrationCount = 0;
    
    const updatedEvents = events.map(event => {
      // Se tem products mas não tem bolosDetalhados, converte
      if (event.products && !event.bolosDetalhados) {
        const products = event.products.split('\n').filter(p => p.trim());
        const bolosDetalhados = products.map(produto => ({
          nome: produto,
          peso: '', // Será preenchido pelo usuário
          descricao: ''
        }));
        
        event.bolosDetalhados = JSON.stringify(bolosDetalhados);
        migrationCount++;
      }
      
      return event;
    });
    
    if (migrationCount > 0) {
      await fs.writeFile('./data/events.json', JSON.stringify(updatedEvents));
      console.log(`✅ Migração concluída: ${migrationCount} eventos atualizados`);
    }
    
    res.json({ 
      message: `Migração concluída. ${migrationCount} eventos foram atualizados.`,
      migratedEvents: migrationCount
    });
  } catch (error) {
    console.error('❌ Erro na migração:', error);
    res.status(500).json({ 
      message: 'Erro na migração',
      error: error.message 
    });
  }
});

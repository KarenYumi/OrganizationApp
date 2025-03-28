import fs from 'node:fs/promises';

import bodyParser from 'body-parser';
import express from 'express';
import cors from 'cors';
import router from './routes/auth.js'; 

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Access-Control-Allow-Headers','X-Requested-With', 'Content-Type'],
  
}));

app.use(bodyParser.json());
app.use(express.static('public'));

app.use(router);

// app.use((req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader(
//     'Access-Control-Allow-Methods',
//     'GET, POST, PUT, DELETE, OPTIONS'
//   );
//   res.setHeader(
//     'Access-Control-Allow-Headers',
//     'X-Requested-With,content-type'
//   );
//   if (req.method === 'OPTIONS') {
//     return res.status(200).end();
//   }
//   next();
// });

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
    return res
      .status(404)
      .json({ message: `For the id ${id}, no event could be found.` });
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
    !event.description?.trim() ||
    !event.date?.trim() ||
    !event.time?.trim() ||
    !event.address?.trim() ||
    !event.status?.trim()
  ) {
    console.log('Invalid event dataaaa:', event);
    return res.status(400).json({ message: 'Invalid data provided.' });
  }

  const eventsFileContent = await fs.readFile('./data/events.json');
  const events = JSON.parse(eventsFileContent);

  const newEvent = {
    id: Math.round(Math.random() * 10000).toString(),
    ...event,
  };

  events.push(newEvent);

  await fs.writeFile('./data/events.json', JSON.stringify(events));

  res.json({ event: newEvent });
});

app.put('/events/:id', async (req, res) => {
  const { id } = req.params;
  const { event } = req.body;

  console.log(req.body);

  if (!event) {
    return res.status(400).json({ message: 'Event is required' });
  }

  if (
    !event.title?.trim() ||
    !event.description?.trim() ||
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

  const eventIndex = events.findIndex((event) => event.id === id);

  if (eventIndex === -1) {
    return res.status(404).json({ message: 'Event not found' });
  }

  events[eventIndex] = {
    id,
    ...event,
  };

  await fs.writeFile('./data/events.json', JSON.stringify(events));

  setTimeout(() => {
    res.json({ event: events[eventIndex] });
  }, 1000);
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

app.listen(3000, () => {
  console.log('Server running on port 3000');
});


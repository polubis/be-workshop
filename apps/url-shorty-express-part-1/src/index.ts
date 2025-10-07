import express from 'express';

const app = express();
app.use(express.json());

const urlDatabase: Record<string, string> = {};

const PORT = 3000;

function generateShortId(length: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/url', (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  let shortId = generateShortId(8);
  while (urlDatabase[shortId]) {
    shortId = generateShortId(8);
  }

  urlDatabase[shortId] = url;

  const shortUrl = `http://localhost:${PORT}/${shortId}`;
  res.status(201).json({ shortUrl });
});

app.get('/:shortId', (req, res) => {
  const { shortId } = req.params;
  const longUrl = urlDatabase[shortId];

  if (longUrl) {
    res.redirect(301, longUrl);
  } else {
    res.status(404).json({ error: 'Short URL not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  setInterval(() => {
    console.log('Tick!')
  }, 1000)
});   


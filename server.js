const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { URL } = require('url');

const PORT = Number(process.env.PORT) || 3000;
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');
const sessions = new Map();

const seedStore = { users: [], orders: [] };
const products = loadProducts();

function loadProducts() {
  const source = fs.readFileSync(path.join(ROOT, 'products.js'), 'utf8');
  const match = source.match(/const DAZEL_PRODUCTS\s*=\s*(\[[\s\S]*?\]);/);
  if (!match) throw new Error('Could not load the product catalog');
  return Function(`return ${match[1]}`)();
}

function loadStore() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(seedStore, null, 2));
    return { ...seedStore };
  }
  try {
    return { ...seedStore, ...JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')) };
  } catch {
    throw new Error('data/store.json is invalid');
  }
}

let store = loadStore();
function saveStore() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
}

function json(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => {
      raw += chunk;
      if (raw.length > 1_000_000) req.destroy(new Error('Request body too large'));
    });
    req.on('end', () => {
      try { resolve(raw ? JSON.parse(raw) : {}); } catch { reject(new Error('Invalid JSON')); }
    });
    req.on('error', reject);
  });
}

function passwordHash(password, salt = crypto.randomBytes(16).toString('hex')) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(`${salt}:${derivedKey.toString('hex')}`);
    });
  });
}

async function passwordMatches(password, stored) {
  const [salt, expected] = String(stored).split(':');
  const actual = await passwordHash(password, salt);
  return crypto.timingSafeEqual(Buffer.from(actual.split(':')[1], 'hex'), Buffer.from(expected, 'hex'));
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

function authUser(req) {
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const userId = sessions.get(token);
  return store.users.find(user => user.id === userId) || null;
}

function safeProduct(product) {
  return { id: product.id, cat: product.cat, name: product.name, price: product.price, mrp: product.mrp, off: product.off, badge: product.badge, icon: product.icon };
}

async function handleApi(req, res, url) {
  if (req.method === 'GET' && url.pathname === '/api/health') return json(res, 200, { ok: true, service: 'dazel-api' });

  if (req.method === 'GET' && url.pathname === '/api/products') {
    const category = url.searchParams.get('category');
    const query = (url.searchParams.get('q') || '').toLowerCase();
    const result = products.filter(product =>
      (!category || product.cat === category) &&
      (!query || product.name.toLowerCase().includes(query) || product.cat.includes(query))
    ).map(safeProduct);
    return json(res, 200, { products: result, total: result.length });
  }

  if (req.method === 'POST' && url.pathname === '/api/auth/signup') {
    const body = await parseBody(req);
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    if (!name || !email || password.length < 6) return json(res, 400, { error: 'Name, email, and a password of at least 6 characters are required.' });
    if (store.users.some(user => user.email === email)) return json(res, 409, { error: 'An account with that email already exists.' });
    const user = { id: `usr_${crypto.randomUUID()}`, name, email, passwordHash: await passwordHash(password), createdAt: new Date().toISOString() };
    store.users.push(user);
    saveStore();
    const token = crypto.randomUUID();
    sessions.set(token, user.id);
    return json(res, 201, { token, user: publicUser(user) });
  }

  if (req.method === 'POST' && url.pathname === '/api/auth/login') {
    const body = await parseBody(req);
    const email = String(body.email || '').trim().toLowerCase();
    const user = store.users.find(candidate => candidate.email === email);
    if (!user || !(await passwordMatches(String(body.password || ''), user.passwordHash))) return json(res, 401, { error: 'Invalid email or password.' });
    const token = crypto.randomUUID();
    sessions.set(token, user.id);
    return json(res, 200, { token, user: publicUser(user) });
  }

  if (req.method === 'POST' && url.pathname === '/api/orders') {
    const body = await parseBody(req);
    const items = Array.isArray(body.items) ? body.items : [];
    if (!items.length) return json(res, 400, { error: 'Your order must contain at least one item.' });
    const normalized = [];
    for (const item of items) {
      const product = products.find(candidate => candidate.id === item.id);
      const quantity = Number(item.qty);
      if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) return json(res, 400, { error: 'Order contains an invalid product or quantity.' });
      normalized.push({ id: product.id, name: product.name, price: product.price, qty: quantity });
    }
    const total = normalized.reduce((sum, item) => sum + item.price * item.qty, 0);
    const order = { id: `DZL${Math.floor(100000 + Math.random() * 900000)}`, userId: authUser(req)?.id || null, items: normalized, total, createdAt: new Date().toISOString() };
    store.orders.push(order);
    saveStore();
    return json(res, 201, { order: { id: order.id, total: order.total, createdAt: order.createdAt } });
  }

  return json(res, 404, { error: 'API route not found.' });
}

function serveStatic(res, url) {
  const requested = url.pathname === '/' ? '/index.html' : url.pathname;
  const filePath = path.resolve(ROOT, `.${requested}`);
  if (!filePath.startsWith(ROOT) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) return json(res, 404, { error: 'File not found.' });
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.jpeg': 'image/jpeg', '.jpg': 'image/jpeg', '.png': 'image/png' };
  res.writeHead(200, { 'Content-Type': `${types[path.extname(filePath)] || 'application/octet-stream'}; charset=utf-8` });
  fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  try {
    if (url.pathname.startsWith('/api/')) await handleApi(req, res, url);
    else if (req.method === 'GET') serveStatic(res, url);
    else json(res, 405, { error: 'Method not allowed.' });
  } catch (error) {
    console.error(error);
    json(res, 500, { error: 'Unexpected server error.' });
  }
});

server.listen(PORT, () => console.log(`Dazel backend running at http://localhost:${PORT}`));

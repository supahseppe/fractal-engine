import { defineConfig, loadEnv } from 'vite';

function openRouterProxyPlugin(env = {}) {
  return {
    name: 'openrouter-proxy',
    configureServer(server) {
      const KEY =
        process.env.OPENROUTER_API_KEY || env.OPENROUTER_API_KEY ||
        process.env.open_router || env.open_router ||
        process.env.VITE_OPENROUTER_API_KEY || env.VITE_OPENROUTER_API_KEY;
      server.middlewares.use('/api/openrouter', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method Not Allowed' }));
          return;
        }
        if (!KEY) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Missing OPENROUTER_API_KEY in server env' }));
          return;
        }
        try {
          let body = '';
          await new Promise((resolve, reject) => {
            req.on('data', (chunk) => { body += chunk; });
            req.on('end', resolve);
            req.on('error', reject);
          });
          const payload = body ? JSON.parse(body) : {};
          const upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${KEY}`,
              'HTTP-Referer': (req.headers.origin || 'http://localhost:8675'),
              'X-Title': 'Snowflake Writing Assistant',
            },
            body: JSON.stringify(payload),
          });
          const text = await upstream.text();
          res.statusCode = upstream.status;
          res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
          res.end(text);
        } catch (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: String(err?.message || err) }));
        }
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    server: {
      port: 8675,
      open: true,
    },
    plugins: [openRouterProxyPlugin(env)],
  };
});

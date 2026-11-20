import { spawn } from 'node:child_process';
import fs from 'node:fs';

export function start(extraArgs = []) {
  const p = spawn('C:\\Program Files\\FigCraft\\figcraft-cli.exe', ['mcp', ...extraArgs], { stdio: ['pipe', 'pipe', 'pipe'] });
  let buf = '';
  let nextId = 1;
  const pending = new Map();
  p.stdout.on('data', d => {
    buf += d.toString();
    let i;
    while ((i = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, i).trim();
      buf = buf.slice(i + 1);
      if (!line) continue;
      try {
        const m = JSON.parse(line);
        if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
      } catch {}
    }
  });
  const rpc = (method, params) => new Promise((resolve, reject) => {
    const id = nextId++;
    const t = setTimeout(() => reject(new Error('timeout ' + method)), 120000);
    pending.set(id, m => { clearTimeout(t); resolve(m); });
    p.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
  });
  const ready = (async () => {
    await rpc('initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'escriba-design', version: '1' } });
    p.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');
  })();
  return {
    ready,
    async call(name, args = {}) {
      await ready;
      const m = await rpc('tools/call', { name, arguments: args });
      if (m.error) throw new Error(name + ': ' + JSON.stringify(m.error));
      const content = m.result?.content ?? [];
      const text = content.filter(c => c.type === 'text').map(c => c.text).join('\n');
      const images = content.filter(c => c.type === 'image');
      if (m.result?.isError) throw new Error(name + ' falhou: ' + text.slice(0, 600));
      let json = null;
      try { json = JSON.parse(text); } catch {}
      return { text, json, images };
    },
    savePng(image, path) { fs.writeFileSync(path, Buffer.from(image.data, 'base64')); },
    close() { p.kill(); },
  };
}

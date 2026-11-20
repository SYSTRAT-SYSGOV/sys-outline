import fs from 'node:fs';
import { start } from './fc.mjs';
const files = fs.readdirSync('D:\\SYSTRAT\\escriba\\design').filter(f => f.endsWith('.figcraft')).sort();
for (const f of files) {
  const fc = start(['--automation-read-root', 'D:\\SYSTRAT\\escriba\\design']);
  try {
    await fc.call('open_file', { path: 'D:\\SYSTRAT\\escriba\\design\\' + f });
    const d = (await fc.call('inspect_document', {})).json;
    const frames = (d.layers ?? d.tree ?? d.page?.layers ?? []);
    const top = Array.isArray(frames) ? frames.filter(x => x.type === 'FRAME' || x.type === 'frame').map(x => x.name + ' ' + (x.width ?? '') + 'x' + (x.height ?? '')) : [];
    console.log(f.padEnd(28), 'páginas:', d.pages?.length, '| páginas:', d.pages?.map(p => p.name).join(','), '| quadros de topo:', top.length ? top.join(' ; ') : JSON.stringify(Object.keys(d)).slice(0, 120));
  } catch (e) { console.log(f, 'ERRO', e.message.slice(0, 200)); }
  fc.close();
}
process.exit(0);

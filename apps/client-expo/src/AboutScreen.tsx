import React from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import { ENV } from './env';
import { ABOUT_MD } from './about_content';

export default function AboutScreen() {
  if (ENV.PRIVACY_URL) {
    return <WebView source={{ uri: ENV.PRIVACY_URL }} />;
  }
  const html = `<!doctype html>
<html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body{background:#0c1118;color:#e5e7eb;font-family:-apple-system,Segoe UI,Roboto,Inter,system-ui;padding:16px}
  a{color:#93c5fd} h1,h2,h3{color:#e5e7eb} code{background:#111827;padding:2px 4px;border-radius:4px}
  .c{max-width:820px;margin:0 auto}
</style>
</head><body><div class="c"><div id="md"></div>
<p><a href="mailto:support@example.com">Contact us</a></p>
</div>
<script>
// super-light markdown to HTML (headings, lists, paragraphs, bold/italic)
const md = "\n# RealitySim \u2014 About\n\nRealitySim is a sandbox that blends real\u2011world signals with a simulation layer, quests, and live events.\n\n## Features\n- Live world deltas via WebSocket\n- AI\u2011generated quests (with caching)\n- Player progression & leaderboard\n- Map focus and event stream\n\n## Privacy\nWe store only what\u2019s needed for gameplay. Analytics are **opt\u2011in** (see Settings).\n\n## Contact\nEmail: support@example.com\n";
function esc(s){return s.replace(/[&<>]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]));}
function render(md){
  const lines = md.split(/\r?\n/);
  const out = [];
  let inList = false;
  for (let raw of lines){
    const s = raw.trim();
    if (!s){ if (inList){ out.push('</ul>'); inList=false; } continue; }
    const m = s.match(/^(#{1,3})\s+(.*)$/);
    if (m){ if (inList){ out.push('</ul>'); inList=false; } const level=m[1].length; out.push('<h'+level+'>'+esc(m[2])+'</h'+level+'>'); continue; }
    if (/^[-*]\s+/.test(s)){ if(!inList){ out.push('<ul>'); inList=true; } out.push('<li>'+esc(s.replace(/^[-*]\s+/,''))+'</li>'); continue; }
    let t = esc(s).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/\*(.+?)\*/g,'<i>$1</i>');
    out.push('<p>'+t+'</p>');
  }
  if (inList) out.push('</ul>');
  return out.join('\n');
}
document.getElementById('md').innerHTML = render(md);
</script>
</body></html>`;
  return <View style={{flex:1}}><WebView source={{ html }} /></View>;
}

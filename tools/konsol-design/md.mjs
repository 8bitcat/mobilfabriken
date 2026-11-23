// Minimal markdown → HTML för designdokumentet (rubriker, stycken, fet/kursiv/kod, listor, tabeller, citat, kodblock, linjer).
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const inline = (s) => esc(s)
  .replace(/`([^`]+)`/g, '<code>$1</code>')
  .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
  .replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

export function md(src) {
  const lines = String(src || '').replace(/\r/g, '').split('\n');
  const out = []; let i = 0;
  const flushPara = (buf) => { if (buf.length) { out.push('<p>' + inline(buf.join(' ')) + '</p>'); buf.length = 0; } };
  const para = [];
  while (i < lines.length) {
    const l = lines[i];
    if (/^```/.test(l)) { flushPara(para); const lang = l.slice(3).trim(); const code = []; i++; while (i < lines.length && !/^```/.test(lines[i])) code.push(lines[i++]); i++; out.push(lang === 'mermaid' ? '<pre class="mermaid">' + esc(code.join('\n')) + '</pre>' : '<pre><code>' + esc(code.join('\n')) + '</code></pre>'); continue; }
    const h = l.match(/^(#{1,6})\s+(.*)$/);
    if (h) { flushPara(para); const n = Math.min(6, h[1].length + 1); out.push(`<h${n}>${inline(h[2].replace(/\s*#+$/, ''))}</h${n}>`); i++; continue; }
    if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(l)) { flushPara(para); out.push('<hr>'); i++; continue; }
    if (/^\|/.test(l) && i + 1 < lines.length && /^\|?\s*:?-{2,}/.test(lines[i + 1])) {
      flushPara(para);
      const cells = (r) => r.replace(/^\|/, '').replace(/\|\s*$/, '').split('|').map((c) => inline(c.trim()));
      const head = cells(l); i += 2; const rows = [];
      while (i < lines.length && /^\|/.test(lines[i])) rows.push(cells(lines[i++]));
      out.push('<div class="tabell"><table><thead><tr>' + head.map((c) => `<th>${c}</th>`).join('') + '</tr></thead><tbody>' + rows.map((r) => '<tr>' + r.map((c) => `<td>${c}</td>`).join('') + '</tr>').join('') + '</tbody></table></div>');
      continue;
    }
    if (/^\s*[-*+]\s+/.test(l) || /^\s*\d+[.)]\s+/.test(l)) {
      flushPara(para);
      const ordered = /^\s*\d+[.)]\s+/.test(l); const items = [];
      while (i < lines.length && (/^\s*[-*+]\s+/.test(lines[i]) || /^\s*\d+[.)]\s+/.test(lines[i]) || /^\s{2,}\S/.test(lines[i]))) {
        if (/^\s{2,}\S/.test(lines[i]) && items.length && !/^\s*[-*+]\s+/.test(lines[i]) && !/^\s*\d+[.)]\s+/.test(lines[i])) items[items.length - 1] += ' ' + lines[i].trim();
        else items.push(lines[i].replace(/^\s*([-*+]|\d+[.)])\s+/, ''));
        i++;
      }
      out.push((ordered ? '<ol>' : '<ul>') + items.map((t) => `<li>${inline(t)}</li>`).join('') + (ordered ? '</ol>' : '</ul>'));
      continue;
    }
    if (/^>\s?/.test(l)) { flushPara(para); const q = []; while (i < lines.length && /^>\s?/.test(lines[i])) q.push(lines[i++].replace(/^>\s?/, '')); out.push('<blockquote>' + md(q.join('\n')) + '</blockquote>'); continue; }
    if (!l.trim()) { flushPara(para); i++; continue; }
    para.push(l.trim()); i++;
  }
  flushPara(para);
  return out.join('\n');
}

// Спільний алгебраїчний рушій: розбір і форматування многочленів, стрілочки, кольори подібних, кубики
// ===== Алгебраїчний рушій: многочлени з цілими коефіцієнтами =====
const SUP = {'⁰':'0','¹':'1','²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9'};
const TOSUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const CYR = {'х':'x','Х':'x','а':'a','А':'a','у':'y','У':'y','с':'c','С':'c','р':'p','Р':'p','в':'b','В':'b','т':'t','Т':'t','м':'m','М':'m','п':'n','к':'k','К':'k','о':'o','О':'o','е':'e','Е':'e','н':'h'};

function normalize(s) {
  s = String(s).trim();
  s = s.replace(/[−–—]/g, '-').replace(/[·×*∙]/g, '*').replace(/[:÷]/g, '/').replace(/,/g, '.');
  s = s.replace(/([⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g, m => '^' + [...m].map(c => SUP[c]).join(''));
  s = [...s].map(c => CYR[c] || c).join('');
  s = s.replace(/\s+/g, '').toLowerCase();
  return s;
}

function tokenize(s) {
  const t = []; let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/[0-9]/.test(c)) { let j = i; while (j < s.length && /[0-9]/.test(s[j])) j++; t.push({k:'n', v:parseInt(s.slice(i, j))}); i = j; }
    else if (/[a-z]/.test(c)) { t.push({k:'v', v:c}); i++; }
    else if ('+-*/^()'.includes(c)) { t.push({k:c}); i++; }
    else throw new Error('Незрозумілий символ «' + c + '»');
  }
  return t;
}

// poly: Map key -> coef ; key = 'a2.x1' ('' константа)
function mkey(vars) { return Object.keys(vars).filter(v => vars[v] > 0).sort().map(v => v + vars[v]).join('.'); }
function parseKey(k) { const o = {}; if (!k) return o; k.split('.').forEach(p => { o[p[0]] = parseInt(p.slice(1)); }); return o; }
function pconst(c) { const m = new Map(); if (c !== 0) m.set('', c); return m; }
function pvar(v) { return new Map([[v + '1', 1]]); }
function padd(a, b, sign = 1) { const r = new Map(a); for (const [k, c] of b) { const n = (r.get(k) || 0) + sign * c; if (n === 0) r.delete(k); else r.set(k, n); } return r; }
function pmul(a, b) {
  let r = new Map();
  for (const [k1, c1] of a) for (const [k2, c2] of b) {
    const v = parseKey(k1), w = parseKey(k2);
    for (const x in w) v[x] = (v[x] || 0) + w[x];
    r = padd(r, new Map([[mkey(v), c1 * c2]]));
  }
  return r;
}
function pdiv(a, b) { // ділення на одночлен
  if (b.size !== 1) throw new Error('Ділити можна лише на одночлен');
  const [[kb, cb]] = [...b];
  const r = new Map();
  for (const [k, c] of a) {
    const v = parseKey(k), w = parseKey(kb);
    for (const x in w) { v[x] = (v[x] || 0) - w[x]; if (v[x] < 0) throw new Error('Ділення не націло'); }
    if (c % cb !== 0) throw new Error('Ділення не націло');
    r.set(mkey(v), c / cb);
  }
  return r;
}
function ppow(a, n) { let r = pconst(1); for (let i = 0; i < n; i++) r = pmul(r, a); return r; }
function peq(a, b) { if (a.size !== b.size) return false; for (const [k, c] of a) if (b.get(k) !== c) return false; return true; }

function parse(str) {
  const t = tokenize(normalize(str)); let i = 0;
  const peek = () => t[i], eat = k => { if (!t[i] || t[i].k !== k) throw new Error('Перевір запис'); return t[i++]; };
  function expr() {
    let r; if (peek() && (peek().k === '+' || peek().k === '-')) { const s = t[i++].k; r = term(); if (s === '-') r = padd(new Map(), r, -1); } else r = term();
    while (peek() && (peek().k === '+' || peek().k === '-')) { const s = t[i++].k; r = padd(r, term(), s === '+' ? 1 : -1); }
    return r;
  }
  function term() {
    let r = factor();
    while (peek() && (peek().k === '*' || peek().k === '/' || peek().k === 'n' || peek().k === 'v' || peek().k === '(')) {
      if (peek().k === '*') { i++; r = pmul(r, factor()); }
      else if (peek().k === '/') { i++; r = pdiv(r, factor()); }
      else r = pmul(r, factor());
    }
    return r;
  }
  function factor() {
    if (peek() && peek().k === '-') { i++; return padd(new Map(), factor(), -1); }
    let b = base();
    if (peek() && peek().k === '^') { i++; const n = eat('n').v; if (n > 40) throw new Error('Завеликий показник'); b = ppow(b, n); }
    return b;
  }
  function base() {
    const x = peek(); if (!x) throw new Error('Вираз обірвався');
    if (x.k === 'n') { i++; return pconst(x.v); }
    if (x.k === 'v') { i++; return pvar(x.v); }
    if (x.k === '(') { i++; const r = expr(); eat(')'); return r; }
    throw new Error('Перевір запис');
  }
  if (!t.length) throw new Error('Порожня відповідь');
  const r = expr(); if (i < t.length) throw new Error('Перевір дужки та знаки');
  return r;
}

// Чи записано у стандартному вигляді (без дужок, без подібних, одночлени стандартні)
function isStandard(str) {
  const s = normalize(str);
  if (s === '0') return true;
  if (/[()\/*]/.test(s)) return false;
  const terms = s.replace(/^[+-]/, '').split(/[+-]/);
  const keys = new Set();
  for (const tm of terms) {
    if (!/^\d*([a-z](\^\d+)?)*$/.test(tm) || !tm) return false;
    const letters = tm.replace(/\^\d+/g, '').replace(/^\d+/, '');
    if (new Set(letters).size !== letters.length) return false;
    if (/^0/.test(tm)) return false;
    const p = parse(tm); const k = p.size ? [...p.keys()][0] : '#0';
    if (keys.has(k)) return false; keys.add(k);
  }
  return true;
}
function deg(k) { return Object.values(parseKey(k)).reduce((s, x) => s + x, 0); }
function fmtMono(k, c, first) {
  const v = parseKey(k); const vars = Object.keys(v).sort().map(x => x + (v[x] > 1 ? [...String(v[x])].map(d => TOSUP[+d]).join('') : '')).join('');
  let sign = c < 0 ? (first ? '−' : ' − ') : (first ? '' : ' + ');
  const a = Math.abs(c); const num = (a === 1 && vars) ? '' : String(a);
  return sign + num + vars;
}
function fmt(p) {
  if (!p.size) return '0';
  const ks = [...p.keys()].sort((a, b) => deg(b) - deg(a) || (a < b ? -1 : 1));
  return ks.map((k, i) => fmtMono(k, p.get(k), i === 0)).join('');
}
function pdeg(p) { let d = 0; for (const k of p.keys()) d = Math.max(d, deg(k)); return d; }
const E = (s) => fmt(parse(s));


// ===== Допоміжне =====
const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const nz = (a, b) => { let x; do { x = ri(a, b); } while (x === 0); return x; };
const sgn = () => (Math.random() < .5 ? -1 : 1);
const VARS = ['x', 'y', 'a', 'b', 'c'];
function sup(n) { return n === 1 ? '' : [...String(n)].map(d => TOSUP[+d]).join(''); }
function pretty(s) {
  return s.replace(/\^(\d+)/g, (m, d) => [...d].map(c => TOSUP[+c]).join('')).replace(/\*/g, ' · ').replace(/-/g, '−').replace(/\//g, ' : ').replace(/\+/g, ' + ').replace(/ − /g, ' − ').replace(/([^ (])−/g, '$1 − ');
}
// одночлен у вхідному синтаксисі: coef, {x:2,y:1}
function mono(c, v, opts = {}) {
  const vars = Object.keys(v).filter(k => v[k] > 0).map(k => k + (v[k] > 1 ? '^' + v[k] : '')).join('');
  if (!vars) return String(c);
  if (c === 1) return vars; if (c === -1) return '-' + vars;
  return c + vars;
}
// многочлен з масиву [c, vars]: '3x^2-2x+1'
function poly(terms) {
  let s = '';
  terms.forEach(([c, v], i) => { if (c === 0) return; const m = mono(Math.abs(c), v); s += (c < 0 ? '-' : (s ? '+' : '')) + m; });
  return s || '0';
}
const neg = terms => terms.map(([c, v]) => [-c, v]);
const P = s => fmt(parse(s));
const wrapNeg = s => s.startsWith('-') ? '(' + s + ')' : s;

// ===== Конструктори виразів =====
// член многочлена: [коефіцієнт, {буква: показник}]
function shuffle(a) { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = ri(0, i); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const sn = c => (c < 0 ? '−' + (-c) : String(c));          // число зі знаком
const pn = c => (c < 0 ? '(−' + (-c) + ')' : String(c));   // від’ємне число в дужках
const ms = ([c, v]) => mono(c, v);                         // член у вхідному синтаксисі
const mp = t => (t[0] < 0 ? '(' + ms(t) + ')' : ms(t));    // від’ємний член у дужках
const mf = t => P(ms(t));                                  // член у гарному вигляді
const mult = n => n + (n < 5 ? ' множники' : ' множників');
const byDeg = (a, b) => deg(mkey(b)) - deg(mkey(a));
function rmono(letters, nv, maxE, cmin, cmax) {
  const v = {}; shuffle(letters).slice(0, nv).sort().forEach(x => { v[x] = ri(1, maxE); });
  const t = [nz(cmin, cmax), v];
  if (!nv && Math.abs(t[0]) === 1) t[0] *= ri(2, 6);
  return t;
}
function tmul(a, b) { const v = { ...a[1] }; for (const x in b[1]) v[x] = (v[x] || 0) + b[1][x]; return [a[0] * b[0], v]; }
function tpow(a, n) { const v = {}; for (const x in a[1]) v[x] = a[1][x] * n; return [a[0] ** n, v]; }
const evalAt = (terms, x, x0) => terms.reduce((s, [c, v]) => s + c * x0 ** (v[x] || 0), 0);

// ===== Кроки розв’язання =====
function prodSteps(fs) {
  const c = fs.reduce((s, t) => s * t[0], 1);
  const L = [...new Set(fs.flatMap(t => Object.keys(t[1])))].sort();
  const lines = L.map(x => {
    const ps = fs.filter(t => t[1][x]).map(t => x + sup(t[1][x])); const e = fs.reduce((s, t) => s + (t[1][x] || 0), 0);
    return ps.length > 1 ? `${ps.join(' · ')} = ${x}${sup(e)}` : `${x}${sup(e)} лишається`;
  });
  return [`Числа: ${fs.map(t => pn(t[0])).join(' · ')} = ${sn(c)}`, `Букви: ${lines.join('; &nbsp; ')}`];
}
function powSteps(t, n) {
  const ls = Object.keys(t[1]).sort().map(x => `(${x}${sup(t[1][x])})${sup(n)} = ${x}${sup(t[1][x] * n)}`);
  if (t[0] !== 1) ls.unshift(`${pn(t[0])}${sup(n)} = ${sn(t[0] ** n)}`);
  return [`Кожен множник підносимо до степеня ${n}:`, ls.join('; &nbsp; ')];
}
function likeSteps(terms) {
  const g = new Map(); terms.forEach(([c, v]) => { const k = mkey(v); if (!g.has(k)) g.set(k, []); g.get(k).push(c); });
  return [...g].map(([k, cs]) => {
    const name = k ? fmtMono(k, 1, true) : 'числа'; const s = cs.reduce((a, b) => a + b, 0);
    return cs.length > 1 ? `${name}: ${sn(cs[0])}${cs.slice(1).map(c => (c < 0 ? ' − ' + (-c) : ' + ' + c)).join('')} = ${sn(s)}` : `${name}: ${sn(cs[0])} — подібних немає`;
  });
}

// ===== Наочність: стрілочки, кольори подібних, кубики =====
const COLS = ['#e11d48', '#2563eb', '#16a34a', '#9333ea'];
// член у <span>, а пробіли перед знаком — зовні
function tspan(m, attrs) { const s = m.match(/^ */)[0]; return `${s}<span ${attrs}>${m.slice(s.length)}</span>`; }

// Стрілочки «що на що множити»: groups = [{ neg, k, p }]; demo — покроково з відповіддю
function arrowsHTML(groups, demo) {
  let ci = 0; const items = [];
  const ex = groups.map((g, gi) => (gi ? (g.neg ? ' − ' : ' + ') : '') + `<span class="ak" data-g="${gi}">${fmtMono(mkey(g.k[1]), g.k[0], true)}</span>(` +
    g.p.map((t, i) => {
      const c = ci++ % 4, r = tmul(g.k, t);
      items.push(demo ? tspan(fmtMono(mkey(r[1]), g.neg ? -r[0] : r[0], !items.length), `class="ar c${c}"`) : `<span class="c${c}">${pretty(mp(g.k))} · ${pretty(mp(t))}</span>`);
      return tspan(fmtMono(mkey(t[1]), t[0], i === 0), `class="at c${c}" data-g="${gi}"`);
    }).join('') + ')').join('');
  return `<div class="viz arcs" data-s="0" data-n="${items.length}"><div class="ex">${ex}</div>` +
    (demo ? `<div class="res">= ${items.join('')}</div><button class="go" onclick="stepArcs(this)">Далі →</button>` : `<div class="cnt">Помнож по стрілочках: ${items.join('; &nbsp; ')}</div>`) + '</div>';
}
function drawArcs(root, upto) {
  const ex = root.querySelector('.ex'), b = ex.getBoundingClientRect(), svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'), lvl = {};
  let h = '<defs>' + COLS.map((c, i) => `<marker id="m${i}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0L10,5L0,10z" fill="${c}"/></marker>`).join('') + '</defs>';
  [...ex.querySelectorAll('.at')].slice(0, upto).forEach((t, n) => {
    const g = t.dataset.g, k = ex.querySelector(`.ak[data-g="${g}"]`).getBoundingClientRect(), r = t.getBoundingClientRect();
    const x1 = k.left + k.width / 2 - b.left + ex.scrollLeft, x2 = r.left + r.width / 2 - b.left + ex.scrollLeft, y = k.top - b.top - 2, up = 8 + (lvl[g] = (lvl[g] || 0) + 1) * 16;
    h += `<path d="M${x1},${y} C${x1},${y - up} ${x2},${y - up} ${x2},${y}" fill="none" stroke="${COLS[n % 4]}" stroke-width="3" marker-end="url(#m${n % 4})"/>`;
  });
  ex.querySelector('svg')?.remove(); svg.innerHTML = h; ex.appendChild(svg);
  root.querySelectorAll('.ar').forEach((r, i) => r.classList.toggle('on', i < upto));
}
function stepArcs(btn) { const r = btn.closest('.arcs'), s = +r.dataset.s + 1; r.dataset.s = s; drawArcs(r, s); if (s >= +r.dataset.n) btn.remove(); }

// Подібні члени одним кольором і однаковим підкресленням: groups = [{ op, br, terms }]
function likeHTML(groups) {
  const keys = [...new Set(groups.flatMap(g => g.terms.map(t => mkey(t[1]))))], j = t => keys.indexOf(mkey(t[1])) % 4;
  const ex = groups.map(g => g.op + (g.br ? '(' : '') + g.terms.map((t, i) => tspan(fmtMono(mkey(t[1]), t[0], i === 0), `class="c${j(t)} u${j(t)}"`)).join('') + (g.br ? ')' : '')).join('');
  const legend = keys.map((k, i) => `<span class="c${i % 4} u${i % 4}">${k ? fmtMono(k, 1, true) : 'числа'}</span>`).join(' &nbsp; ');
  return `<div class="viz"><div class="ex2">${ex}</div><div class="cnt">Однаковий колір і підкреслення — подібні члени: ${legend}</div></div>`;
}

// Кубики-множники для властивостей степеня: op '*' | '/' | '^'; demo — з кнопкою і відповіддю
function cubesHTML(op, x, a, b, demo) {
  const row = (n, cls) => Array(n).fill(`<span class="cube ${cls}">${x}</span>`).join('');
  const q = op === '*' ? `${x}${sup(a)} · ${x}${sup(b)}` : op === '/' ? `${x}${sup(a)} : ${x}${sup(b)}` : `(${x}${sup(a)})${sup(b)}`;
  const e = op === '*' ? a + b : op === '/' ? a - b : a * b;
  const pic = op === '*' ? `<div class="grp">${row(a, '')}${row(b, 'k1')}</div>`
    : op === '/' ? `<div class="frac"><div class="grp">${row(b, 'out')}${row(a - b, '')}</div><div class="grp">${row(b, 'k1 out')}</div></div>`
    : `<div class="grp">${Array(b).fill(`(${row(a, '')})`).join(' · ')}</div>`;
  const why = op === '*' ? `${a} + ${b} = ${mult(e)} ${x}` : op === '/' ? `Верхні й нижні множники скорочуються попарно: ${a} − ${b} = ${e}` : `${b} групи по ${a}: ${a} · ${b} = ${mult(e)} ${x}`;
  if (!demo) return `<div class="viz">${pic}<div class="cnt">Порахуй кубики-множники ${x}</div></div>`;
  return `<div class="viz"><div class="ex2">${q}</div><div hidden>${pic}<div class="cnt">${why}</div><div class="ex2">= ${x}${sup(e)}</div></div><button class="go" onclick="this.previousElementSibling.hidden = false; this.remove()">Розкласти на множники</button></div>`;
}


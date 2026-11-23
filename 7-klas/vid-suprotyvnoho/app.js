// Тренажер «Доведення від супротивного». Тексти завдань — у tasks.js.
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

// ===== Прогрес =====
const KEY = 'geo7-vid-suprotyvnoho';
const fresh = () => ({ done: {}, s0: false, name: '', test: null, fold: false });
let store = fresh();
try { Object.assign(store, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) {}
function save() { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {} }

const STEPS = [
  { title: 'Пам’ятка', sub: '6 карток' },
  { title: 'Детектив', sub: 'міркування без геометрії', tasks: S1, shuffle: true },
  { title: 'Скажи навпаки', sub: 'супротивне твердження', tasks: S2, shuffle: true },
  { title: 'З чим суперечність?', sub: 'аксіома, теорема чи умова', tasks: S3, shuffle: true },
  { title: 'Подивись сам', sub: 'рухомий малюнок', tasks: S4 },
  { title: 'Збери доведення', sub: 'рядки в блок-схему', tasks: S5 },
  { title: 'Заповни пропуски', sub: 'обери слова', tasks: S6 },
  { title: 'Доведи сам', sub: 'за опорною схемою (за бажанням)', tasks: S7 },
  { title: 'Перевір себе', sub: '8 завдань без підказок' }
];
const doneOf = k => store.done[k] || [];
const complete = k => (k === 0 ? store.s0 : k === 8 ? !!store.test : STEPS[k].tasks.every(t => doneOf(k).includes(t.id)));
// Крок 7 — за бажанням, тому «Перевір себе» відкривається після кроків 0–6
const unlocked = k => k === 0 || (k === 8 ? [0, 1, 2, 3, 4, 5, 6].every(complete) : complete(k - 1));

// ===== Алгоритм-блок-схема =====
let active = 0, memo = -1;
const algo = () => `<div class="algo" id="algo">${algoInner()}</div>`;
function algoInner() {
  if (store.fold) return `<div class="bar"><span class="line1">${BLOCKS.map((b, i) => `<span class="${active === i + 1 ? 'on' : ''}">${b.short}</span>`).join(' → ')}</span><button class="fold" onclick="fold(false)" aria-expanded="false">Розгорнути</button></div>`;
  return `<div class="bar"><b>Алгоритм</b><button class="fold" onclick="fold(true)" aria-expanded="true">Згорнути</button></div><div class="row">` +
    BLOCKS.map((b, i) => (i ? '<span class="arr" aria-hidden="true"><span class="v">↓</span><span class="h">→</span></span>' : '') +
      `<button class="blk ${active === i + 1 ? 'on' : ''}" onclick="showMemo(${i})" aria-expanded="${memo === i}">${i + 1}. ${b.name}</button>`).join('') +
    '</div>' + (memo >= 0 ? `<div class="memo"><b>${BLOCKS[memo].name}.</b> ${BLOCKS[memo].memo}</div>` : '');
}
function redrawAlgo() { const el = $('#algo'); if (el) el.innerHTML = algoInner(); }
function setActive(n) { active = n; redrawAlgo(); }
function fold(f) { store.fold = f; save(); redrawAlgo(); }
function showMemo(i) { memo = memo === i ? -1 : i; redrawAlgo(); }

// ===== Статичні малюнки =====
const FIGS = {
  f51: `<svg class="fig sm" viewBox="0 0 460 300" role="img" aria-label="Прямі a і b, січна c, відповідні кути 1 і 2"><line x1="20" y1="90" x2="440" y2="60"/><line x1="20" y1="210" x2="440" y2="250"/><line x1="130" y1="290" x2="330" y2="10"/>
    <text x="420" y="45">a</text><text x="420" y="280">b</text><text x="342" y="26">c</text><text class="n" x="300" y="52">1</text><text class="n" x="208" y="208">2</text></svg>`,
  f52: `<svg class="fig sm" viewBox="0 0 460 300" role="img" aria-label="Паралельні прямі a і b, пряма c перетинає a в точці M"><line x1="20" y1="90" x2="440" y2="90"/><line x1="20" y1="210" x2="440" y2="210"/><line x1="140" y1="10" x2="320" y2="290"/>
    <circle cx="191.4" cy="90" r="6"/><text x="150" y="78">M</text><text x="420" y="78">a</text><text x="420" y="198">b</text><text x="168" y="36">c</text></svg>`,
  f53: `<svg class="fig sm" viewBox="0 0 460 300" role="img" aria-label="Прямі a і b перпендикулярні до прямої c"><line x1="20" y1="230" x2="440" y2="230"/><line x1="150" y1="20" x2="150" y2="285"/><line x1="310" y1="20" x2="310" y2="285"/>
    <path class="ln" d="M150,212 H168 V230"/><path class="ln" d="M310,212 H328 V230"/><text x="160" y="44">a</text><text x="320" y="44">b</text><text x="420" y="218">c</text></svg>`,
  f54: `<svg class="fig sm" viewBox="0 0 460 300" role="img" aria-label="Три паралельні прямі a, b, c"><line x1="20" y1="70" x2="440" y2="70"/><line x1="20" y1="150" x2="440" y2="150"/><line x1="20" y1="230" x2="440" y2="230"/>
    <text x="420" y="58">a</text><text x="420" y="138">b</text><text x="420" y="218">c</text></svg>`,
  f55: `<svg class="fig sm" viewBox="0 0 460 300" role="img" aria-label="Прямі a і b перетинаються, m перпендикулярна до a, n перпендикулярна до b"><line x1="20" y1="250" x2="440" y2="110"/><line x1="20" y1="110" x2="440" y2="250"/>
    <line x1="36.8" y1="33.5" x2="119" y2="280"/><line x1="423.2" y1="33.5" x2="341" y2="280"/><text x="420" y="98">a</text><text x="420" y="280">b</text><text x="56" y="46">m</text><text x="388" y="46">n</text></svg>`
};

// ===== Екрани =====
let cur = null, test = null;
const header = k => `<button class="back" onclick="home()">← Усі кроки</button><h2>${k}. ${STEPS[k].title}</h2>${algo()}`;
function home() {
  cur = null; active = 0; memo = -1;
  $('#app').innerHTML = `<a class="back" href="../../">← Меню 7 класу</a><h1>Доведення від супротивного</h1>
  <p class="lead">7 клас · геометрія · Бевз, § 7–9. Проходь кроки по черзі: наступний відкривається, коли виконано всі завдання попереднього.</p>
  <div class="steps">${STEPS.map((s, k) => {
    const lock = !unlocked(k), c = complete(k), prog = s.tasks ? `${doneOf(k).length} з ${s.tasks.length}` : 'не пройдено';
    return `<button class="step" ${lock ? 'disabled' : ''} onclick="openStep(${k})"><b>${k}. ${s.title}</b><span class="small">${s.sub}</span><span class="st ${c ? 'ok' : ''}">${c ? 'пройдено' : lock ? 'закрито' : prog}</span></button>`;
  }).join('')}</div>
  ${store.test ? '<div class="btns"><button onclick="result()">Мій результат «Перевір себе»</button></div>' : ''}
  <details><summary>Для вчителя</summary><ul><li>Орієнтовний час: 25–30 хв.</li><li><b>ДЗ:</b> пройти кроки 1–6 і надіслати скріншот екрана «Перевір себе». Крок 7 — за бажанням.</li><li>На наступному уроці розібрати № 331 (крок 7.1) біля дошки.</li></ul></details>
  <div class="btns"><button onclick="restart()">Почати спочатку</button></div>
  <p class="small">Прогрес зберігається лише на цьому пристрої.</p>`;
}
function restart() {
  if (!confirm('Почати спочатку? Увесь прогрес буде стерто.')) return;
  const f = store.fold; store = fresh(); store.fold = f; save(); home();
}
function openStep(k, id) {
  if (!unlocked(k)) return home();
  memo = -1;
  if (k === 0) return cards(0);
  if (k === 8) return startTest();
  if (id === undefined || !cur || cur.k !== k || cur.mode !== 'practice') {
    const order = STEPS[k].shuffle ? shuffle(STEPS[k].tasks) : STEPS[k].tasks;
    cur = { k, order };
    if (id === undefined) id = (order.find(t => !doneOf(k).includes(t.id)) || order[0]).id;
  }
  Object.assign(cur, { id, mode: 'practice', hint: 0, fails: 0 });
  $('#app').innerHTML = header(k) + `<div class="pills">${cur.order.map((t, j) => `<button class="${t.id === id ? 'on' : ''} ${doneOf(k).includes(t.id) ? 'ok' : ''}" onclick="openStep(${k},'${t.id}')" aria-label="Завдання ${j + 1}">${j + 1}</button>`).join('')}</div><div class="card" id="task"></div>`;
  showTask(cur.order.find(t => t.id === id));
}
function showTask(t) {
  cur.t = t; cur.R = RENDER[cur.k](t);
  const R = cur.R;
  $('#task').innerHTML = (R.title ? `<div class="small">${R.title}</div>` : '') + `<div class="q">${R.q}</div>${R.body}` +
    (cur.mode === 'practice' ? `<div class="btns"><button id="hb" onclick="hint()">Підказка 1</button>${R.sol ? '<button id="sb" hidden onclick="solution()">Показати розв’язання</button>' : ''}</div><div id="hints"></div>` : '') +
    '<div id="fb" aria-live="polite"></div>';
  setActive(R.active || 0);
  if (R.init) R.init();
}
function hint() {
  cur.hint++;
  $('#hints').innerHTML = cur.R.hints.slice(0, cur.hint).map((h, j) => `<div class="hint"><b>Підказка ${j + 1}.</b> ${h}</div>`).join('');
  if (cur.hint >= 2) $('#hb').remove(); else $('#hb').textContent = 'Підказка 2';
}
function solution() { $('#sb').remove(); $('#task').insertAdjacentHTML('beforeend', `<div class="sol"><b>Розв’язання.</b> ${cur.R.sol}</div>`); }
const fb = h => { $('#fb').innerHTML = h; };
const warn = m => fb(`<div class="bad">${m}</div>`);
function answer(ok, msg) {
  if (cur.mode === 'test') return testAnswer(ok);
  if (!ok) {
    cur.fails++; warn(msg);
    if (cur.fails >= 2 && $('#sb')) $('#sb').hidden = false;
    return;
  }
  markDone();
  fb('<div class="good">Правильно!</div>' + (cur.R.okMsg ? `<p>${cur.R.okMsg}</p>` : '') + (cur.R.after ? '' : nextHtml()));
  if (cur.R.after) cur.R.after();
}
function markDone() {
  const d = store.done[cur.k] = doneOf(cur.k); if (!d.includes(cur.id)) d.push(cur.id); save();
  const pill = document.querySelectorAll('.pills button')[cur.order.findIndex(t => t.id === cur.id)];
  if (pill) pill.classList.add('ok');
}
function nextHtml() {
  const k = cur.k, nx = cur.order.find(t => !doneOf(k).includes(t.id));
  if (nx) return `<div class="btns"><button class="go" onclick="openStep(${k},'${nx.id}')">Наступне завдання</button></div>`;
  const nexts = k === 6 ? [7, 8] : [k + 1];
  return `<p class="good">Крок ${k} пройдено.</p><div class="btns">${nexts.map(n => `<button class="go" onclick="openStep(${n})">${n}. ${STEPS[n].title}${n === 7 ? ' (за бажанням)' : ''}</button>`).join('')}</div>`;
}
function optsHTML(opts) { cur.sh = shuffle(opts); return `<div class="opts">${cur.sh.map((o, i) => `<button onclick="cur.R.pick(${i})">${o.t}</button>`).join('')}</div>`; }
const proofHead = t => `${FIGS[t.fig]}<p class="given"><b>Дано:</b> ${t.given}<br><b>Довести:</b> ${t.prove}</p>`;

// ===== Завдання кожного кроку =====
const SLOTN = { A: 'Припущення', R: 'Міркування', C: 'Суперечність', V: 'Висновок' };
const RENDER = {
  1: t => ({
    q: `${t.q}<br><b>${t.ask}</b>`, body: optsHTML(t.opts) + '<ol class="chain" id="chain"></ol>', active: 1, hints: t.hints,
    sol: `${t.opts.find(o => o.ok).t}<ol class="chain">${t.lines.map(l => `<li><b>${BLOCKS[l.b - 1].short}:</b> ${l.t}</li>`).join('')}</ol>`,
    pick: i => answer(!!cur.sh[i].ok, `Ні. ${cur.sh[i].why}`),
    after: () => { cur.line = 0; document.querySelectorAll('#task .opts button').forEach(b => { b.disabled = true; }); revealLine(); } }),
  2: t => ({
    q: `Твердження: <b>${t.st}</b><br>Яке твердження йому супротивне?`, body: optsHTML(t.opts), active: 1, hints: t.hints,
    sol: `Супротивне: <b>${t.opts.find(o => o.ok).t}</b>`, pick: i => answer(!!cur.sh[i].ok, `Ні. ${cur.sh[i].why}`) }),
  3: t => ({
    q: 'З чим це суперечить?', active: 3, hints: t.hints, okMsg: t.expl,
    body: `<ol class="chain">${t.chain.map(c => `<li>${c}</li>`).join('')}<li class="hl">${t.hl}</li></ol>` + optsHTML(Object.keys(CONTRA).map(k => ({ t: CONTRA[k].t, k }))),
    sol: `${CONTRA[t.ok].t}. ${t.expl}`,
    pick: i => { const k = cur.sh[i].k; answer(k === t.ok, `Ні. ${(t.wrong && t.wrong[k]) || CONTRA[k].why}`); } }),
  4: t => (t.id === '4.1' ? slope(t) : perp(t)),
  5: t => build(t),
  6: t => gaps(t),
  7: t => ({
    title: t.title, q: t.q, active: 1, hints: t.hints,
    body: BLOCKS.map((b, i) => `<label class="fld" for="w${i}">${i + 1}. ${b.name}</label><textarea id="w${i}" onfocus="setActive(${i + 1})"></textarea>`).join('') +
      '<div class="btns"><button class="go" onclick="compare7()">Порівняти з розв’язанням</button></div><div id="cmp"></div>' })
};

// Крок 1: після правильного припущення — міркування по рядку
function revealLine() {
  const t = cur.t, l = t.lines[cur.line++];
  $('#chain').insertAdjacentHTML('beforeend', `<li><b>${BLOCKS[l.b - 1].short}:</b> ${l.t}</li>`);
  setActive(l.b);
  fb('<div class="good">Правильно!</div>' + (cur.line < t.lines.length ? '<div class="btns"><button class="go" onclick="revealLine()">Далі</button></div>' : nextHtml()));
}

// Крок 4.1: пряма c обертається навколо точки M
function slope(t) {
  return { title: t.title, q: t.q, active: 3, hints: t.hints, init: draw41,
    body: `<div id="fig41"></div><label class="fld" for="ang">Кут нахилу прямої c: <span id="angv"></span></label><input type="range" id="ang" min="-80" max="80" step="1" value="50" oninput="draw41()"><p><b>Чи перетинає c пряму b?</b></p><div id="ans41" aria-live="polite"></div>` };
}
function draw41() {
  const inp = $('#ang'); if (Math.abs(+inp.value) <= 2) inp.value = 0;   // легше влучити в 0° пальцем
  const th = +inp.value, r = th * Math.PI / 180, dx = Math.cos(r), dy = -Math.sin(r), P = s => `${(230 + s * dx).toFixed(1)},${(100 + s * dy).toFixed(1)}`;
  $('#angv').textContent = th + '°';
  let s = '<svg class="fig" viewBox="0 0 460 300" role="img" aria-label="Паралельні прямі a і b, пряма c через точку M"><line x1="20" y1="100" x2="440" y2="100"/><line x1="20" y1="220" x2="440" y2="220"/>';
  s += `<path class="ln ${th === 0 ? 'red' : 'acc'}" d="M${P(-700)} L${P(700)}"/><circle cx="230" cy="100" r="6"/><text x="200" y="88">M</text><text x="425" y="88">a</text><text x="425" y="208">b</text>`;
  s += `<text${th === 0 ? ' class="r"' : ''} x="${(230 + 150 * dx - 22 * dy).toFixed(1)}" y="${(100 + 150 * dy + 22 * dx).toFixed(1)}">c</text>`;
  const nx = th === 0 ? null : 230 - 120 / Math.tan(r), seen = nx !== null && nx > 15 && nx < 445;
  if (seen) s += `<circle cx="${nx.toFixed(1)}" cy="220" r="6"/><text x="${(nx + 8).toFixed(1)}" y="252">N</text>`;
  $('#fig41').innerHTML = s + '</svg>';
  $('#ans41').innerHTML = th !== 0 ? `<p>Так, у точці N${seen ? '' : ' (точка N за межами малюнка)'}.</p>`
    : '<div class="redmsg">c паралельна b лише тоді, коли збігається з a. Але c — інша пряма, ніж a. Через M не можна провести другу пряму, паралельну b (аксіома паралельних прямих). Отже, c обов’язково перетне b.</div><div class="btns"><button class="go" onclick="understood()">Зрозумів</button></div>';
}
// Крок 4.2: дві прямі, перпендикулярні до c
function perp(t) {
  cur.tilt = false;
  return { title: t.title, q: t.q, active: 3, hints: t.hints, init: draw42,
    body: '<div id="fig42"></div><label class="fld" for="bx">Положення прямої b</label><input type="range" id="bx" min="200" max="400" step="1" value="300" oninput="draw42()"><div class="btns" id="b42"></div><div id="ans42" aria-live="polite"></div>' };
}
function tilt42(v) { cur.tilt = v; draw42(); }
function draw42() {
  const bx = +$('#bx').value, ang = Math.round(Math.atan2(150, bx - 150) * 180 / Math.PI);
  let s = '<svg class="fig" viewBox="0 0 460 300" role="img" aria-label="Пряма a перпендикулярна до c, пряма b"><line x1="20" y1="230" x2="440" y2="230"/><line x1="150" y1="20" x2="150" y2="285"/><path class="ln" d="M150,212 H168 V230"/>';
  s += '<text x="158" y="44">a</text><text x="425" y="218">c</text>';
  if (!cur.tilt) s += `<line class="acc" x1="${bx}" y1="20" x2="${bx}" y2="285"/><path class="ln" d="M${bx},212 H${bx + 18} V230"/><text x="${bx + 10}" y="44">b</text>`;
  else {
    const ddx = 150 - bx, ddy = -150, A = [bx - 0.3 * ddx, 230 - 0.3 * ddy], B = [150 + 0.4 * ddx, 80 + 0.4 * ddy];
    s += `<line class="red" x1="${A[0]}" y1="${A[1]}" x2="${B[0]}" y2="${B[1]}"/><circle cx="150" cy="80" r="6"/><text x="118" y="74">M</text>`;
    s += `<text class="n r" x="${bx - 62}" y="220">${ang}°</text><text class="r" x="${bx + 8}" y="${282}">b</text>`;
  }
  $('#fig42').innerHTML = s + '</svg>';
  $('#b42').innerHTML = cur.tilt ? '<button onclick="tilt42(false)">Повернути</button>' : '<button class="go" onclick="tilt42(true)">Припустимо, що a і b перетинаються</button>';
  $('#ans42').innerHTML = cur.tilt ? `<p>Кут між b і c — ${ang}°, уже не 90°.</p><div class="redmsg">Якщо a і b перетнуться в точці M, то через M пройдуть дві прямі, перпендикулярні до c. А така пряма лише одна. Суперечність.</div><div class="btns"><button class="go" onclick="understood()">Зрозумів</button></div>` : '';
}
function understood() {
  markDone();
  if (cur.id === '4.1') return openStep(4, '4.2');
  fb('<div class="good">Правильно!</div>' + nextHtml());
}

// Крок 5: тап-тап (мишею можна перетягувати)
function build(t) {
  const extra = cur.mode === 'test' ? t.extra.slice(0, 1) : t.extra;
  const cardsL = [{ t: t.assume, s: 'A0' }, ...t.reason.map((r, i) => ({ t: r, s: 'R' + i })), { t: t.contra, s: 'C0' }, { t: t.concl, s: 'V0' }, ...extra.map(e => ({ t: e.t, s: null, why: e.why }))];
  cur.st = { cards: cardsL, slots: ['A0', ...t.reason.map((_, i) => 'R' + i), 'C0', 'V0'], pool: shuffle(cardsL.map((_, i) => i)), at: {}, sel: null, mark: null, why: null };
  return { title: t.title, q: t.cond, hints: t.hints, init: draw5,
    sol: `<ol>${cur.st.slots.map(s => `<li><b>${SLOTN[s[0]]}:</b> ${cardsL.find(c => c.s === s).t}</li>`).join('')}</ol>Зайві рядки лишаються поза схемою.`,
    body: proofHead(t) + `<div class="build"><div><p class="small">Натисни рядок, потім місце у схемі. Зайві рядки лиши тут.</p><div class="pool" id="pool" ondragover="event.preventDefault()" ondrop="dropPool()"></div></div><div class="scheme" id="scheme"></div></div><div class="btns"><button class="go" onclick="check5()">Перевірити</button></div>` };
}
function draw5() {
  const st = cur.st, mk = i => (st.mark && st.mark[i]) || '', wy = i => (st.why && st.why[i] ? `<div class="why">${st.why[i]}</div>` : '');
  $('#pool').innerHTML = st.pool.map(i => `<button draggable="true" ondragstart="dragC(${i})" class="${st.sel === i ? 'sel' : ''} ${mk(i)}" aria-pressed="${st.sel === i}" onclick="selC(${i})">${st.cards[i].t}</button>${wy(i)}`).join('') || '<span class="small">Усі рядки розставлено.</span>';
  $('#scheme').innerHTML = ['A', 'R', 'C', 'V'].map((g, bi) => `<div class="blkname">${bi + 1}. ${SLOTN[g]}</div>` + st.slots.filter(s => s[0] === g).map(s => {
    const i = st.at[s], full = i !== undefined;
    return `<button class="slot ${full ? 'full ' + mk(i) : ''}" ${full ? `draggable="true" ondragstart="dragC(${i})"` : ''} ondragover="event.preventDefault()" ondrop="dropSlot('${s}')" onclick="slotC('${s}')">${full ? st.cards[i].t : 'Натисни, щоб поставити сюди'}</button>${full ? wy(i) : ''}`;
  }).join('')).join('');
}
function clearMarks() { cur.st.mark = null; cur.st.why = null; }
function selC(i) { cur.st.sel = cur.st.sel === i ? null : i; clearMarks(); draw5(); }
function place(i, s) {
  const st = cur.st;
  for (const k in st.at) if (st.at[k] === i) delete st.at[k];
  if (st.at[s] !== undefined) st.pool.push(st.at[s]);
  st.pool = st.pool.filter(x => x !== i); st.at[s] = i; st.sel = null;
}
function slotC(s) {
  const st = cur.st; setActive('ARCV'.indexOf(s[0]) + 1);
  if (st.sel !== null) place(st.sel, s);
  else if (st.at[s] !== undefined) { st.pool.push(st.at[s]); delete st.at[s]; }
  clearMarks(); draw5();
}
function dragC(i) { cur.st.sel = i; }
function dropSlot(s) { if (cur.st.sel !== null) slotC(s); }
function dropPool() {
  const st = cur.st, i = st.sel; if (i === null) return;
  for (const k in st.at) if (st.at[k] === i) { delete st.at[k]; st.pool.push(i); }
  st.sel = null; clearMarks(); draw5();
}
function check5() {
  const st = cur.st;
  if (st.slots.some(s => st.at[s] === undefined)) return warn('Заповни всі місця у схемі.');
  const mark = {}, why = {}; let all = true;
  st.slots.forEach(s => {
    const i = st.at[s], c = st.cards[i];
    if (c.s === s) { mark[i] = 'right'; return; }
    all = false; mark[i] = 'wrong';
    why[i] = c.s === null ? c.why : c.s[0] === s[0] ? `Порядок міркувань інший: цей рядок має бути ${c.s === 'R0' ? 'першим' : 'другим'}.` : `Цей рядок належить до блоку «${SLOTN[c.s[0]]}».`;
  });
  st.pool.forEach(i => { if (st.cards[i].s) { all = false; mark[i] = 'wrong'; why[i] = 'Цей рядок потрібен у схемі.'; } else mark[i] = 'right'; });
  if (cur.mode === 'practice') { st.mark = mark; st.why = why; draw5(); }
  answer(all, 'Є помилки — дивись пояснення біля червоних рядків.');
}

// Крок 6: пропуски — кнопки вибору під рядком
function gaps(t) {
  cur.gs = [];
  const lines = t.lines.map(l => {
    let opts = '';
    const text = l.parts.map(p => {
      if (typeof p === 'string') return p;
      const j = cur.gs.length; cur.gs.push({ sh: shuffle(p.opts), v: null, b: l.b });
      opts += `<div class="gopts" role="group" aria-label="Пропуск ${j + 1}">${cur.gs[j].sh.map((o, oi) => `<button id="g${j}o${oi}" onclick="choose(${j},${oi})">${o.t}</button>`).join('')}</div>`;
      return `<span class="gap" id="g${j}">${'&nbsp;'.repeat(12)}</span>`;
    }).join('');
    return `<div class="pline"><b>${BLOCKS[l.b - 1].short}:</b> ${text}${opts}</div>`;
  }).join('');
  const full = t.lines.map(l => `<li>${l.parts.map(p => (typeof p === 'string' ? p : `<b>${p.opts.find(o => o.ok).t}</b>`)).join('')}</li>`).join('');
  return { title: `Доведення з кроку 5 (${t.of})`, q: `Пропусків: ${cur.gs.length}. Обери слова для пропусків.`, hints: t.hints, sol: `<ol>${full}</ol>`,
    body: proofHead(t) + lines + '<div class="btns"><button class="go" onclick="check6()">Перевірити</button></div>' };
}
function choose(j, oi) {
  const g = cur.gs[j]; g.v = oi; setActive(g.b);
  $('#g' + j).textContent = g.sh[oi].t; $('#g' + j).className = 'gap';
  g.sh.forEach((_, k) => $(`#g${j}o${k}`).classList.toggle('sel', k === oi));
}
function check6() {
  if (cur.gs.some(g => g.v === null)) return warn('Заповни всі пропуски.');
  const msgs = [];
  cur.gs.forEach((g, j) => { const o = g.sh[g.v]; $('#g' + j).className = 'gap ' + (o.ok ? 'right' : 'wrong'); if (!o.ok) msgs.push(`«${o.t}»: ${o.why}`); });
  answer(!msgs.length, msgs.join('<br>'));
}

// Крок 7: порівняння зі зразком
function compare7() {
  const mine = BLOCKS.map((_, i) => $('#w' + i).value.trim());
  if (mine.some(x => !x)) return warn('Заповни всі чотири поля — хоча б коротко.');
  fb('');
  $('#cmp').innerHTML = `<div class="cmp"><div class="card"><b>Твоє доведення</b><ol>${mine.map(x => `<li>${esc(x)}</li>`).join('')}</ol></div><div class="card"><b>Зразок</b><ol>${cur.t.sample.map(x => `<li>${x}</li>`).join('')}</ol></div></div>
  <p>Порівняй кожен рядок: чи правильне припущення, з чим суперечність і чи є висновок.</p><div class="btns"><button class="go" onclick="answer(true)">Збігається</button><button onclick="warn('Виправ свої рядки за зразком і порівняй ще раз.')">Є помилка</button></div>`;
}

// Крок 0: пам’ятка
function cards(i) {
  const c = CARDS[i]; active = 0;
  const scheme = c.algo ? `<ol>${BLOCKS.map(b => `<li><b>${b.name}</b> — ${b.text.charAt(0).toLowerCase() + b.text.slice(1)}</li>`).join('')}</ol>` : '';
  $('#app').innerHTML = header(0) + `<div class="card"><div class="small">Картка ${i + 1} з ${CARDS.length}</div><h2>${c.title}</h2>${scheme}${c.html}</div>
  <div class="btns">${i > 0 ? `<button onclick="cards(${i - 1})">Назад</button>` : ''}${i < CARDS.length - 1 ? `<button class="go" onclick="cards(${i + 1})">Далі</button>` : '<button class="go" onclick="cardsDone()">Готово</button>'}</div>`;
}
function cardsDone() {
  store.s0 = true; save();
  $('#app').innerHTML = header(0) + `<p class="good">Пам’ятку прочитано.</p><div class="btns"><button class="go" onclick="openStep(1)">1. ${STEPS[1].title}</button></div>`;
}

// Крок 8: перевір себе
function startTest() {
  const take = (arr, k, n) => shuffle(arr).slice(0, n).map(t => [k, t]);
  test = { q: [...take(S2, 2, 3), ...take(S3, 3, 3), ...take(S5, 5, 2)], res: [] };
  testNext();
}
function testNext() {
  if (test.res.length === test.q.length) return testEnd();
  const [k, t] = test.q[test.res.length];
  cur = { k, id: t.id, order: [t], mode: 'test' };
  $('#app').innerHTML = `<button class="back" onclick="if (confirm('Вийти? Цю спробу не буде зараховано.')) home()">← Вийти</button><h2>8. Перевір себе</h2>${algo()}<p class="small">Завдання ${test.res.length + 1} з ${test.q.length} · без підказок</p><div class="card" id="task"></div>`;
  showTask(t);
}
function testAnswer(ok) { test.res.push(ok); testNext(); }
function testEnd() { store.test = { score: test.res.filter(Boolean).length, at: Date.now() }; save(); result(); }
function result() {
  const r = store.test, when = new Date(r.at).toLocaleString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  $('#app').innerHTML = `<button class="back" onclick="home()">← Усі кроки</button><h2>Перевір себе — результат</h2>
  <div class="result"><label class="fld" for="nm">Прізвище, ім’я</label><input id="nm" class="inp" value="${esc(store.name)}" oninput="store.name = this.value; save()" autocomplete="name">
  <p class="big">${r.score} з 8</p><p>${when}</p>
  <ul>${[1, 2, 3, 4, 5, 6, 7].map(k => `<li>${k}. ${STEPS[k].title} — ${complete(k) ? '<b>пройдено</b>' : 'не пройдено'}</li>`).join('')}</ul></div>
  <p><b>Зроби скріншот цього екрана й надішли вчителю.</b></p>
  <div class="btns"><button class="go" onclick="startTest()">Пройти ще раз</button><button onclick="restart()">Почати спочатку</button></div>`;
}
home();

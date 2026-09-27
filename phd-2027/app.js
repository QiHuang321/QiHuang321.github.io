/* qihuang.me/phd-2027/ — behaviour. No libraries. Every module is isolated so one failure never blanks the page. */
(function () {
  'use strict';
  var d = document, root = d.documentElement, DAY = 864e5, SVGNS = 'http://www.w3.org/2000/svg';
  var hasData = !!(window.PHD && window.PHD.programmes && window.PHD.programmes.length);
  var P = window.PHD || { programmes: [], referees: [] };
  var calm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var TITLE = { en: 'Qi Huang · PhD applications, 2027 intake — for referees', zh: '黄骑 · 2027年入学博士申请（致推荐人）' };
  var q; try { q = new URLSearchParams(location.search); } catch (e) { q = null; }

  function run(name, fn) { try { fn(); } catch (e) { if (window.console) console.error('[phd-2027] ' + name, e); } }
  function isZh() { return /^zh/i.test(root.lang); }

  /* ---------- DOM helpers ---------- */
  function el(tag, cls, text) {
    var e = d.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  // A bilingual pair of sibling elements (same tag), as in the static HTML.
  function L(en, zh, tag, zhNowrap) {
    var f = d.createDocumentFragment(), a = el(tag || 'span', null, en), b = el(tag || 'span', zhNowrap ? 'nw' : null, zh);
    a.setAttribute('data-l', 'en'); b.setAttribute('data-l', 'zh'); b.lang = 'zh-Hans';
    f.appendChild(a); f.appendChild(b);
    return f;
  }
  function icon(id, cls) {
    var s = d.createElementNS(SVGNS, 'svg'), u = d.createElementNS(SVGNS, 'use');
    s.setAttribute('class', 'ic' + (cls ? ' ' + cls : '')); s.setAttribute('aria-hidden', 'true');
    u.setAttribute('href', '#' + id); s.appendChild(u);
    return s;
  }
  var PILL = {
    submitted: ['ok', 'i-check', 'Submitted', '已提交'],
    planned: ['plan', 'i-planned', 'Planned', '计划中'],
    awaiting: ['wait', 'i-clock', 'Awaiting', '待提交'],
    sent: ['sent', 'i-mail', 'Invitation sent', '邀请已发出'],
    received: ['ok', 'i-check', 'Received', '已收到'],
    notyet: ['plan', 'i-planned', 'Not yet sent', '尚未发送']
  };
  function pill(kind) {
    var p = PILL[kind] || PILL.awaiting, s = el('span', 'pill ' + p[0]);
    s.appendChild(icon(p[1])); s.appendChild(L(p[2], p[3]));
    return s;
  }

  /* ---------- Dates (day counts use the viewer's local date; closing instants use each deadline's offset) ---------- */
  function ymd(iso) { return iso.split('-').map(Number); }
  function dnum(iso) { var a = ymd(iso); return Date.UTC(a[0], a[1] - 1, a[2]) / DAY; }
  function isoOf(n) { var t = new Date(n * DAY); return t.getUTCFullYear() + '-' + ('0' + (t.getUTCMonth() + 1)).slice(-2) + '-' + ('0' + t.getUTCDate()).slice(-2); }
  function fmtEn(iso) { var a = ymd(iso); return a[2] + ' ' + MON[a[1] - 1] + ' ' + a[0]; }
  function fmtZh(iso) { var a = ymd(iso); return a[0] + '年' + a[1] + '月' + a[2] + '日'; }
  function todayOverride() { var o = q && q.get('today'); return o && /^\d{4}-\d{2}-\d{2}$/.test(o) ? o : null; } // testing hook: ?today=YYYY-MM-DD
  function todayNum() {
    var o = todayOverride(); if (o) return dnum(o);
    var t = new Date();
    return Date.UTC(t.getFullYear(), t.getMonth(), t.getDate()) / DAY;
  }
  // "Now" as an instant; with ?today= it is noon (UTC+8) of that day.
  function nowMs() { var o = todayOverride(); return o ? dnum(o) * DAY + 4 * 36e5 : Date.now(); }
  // The instant a deadline closes: its time (or the end of its day) at its UTC offset.
  function closeMs(date) {
    var dl = null;
    (P.programmes || []).forEach(function (p) { if (p.deadline && p.deadline.date === date) dl = p.deadline; });
    var t = Date.parse(date + 'T' + (dl && dl.time ? dl.time : '23:59:59') + ((dl && dl.offset) || '+08:00'));
    return isNaN(t) ? Infinity : t;
  }
  function timeEl(iso, en, zh) {
    var f = d.createDocumentFragment(), a = el('time', null, en), b = el('time', 'nw', zh);
    a.dateTime = b.dateTime = iso;
    a.setAttribute('data-l', 'en'); b.setAttribute('data-l', 'zh'); b.lang = 'zh-Hans';
    f.appendChild(a); f.appendChild(b);
    return f;
  }
  function deadlineText(dl) {
    var f = timeEl(dl.date, fmtEn(dl.date), fmtZh(dl.date));
    if (dl.time) {
      var tz = dl.tz || {}, a = f.firstChild, b = f.lastChild;
      a.textContent = '';
      a.appendChild(el('span', 'nw', fmtEn(dl.date) + ','));
      a.appendChild(d.createTextNode(' '));
      a.appendChild(el('span', 'nw', dl.time + (tz.en ? ' ' + tz.en : '')));
      a.dateTime = b.dateTime = dl.date + 'T' + dl.time + (dl.offset || '+08:00');
      var zh = el('span', 'nw', ' ' + dl.time + (tz.zh ? '（' + tz.zh + '）' : ''));
      zh.setAttribute('data-l', 'zh'); zh.lang = 'zh-Hans'; f.appendChild(zh);
    }
    return f;
  }
  // "A · B · C" -> one unbreakable span per part; the " ·" is drawn in CSS at the end of each part, so it never starts a line.
  function parts(dst, en, zh) {
    [[en, 'en'], [zh, 'zh']].forEach(function (x) {
      var w = el('span'); w.setAttribute('data-l', x[1]); if (x[1] === 'zh') w.lang = 'zh-Hans';
      String(x[0]).split(' · ').forEach(function (t, i) { if (i) w.appendChild(d.createTextNode(' ')); w.appendChild(el('span', 'nw', t)); });
      dst.appendChild(w);
    });
  }
  function sortedProgrammes() {
    return (P.programmes || []).slice().sort(function (a, b) {
      var x = a.deadline && a.deadline.date ? dnum(a.deadline.date) : Infinity;
      var y = b.deadline && b.deadline.date ? dnum(b.deadline.date) : Infinity;
      return x - y || (a.submitted ? 0 : 1) - (b.submitted ? 0 : 1);
    });
  }
  function hasSection(p) { var s = d.getElementById(p.id); return !!(s && s.classList.contains('prog')); }

  /* ---------- Render from data.js ---------- */
  function kvRow(dl, dtEn, dtZh, ddFill) {
    var row = el('div'), dt = el('dt'), dd = el('dd');
    dt.appendChild(L(dtEn, dtZh)); ddFill(dd);
    row.appendChild(dt); row.appendChild(dd); dl.appendChild(row);
  }
  function whoList(p) {
    var ul = el('ul', 'who');
    (P.referees || []).forEach(function (r) {
      var li = el('li'); li.appendChild(el('span', null, r.name));
      li.appendChild(pill((p.invitations || {})[r.id] || 'notyet')); ul.appendChild(li);
    });
    return ul;
  }
  function deadlineRow(kv, p) {
    kvRow(kv, 'Application deadline', '申请截止', function (dd) {
      if (p.deadline && p.deadline.date) {
        dd.appendChild(deadlineText(p.deadline));
        var c = el('span', 'cd inl'); c.setAttribute('data-until', p.deadline.date); dd.appendChild(c);
      } else dd.appendChild(L('To be confirmed', '待定'));
    });
  }

  function renderBoard() {
    var box = d.getElementById('board'); if (!box) return;
    box.textContent = '';
    if (!hasData) {
      var m = el('p', 'noscript-note');
      m.appendChild(L('The overview could not be loaded. The programme details below are complete; please reload, or email qihuang@uchicago.edu.',
        '概览未能加载；下方项目详情完整，请刷新页面或发邮件至 qihuang@uchicago.edu。'));
      box.appendChild(m); return;
    }
    var planned = 0;
    sortedProgrammes().forEach(function (p) {
      var st = p.status === 'submitted' ? 'submitted' : 'planned';
      if (st === 'planned') planned++;
      var card = el('article', 'card'); card.setAttribute('data-app', p.id); card.setAttribute('data-status', st);
      var top = el('div', 'card-top'), eb = el('p', 'eyebrow');
      eb.appendChild(d.createTextNode(p.short + ' · ')); eb.appendChild(L(p.place.en, p.place.zh));
      top.appendChild(eb); top.appendChild(pill(st)); card.appendChild(top);
      var h = el('h3', 'card-t'), link = st === 'submitted' && hasSection(p);
      if (link) { var a = el('a', 'stretch'); a.href = '#' + p.id; a.appendChild(L(p.title.en, p.title.zh)); h.appendChild(a); }
      else h.appendChild(L(p.title.en, p.title.zh));
      card.appendChild(h);
      var s = el('p', 'card-s'); parts(s, p.sub.en, p.sub.zh); card.appendChild(s);
      var kv = el('dl', 'kv');
      if (p.submitted) kvRow(kv, 'Submitted', '提交日期', function (dd) {
        dd.appendChild(timeEl(p.submitted, fmtEn(p.submitted), fmtZh(p.submitted)));
        var c = el('span', 'cd inl'); c.setAttribute('data-since', p.submitted); dd.appendChild(c);
      });
      deadlineRow(kv, p);
      if (p.supervisors) kvRow(kv, 'Proposed supervisors', '意向导师', function (dd) { dd.appendChild(L(p.supervisors.en, p.supervisors.zh)); });
      kvRow(kv, 'Referee invitations', '推荐信邀请', function (dd) {
        dd.appendChild(whoList(p));
        if (p.inviteNote) { var n = el('p', 'kv-note'); n.appendChild(L(p.inviteNote.en, p.inviteNote.zh)); dd.appendChild(n); }
      });
      card.appendChild(kv);
      if (link) {
        var more = el('p', 'card-more'); more.setAttribute('aria-hidden', 'true');
        more.appendChild(L('Programme, supervisors and documents', '项目、导师与材料')); more.appendChild(icon('i-arrow-right'));
        card.appendChild(more);
      }
      box.appendChild(card);
    });
    var empty = d.getElementById('board-empty'); if (empty) empty.hidden = planned > 0;
  }

  function renderPlanned() {
    var list = d.getElementById('planned-list'), empty = d.getElementById('planned-empty'); if (!list) return;
    list.textContent = '';
    var n = 0;
    sortedProgrammes().forEach(function (p) {
      if (p.status === 'submitted') return;
      n++;
      var a = el('article', 'prog-mini w-main'); a.setAttribute('data-app', p.id);
      var top = el('div', 'card-top'), eb = el('p', 'eyebrow');
      eb.appendChild(d.createTextNode(p.short + ' · ')); eb.appendChild(L(p.place.en, p.place.zh));
      top.appendChild(eb); top.appendChild(pill('planned')); a.appendChild(top);
      var h = el('h3', 'h'); h.appendChild(L(p.title.en, p.title.zh)); a.appendChild(h);
      var s = el('p', 'card-s'); parts(s, p.sub.en, p.sub.zh); a.appendChild(s);
      var kv = el('dl', 'kv');
      deadlineRow(kv, p);
      if (p.supervisors) kvRow(kv, 'Proposed supervisors', '意向导师', function (dd) { dd.appendChild(L(p.supervisors.en, p.supervisors.zh)); });
      kvRow(kv, 'Documents', '材料', function (dd) { dd.appendChild(L('In preparation', '准备中')); });
      kvRow(kv, 'Referee invitations', '推荐信邀请', function (dd) { dd.appendChild(L('Not yet sent', '尚未发送')); });
      a.appendChild(kv); list.appendChild(a);
    });
    if (empty) empty.hidden = n > 0;
    var sec = d.getElementById('planned'); if (sec) sec.hidden = n === 0; // the overview line already says "none"
  }

  function renderInvitations() {
    var progs = sortedProgrammes();
    // Programme sections: one row per referee.
    [].forEach.call(d.querySelectorAll('ul.inv[data-inv]'), function (ul) {
      var p = progs.filter(function (x) { return x.id === ul.getAttribute('data-inv'); })[0]; if (!p) return;
      ul.textContent = '';
      (P.referees || []).forEach(function (r) {
        var li = el('li'), nm = el('span', 'who-n');
        nm.appendChild(L('Prof. ' + r.name, r.name + ' 教授', 'span', true));
        li.appendChild(nm); li.appendChild(pill((p.invitations || {})[r.id] || 'notyet')); ul.appendChild(li);
      });
    });
    // Referee margin: one row per programme (deadline order).
    [].forEach.call(d.querySelectorAll('ul.inv.mini[data-ref]'), function (ul) {
      var id = ul.getAttribute('data-ref'); ul.textContent = '';
      progs.forEach(function (p) {
        var li = el('li'), c = el('span', 'code', p.short);
        if (p.refNote) { var sn = el('span', 'sub-n'); sn.appendChild(L(p.refNote.en, p.refNote.zh)); c.appendChild(sn); }
        li.appendChild(c); li.appendChild(pill((p.invitations || {})[id] || 'notyet')); ul.appendChild(li);
      });
    });
  }

  // Detail sections and their nav links follow deadline order.
  function orderSections() {
    var progs = sortedProgrammes().filter(function (p) { return p.status === 'submitted' && hasSection(p); });
    if (!progs.length) return; // keep the static nav links
    var planned = d.getElementById('planned');
    progs.forEach(function (p) { var s = d.getElementById(p.id); if (planned && s) planned.parentNode.insertBefore(s, planned); });
    var ul = d.querySelector('.links ul'); if (!ul) return;
    [].forEach.call(ul.querySelectorAll('li[data-prog]'), function (li) { li.parentNode.removeChild(li); });
    var anchor = ul.querySelector('a[href="#profile"]'); anchor = anchor && anchor.parentNode;
    progs.forEach(function (p) {
      var li = el('li'), a = el('a', null, p.short); li.setAttribute('data-prog', p.id); a.href = '#' + p.id;
      li.appendChild(a); ul.insertBefore(li, anchor);
    });
  }

  /* ---------- Timeline ---------- */
  var tlState = null, tlRO = null;
  function renderTimeline() {
    var w = d.getElementById('tl'); if (!w) return;
    var evs = [];
    sortedProgrammes().forEach(function (p) { (p.events || []).forEach(function (e) { if (e.date) evs.push(e); }); });
    evs.sort(function (a, b) { return dnum(a.date) - dnum(b.date); });
    if (!evs.length) return; // keep the static list
    w.textContent = ''; w.classList.remove('is-static');
    var a0 = ymd(evs[0].date);
    var start = Date.UTC(a0[0], a0[1] - 1, 1) / DAY, end = dnum(evs[evs.length - 1].date) + 10, span = end - start;
    var today = todayNum(), tx = (today - start) / span * 100;
    var pct = function (n) { return (Math.round(n * 100) / 100) + '%'; };
    w.style.setProperty('--today', pct(Math.max(0, Math.min(100, tx))));
    // Hide the "today" tick outside the axis or when an event sits within 6 days of it (the event's own label says "today", "in 3 days"…).
    w.classList.toggle('no-now', tx < 0 || tx > 100 || evs.some(function (e) { return Math.abs(dnum(e.date) - today) < 6; }));

    var axis = el('div', 'tl-axis'); axis.setAttribute('aria-hidden', 'true');
    axis.appendChild(el('span', 'tl-fill'));
    var now = el('span', 'tl-now'), nl = el('span', 'tl-now-l'); nl.appendChild(L('Today', '今天')); now.appendChild(nl); axis.appendChild(now);
    for (var y = a0[0], m = a0[1] - 1; Date.UTC(y, m, 1) / DAY <= end; m++) {
      if (m > 11) { m = 0; y++; }
      var mk = el('span', 'tl-m'); mk.style.setProperty('--x', pct((Date.UTC(y, m, 1) / DAY - start) / span * 100));
      mk.appendChild(L(MON[m], (m + 1) + '月')); axis.appendChild(mk);
    }
    w.appendChild(axis);

    var ol = el('ol', 'tl'), nowRow = null, placed = false;
    evs.forEach(function (e, i) {
      var n = dnum(e.date), x = (n - start) / span * 100;
      var state = n < today ? 'past' : n === today ? 'is-today' : 'future';
      if (!placed && n >= today) {
        placed = true;
        if (n > today && tx >= 0 && tx <= 100) { nowRow = nowLi(today); ol.appendChild(nowRow); }
      }
      var li = el('li', 'ev ' + (i % 2 ? 'down' : 'up') + (x > 55 ? ' end' : '') + (e.kind === 'deadline' ? ' dl' : '') + ' ' + state);
      li.style.setProperty('--x', pct(x)); li.setAttribute('data-date', e.date);
      var dot = el('span', 'dot'); dot.setAttribute('aria-hidden', 'true'); li.appendChild(dot);
      li.appendChild(timeEl(e.date, fmtEn(e.date), fmtZh(e.date)));
      var c = el('span', 'cd'); c.setAttribute('data-rel', e.date); li.appendChild(c);
      li.appendChild(L(e.en, e.zh, 'p'));
      ol.appendChild(li);
    });
    if (!placed && tx >= 0 && tx <= 100) { nowRow = nowLi(today); ol.appendChild(nowRow); }
    w.appendChild(ol);
    tlState = { ol: ol, nowRow: nowRow };
    railFill();
    // Refit when labels change size (web fonts arriving, user text-spacing or font-size overrides).
    if (window.ResizeObserver) {
      if (tlRO) tlRO.disconnect();
      var queued = false;
      tlRO = new ResizeObserver(function () { if (!queued) { queued = true; requestAnimationFrame(function () { queued = false; railFill(); }); } });
      [].forEach.call(ol.children, function (li) { tlRO.observe(li); });
    }
  }
  function nowLi(today) {
    var li = el('li', 'ev now'), iso = isoOf(today);
    li.appendChild(L('Today · ' + fmtEn(iso), '今天 · ' + fmtZh(iso)));
    return li;
  }
  // Vertical layout: the rail is moss down to "today".
  function railFill() {
    if (!tlState) return;
    var ol = tlState.ol, y = 0, mark = tlState.nowRow || ol.querySelector('.ev.is-today');
    if (mark) y = mark.offsetTop + 10;
    else { var past = ol.querySelectorAll('.ev.past'); if (past.length) y = past[past.length - 1].offsetTop + past[past.length - 1].offsetHeight; }
    ol.style.setProperty('--now-y', Math.max(0, y - 7) + 'px');
    // Horizontal layout: grow the box to fit its labels (large text, text-spacing overrides).
    var w = d.getElementById('tl'); if (!w) return;
    w.style.height = ''; w.style.marginTop = '';
    if (window.matchMedia && matchMedia('screen and (min-width:64rem)').matches) {
      var wr = w.getBoundingClientRect(), maxB = 0, minT = 0;
      [].forEach.call(w.querySelectorAll('.ev'), function (e) {
        if (getComputedStyle(e).display === 'none') return;
        var r = e.getBoundingClientRect(); maxB = Math.max(maxB, r.bottom - wr.top); minT = Math.min(minT, r.top - wr.top);
      });
      w.style.height = Math.max(w.offsetHeight, Math.ceil(maxB) + 8) + 'px';
      if (minT < 0) w.style.marginTop = Math.ceil(-minT) + 'px';
    }
  }
  function animateTimeline() {
    var w = d.getElementById('tl'); if (!w) return;
    if (calm || !('IntersectionObserver' in window)) { w.classList.add('go'); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { w.classList.add('go'); io.disconnect(); } });
    }, { threshold: 0.3 });
    io.observe(w);
  }

  /* ---------- Countdowns ---------- */
  function setChip(c, en, zh, cls) {
    c.textContent = ''; c.appendChild(L(en, zh, 'span', true));
    c.classList.remove('soon', 'today', 'past'); if (cls) c.classList.add(cls);
    c.classList.add('on');
  }
  function sinceText(n) { return n < 0 ? ['in ' + (-n) + ' days', (-n) + ' 天后'] : n === 0 ? ['today', '今天'] : n === 1 ? ['yesterday', '昨天'] : [n + ' days ago', n + ' 天前']; }
  function fillDates() {
    var t = todayNum(), now = nowMs();
    [].forEach.call(d.querySelectorAll('[data-until]'), function (c) {
      var iso = c.getAttribute('data-until'), n = dnum(iso) - t;
      if (now > closeMs(iso)) setChip(c, 'Closed', '已截止', 'past');
      else if (n > 1) setChip(c, n + ' days left', '还有 ' + n + ' 天', n <= 14 ? 'soon' : '');
      else if (n === 1) setChip(c, '1 day left', '还有 1 天', 'soon');
      else setChip(c, 'Due today', '今天截止', 'today');
    });
    [].forEach.call(d.querySelectorAll('[data-since]'), function (c) {
      var s = sinceText(t - dnum(c.getAttribute('data-since'))); setChip(c, s[0], s[1], '');
    });
    [].forEach.call(d.querySelectorAll('[data-rel]'), function (c) {
      var n = dnum(c.getAttribute('data-rel')) - t;
      if (n < 0 || (n === 0 && c.parentNode.classList.contains('dl') && now > closeMs(c.getAttribute('data-rel')))) { var s = sinceText(-n); setChip(c, s[0], s[1], ''); }
      else if (n === 0) setChip(c, 'today', '今天', '');
      else if (n === 1) setChip(c, 'tomorrow', '明天', '');
      else setChip(c, 'in ' + n + ' days', n + ' 天后', '');
    });
  }
  // HKU deadline in the viewer's own time zone (only when it is not UTC+8).
  function localTimes() {
    [].forEach.call(d.querySelectorAll('[data-local]'), function (p) {
      var dt = new Date(p.getAttribute('data-local')), off = -dt.getTimezoneOffset();
      if (isNaN(dt) || off === 480) return;
      // A numeric offset, not a zone abbreviation: "CST" would read as China Standard Time in the Chinese UI.
      var ao = Math.abs(off), tz = 'GMT' + (off < 0 ? '\u2212' : '+') + Math.floor(ao / 60) + (ao % 60 ? ':' + ('0' + ao % 60).slice(-2) : '');
      var y = dt.getFullYear(), m = dt.getMonth() + 1, dd = dt.getDate(), hm = ('0' + dt.getHours()).slice(-2) + ':' + ('0' + dt.getMinutes()).slice(-2);
      p.textContent = '';
      p.appendChild(icon('i-clock'));
      p.appendChild(L('In your time zone: ' + dd + ' ' + MON[m - 1] + ' ' + y + ', ' + hm + ' (' + tz + ')',
        '您所在时区：' + y + '年' + m + '月' + dd + '日 ' + hm + '（' + tz + '）'));
      p.hidden = false;
    });
  }

  /* ---------- Language ---------- */
  function applyLangAttrs() {
    var zh = isZh();
    d.title = zh ? TITLE.zh : TITLE.en;
    [].forEach.call(d.querySelectorAll('[data-aria-en]'), function (e) { e.setAttribute('aria-label', e.getAttribute(zh ? 'data-aria-zh' : 'data-aria-en')); });
    [].forEach.call(d.querySelectorAll('[data-set-lang]'), function (b) { b.setAttribute('aria-pressed', String((b.getAttribute('data-set-lang') === 'zh') === zh)); });
    [].forEach.call(d.querySelectorAll('.field'), function (f) {
      var r = f.querySelector('.reader'); if (r) r.setAttribute('data-print-note', (zh ? '全文见网页：' : 'Full text on the web page: ') + 'qihuang.me/phd-2027/#' + f.id);
    });
  }
  function initLang() {
    var g = d.querySelector('.lang'); if (!g) return;
    g.hidden = false;
    applyLangAttrs();
    g.addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-set-lang]'); if (!b) return;
      var want = b.getAttribute('data-set-lang'); if ((want === 'zh') === isZh()) return;
      var hh = d.querySelector('.top').offsetHeight, anchor = null, before = 0;
      var cands = d.querySelectorAll('main section[id], .it, .card, .field, .ev');
      for (var i = 0; i < cands.length; i++) {
        var r = cands[i].getBoundingClientRect();
        if (r.height && r.top >= hh) { anchor = cands[i]; before = r.top; break; }
      }
      root.lang = want === 'zh' ? 'zh-Hans' : 'en';
      applyLangAttrs();
      if (anchor && scrollY > 0) window.scrollBy({ top: anchor.getBoundingClientRect().top - before, left: 0, behavior: 'instant' });
      try { localStorage.setItem('phd-lang', want); } catch (e) {}
      if (q && q.has('lang')) { q.set('lang', want); try { history.replaceState(null, '', '?' + q.toString() + location.hash); } catch (e) {} }
      railFill();
      if (window.__placeInd) window.__placeInd();
    });
  }

  /* ---------- Theme (homepage) ---------- */
  function initTheme() {
    var form = d.querySelector('.theme'); if (!form) return;
    var metas = d.querySelectorAll('meta[name="theme-color"]');
    function apply(v) {
      if (v === 'system') delete root.dataset.theme; else root.dataset.theme = v;
      [].forEach.call(metas, function (m, k) { m.content = v === 'system' ? ['#f4f2eb', '#121511'][k] : (v === 'dark' ? '#121511' : '#f4f2eb'); });
    }
    form.hidden = false;
    var saved = root.dataset.theme || 'system';
    form.querySelector('[value="' + saved + '"]').checked = true;
    apply(saved);
    form.addEventListener('change', function (e) {
      apply(e.target.value);
      try { if (e.target.value === 'system') localStorage.removeItem('theme'); else localStorage.setItem('theme', e.target.value); } catch (_) {}
    });
  }

  /* ---------- Nav scroll-spy (homepage) ---------- */
  function initNav() {
    var bar = d.querySelector('.links'), ind = d.querySelector('.ind'); if (!bar || !ind) return;
    var links = [].slice.call(bar.querySelectorAll('a[href^="#"]'));
    var secs = links.map(function (a) { return d.getElementById(a.hash.slice(1)); });
    var cur = -2, queued = false;
    function place() {
      var a = links[cur];
      ind.style.opacity = a ? 1 : 0;
      if (a) ind.style.transform = 'translateX(' + a.offsetLeft + 'px) scaleX(' + a.offsetWidth + ')';
    }
    function spy() {
      queued = false;
      var y = scrollY, line = y + innerHeight * 0.3, i = -1;
      if (y + innerHeight >= root.scrollHeight - 2) i = secs.length - 1;
      else secs.forEach(function (s, k) { if (s && s.getBoundingClientRect().top + y <= line) i = k; });
      if (i === cur) return;
      if (links[cur]) links[cur].removeAttribute('aria-current');
      if (links[i]) links[i].setAttribute('aria-current', 'location');
      cur = i; place();
      if (links[i] && bar.scrollWidth > bar.clientWidth) bar.scrollTo({ left: links[i].offsetLeft - 24, behavior: calm ? 'auto' : 'smooth' });
    }
    window.__placeInd = place;
    addEventListener('scroll', function () { if (!queued) { queued = true; requestAnimationFrame(spy); } }, { passive: true });
    addEventListener('resize', function () { place(); railFill(); });
    spy();
    requestAnimationFrame(function () { ind.classList.add('glide'); });
  }

  /* ---------- Copy email (homepage) ---------- */
  function initCopy() {
    var btn = d.querySelector('.copy'), status = d.getElementById('copied'), timer; if (!btn) return;
    if (!(navigator.clipboard && window.isSecureContext)) return;
    var orig = [].slice.call(btn.childNodes);
    btn.hidden = false;
    btn.addEventListener('click', function () {
      navigator.clipboard.writeText(btn.getAttribute('data-copy')).then(function () {
        btn.textContent = ''; btn.appendChild(L('Copied', '已复制')); btn.classList.add('ok');
        status.textContent = isZh() ? '邮箱地址已复制' : 'Email address copied';
        clearTimeout(timer);
        timer = setTimeout(function () {
          btn.textContent = ''; orig.forEach(function (n) { btn.appendChild(n); });
          btn.classList.remove('ok'); status.textContent = '';
        }, 2000);
      }).catch(function () {
        status.textContent = isZh() ? '无法复制，邮箱为 qihuang@uchicago.edu' : 'Could not copy. The address is qihuang@uchicago.edu';
      });
    });
  }

  /* ---------- HKPFS statement reader ---------- */
  function decode(b64) {
    var bin = atob(b64), u = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    return new TextDecoder('utf-8').decode(u);
  }
  function tx(s) { return d.createTextNode(s); }
  function runIn(p, s, re, cls) {
    var last = 0, m; re.lastIndex = 0;
    while ((m = re.exec(s))) {
      if (m.index > last) p.appendChild(tx(s.slice(last, m.index)));
      p.appendChild(el('strong', cls, m[0])); last = m.index + m[0].length;
    }
    if (last < s.length) p.appendChild(tx(s.slice(last)));
  }
  // Adds structure only: every character of the original stays in the DOM, in order.
  function buildReader(body, text) {
    text = text.replace(/\r\n?/g, '\n');
    var blocks = text.split(/\n[ \t]*\n+/);
    blocks.forEach(function (block, bi) {
      if (bi) body.appendChild(tx('\n\n'));
      var lines = block.split('\n'), m, first = lines[0];
      if (first.trim() === 'References') {
        body.appendChild(el('h6', 'rd-refh', first)); body.appendChild(tx('\n'));
        var ol = el('ol', 'refs');
        lines.slice(1).forEach(function (line, k) {
          if (k) ol.appendChild(tx('\n'));
          var li = el('li'), r = line.match(/^(\[\d+\])(\s+)(.*)$/);
          if (r) { li.appendChild(el('span', 'ref-n', r[1])); li.appendChild(tx(r[2])); li.appendChild(el('span', 'ref-t', r[3])); }
          else li.textContent = line;
          ol.appendChild(li);
        });
        body.appendChild(ol); return;
      }
      if ((m = first.match(/^(\d+\.)(\s+)(.*?)(?:(\s+)(\([^()]*\)))?$/)) && lines.length > 1) {
        var sec = el('div', 'rd-sec'), hd = el('p', 'rd-hd');
        hd.appendChild(el('span', 'rd-num', m[1])); hd.appendChild(tx(m[2])); hd.appendChild(el('span', 'rd-ttl', m[3]));
        if (m[5]) { hd.appendChild(tx(m[4])); hd.appendChild(el('span', 'rd-meta', m[5])); }
        sec.appendChild(hd);
        var ul = null;
        lines.slice(1).forEach(function (line) {
          if (line.indexOf('- ') === 0) {
            if (!ul) { ul = el('ul', 'rd-list'); sec.appendChild(tx('\n')); sec.appendChild(ul); } else ul.appendChild(tx('\n'));
            var li = el('li'); li.appendChild(el('span', 'mk', '- ')); li.appendChild(tx(line.slice(2))); ul.appendChild(li);
          } else { ul = null; sec.appendChild(tx('\n')); sec.appendChild(el('p', null, line)); }
        });
        body.appendChild(sec); return;
      }
      var rm = block.match(/^(Background\.|Objectives\.|Methodology and evaluation\.|Timeline\.|Disclosure of AI usage:)\s/) || block.match(/^(Aim \d+:[^.]*\.)\s/);
      if (rm) {
        var p = el('p', /^Aim/.test(rm[1]) ? 'aim' : null), rest = block.slice(rm[1].length);
        p.appendChild(el('strong', 'rl', rm[1]));
        if (rm[1] === 'Timeline.') runIn(p, rest, /Year \d:/g, 'yr');
        else if (rm[1] === 'Disclosure of AI usage:') runIn(p, rest, /\(\d\) [A-Z][a-z]+(?: [a-z]+)?:/g, 'rl');
        else p.appendChild(tx(rest));
        body.appendChild(p); return;
      }
      var dp = el('p');
      lines.forEach(function (line, k) { if (k) { dp.appendChild(el('br')); dp.appendChild(tx('\n')); } dp.appendChild(tx(line)); });
      body.appendChild(dp);
    });
  }
  function initReader() {
    var fields = [].slice.call(d.querySelectorAll('.field[data-key]')); if (!fields.length) return;
    var err = d.getElementById('hk-err'), all = d.getElementById('hk-all');
    var data = P.hkpfs, map = {};
    try {
      if (!data || data.encoding !== 'base64-utf8' || !window.atob || !window.TextDecoder) throw new Error('no decoder or data');
      data.fields.forEach(function (f) { map[f.key] = decode(f.b64); });
    } catch (e) { if (err) err.hidden = false; return; }

    function collapsedPx(body) { return parseFloat(getComputedStyle(body).fontSize) * 6.5; }
    function label(btn, open) { var s = btn.querySelector('.rd-l'); s.textContent = ''; s.appendChild(open ? L('Collapse', '收起') : L('Read full text', '阅读全文')); }
    function setOpen(f, open, animate) {
      var r = f.querySelector('.reader'), body = r.querySelector('.reader-body'), btn = r.querySelector('.rd-t');
      if ((r.getAttribute('data-open') === 'true') === open) return;
      btn.setAttribute('aria-expanded', String(open)); label(btn, open);
      if (!animate || calm) { r.setAttribute('data-open', String(open)); return; }
      var from = body.getBoundingClientRect().height, to = open ? body.scrollHeight : collapsedPx(body);
      body.style.maxHeight = from + 'px'; body.classList.add('anim');
      if (open) r.setAttribute('data-open', 'true');
      body.getBoundingClientRect(); // reflow
      body.style.maxHeight = to + 'px';
      var done = function () {
        body.removeEventListener('transitionend', done); clearTimeout(tm);
        body.classList.remove('anim'); body.style.maxHeight = '';
        if (!open) r.setAttribute('data-open', 'false');
      };
      var tm = setTimeout(done, 500);
      body.addEventListener('transitionend', done);
    }
    function syncAll() {
      if (!all) return;
      var closed = fields.some(function (f) { var b = f.querySelector('.rd-t'); return !b.hidden && f.querySelector('.reader').getAttribute('data-open') !== 'true'; });
      all.setAttribute('data-state', closed ? 'closed' : 'open');
      all.textContent = ''; all.appendChild(closed ? L('Expand all', '全部展开') : L('Collapse all', '全部收起'));
    }

    fields.forEach(function (f) {
      var text = map[f.getAttribute('data-key')]; if (text == null) return;
      var r = f.querySelector('.reader'), body = r.querySelector('.reader-body'), btn = r.querySelector('.rd-t');
      buildReader(body, text);
      var words = text.trim().split(/\s+/).length, fw = f.querySelector('.f-w');
      if (fw) fw.appendChild(L(words.toLocaleString('en-US') + ' words', words + ' 词', 'span', true));
      // Short fields (under ~90 words fit in the collapsed height) are shown in full; deterministic, no layout measurement.
      if (words < 90) { r.setAttribute('data-open', 'true'); btn.hidden = true; return; }
      label(btn, false); btn.hidden = false;
      btn.addEventListener('click', function () {
        var open = r.getAttribute('data-open') !== 'true';
        setOpen(f, open, true); syncAll();
        if (open) { try { history.replaceState(null, '', location.pathname + location.search + '#' + f.id); } catch (e) {} }
        else if (f.getBoundingClientRect().top < d.querySelector('.top').offsetHeight) f.scrollIntoView({ block: 'start', behavior: calm ? 'auto' : 'smooth' });
      });
    });
    if (all && fields.some(function (f) { return !f.querySelector('.rd-t').hidden; })) {
      all.hidden = false; syncAll();
      all.addEventListener('click', function () {
        var open = all.getAttribute('data-state') !== 'open';
        fields.forEach(function (f) { if (!f.querySelector('.rd-t').hidden) setOpen(f, open, false); });
        syncAll();
      });
    }
    var h = location.hash.slice(1), target = h && d.getElementById(h);
    if (target && target.classList.contains('field')) {
      setOpen(target, true, false); syncAll();
      requestAnimationFrame(function () { target.scrollIntoView({ block: 'start' }); });
    }
  }

  /* ---------- Print ---------- */
  function initPrint() {
    var b = d.getElementById('print'); if (!b || !window.print) return;
    b.hidden = false;
    b.addEventListener('click', function () { window.print(); });
  }

  run('order', orderSections);
  run('board', renderBoard);
  run('planned', renderPlanned);
  run('inv', renderInvitations);
  run('timeline', renderTimeline);
  run('lang', initLang);
  run('theme', initTheme);
  run('dates', function () { fillDates(); localTimes(); });
  run('reader', initReader);
  run('nav', initNav);
  run('copy', initCopy);
  run('print', initPrint);
  run('timeline-anim', animateTimeline);
  // Re-render day counts only when the date (or a closing instant) has changed.
  function stamp() { var s = String(todayNum()); [].forEach.call(d.querySelectorAll('[data-until]'), function (c) { s += nowMs() > closeMs(c.getAttribute('data-until')) ? 'c' : 'o'; }); return s; }
  var last = stamp();
  function refresh() {
    var s = stamp(); if (s === last) return; last = s;
    renderTimeline(); fillDates(); var w = d.getElementById('tl'); if (w) w.classList.add('go');
  }
  d.addEventListener('visibilitychange', function () { if (d.visibilityState === 'visible') run('refresh', refresh); });
  setInterval(function () { run('refresh', refresh); }, 60000);
})();

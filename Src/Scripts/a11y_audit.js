/* ============================================================================
   WCAG contrast auditor for the Jaiguru React Native app.

   Walks the JSX tree of every .tsx file, resolves each foreground element
   (Text, AppText, icons, ActivityIndicator, TextInput placeholders, SVG fills)
   against its NEAREST RENDERED BACKGROUND — following parent Views, StyleSheet
   entries, theme FONTS/STYLES spreads, inline styles, style arrays and
   LinearGradient stops.

   Thresholds (WCAG 2.1):
     1.4.3 normal text ...... 4.5:1
     1.4.3 large text ....... 3.0:1   (>=24px, or >=18.66px when bold)
     1.4.11 non-text ........ 3.0:1   (icons, spinners)

   Skipped by design: elements whose background is computed at runtime
   (e.g. backgroundColor: user.avatarColor) — reported separately as unknown.

   Usage:  node a11y_audit.js            (from project root)
           node a11y_audit.js --all      (also list passing large-text items)
============================================================================ */
const fs = require('fs'), path = require('path'), ts = require('typescript');

/* ---------------------------------------------------------------- theme --- */
const STUB = `const Dimensions={get:()=>({width:390,height:844})},PixelRatio={roundToNearestPixel:n=>Math.round(n)},Platform={OS:"android"};`;
function loadTheme() {
  const src = fs.readFileSync('Src/Utills/AppTheme.ts', 'utf8').replace(/import[^;]*from "react-native";/, STUB);
  const m = { exports: {} };
  new Function('module', 'exports', 'require',
    ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText)(m, m.exports, require);
  return { COLORS: m.exports.COLORS, SIZES: m.exports.SIZES, FONTS: m.exports.FONTS, STYLES: m.exports.STYLES, ELEVATION: m.exports.ELEVATION };
}
const THEME = loadTheme();

/* ------------------------------------------------------------ colour math --- */
function parseColor(v) {
  if (typeof v !== 'string') return null;
  let m = v.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+))?\s*\)/);
  if (m) return { c: [+m[1], +m[2], +m[3]], a: m[4] === undefined ? 1 : +m[4] };
  m = v.trim().match(/^#([0-9a-fA-F]{3,8})$/);
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = [...h].map(c => c + c).join('');
  if (h.length === 4) h = [...h].map(c => c + c).join('');
  if (h.length === 8) return { c: [0, 2, 4].map(i => parseInt(h.substr(i, 2), 16)), a: parseInt(h.substr(6, 2), 16) / 255 };
  if (h.length !== 6) return null;
  return { c: [0, 2, 4].map(i => parseInt(h.substr(i, 2), 16)), a: 1 };
}
const composite = (fg, bg) => fg.c.map((v, i) => v * fg.a + bg[i] * (1 - fg.a));
const lum = (c) => { const [r, g, b] = c.map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const contrast = (a, b) => { const l1 = lum(a), l2 = lum(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); };

/* --------------------------------------------------------- expr resolver --- */
function resolveValue(expr, locals) {
  if (expr == null) return null;
  let e = String(expr).trim().replace(/,$/, '').replace(/^\(|\)$/g, '').trim();
  const q = e.match(/^['"`](.*)['"`]$/);
  if (q) e = q[1];
  if (/^#[0-9a-fA-F]{3,8}$/.test(e) || /^rgba?\(/.test(e)) return e;
  if (/^[\d.]+$/.test(e)) return parseFloat(e);
  const t = e.match(/^(?:theme\.)?(COLORS|SIZES|FONTS|STYLES|ELEVATION)\.([\w.]+)$/);
  if (t) {
    let cur = THEME[t[1]];
    for (const p of t[2].split('.')) { if (cur == null) return null; cur = cur[p]; }
    return (typeof cur === 'string' || typeof cur === 'number') ? cur : null;
  }
  if (locals && Object.prototype.hasOwnProperty.call(locals, e)) return locals[e];
  return null;
}
/* a style-object reference like FONTS.body / STYLES.card.base / styles.title */
function resolveStyleObject(ref, sheets) {
  const t = ref.match(/^(?:theme\.)?(FONTS|STYLES)\.([\w.]+)$/);
  if (t) {
    let cur = THEME[t[1]];
    for (const p of t[2].split('.')) { if (cur == null) return null; cur = cur[p]; }
    return (cur && typeof cur === 'object') ? cur : null;
  }
  const s = ref.match(/^(\w+)\.(\w+)$/);
  if (s && sheets[s[1]] && sheets[s[1]][s[2]]) return sheets[s[1]][s[2]];
  return null;
}

/* ------------------------------------------------ balanced-brace scanner --- */
function readBlock(text, openIdx) {
  let d = 0;
  for (let i = openIdx; i < text.length; i++) {
    if (text[i] === '{') d++;
    else if (text[i] === '}') { d--; if (!d) return { body: text.slice(openIdx + 1, i), end: i }; }
  }
  return { body: '', end: openIdx };
}

/* ---------------------------------------------- parse StyleSheet.create --- */
const FG_KEYS = ['color'];
const BG_KEYS = ['backgroundColor'];
function readDecls(blk, locals) {
  const out = {};
  // Reads `key: <value>` respecting parens/brackets/quotes, so values that
  // contain commas — rgba(255, 255, 255, 0.9) — are captured whole.
  const grab = (key) => {
    const re = new RegExp(`(?:^|[,{\\s])${key}\\s*:\\s*`, 'g');
    const m = re.exec(blk);
    if (!m) return null;
    let i = re.lastIndex, depth = 0, q = null, out2 = '';
    for (; i < blk.length; i++) {
      const ch = blk[i];
      if (q) { out2 += ch; if (ch === q && blk[i - 1] !== '\\') q = null; continue; }
      if (ch === '"' || ch === "'" || ch === '`') { q = ch; out2 += ch; continue; }
      if ('([{'.includes(ch)) depth++;
      else if (')]}'.includes(ch)) { if (!depth) break; depth--; }
      else if ((ch === ',' || ch === '\n') && !depth) break;
      out2 += ch;
    }
    return out2.trim() || null;
  };
  for (const k of BG_KEYS) { const v = grab(k); if (v != null) { const r = resolveValue(v, locals); if (r != null) out.bg = r; else out.dynBg = true; } }
  for (const k of FG_KEYS) { const v = grab(k); if (v != null) { const r = resolveValue(v, locals); if (r != null) out.fg = r; else out.dynFg = true; } }
  const fs_ = grab('fontSize'); if (fs_ != null) { const r = resolveValue(fs_, locals); if (typeof r === 'number') out.fontSize = r; }
  const fw = grab('fontWeight'); if (fw != null) out.fontWeight = String(fw).replace(/['"]/g, '').trim();
  const ff = grab('fontFamily'); if (ff != null) { const r = resolveValue(ff, locals); if (typeof r === 'string') out.fontFamily = r; }
  // spreads such as ...FONTS.bodySm inside a StyleSheet entry
  const sp = blk.match(/\.\.\.((?:theme\.)?(?:FONTS|STYLES)\.[\w.]+)/g) || [];
  for (const s of sp) {
    const o = resolveStyleObject(s.replace('...', ''), {});
    if (o) {
      if (o.color && out.fg === undefined) out.fg = o.color;
      if (o.backgroundColor && out.bg === undefined) out.bg = o.backgroundColor;
      if (o.fontSize && out.fontSize === undefined) out.fontSize = o.fontSize;
      if (o.fontFamily && out.fontFamily === undefined) out.fontFamily = o.fontFamily;
    }
  }
  return out;
}
function extractSheets(text, locals) {
  const sheets = {};
  const re = /(?:const|let|var)\s+(\w+)\s*=\s*StyleSheet\.create\(\s*\{/g;
  let m;
  while ((m = re.exec(text))) {
    const open = text.indexOf('{', m.index + m[0].length - 1);
    const { body, end } = readBlock(text, open);
    const entries = {};
    const er = /(\w+)\s*:\s*\{/g; let e;
    while ((e = er.exec(body))) {
      const o = body.indexOf('{', e.index + e[0].length - 1);
      const blk = readBlock(body, o);
      entries[e[1]] = readDecls(blk.body, locals);
      er.lastIndex = blk.end;
    }
    sheets[m[1]] = entries;
    re.lastIndex = end;
  }
  return sheets;
}

/* ------------------------------------------------------- JSX tag parsing --- */
function attrValue(tag, name) {
  const re = new RegExp(`\\b${name}\\s*=\\s*`);
  const m = tag.match(re);
  if (!m) return null;
  let i = m.index + m[0].length;
  if (tag[i] === '{') { const b = readBlock(tag, i); return b.body.trim(); }
  const q = tag[i];
  if (q === '"' || q === "'") { const j = tag.indexOf(q, i + 1); return tag.slice(i + 1, j); }
  return null;
}
/* Separates always-applied style refs from conditional ones. A ref appearing
   after `&&` or inside a `? :` only applies in some states, so failing on it
   alone is not a definite violation. */
function splitStyleParts(sv) {
  const base = [], conditional = [], conditionalRanges = [];
  // Only `&&` and `?` mark a conditional. A bare `:` must NOT count — object
  // literals ({ backgroundColor: X }) are full of colons and would otherwise
  // make every inline style look conditional.
  const segRe = /(?:&&|\?(?!\.))\s*/g;
  const marks = [];
  let m;
  while ((m = segRe.exec(sv))) marks.push(m.index);
  const refRe = /(?:theme\.)?(?:FONTS|STYLES)\.[\w.]+|\b\w+\.\w+/g;
  while ((m = refRe.exec(sv))) {
    const ref = m[0];
    if (/^\d/.test(ref)) continue;
    // conditional if any &&/?/: marker sits between the previous comma and here
    const prevComma = sv.lastIndexOf(',', m.index);
    const isCond = marks.some(k => k > prevComma && k < m.index);
    (isCond ? conditional : base).push(ref);
    if (isCond) conditionalRanges.push([prevComma, m.index + ref.length]);
  }
  return { base, conditional, conditionalRanges };
}

function styleOfTag(tag, sheets, locals) {
  const out = {};
  const apply = (o) => {
    if (!o) return;
    if (o.bg !== undefined) out.bg = o.bg;
    if (o.backgroundColor !== undefined) out.bg = o.backgroundColor;
    if (o.dynBg) out.dynBg = true;
    if (o.fg !== undefined) out.fg = o.fg;
    if (o.color !== undefined) out.fg = o.color;
    if (o.fontSize !== undefined) out.fontSize = o.fontSize;
    if (o.fontWeight !== undefined) out.fontWeight = o.fontWeight;
    if (o.fontFamily !== undefined) out.fontFamily = o.fontFamily;
  };
  const sv = attrValue(tag, 'style');
  if (sv != null) {
    // Split the style expression into an unconditional base and any
    // conditionally-applied parts (`cond && styles.x`, `cond ? a : b`), so a
    // variant that only applies sometimes isn't treated as always-on.
    const parts = splitStyleParts(sv);
    for (const r of parts.base) apply(resolveStyleObject(r, sheets));
    let i = -1;
    while ((i = sv.indexOf('{', i + 1)) !== -1) {
      const b = readBlock(sv, i);
      const d = readDecls(b.body, locals);
      if (!parts.conditionalRanges.some(([s, e]) => i >= s && i <= e)) apply(d);
      else if (d.dynBg) out.dynBg = true;   // unknown bg counts in any branch
      i = b.end;
    }
    out.variants = parts.conditional
      .map(r => resolveStyleObject(r, sheets))
      .filter(o => o && (o.bg !== undefined || o.fg !== undefined));
  }
  // LinearGradient — first stop is the effective background behind children
  const cs = attrValue(tag, 'colors');
  if (cs != null) { const first = cs.replace(/^\[/, '').split(',')[0]; const v = resolveValue(first, locals); if (v != null) out.bg = v; else out.dynBg = true; }
  return out;
}

/* ----------------------------------------- surfaces painted by components --- */
const C = THEME.COLORS;
const COMPONENT_SURFACE = {
  AppCard: (variant) => ({
    default: C.surface, elevated: C.surface, premium: C.surface,
    blue: C.brand, blueLight: C.accentSoft, blueBorder: C.surface, flat: C.surface,
  }[variant || 'default'] ?? C.surface),
  ScreenWrapper: C.surfacePage,
  PremiumBackground: C.surfacePage,
  SafeAreaView: undefined,
  AppModal: C.surface,
  AppBottomSheet: C.surface,
};

/* --------------------------------------------------------- element kinds --- */
const ICON_RE = /^(Icon|Ionicons|MaterialIcons|MaterialCommunityIcons|Feather|FontAwesome\d*|AntDesign|Entypo|Octicons|SimpleLineIcons|Fontisto|Foundation|Zocial|EvilIcons)$/;
const TEXTISH = /^(Text|AppText|AnimatedText)$/;
const isBold = (st) => {
  const w = st.fontWeight;
  if (w && (w === 'bold' || parseInt(w, 10) >= 600)) return true;
  return !!(st.fontFamily && /(Bold|SemiBold|ExtraBold|Black)/i.test(st.fontFamily));
};
const threshold = (kind, st) => {
  if (kind !== 'text') return 3.0;
  const fs_ = st.fontSize || 14;
  if (fs_ >= 24 || (fs_ >= 18.66 && isBold(st))) return 3.0;
  return 4.5;
};

/* ----------------------------------------------------------------- audit --- */
const findings = [], unknown = [];
/* Blanks out comments while preserving byte offsets, so commented-out JSX is
   not audited and reported line numbers stay correct. */
function stripComments(src) {
  let out = '', i = 0, q = null;
  while (i < src.length) {
    const c = src[i], n = src[i + 1];
    if (q) { out += c; if (c === q && src[i - 1] !== '\\') q = null; i++; continue; }
    if (c === '"' || c === "'" || c === '`') { q = c; out += c; i++; continue; }
    if (c === '/' && n === '/' && src[i - 1] !== ':') {
      while (i < src.length && src[i] !== '\n') { out += ' '; i++; }
      continue;
    }
    if (c === '/' && n === '*') {
      while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) { out += src[i] === '\n' ? '\n' : ' '; i++; }
      out += '  '; i += 2; continue;
    }
    out += c; i++;
  }
  return out;
}

function auditFile(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const text = stripComments(raw);
  const lines = raw.split('\n');

  const locals = {};
  let cm;
  const cr = /(?:const|let)\s+(\w+)\s*(?::[^=]+)?=\s*((?:theme\.)?COLORS\.[\w.]+|'#[0-9a-fA-F]{3,8}'|"#[0-9a-fA-F]{3,8}"|'rgba?\([^']*\)'|"rgba?\([^"]*\)")/g;
  while ((cm = cr.exec(text))) { const v = resolveValue(cm[2], null); if (v != null) locals[cm[1]] = v; }

  const sheets = extractSheets(text, locals);

  const pageBg = parseColor(THEME.COLORS.surfacePage) || { c: [255, 255, 255], a: 1 };
  const stack = [{ bg: THEME.COLORS.surfacePage, bgRGB: composite(pageBg, [255, 255, 255]), fg: null, dyn: false, st: {} }];
  const tagRe = /<(\/?)([A-Za-z][\w.]*)((?:[^<>'"{]|'[^']*'|"[^"]*"|\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\})*?)(\/?)>/g;
  let m;
  while ((m = tagRe.exec(text))) {
    const [full, closing, rawName, , selfClose] = m;
    const name = rawName.split('.').pop();
    const line = text.slice(0, m.index).split('\n').length;
    if (closing) { if (stack.length > 1) stack.pop(); continue; }

    const st = styleOfTag(full, sheets, locals);
    // Custom wrappers that paint their own surface. Without this the auditor
    // would measure children against whatever is behind the wrapper.
    if (st.bg === undefined) {
      const surf = COMPONENT_SURFACE[name];
      if (surf) {
        const v = attrValue(full, 'variant');
        const c = typeof surf === 'function' ? surf(v) : surf;
        if (c) st.bg = c;
      }
    }
    const parent = stack[stack.length - 1];
    const bg = st.bg !== undefined ? st.bg : parent.bg;
    const dyn = !!(st.dynBg || parent.dyn);
    // A translucent background blends with whatever is behind it, so resolve
    // it against the ancestor's already-flattened colour rather than white.
    let bgRGB = parent.bgRGB;
    if (st.bg !== undefined) {
      const p = parseColor(st.bg);
      if (p) bgRGB = composite(p, parent.bgRGB);
    }

    const inherited = { ...parent.st, ...st };
    let kind = null, fg = null;

    if (TEXTISH.test(name)) {
      kind = 'text';
      const cprop = attrValue(full, 'color');
      fg = (cprop != null ? resolveValue(cprop, locals) : undefined);
      if (fg == null) fg = st.fg !== undefined ? st.fg : parent.fg;
      if (name === 'AppText' && inherited.fontSize === undefined) {
        const v = attrValue(full, 'variant');
        const map = { h1: 'display', h2: 'display', h3: 'title', h4: 'heading', h5: 'subheading', h6: 'subheading', bodyLarge: 'bodyLg', bodyMedium: 'bodyEmphasis', bodySmall: 'bodySm', bodyBold: 'bodyEmphasis', captionBold: 'label', labelUppercase: 'eyebrow', button: 'action', buttonLarge: 'action', buttonSmall: 'actionSm', goldText: 'bodyEmphasis', blueText: 'bodyEmphasis' };
        const f = THEME.FONTS[map[v] || v || 'body'];
        if (f) { inherited.fontSize = f.fontSize; inherited.fontFamily = f.fontFamily; if (fg == null) fg = f.color; }
      }
    } else if (ICON_RE.test(name)) {
      kind = 'icon';
      const c = attrValue(full, 'color') ?? attrValue(full, 'tintColor');
      fg = c != null ? resolveValue(c, locals) : (st.fg !== undefined ? st.fg : null);
    } else if (name === 'ActivityIndicator') {
      kind = 'spinner';
      const c = attrValue(full, 'color');
      fg = c != null ? resolveValue(c, locals) : null;
    } else if (name === 'TextInput') {
      const c = attrValue(full, 'placeholderTextColor');
      if (c != null) { kind = 'placeholder'; fg = resolveValue(c, locals); }
    } else if (/^(Path|Circle|Rect|Ellipse|Polygon|Line)$/.test(name)) {
      const c = attrValue(full, 'fill') ?? attrValue(full, 'stroke');
      if (c != null) { kind = 'svg'; fg = resolveValue(c, locals); }
    }

    if (kind && fg != null && bg != null) {
      const pf = parseColor(fg), pb = parseColor(bg);
      if (pf && pb) {
        if (dyn) unknown.push({ file, line, kind, fg, reason: 'background computed at runtime' });
        else if (pf.a === 0) { /* fully transparent, nothing rendered */ }
        else {
          // Candidate backgrounds: the resolved one, plus any conditional
          // variant that may replace it. Only a definite failure counts —
          // i.e. the element is unreadable in EVERY reachable state.
          const bgCandidates = [bgRGB];
          for (const v of (st.variants || [])) if (v.bg !== undefined) { const p = parseColor(v.bg); if (p) bgCandidates.push(composite(p, parent.bgRGB)); }
          for (const v of (parent.variants || [])) if (v.bg !== undefined) { const p = parseColor(v.bg); if (p) bgCandidates.push(composite(p, parent.bgRGB)); }
          const fgCandidates = [fg];
          for (const v of (st.variants || [])) if (v.fg !== undefined) fgCandidates.push(v.fg);

          const need = threshold(kind, inherited);
          let best = 0;
          for (const cb of bgCandidates) for (const cf of fgCandidates) {
            const f2 = parseColor(cf);
            if (!f2) continue;
            best = Math.max(best, contrast(cb, composite(f2, cb)));
          }
          const r = contrast(bgRGB, composite(pf, bgRGB));
          if (best < need) findings.push({
            file, line, kind, ratio: r, need, fg, bg,
            size: inherited.fontSize, bold: isBold(inherited),
            code: (lines[line - 1] || '').trim().slice(0, 78),
          });
        }
      }
    }
    if (!selfClose) stack.push({ bg, bgRGB, fg: (kind === 'text' && fg != null) ? fg : parent.fg, dyn, st: inherited, variants: st.variants });
  }
}

const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (['node_modules', '.git', '.expo', 'Assets', 'android', 'ios'].includes(e.name)) continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p); else if (/\.tsx$/.test(p)) files.push(p);
  }
})('Src');

for (const f of files) { try { auditFile(f); } catch (err) { console.error('parse-skip', f, err.message); } }

const seen = new Set(), uniq = [];
for (const f of findings.sort((a, b) => a.ratio - b.ratio)) {
  const k = `${f.file}:${f.line}:${f.kind}`;
  if (!seen.has(k)) { seen.add(k); uniq.push(f); }
}

console.log(`Scanned ${files.length} .tsx files.\n`);
if (!uniq.length) {
  console.log('PASS — no WCAG contrast violations.');
} else {
  const byFile = {};
  for (const f of uniq) (byFile[f.file] ??= []).push(f);
  console.log(`FAIL — ${uniq.length} violations in ${Object.keys(byFile).length} files\n`);
  for (const [file, list] of Object.entries(byFile)) {
    console.log(file.replace(/^Src\//, ''));
    for (const f of list) {
      const sev = f.ratio < 1.5 ? 'INVISIBLE' : f.ratio < 2.5 ? 'SEVERE   ' : 'FAIL     ';
      const meta = f.kind === 'text' ? `text ${f.size ?? '?'}px${f.bold ? ' bold' : ''}` : f.kind;
      console.log(`  ${sev} ${f.ratio.toFixed(2)}:1 (need ${f.need}) L${f.line}  [${meta}]`);
      console.log(`            fg=${f.fg}  bg=${f.bg}`);
      console.log(`            ${f.code}`);
    }
    console.log('');
  }
}
if (unknown.length) console.log(`\n${unknown.length} element(s) skipped — background is computed at runtime (avatar colours, toast types).`);
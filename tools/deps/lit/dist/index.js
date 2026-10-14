const H = globalThis; const T = H.ShadowRoot && (H.ShadyCSS === void 0 || H.ShadyCSS.nativeShadow) && 'adoptedStyleSheets' in Document.prototype && 'replace' in CSSStyleSheet.prototype; const J = Symbol(); const F = new WeakMap(); const R = class {
  constructor(t, e, s) { if (this._$cssResult$ = !0, s !== J) throw Error('CSSResult is not constructable. Use `unsafeCSS` or `css` instead.'); this.cssText = t, this.t = e; }

  get styleSheet() { let t = this.o; const e = this.t; if (T && t === void 0) { const s = e !== void 0 && e.length === 1; s && (t = F.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), s && F.set(e, t)); } return t; }

  toString() { return this.cssText; }
}; const G = (o) => new R(typeof o === 'string' ? o : `${o}`, void 0, J); const Q = (o, t) => { if (T)o.adoptedStyleSheets = t.map(((e) => (e instanceof CSSStyleSheet ? e : e.styleSheet))); else for (const e of t) { const s = document.createElement('style'); const i = H.litNonce; i !== void 0 && s.setAttribute('nonce', i), s.textContent = e.cssText, o.appendChild(s); } }; const L = T ? (o) => o : (o) => (o instanceof CSSStyleSheet ? ((t) => { let e = ''; for (const s of t.cssRules)e += s.cssText; return G(e); })(o) : o); const {
  is: dt, defineProperty: ut, getOwnPropertyDescriptor: $t, getOwnPropertyNames: _t, getOwnPropertySymbols: ft, getPrototypeOf: mt,
} = Object; const M = globalThis; const X = M.trustedTypes; const At = X ? X.emptyScript : ''; const gt = M.reactiveElementPolyfillSupport; const b = (o, t) => o; const k = { toAttribute(o, t) { switch (t) { case Boolean: o = o ? At : null; break; case Object: case Array: o = o == null ? o : JSON.stringify(o); } return o; }, fromAttribute(o, t) { let e = o; switch (t) { case Boolean: e = o !== null; break; case Number: e = o === null ? null : Number(o); break; case Object: case Array: try { e = JSON.parse(o); } catch { e = null; } } return e; } }; const tt = (o, t) => !dt(o, t); const Y = {
  attribute: !0, type: String, converter: k, reflect: !1, useDefault: !1, hasChanged: tt,
}; Symbol.metadata ??= Symbol('metadata'), M.litPropertyMetadata ??= new WeakMap(); const $ = class extends HTMLElement {
  static addInitializer(t) { this._$Ei(), (this.l ??= []).push(t); }

  static get observedAttributes() { return this.finalize(), this._$Eh && [...this._$Eh.keys()]; }

  static createProperty(t, e = Y) { if (e.state && (e.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((e = Object.create(e)).wrapped = !0), this.elementProperties.set(t, e), !e.noAccessor) { const s = Symbol(); const i = this.getPropertyDescriptor(t, s, e); i !== void 0 && ut(this.prototype, t, i); } }

  static getPropertyDescriptor(t, e, s) {
    const { get: i, set: r } = $t(this.prototype, t) ?? { get() { return this[e]; }, set(n) { this[e] = n; } }; return {
      get: i, set(n) { const l = i?.call(this); r?.call(this, n), this.requestUpdate(t, l, s); }, configurable: !0, enumerable: !0,
    };
  }

  static getPropertyOptions(t) { return this.elementProperties.get(t) ?? Y; }

  static _$Ei() { if (this.hasOwnProperty(b('elementProperties'))) return; const t = mt(this); t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties); }

  static finalize() { if (this.hasOwnProperty(b('finalized'))) return; if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(b('properties'))) { const e = this.properties; const s = [..._t(e), ...ft(e)]; for (const i of s) this.createProperty(i, e[i]); } const t = this[Symbol.metadata]; if (t !== null) { const e = litPropertyMetadata.get(t); if (e !== void 0) for (const [s, i] of e) this.elementProperties.set(s, i); } this._$Eh = new Map(); for (const [e, s] of this.elementProperties) { const i = this._$Eu(e, s); i !== void 0 && this._$Eh.set(i, e); } this.elementStyles = this.finalizeStyles(this.styles); }

  static finalizeStyles(t) { const e = []; if (Array.isArray(t)) { const s = new Set(t.flat(1 / 0).reverse()); for (const i of s)e.unshift(L(i)); } else t !== void 0 && e.push(L(t)); return e; }

  static _$Eu(t, e) { const s = e.attribute; return s === !1 ? void 0 : typeof s === 'string' ? s : typeof t === 'string' ? t.toLowerCase() : void 0; }

  constructor() { super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev(); }

  _$Ev() { this._$ES = new Promise(((t) => this.enableUpdating = t)), this._$AL = new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach(((t) => t(this))); }

  addController(t) { (this._$EO ??= new Set()).add(t), this.renderRoot !== void 0 && this.isConnected && t.hostConnected?.(); }

  removeController(t) { this._$EO?.delete(t); }

  _$E_() {
    const t = new Map(); const
      e = this.constructor.elementProperties; for (const s of e.keys()) this.hasOwnProperty(s) && (t.set(s, this[s]), delete this[s]); t.size > 0 && (this._$Ep = t);
  }

  createRenderRoot() { const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions); return Q(t, this.constructor.elementStyles), t; }

  connectedCallback() { this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach(((t) => t.hostConnected?.())); }

  enableUpdating(t) {}

  disconnectedCallback() { this._$EO?.forEach(((t) => t.hostDisconnected?.())); }

  attributeChangedCallback(t, e, s) { this._$AK(t, s); }

  _$ET(t, e) { const s = this.constructor.elementProperties.get(t); const i = this.constructor._$Eu(t, s); if (i !== void 0 && s.reflect === !0) { const r = (s.converter?.toAttribute !== void 0 ? s.converter : k).toAttribute(e, s.type); this._$Em = t, r == null ? this.removeAttribute(i) : this.setAttribute(i, r), this._$Em = null; } }

  _$AK(t, e) { const s = this.constructor; const i = s._$Eh.get(t); if (i !== void 0 && this._$Em !== i) { const r = s.getPropertyOptions(i); const n = typeof r.converter === 'function' ? { fromAttribute: r.converter } : r.converter?.fromAttribute !== void 0 ? r.converter : k; this._$Em = i; const l = n.fromAttribute(e, r.type); this[i] = l ?? this._$Ej?.get(i) ?? l, this._$Em = null; } }

  requestUpdate(t, e, s) { if (t !== void 0) { const i = this.constructor; const r = this[t]; if (s ??= i.getPropertyOptions(t), !((s.hasChanged ?? tt)(r, e) || s.useDefault && s.reflect && r === this._$Ej?.get(t) && !this.hasAttribute(i._$Eu(t, s)))) return; this.C(t, e, s); } this.isUpdatePending === !1 && (this._$ES = this._$EP()); }

  C(t, e, { useDefault: s, reflect: i, wrapped: r }, n) { s && !(this._$Ej ??= new Map()).has(t) && (this._$Ej.set(t, n ?? e ?? this[t]), r !== !0 || n !== void 0) || (this._$AL.has(t) || (this.hasUpdated || s || (e = void 0), this._$AL.set(t, e)), i === !0 && this._$Em !== t && (this._$Eq ??= new Set()).add(t)); }

  async _$EP() { this.isUpdatePending = !0; try { await this._$ES; } catch (e) { Promise.reject(e); } const t = this.scheduleUpdate(); return t != null && await t, !this.isUpdatePending; }

  scheduleUpdate() { return this.performUpdate(); }

  performUpdate() { if (!this.isUpdatePending) return; if (!this.hasUpdated) { if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) { for (const [i, r] of this._$Ep) this[i] = r; this._$Ep = void 0; } const s = this.constructor.elementProperties; if (s.size > 0) for (const [i, r] of s) { const { wrapped: n } = r; const l = this[i]; n !== !0 || this._$AL.has(i) || l === void 0 || this.C(i, void 0, r, l); } } let t = !1; const e = this._$AL; try { t = this.shouldUpdate(e), t ? (this.willUpdate(e), this._$EO?.forEach(((s) => s.hostUpdate?.())), this.update(e)) : this._$EM(); } catch (s) { throw t = !1, this._$EM(), s; }t && this._$AE(e); }

  willUpdate(t) {}

  _$AE(t) { this._$EO?.forEach(((e) => e.hostUpdated?.())), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t); }

  _$EM() { this._$AL = new Map(), this.isUpdatePending = !1; }

  get updateComplete() { return this.getUpdateComplete(); }

  getUpdateComplete() { return this._$ES; }

  shouldUpdate(t) { return !0; }

  update(t) { this._$Eq &&= this._$Eq.forEach(((e) => this._$ET(e, this[e]))), this._$EM(); }

  updated(t) {}

  firstUpdated(t) {}
}; $.elementStyles = [], $.shadowRootOptions = { mode: 'open' }, $[b('elementProperties')] = new Map(), $[b('finalized')] = new Map(), gt?.({ ReactiveElement: $ }), (M.reactiveElementVersions ??= []).push('2.1.1'); const W = globalThis; const N = W.trustedTypes; const et = N ? N.createPolicy('lit-html', { createHTML: (o) => o }) : void 0; const ht = '$lit$'; const f = `lit$${Math.random().toFixed(9).slice(2)}$`; const at = `?${f}`; const yt = `<${at}>`; const g = document; const w = () => g.createComment(''); const x = (o) => o === null || typeof o !== 'object' && typeof o !== 'function'; const q = Array.isArray; const vt = (o) => q(o) || typeof o?.[Symbol.iterator] === 'function'; const D = `[ 	
\f\r]`; const C = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g; const st = /-->/g; const it = />/g; const m = RegExp(`>|${D}(?:([^\\s"'>=/]+)(${D}*=${D}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, 'g'); const ot = /'/g; const rt = /"/g; const lt = /^(?:script|style|textarea|title)$/i; const K = (o) => (t, ...e) => ({ _$litType$: o, strings: t, values: e }); const St = K(1); const Ht = K(2); const Rt = K(3); const y = Symbol.for('lit-noChange'); const c = Symbol.for('lit-nothing'); const nt = new WeakMap(); const A = g.createTreeWalker(g, 129); function ct(o, t) { if (!q(o) || !o.hasOwnProperty('raw')) throw Error('invalid template strings array'); return et !== void 0 ? et.createHTML(t) : t; } const Et = (o, t) => { const e = o.length - 1; const s = []; let i; let r = t === 2 ? '<svg>' : t === 3 ? '<math>' : ''; let n = C; for (let l = 0; l < e; l++) { const h = o[l]; let p; let d; let a = -1; let u = 0; for (;u < h.length && (n.lastIndex = u, d = n.exec(h), d !== null);)u = n.lastIndex, n === C ? d[1] === '!--' ? n = st : d[1] !== void 0 ? n = it : d[2] !== void 0 ? (lt.test(d[2]) && (i = RegExp(`</${d[2]}`, 'g')), n = m) : d[3] !== void 0 && (n = m) : n === m ? d[0] === '>' ? (n = i ?? C, a = -1) : d[1] === void 0 ? a = -2 : (a = n.lastIndex - d[2].length, p = d[1], n = d[3] === void 0 ? m : d[3] === '"' ? rt : ot) : n === rt || n === ot ? n = m : n === st || n === it ? n = C : (n = m, i = void 0); const _ = n === m && o[l + 1].startsWith('/>') ? ' ' : ''; r += n === C ? h + yt : a >= 0 ? (s.push(p), h.slice(0, a) + ht + h.slice(a) + f + _) : h + f + (a === -2 ? l : _); } return [ct(o, r + (o[e] || '<?>') + (t === 2 ? '</svg>' : t === 3 ? '</math>' : '')), s]; }; const P = class o {
  constructor({ strings: t, _$litType$: e }, s) {
    let i; this.parts = []; let r = 0; let n = 0; const l = t.length - 1; const h = this.parts; const [p, d] = Et(t, e); if (this.el = o.createElement(p, s), A.currentNode = this.el.content, e === 2 || e === 3) { const a = this.el.content.firstChild; a.replaceWith(...a.childNodes); } for (;(i = A.nextNode()) !== null && h.length < l;) {
      if (i.nodeType === 1) {
        if (i.hasAttributes()) {
          for (const a of i.getAttributeNames()) {
            if (a.endsWith(ht)) {
              const u = d[n++]; const _ = i.getAttribute(a).split(f); const O = /([.?@])?(.*)/.exec(u); h.push({
                type: 1, index: r, name: O[2], strings: _, ctor: O[1] === '.' ? B : O[1] === '?' ? z : O[1] === '@' ? I : E,
              }), i.removeAttribute(a);
            } else a.startsWith(f) && (h.push({ type: 6, index: r }), i.removeAttribute(a));
          }
        } if (lt.test(i.tagName)) { const a = i.textContent.split(f); const u = a.length - 1; if (u > 0) { i.textContent = N ? N.emptyScript : ''; for (let _ = 0; _ < u; _++)i.append(a[_], w()), A.nextNode(), h.push({ type: 2, index: ++r }); i.append(a[u], w()); } }
      } else if (i.nodeType === 8) if (i.data === at)h.push({ type: 2, index: r }); else { let a = -1; for (;(a = i.data.indexOf(f, a + 1)) !== -1;)h.push({ type: 7, index: r }), a += f.length - 1; }r++;
    }
  }

  static createElement(t, e) { const s = g.createElement('template'); return s.innerHTML = t, s; }
}; function S(o, t, e = o, s) { if (t === y) return t; let i = s !== void 0 ? e._$Co?.[s] : e._$Cl; const r = x(t) ? void 0 : t._$litDirective$; return i?.constructor !== r && (i?._$AO?.(!1), r === void 0 ? i = void 0 : (i = new r(o), i._$AT(o, e, s)), s !== void 0 ? (e._$Co ??= [])[s] = i : e._$Cl = i), i !== void 0 && (t = S(o, i._$AS(o, t.values), i, s)), t; } const j = class {
  constructor(t, e) { this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = e; }

  get parentNode() { return this._$AM.parentNode; }

  get _$AU() { return this._$AM._$AU; }

  u(t) { const { el: { content: e }, parts: s } = this._$AD; const i = (t?.creationScope ?? g).importNode(e, !0); A.currentNode = i; let r = A.nextNode(); let n = 0; let l = 0; let h = s[0]; for (;h !== void 0;) { if (n === h.index) { let p; h.type === 2 ? p = new U(r, r.nextSibling, this, t) : h.type === 1 ? p = new h.ctor(r, h.name, h.strings, this, t) : h.type === 6 && (p = new V(r, this, t)), this._$AV.push(p), h = s[++l]; }n !== h?.index && (r = A.nextNode(), n++); } return A.currentNode = g, i; }

  p(t) { let e = 0; for (const s of this._$AV)s !== void 0 && (s.strings !== void 0 ? (s._$AI(t, s, e), e += s.strings.length - 2) : s._$AI(t[e])), e++; }
}; var U = class o {
  get _$AU() { return this._$AM?._$AU ?? this._$Cv; }

  constructor(t, e, s, i) { this.type = 2, this._$AH = c, this._$AN = void 0, this._$AA = t, this._$AB = e, this._$AM = s, this.options = i, this._$Cv = i?.isConnected ?? !0; }

  get parentNode() { let t = this._$AA.parentNode; const e = this._$AM; return e !== void 0 && t?.nodeType === 11 && (t = e.parentNode), t; }

  get startNode() { return this._$AA; }

  get endNode() { return this._$AB; }

  _$AI(t, e = this) { t = S(this, t, e), x(t) ? t === c || t == null || t === '' ? (this._$AH !== c && this._$AR(), this._$AH = c) : t !== this._$AH && t !== y && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : vt(t) ? this.k(t) : this._(t); }

  O(t) { return this._$AA.parentNode.insertBefore(t, this._$AB); }

  T(t) { this._$AH !== t && (this._$AR(), this._$AH = this.O(t)); }

  _(t) { this._$AH !== c && x(this._$AH) ? this._$AA.nextSibling.data = t : this.T(g.createTextNode(t)), this._$AH = t; }

  $(t) { const { values: e, _$litType$: s } = t; const i = typeof s === 'number' ? this._$AC(t) : (s.el === void 0 && (s.el = P.createElement(ct(s.h, s.h[0]), this.options)), s); if (this._$AH?._$AD === i) this._$AH.p(e); else { const r = new j(i, this); const n = r.u(this.options); r.p(e), this.T(n), this._$AH = r; } }

  _$AC(t) { let e = nt.get(t.strings); return e === void 0 && nt.set(t.strings, e = new P(t)), e; }

  k(t) { q(this._$AH) || (this._$AH = [], this._$AR()); const e = this._$AH; let s; let i = 0; for (const r of t)i === e.length ? e.push(s = new o(this.O(w()), this.O(w()), this, this.options)) : s = e[i], s._$AI(r), i++; i < e.length && (this._$AR(s && s._$AB.nextSibling, i), e.length = i); }

  _$AR(t = this._$AA.nextSibling, e) { for (this._$AP?.(!1, !0, e); t !== this._$AB;) { const s = t.nextSibling; t.remove(), t = s; } }

  setConnected(t) { this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t)); }
}; var E = class {
  get tagName() { return this.element.tagName; }

  get _$AU() { return this._$AM._$AU; }

  constructor(t, e, s, i, r) { this.type = 1, this._$AH = c, this._$AN = void 0, this.element = t, this.name = e, this._$AM = i, this.options = r, s.length > 2 || s[0] !== '' || s[1] !== '' ? (this._$AH = Array(s.length - 1).fill(new String()), this.strings = s) : this._$AH = c; }

  _$AI(t, e = this, s, i) { const r = this.strings; let n = !1; if (r === void 0)t = S(this, t, e, 0), n = !x(t) || t !== this._$AH && t !== y, n && (this._$AH = t); else { const l = t; let h; let p; for (t = r[0], h = 0; h < r.length - 1; h++)p = S(this, l[s + h], e, h), p === y && (p = this._$AH[h]), n ||= !x(p) || p !== this._$AH[h], p === c ? t = c : t !== c && (t += (p ?? '') + r[h + 1]), this._$AH[h] = p; }n && !i && this.j(t); }

  j(t) { t === c ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? ''); }
}; var B = class extends E {
  constructor() { super(...arguments), this.type = 3; }

  j(t) { this.element[this.name] = t === c ? void 0 : t; }
}; var z = class extends E {
  constructor() { super(...arguments), this.type = 4; }

  j(t) { this.element.toggleAttribute(this.name, !!t && t !== c); }
}; var I = class extends E {
  constructor(t, e, s, i, r) { super(t, e, s, i, r), this.type = 5; }

  _$AI(t, e = this) { if ((t = S(this, t, e, 0) ?? c) === y) return; const s = this._$AH; const i = t === c && s !== c || t.capture !== s.capture || t.once !== s.once || t.passive !== s.passive; const r = t !== c && (s === c || i); i && this.element.removeEventListener(this.name, this, s), r && this.element.addEventListener(this.name, this, t), this._$AH = t; }

  handleEvent(t) { typeof this._$AH === 'function' ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t); }
}; var V = class {
  constructor(t, e, s) { this.element = t, this.type = 6, this._$AN = void 0, this._$AM = e, this.options = s; }

  get _$AU() { return this._$AM._$AU; }

  _$AI(t) { S(this, t); }
}; const bt = W.litHtmlPolyfillSupport; bt?.(P, U), (W.litHtmlVersions ??= []).push('3.3.1'); const pt = (o, t, e) => { const s = e?.renderBefore ?? t; let i = s._$litPart$; if (i === void 0) { const r = e?.renderBefore ?? null; s._$litPart$ = i = new U(t.insertBefore(w(), r), r, void 0, e ?? {}); } return i._$AI(o), i; }; const Z = globalThis; const v = class extends $ {
  constructor() { super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0; }

  createRenderRoot() { const t = super.createRenderRoot(); return this.renderOptions.renderBefore ??= t.firstChild, t; }

  update(t) { const e = this.render(); this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = pt(e, this.renderRoot, this.renderOptions); }

  connectedCallback() { super.connectedCallback(), this._$Do?.setConnected(!0); }

  disconnectedCallback() { super.disconnectedCallback(), this._$Do?.setConnected(!1); }

  render() { return y; }
}; v._$litElement$ = !0, v.finalized = !0, Z.litElementHydrateSupport?.({ LitElement: v }); const Ct = Z.litElementPolyfillSupport; Ct?.({ LitElement: v }); (Z.litElementVersions ??= []).push('4.2.1'); export { v as LitElement, St as html, c as nothing };
/*! Bundled license information:

@lit/reactive-element/css-tag.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/reactive-element.js:
lit-html/lit-html.js:
lit-element/lit-element.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/is-server.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/

/*
 * Levotrade standalone runtime
 * ----------------------------
 * Renders the design-canvas screens (x-dc markup + DCLogic class) in any normal
 * browser, without the canvas environment. Needs window.React, window.ReactDOM
 * and window.Levotrade (the design-system bundle) to be loaded first.
 *
 * Supported markup:
 *   <x-import component-from-global-scope="Levotrade.X" prop="{{hole}}">  -> React component
 *   <sc-if value="{{hole}}">…</sc-if>                                    -> conditional block
 *   <helmet>…</helmet>                                                   -> styles moved into <head>
 *   attr="{{path.to.value}}" / text {{hole}}                             -> values from renderVals()
 */
(function () {
  'use strict';
  var React = window.React;
  var h = React.createElement;
  var FULL = /^\s*\{\{\s*([^}]+?)\s*\}\}\s*$/;
  var HOLE = /\{\{\s*([^}]+?)\s*\}\}/g;

  function get(obj, path) {
    return String(path).split('.').reduce(function (o, k) { return o == null ? undefined : o[k]; }, obj);
  }
  function resolve(str, vals) {
    var m = str.match(FULL);
    if (m) return get(vals, m[1]);
    if (str.indexOf('{{') < 0) return str;
    return str.replace(HOLE, function (_, p) {
      var v = get(vals, p);
      return v == null || v === false ? '' : String(v);
    });
  }
  function camel(s) { return s.replace(/-([a-z])/g, function (_, c) { return c.toUpperCase(); }); }
  function styleObj(str) {
    if (!str || typeof str !== 'string') return str;
    var out = {};
    str.split(';').forEach(function (decl) {
      var i = decl.indexOf(':');
      if (i < 0) return;
      var k = decl.slice(0, i).trim();
      var v = decl.slice(i + 1).trim();
      if (!k) return;
      out[k.indexOf('--') === 0 ? k : camel(k)] = v;
    });
    return out;
  }
  var DOM_RENAME = { 'class': 'className', 'for': 'htmlFor', tabindex: 'tabIndex', readonly: 'readOnly', colspan: 'colSpan', rowspan: 'rowSpan', viewbox: 'viewBox' };

  function buildChildren(node, vals) {
    var out = [];
    node.childNodes.forEach(function (c) {
      var el = build(c, vals);
      if (el === null || el === undefined) return;
      if (Array.isArray(el)) out.push.apply(out, el); else out.push(el);
    });
    return out;
  }

  function build(node, vals) {
    if (node.nodeType === 3) {
      var t = node.nodeValue;
      if (!t.trim() && t.indexOf('\n') >= 0) return null;
      var r = resolve(t, vals);
      return r == null || r === false ? null : r;
    }
    if (node.nodeType !== 1) return null;
    var tag = node.localName;
    if (tag === 'helmet' || tag === 'script') return null;

    if (tag === 'sc-if') {
      var cond = resolve(node.getAttribute('value') || '', vals);
      return cond ? buildChildren(node, vals) : null;
    }

    var props = {};
    var children = buildChildren(node, vals);

    if (tag === 'x-import') {
      var name = node.getAttribute('component-from-global-scope') || '';
      var Comp = get(window, name);
      Array.prototype.forEach.call(node.attributes, function (a) {
        if (a.name === 'component-from-global-scope' || a.name.indexOf('hint-') === 0) return;
        var v = resolve(a.value, vals);
        if (a.name === 'class') props.className = v;
        else if (a.name === 'style') props.style = styleObj(v);
        else {
          props[camel(a.name)] = v;
          if (a.name.indexOf('aria-') === 0 || a.name.indexOf('data-') === 0) props[a.name] = v;
        }
      });
      if (!Comp) {
        return h('div', { style: { padding: 8, border: '1px dashed #c33', color: '#c33', font: '12px monospace' } }, 'Missing component: ' + name);
      }
      return h.apply(null, [Comp, props].concat(children));
    }

    Array.prototype.forEach.call(node.attributes, function (a) {
      if (a.name.indexOf('hint-') === 0) return;
      var v = resolve(a.value, vals);
      if (a.name === 'style') props.style = styleObj(v);
      else if (DOM_RENAME[a.name]) props[DOM_RENAME[a.name]] = v;
      else if (a.name.indexOf('on-') === 0) props[camel(a.name)] = v;
      else props[a.name] = v;
    });
    return h.apply(null, [tag, props].concat(children));
  }

  function DCLogic(props) { React.Component.call(this, props); }
  DCLogic.prototype = Object.create(React.Component.prototype);
  DCLogic.prototype.constructor = DCLogic;
  DCLogic.prototype.renderVals = function () { return {}; };
  DCLogic.prototype.render = function () {
    var tpl = this.constructor.__template;
    var vals = this.renderVals() || {};
    return h.apply(null, [React.Fragment, null].concat(buildChildren(tpl, vals)));
  };

  function mount(opts) {
    opts = opts || {};
    var tplEl = document.getElementById(opts.templateId || 'dc-template');
    var logicEl = document.getElementById(opts.logicId || 'dc-logic');
    var root = tplEl.content || tplEl;

    // move <helmet> styles into <head>
    root.querySelectorAll('helmet').forEach(function (hm) {
      hm.querySelectorAll('style, link').forEach(function (s) { document.head.appendChild(s.cloneNode(true)); });
    });

    var Component = new Function('DCLogic', 'React', logicEl.textContent + '\n;return Component;')(DCLogic, React);
    Component.__template = root;

    var defaults = {};
    try {
      var schema = JSON.parse(logicEl.getAttribute('data-props') || '{}');
      Object.keys(schema).forEach(function (k) {
        if (k.charAt(0) !== '$' && schema[k] && 'default' in schema[k]) defaults[k] = schema[k]['default'];
      });
    } catch (e) {}
    var props = Object.assign(defaults, opts.props || {});
    try {
      var q = new URLSearchParams(window.location.search).get('screen');
      if (q) props.startScreen = q;
    } catch (e) {}

    var container = document.getElementById(opts.rootId || 'root');
    var el = h(Component, props);
    if (window.ReactDOM.createRoot) window.ReactDOM.createRoot(container).render(el);
    else window.ReactDOM.render(el, container);
  }

  window.LevoRuntime = { mount: mount, DCLogic: DCLogic };
})();

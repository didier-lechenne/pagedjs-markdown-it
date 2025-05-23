/**
 * Minified by jsDelivr using Terser v5.15.1.
 * Original file: /npm/markdown-it-attrs@4.1.6/markdown-it-attrs.browser.js
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
! function(t) {
    if ("object" == typeof exports && "undefined" != typeof module) module.exports = t();
    else if ("function" == typeof define && define.amd) define([], t);
    else {
        ("undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : this).markdownItAttrs = t()
    }
}((function() {
    return function t(e, n, r) {
        function i(l, s) {
            if (!n[l]) {
                if (!e[l]) {
                    var f = "function" == typeof require && require;
                    if (!s && f) return f(l, !0);
                    if (o) return o(l, !0);
                    var a = new Error("Cannot find module '" + l + "'");
                    throw a.code = "MODULE_NOT_FOUND", a
                }
                var c = n[l] = {
                    exports: {}
                };
                e[l][0].call(c.exports, (function(t) {
                    return i(e[l][1][t] || t)
                }), c, c.exports, t, e, n, r)
            }
            return n[l].exports
        }
        for (var o = "function" == typeof require && require, l = 0; l < r.length; l++) i(r[l]);
        return i
    }({
        1: [function(t, e, n) {
            "use strict";

            function r(t) {
                return r = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(t) {
                    return typeof t
                } : function(t) {
                    return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
                }, r(t)
            }
            var i = t("./patterns.js"),
                o = {
                    leftDelimiter: "{",
                    rightDelimiter: "}",
                    allowedAttributes: []
                };

            function l(t, e, n) {
                var i = {
                        match: !1,
                        j: null
                    },
                    o = void 0 !== n.shift ? e + n.shift : n.position;
                if (void 0 !== n.shift && o < 0) return i;
                var s, f, a = (s = t, (f = o) >= 0 ? s[f] : s[s.length + f]);
                if (void 0 === a) return i;
                for (var c = function() {
                        var t = h[u];
                        if ("shift" === t || "position" === t) return "continue";
                        if (void 0 === a[t]) return {
                            v: i
                        };
                        if ("children" === t && function(t) {
                                return Array.isArray(t) && t.length && t.every((function(t) {
                                    return "object" === r(t)
                                }))
                            }(n.children)) {
                            var e = function() {
                                if (0 === a.children.length) return {
                                    v: {
                                        v: i
                                    }
                                };
                                var t, e = n.children,
                                    r = a.children;
                                if (e.every((function(t) {
                                        return void 0 !== t.position
                                    }))) {
                                    if (t = e.every((function(t) {
                                            return l(r, t.position, t).match
                                        }))) {
                                        var o = function(t) {
                                            return t.slice(-1)[0] || {}
                                        }(e).position;
                                        i.j = o >= 0 ? o : r.length + o
                                    }
                                } else
                                    for (var s = function(n) {
                                            if (t = e.every((function(t) {
                                                    return l(r, n, t).match
                                                }))) return i.j = n, "break"
                                        }, f = 0; f < r.length; f++) {
                                        if ("break" === s(f)) break
                                    }
                                return !1 === t ? {
                                    v: {
                                        v: i
                                    }
                                } : {
                                    v: "continue"
                                }
                            }();
                            if ("object" === r(e)) return e.v
                        }
                        switch (r(n[t])) {
                            case "boolean":
                            case "number":
                            case "string":
                                if (a[t] !== n[t]) return {
                                    v: i
                                };
                                break;
                            case "function":
                                if (!n[t](a[t])) return {
                                    v: i
                                };
                                break;
                            case "object":
                                if (function(t) {
                                        return Array.isArray(t) && t.length && t.every((function(t) {
                                            return "function" == typeof t
                                        }))
                                    }(n[t])) {
                                    if (!1 === n[t].every((function(e) {
                                            return e(a[t])
                                        }))) return {
                                        v: i
                                    };
                                    break
                                }
                            default:
                                throw new Error("Unknown type of pattern test (key: ".concat(t, "). Test should be of type boolean, number, string, function or array of functions."))
                        }
                    }, u = 0, h = Object.keys(n); u < h.length; u++) {
                    var p = c();
                    if ("continue" !== p && "object" === r(p)) return p.v
                }
                return i.match = !0, i
            }
            e.exports = function(t, e) {
                var n = Object.assign({}, o);
                n = Object.assign(n, e);
                var r = i(n);
                t.core.ruler.before("linkify", "curly_attributes", (function(t) {
                    for (var e = t.tokens, n = function(t) {
                            for (var n = 0; n < r.length; n++) {
                                var i = r[n],
                                    o = null;
                                i.tests.every((function(n) {
                                    var r = l(e, t, n);
                                    return null !== r.j && (o = r.j), r.match
                                })) && (i.transform(e, t, o), "inline attributes" !== i.name && "inline nesting 0" !== i.name || n--)
                            }
                        }, i = 0; i < e.length; i++) n(i)
                }))
            }
        }, {
            "./patterns.js": 2
        }],
        2: [function(t, e, n) {
            "use strict";
            var r = t("./utils.js");

            function i(t) {
                return t.slice(-1)[0]
            }
            e.exports = function(t) {
                var e = new RegExp("^ {0,3}[-*_]{3,} ?" + r.escapeRegExp(t.leftDelimiter) + "[^" + r.escapeRegExp(t.rightDelimiter) + "]");
                return [{
                    name: "fenced code blocks",
                    tests: [{
                        shift: 0,
                        block: !0,
                        info: r.hasDelimiters("end", t)
                    }],
                    transform: function(e, n) {
                        var i = e[n],
                            o = i.info.lastIndexOf(t.leftDelimiter),
                            l = r.getAttrs(i.info, o, t);
                        r.addAttrs(l, i), i.info = r.removeDelimiter(i.info, t)
                    }
                }, {
                    name: "inline nesting 0",
                    tests: [{
                        shift: 0,
                        type: "inline",
                        children: [{
                            shift: -1,
                            type: function(t) {
                                return "image" === t || "code_inline" === t
                            }
                        }, {
                            shift: 0,
                            type: "text",
                            content: r.hasDelimiters("start", t)
                        }]
                    }],
                    transform: function(e, n, i) {
                        var o = e[n].children[i],
                            l = o.content.indexOf(t.rightDelimiter),
                            s = e[n].children[i - 1],
                            f = r.getAttrs(o.content, 0, t);
                        r.addAttrs(f, s), o.content.length === l + t.rightDelimiter.length ? e[n].children.splice(i, 1) : o.content = o.content.slice(l + t.rightDelimiter.length)
                    }
                }, {
                    name: "tables",
                    tests: [{
                        shift: 0,
                        type: "table_close"
                    }, {
                        shift: 1,
                        type: "paragraph_open"
                    }, {
                        shift: 2,
                        type: "inline",
                        content: r.hasDelimiters("only", t)
                    }],
                    transform: function(e, n) {
                        var i = e[n + 2],
                            o = r.getMatchingOpeningToken(e, n),
                            l = r.getAttrs(i.content, 0, t);
                        r.addAttrs(l, o), e.splice(n + 1, 3)
                    }
                }, {
                    name: "inline attributes",
                    tests: [{
                        shift: 0,
                        type: "inline",
                        children: [{
                            shift: -1,
                            nesting: -1
                        }, {
                            shift: 0,
                            type: "text",
                            content: r.hasDelimiters("start", t)
                        }]
                    }],
                    transform: function(e, n, i) {
                        var o = e[n].children[i],
                            l = o.content,
                            s = r.getAttrs(l, 0, t),
                            f = r.getMatchingOpeningToken(e[n].children, i - 1);
                        r.addAttrs(s, f), o.content = l.slice(l.indexOf(t.rightDelimiter) + t.rightDelimiter.length)
                    }
                }, {
                    name: "list softbreak",
                    tests: [{
                        shift: -2,
                        type: "list_item_open"
                    }, {
                        shift: 0,
                        type: "inline",
                        children: [{
                            position: -2,
                            type: "softbreak"
                        }, {
                            position: -1,
                            type: "text",
                            content: r.hasDelimiters("only", t)
                        }]
                    }],
                    transform: function(e, n, i) {
                        for (var o = e[n].children[i].content, l = r.getAttrs(o, 0, t), s = n - 2; e[s - 1] && "ordered_list_open" !== e[s - 1].type && "bullet_list_open" !== e[s - 1].type;) s--;
                        r.addAttrs(l, e[s - 1]), e[n].children = e[n].children.slice(0, -2)
                    }
                }, {
                    name: "list double softbreak",
                    tests: [{
                        shift: 0,
                        type: function(t) {
                            return "bullet_list_close" === t || "ordered_list_close" === t
                        }
                    }, {
                        shift: 1,
                        type: "paragraph_open"
                    }, {
                        shift: 2,
                        type: "inline",
                        content: r.hasDelimiters("only", t),
                        children: function(t) {
                            return 1 === t.length
                        }
                    }, {
                        shift: 3,
                        type: "paragraph_close"
                    }],
                    transform: function(e, n) {
                        var i = e[n + 2].content,
                            o = r.getAttrs(i, 0, t),
                            l = r.getMatchingOpeningToken(e, n);
                        r.addAttrs(o, l), e.splice(n + 1, 3)
                    }
                }, {
                    name: "list item end",
                    tests: [{
                        shift: -2,
                        type: "list_item_open"
                    }, {
                        shift: 0,
                        type: "inline",
                        children: [{
                            position: -1,
                            type: "text",
                            content: r.hasDelimiters("end", t)
                        }]
                    }],
                    transform: function(e, n, o) {
                        var l = e[n].children[o],
                            s = l.content,
                            f = r.getAttrs(s, s.lastIndexOf(t.leftDelimiter), t);
                        r.addAttrs(f, e[n - 2]);
                        var a = s.slice(0, s.lastIndexOf(t.leftDelimiter));
                        l.content = " " !== i(a) ? a : a.slice(0, -1)
                    }
                }, {
                    name: "\n{.a} softbreak then curly in start",
                    tests: [{
                        shift: 0,
                        type: "inline",
                        children: [{
                            position: -2,
                            type: "softbreak"
                        }, {
                            position: -1,
                            type: "text",
                            content: r.hasDelimiters("only", t)
                        }]
                    }],
                    transform: function(e, n, i) {
                        for (var o = e[n].children[i], l = r.getAttrs(o.content, 0, t), s = n + 1; e[s + 1] && -1 === e[s + 1].nesting;) s++;
                        var f = r.getMatchingOpeningToken(e, s);
                        r.addAttrs(l, f), e[n].children = e[n].children.slice(0, -2)
                    }
                }, {
                    name: "horizontal rule",
                    tests: [{
                        shift: 0,
                        type: "paragraph_open"
                    }, {
                        shift: 1,
                        type: "inline",
                        children: function(t) {
                            return 1 === t.length
                        },
                        content: function(t) {
                            return null !== t.match(e)
                        }
                    }, {
                        shift: 2,
                        type: "paragraph_close"
                    }],
                    transform: function(e, n) {
                        var i = e[n];
                        i.type = "hr", i.tag = "hr", i.nesting = 0;
                        var o = e[n + 1].content,
                            l = o.lastIndexOf(t.leftDelimiter),
                            s = r.getAttrs(o, l, t);
                        r.addAttrs(s, i), i.markup = o, e.splice(n + 1, 2)
                    }
                }, {
                    name: "end of block",
                    tests: [{
                        shift: 0,
                        type: "inline",
                        children: [{
                            position: -1,
                            content: r.hasDelimiters("end", t),
                            type: function(t) {
                                return "code_inline" !== t && "math_inline" !== t
                            }
                        }]
                    }],
                    transform: function(e, n, o) {
                        for (var l = e[n].children[o], s = l.content, f = r.getAttrs(s, s.lastIndexOf(t.leftDelimiter), t), a = n + 1; e[a + 1] && -1 === e[a + 1].nesting;) a++;
                        var c = r.getMatchingOpeningToken(e, a);
                        r.addAttrs(f, c);
                        var u = s.slice(0, s.lastIndexOf(t.leftDelimiter));
                        l.content = " " !== i(u) ? u : u.slice(0, -1)
                    }
                }]
            }
        }, {
            "./utils.js": 3
        }],
        3: [function(t, e, n) {
            "use strict";

            function r(t) {
                return t.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")
            }
            n.getAttrs = function(t, e, n) {
                for (var r = /[^\t\n\f />"'=]/, i = [], o = "", l = "", s = !0, f = !1, a = e + n.leftDelimiter.length; a < t.length; a++) {
                    if (t.slice(a, a + n.rightDelimiter.length) === n.rightDelimiter) {
                        "" !== o && i.push([o, l]);
                        break
                    }
                    var c = t.charAt(a);
                    if ("=" === c && s) s = !1;
                    else if ("." !== c || "" !== o)
                        if ("#" !== c || "" !== o)
                            if ('"' !== c || "" !== l || f)
                                if ('"' === c && f) f = !1;
                                else if (" " !== c || f) s && -1 === c.search(r) || (s ? o += c : l += c);
                    else {
                        if ("" === o) continue;
                        i.push([o, l]), o = "", l = "", s = !0
                    } else f = !0;
                    else o = "id", s = !1;
                    else "." === t.charAt(a + 1) ? (o = "css-module", a += 1) : o = "class", s = !1
                }
                if (n.allowedAttributes && n.allowedAttributes.length) {
                    var u = n.allowedAttributes;
                    return i.filter((function(t) {
                        var e = t[0];
                        return u.some((function(t) {
                            return e === t || t instanceof RegExp && t.test(e)
                        }))
                    }))
                }
                return i
            }, n.addAttrs = function(t, e) {/**
 * Minified by jsDelivr using Terser v5.15.1.
 * Original file: /npm/markdown-it-attrs@4.1.6/markdown-it-attrs.browser.js
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
! function(t) {
    if ("object" == typeof exports && "undefined" != typeof module) module.exports = t();
    else if ("function" == typeof define && define.amd) define([], t);
    else {
        ("undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : this).markdownItAttrs = t()
    }
}((function() {
    return function t(e, n, r) {
        function i(l, s) {
            if (!n[l]) {
                if (!e[l]) {
                    var f = "function" == typeof require && require;
                    if (!s && f) return f(l, !0);
                    if (o) return o(l, !0);
                    var a = new Error("Cannot find module '" + l + "'");
                    throw a.code = "MODULE_NOT_FOUND", a
                }
                var c = n[l] = {
                    exports: {}
                };
                e[l][0].call(c.exports, (function(t) {
                    return i(e[l][1][t] || t)
                }), c, c.exports, t, e, n, r)
            }
            return n[l].exports
        }
        for (var o = "function" == typeof require && require, l = 0; l < r.length; l++) i(r[l]);
        return i
    }({
        1: [function(t, e, n) {
            "use strict";

            function r(t) {
                return r = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(t) {
                    return typeof t
                } : function(t) {
                    return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
                }, r(t)
            }
            var i = t("./patterns.js"),
                o = {
                    leftDelimiter: "{",
                    rightDelimiter: "}",
                    allowedAttributes: []
                };

            function l(t, e, n) {
                var i = {
                        match: !1,
                        j: null
                    },
                    o = void 0 !== n.shift ? e + n.shift : n.position;
                if (void 0 !== n.shift && o < 0) return i;
                var s, f, a = (s = t, (f = o) >= 0 ? s[f] : s[s.length + f]);
                if (void 0 === a) return i;
                for (var c = function() {
                        var t = h[u];
                        if ("shift" === t || "position" === t) return "continue";
                        if (void 0 === a[t]) return {
                            v: i
                        };
                        if ("children" === t && function(t) {
                                return Array.isArray(t) && t.length && t.every((function(t) {
                                    return "object" === r(t)
                                }))
                            }(n.children)) {
                            var e = function() {
                                if (0 === a.children.length) return {
                                    v: {
                                        v: i
                                    }
                                };
                                var t, e = n.children,
                                    r = a.children;
                                if (e.every((function(t) {
                                        return void 0 !== t.position
                                    }))) {
                                    if (t = e.every((function(t) {
                                            return l(r, t.position, t).match
                                        }))) {
                                        var o = function(t) {
                                            return t.slice(-1)[0] || {}
                                        }(e).position;
                                        i.j = o >= 0 ? o : r.length + o
                                    }
                                } else
                                    for (var s = function(n) {
                                            if (t = e.every((function(t) {
                                                    return l(r, n, t).match
                                                }))) return i.j = n, "break"
                                        }, f = 0; f < r.length; f++) {
                                        if ("break" === s(f)) break
                                    }
                                return !1 === t ? {
                                    v: {
                                        v: i
                                    }
                                } : {
                                    v: "continue"
                                }
                            }();
                            if ("object" === r(e)) return e.v
                        }
                        switch (r(n[t])) {
                            case "boolean":
                            case "number":
                            case "string":
                                if (a[t] !== n[t]) return {
                                    v: i
                                };
                                break;
                            case "function":
                                if (!n[t](a[t])) return {
                                    v: i
                                };
                                break;
                            case "object":
                                if (function(t) {
                                        return Array.isArray(t) && t.length && t.every((function(t) {
                                            return "function" == typeof t
                                        }))
                                    }(n[t])) {
                                    if (!1 === n[t].every((function(e) {
                                            return e(a[t])
                                        }))) return {
                                        v: i
                                    };
                                    break
                                }
                            default:
                                throw new Error("Unknown type of pattern test (key: ".concat(t, "). Test should be of type boolean, number, string, function or array of functions."))
                        }
                    }, u = 0, h = Object.keys(n); u < h.length; u++) {
                    var p = c();
                    if ("continue" !== p && "object" === r(p)) return p.v
                }
                return i.match = !0, i
            }
            e.exports = function(t, e) {
                var n = Object.assign({}, o);
                n = Object.assign(n, e);
                var r = i(n);
                t.core.ruler.before("linkify", "curly_attributes", (function(t) {
                    for (var e = t.tokens, n = function(t) {
                            for (var n = 0; n < r.length; n++) {
                                var i = r[n],
                                    o = null;
                                i.tests.every((function(n) {
                                    var r = l(e, t, n);
                                    return null !== r.j && (o = r.j), r.match
                                })) && (i.transform(e, t, o), "inline attributes" !== i.name && "inline nesting 0" !== i.name || n--)
                            }
                        }, i = 0; i < e.length; i++) n(i)
                }))
            }
        }, {
            "./patterns.js": 2
        }],
        2: [function(t, e, n) {
            "use strict";
            var r = t("./utils.js");

            function i(t) {
                return t.slice(-1)[0]
            }
            e.exports = function(t) {
                var e = new RegExp("^ {0,3}[-*_]{3,} ?" + r.escapeRegExp(t.leftDelimiter) + "[^" + r.escapeRegExp(t.rightDelimiter) + "]");
                return [{
                    name: "fenced code blocks",
                    tests: [{
                        shift: 0,
                        block: !0,
                        info: r.hasDelimiters("end", t)
                    }],
                    transform: function(e, n) {
                        var i = e[n],
                            o = i.info.lastIndexOf(t.leftDelimiter),
                            l = r.getAttrs(i.info, o, t);
                        r.addAttrs(l, i), i.info = r.removeDelimiter(i.info, t)
                    }
                }, {
                    name: "inline nesting 0",
                    tests: [{
                        shift: 0,
                        type: "inline",
                        children: [{
                            shift: -1,
                            type: function(t) {
                                return "image" === t || "code_inline" === t
                            }
                        }, {
                            shift: 0,
                            type: "text",
                            content: r.hasDelimiters("start", t)
                        }]
                    }],
                    transform: function(e, n, i) {
                        var o = e[n].children[i],
                            l = o.content.indexOf(t.rightDelimiter),
                            s = e[n].children[i - 1],
                            f = r.getAttrs(o.content, 0, t);
                        r.addAttrs(f, s), o.content.length === l + t.rightDelimiter.length ? e[n].children.splice(i, 1) : o.content = o.content.slice(l + t.rightDelimiter.length)
                    }
                }, {
                    name: "tables",
                    tests: [{
                        shift: 0,
                        type: "table_close"
                    }, {
                        shift: 1,
                        type: "paragraph_open"
                    }, {
                        shift: 2,
                        type: "inline",
                        content: r.hasDelimiters("only", t)
                    }],
                    transform: function(e, n) {
                        var i = e[n + 2],
                            o = r.getMatchingOpeningToken(e, n),
                            l = r.getAttrs(i.content, 0, t);
                        r.addAttrs(l, o), e.splice(n + 1, 3)
                    }
                }, {
                    name: "inline attributes",
                    tests: [{
                        shift: 0,
                        type: "inline",
                        children: [{
                            shift: -1,
                            nesting: -1
                        }, {
                            shift: 0,
                            type: "text",
                            content: r.hasDelimiters("start", t)
                        }]
                    }],
                    transform: function(e, n, i) {
                        var o = e[n].children[i],
                            l = o.content,
                            s = r.getAttrs(l, 0, t),
                            f = r.getMatchingOpeningToken(e[n].children, i - 1);
                        r.addAttrs(s, f), o.content = l.slice(l.indexOf(t.rightDelimiter) + t.rightDelimiter.length)
                    }
                }, {
                    name: "list softbreak",
                    tests: [{
                        shift: -2,
                        type: "list_item_open"
                    }, {
                        shift: 0,
                        type: "inline",
                        children: [{
                            position: -2,
                            type: "softbreak"
                        }, {
                            position: -1,
                            type: "text",
                            content: r.hasDelimiters("only", t)
                        }]
                    }],
                    transform: function(e, n, i) {
                        for (var o = e[n].children[i].content, l = r.getAttrs(o, 0, t), s = n - 2; e[s - 1] && "ordered_list_open" !== e[s - 1].type && "bullet_list_open" !== e[s - 1].type;) s--;
                        r.addAttrs(l, e[s - 1]), e[n].children = e[n].children.slice(0, -2)
                    }
                }, {
                    name: "list double softbreak",
                    tests: [{
                        shift: 0,
                        type: function(t) {
                            return "bullet_list_close" === t || "ordered_list_close" === t
                        }
                    }, {
                        shift: 1,
                        type: "paragraph_open"
                    }, {
                        shift: 2,
                        type: "inline",
                        content: r.hasDelimiters("only", t),
                        children: function(t) {
                            return 1 === t.length
                        }
                    }, {
                        shift: 3,
                        type: "paragraph_close"
                    }],
                    transform: function(e, n) {
                        var i = e[n + 2].content,
                            o = r.getAttrs(i, 0, t),
                            l = r.getMatchingOpeningToken(e, n);
                        r.addAttrs(o, l), e.splice(n + 1, 3)
                    }
                }, {
                    name: "list item end",
                    tests: [{
                        shift: -2,
                        type: "list_item_open"
                    }, {
                        shift: 0,
                        type: "inline",
                        children: [{
                            position: -1,
                            type: "text",
                            content: r.hasDelimiters("end", t)
                        }]
                    }],
                    transform: function(e, n, o) {
                        var l = e[n].children[o],
                            s = l.content,
                            f = r.getAttrs(s, s.lastIndexOf(t.leftDelimiter), t);
                        r.addAttrs(f, e[n - 2]);
                        var a = s.slice(0, s.lastIndexOf(t.leftDelimiter));
                        l.content = " " !== i(a) ? a : a.slice(0, -1)
                    }
                }, {
                    name: "\n{.a} softbreak then curly in start",
                    tests: [{
                        shift: 0,
                        type: "inline",
                        children: [{
                            position: -2,
                            type: "softbreak"
                        }, {
                            position: -1,
                            type: "text",
                            content: r.hasDelimiters("only", t)
                        }]
                    }],
                    transform: function(e, n, i) {
                        for (var o = e[n].children[i], l = r.getAttrs(o.content, 0, t), s = n + 1; e[s + 1] && -1 === e[s + 1].nesting;) s++;
                        var f = r.getMatchingOpeningToken(e, s);
                        r.addAttrs(l, f), e[n].children = e[n].children.slice(0, -2)
                    }
                }, {
                    name: "horizontal rule",
                    tests: [{
                        shift: 0,
                        type: "paragraph_open"
                    }, {
                        shift: 1,
                        type: "inline",
                        children: function(t) {
                            return 1 === t.length
                        },
                        content: function(t) {
                            return null !== t.match(e)
                        }
                    }, {
                        shift: 2,
                        type: "paragraph_close"
                    }],
                    transform: function(e, n) {
                        var i = e[n];
                        i.type = "hr", i.tag = "hr", i.nesting = 0;
                        var o = e[n + 1].content,
                            l = o.lastIndexOf(t.leftDelimiter),
                            s = r.getAttrs(o, l, t);
                        r.addAttrs(s, i), i.markup = o, e.splice(n + 1, 2)
                    }
                }, {
                    name: "end of block",
                    tests: [{
                        shift: 0,
                        type: "inline",
                        children: [{
                            position: -1,
                            content: r.hasDelimiters("end", t),
                            type: function(t) {
                                return "code_inline" !== t && "math_inline" !== t
                            }
                        }]
                    }],
                    transform: function(e, n, o) {
                        for (var l = e[n].children[o], s = l.content, f = r.getAttrs(s, s.lastIndexOf(t.leftDelimiter), t), a = n + 1; e[a + 1] && -1 === e[a + 1].nesting;) a++;
                        var c = r.getMatchingOpeningToken(e, a);
                        r.addAttrs(f, c);
                        var u = s.slice(0, s.lastIndexOf(t.leftDelimiter));
                        l.content = " " !== i(u) ? u : u.slice(0, -1)
                    }
                }]
            }
        }, {
            "./utils.js": 3
        }],
        3: [function(t, e, n) {
            "use strict";

            function r(t) {
                return t.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")
            }
            n.getAttrs = function(t, e, n) {
                for (var r = /[^\t\n\f />"'=]/, i = [], o = "", l = "", s = !0, f = !1, a = e + n.leftDelimiter.length; a < t.length; a++) {
                    if (t.slice(a, a + n.rightDelimiter.length) === n.rightDelimiter) {
                        "" !== o && i.push([o, l]);
                        break
                    }
                    var c = t.charAt(a);
                    if ("=" === c && s) s = !1;
                    else if ("." !== c || "" !== o)
                        if ("#" !== c || "" !== o)
                            if ('"' !== c || "" !== l || f)
                                if ('"' === c && f) f = !1;
                                else if (" " !== c || f) s && -1 === c.search(r) || (s ? o += c : l += c);
                    else {
                        if ("" === o) continue;
                        i.push([o, l]), o = "", l = "", s = !0
                    } else f = !0;
                    else o = "id", s = !1;
                    else "." === t.charAt(a + 1) ? (o = "css-module", a += 1) : o = "class", s = !1
                }
                if (n.allowedAttributes && n.allowedAttributes.length) {
                    var u = n.allowedAttributes;
                    return i.filter((function(t) {
                        var e = t[0];
                        return u.some((function(t) {
                            return e === t || t instanceof RegExp && t.test(e)
                        }))
                    }))
                }
                return i
            }, n.addAttrs = function(t, e) {
                for (var n = 0, r = t.length; n < r; ++n) {
                    var i = t[n][0];
                    "class" === i ? e.attrJoin("class", t[n][1]) : "css-module" === i ? e.attrJoin("css-module", t[n][1]) : e.attrPush(t[n])
                }
                return e
            }, n.hasDelimiters = function(t, e) {
                if (!t) throw new Error('Parameter `where` not passed. Should be "start", "end" or "only".');
                return function(n) {
                    var r, i, o, l = e.leftDelimiter.length + 1 + e.rightDelimiter.length;
                    if (!n || "string" != typeof n || n.length < l) return !1;
                    var s, f, a, c = l - e.rightDelimiter.length;
                    switch (t) {
                        case "start":
                            i = -1 === (r = n.slice(0, e.leftDelimiter.length) === e.leftDelimiter ? 0 : -1) ? -1 : n.indexOf(e.rightDelimiter, c), (o = n.charAt(i + e.rightDelimiter.length)) && -1 !== e.rightDelimiter.indexOf(o) && (i = -1);
                            break;
                        case "end":
                            i = (i = -1 === (r = n.lastIndexOf(e.leftDelimiter)) ? -1 : n.indexOf(e.rightDelimiter, r + c)) === n.length - e.rightDelimiter.length ? i : -1;
                            break;
                        case "only":
                            r = n.slice(0, e.leftDelimiter.length) === e.leftDelimiter ? 0 : -1, i = n.slice(n.length - e.rightDelimiter.length) === e.rightDelimiter ? n.length - e.rightDelimiter.length : -1;
                            break;
                        default:
                            throw new Error("Unexpected case ".concat(t, ", expected 'start', 'end' or 'only'"))
                    }
                    return -1 !== r && -1 !== i && (s = n.substring(r, i + e.rightDelimiter.length), f = "." === s.charAt(e.leftDelimiter.length), a = "#" === s.charAt(e.leftDelimiter.length), f || a ? s.length >= l + 1 : s.length >= l)
                }
            }, n.removeDelimiter = function(t, e) {
                var n = r(e.leftDelimiter),
                    i = r(e.rightDelimiter),
                    o = new RegExp("[ \\n]?" + n + "[^" + n + i + "]+" + i + "$"),
                    l = t.search(o);
                return -1 !== l ? t.slice(0, l) : t
            }, n.escapeRegExp = r, n.getMatchingOpeningToken = function(t, e) {
                if ("softbreak" === t[e].type) return !1;
                if (0 === t[e].nesting) return t[e];
                for (var n = t[e].level, r = t[e].type.replace("_close", "_open"); e >= 0; --e)
                    if (t[e].type === r && t[e].level === n) return t[e];
                return !1
            };
            var i = /[&<>"]/,
                o = /[&<>"]/g,
                l = {
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;"
                };

            function s(t) {
                return l[t]
            }
            n.escapeHtml = function(t) {
                return i.test(t) ? t.replace(o, s) : t
            }
        }, {}]
    }, {}, [1])(1)
}));
//# sourceMappingURL=/sm/0bfdb6da25d55367850e0c1d36fb0fe5d0902d54b59854b42b34dc5853c03e40.map
                for (var n = 0, r = t.length; n < r; ++n) {
                    var i = t[n][0];
                    "class" === i ? e.attrJoin("class", t[n][1]) : "css-module" === i ? e.attrJoin("css-module", t[n][1]) : e.attrPush(t[n])
                }
                return e
            }, n.hasDelimiters = function(t, e) {
                if (!t) throw new Error('Parameter `where` not passed. Should be "start", "end" or "only".');
                return function(n) {
                    var r, i, o, l = e.leftDelimiter.length + 1 + e.rightDelimiter.length;
                    if (!n || "string" != typeof n || n.length < l) return !1;
                    var s, f, a, c = l - e.rightDelimiter.length;
                    switch (t) {
                        case "start":
                            i = -1 === (r = n.slice(0, e.leftDelimiter.length) === e.leftDelimiter ? 0 : -1) ? -1 : n.indexOf(e.rightDelimiter, c), (o = n.charAt(i + e.rightDelimiter.length)) && -1 !== e.rightDelimiter.indexOf(o) && (i = -1);
                            break;
                        case "end":
                            i = (i = -1 === (r = n.lastIndexOf(e.leftDelimiter)) ? -1 : n.indexOf(e.rightDelimiter, r + c)) === n.length - e.rightDelimiter.length ? i : -1;
                            break;
                        case "only":
                            r = n.slice(0, e.leftDelimiter.length) === e.leftDelimiter ? 0 : -1, i = n.slice(n.length - e.rightDelimiter.length) === e.rightDelimiter ? n.length - e.rightDelimiter.length : -1;
                            break;
                        default:
                            throw new Error("Unexpected case ".concat(t, ", expected 'start', 'end' or 'only'"))
                    }
                    return -1 !== r && -1 !== i && (s = n.substring(r, i + e.rightDelimiter.length), f = "." === s.charAt(e.leftDelimiter.length), a = "#" === s.charAt(e.leftDelimiter.length), f || a ? s.length >= l + 1 : s.length >= l)
                }
            }, n.removeDelimiter = function(t, e) {
                var n = r(e.leftDelimiter),
                    i = r(e.rightDelimiter),
                    o = new RegExp("[ \\n]?" + n + "[^" + n + i + "]+" + i + "$"),
                    l = t.search(o);
                return -1 !== l ? t.slice(0, l) : t
            }, n.escapeRegExp = r, n.getMatchingOpeningToken = function(t, e) {
                if ("softbreak" === t[e].type) return !1;
                if (0 === t[e].nesting) return t[e];
                for (var n = t[e].level, r = t[e].type.replace("_close", "_open"); e >= 0; --e)
                    if (t[e].type === r && t[e].level === n) return t[e];
                return !1
            };
            var i = /[&<>"]/,
                o = /[&<>"]/g,
                l = {
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;"
                };

            function s(t) {
                return l[t]
            }
            n.escapeHtml = function(t) {
                return i.test(t) ? t.replace(o, s) : t
            }
        }, {}]
    }, {}, [1])(1)
}));
//# sourceMappingURL=/sm/0bfdb6da25d55367850e0c1d36fb0fe5d0902d54b59854b42b34dc5853c03e40.map
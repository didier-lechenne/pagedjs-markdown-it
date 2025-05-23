
/*! markdown-it-footnote 4.0.0 https://github.com/markdown-it/markdown-it-footnote @license MIT */
(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define(factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self,
  global.markdownitFootnote = factory());
})(this, (function() {
  "use strict";

  // Process footnotes

  /// /////////////////////////////////////////////////////////////////////////////
  // Renderer partials

  /**
   * Fonction pour générer le nom de l'ancre de la note de bas de page.
   * @param {Array} tokens - Tableau des tokens.
   * @param {number} idx - Index du token actuel.
   * @param {Object} options - Options de rendu.
   * @param {Object} env - Environnement de rendu.
   * @returns {string} - Nom de l'ancre de la note de bas de page.
   */
  function render_footnote_anchor_name(tokens, idx, options, env /*, slf */) {
      const n = Number(tokens[idx].meta.id + 1).toString();
      let prefix = "";
      if (typeof env.docId === "string") prefix = `-${env.docId}-`;
      return prefix + n;
  }

  /**
   * Fonction pour générer la légende de la note de bas de page.
   * @param {Array} tokens - Tableau des tokens.
   * @param {number} idx - Index du token actuel.
   * @returns {string} - Légende de la note de bas de page.
   */
  function render_footnote_caption(tokens, idx /*, options, env, slf */) {
      let n = Number(tokens[idx].meta.id + 1).toString();
      if (tokens[idx].meta.subId > 0) n += `:${tokens[idx].meta.subId}`;
      return `${n}`;
  }

  /**
   * Fonction pour générer la référence de la note de bas de page.
   * @param {Array} tokens - Tableau des tokens.
   * @param {number} idx - Index du token actuel.
   * @param {Object} options - Options de rendu.
   * @param {Object} env - Environnement de rendu.
   * @param {Object} slf - Fonctions de rendu.
   * @returns {string} - HTML de la référence de la note de bas de page.
   */
  function render_footnote_ref(tokens, idx, options, env, slf) {
      const id = slf.rules.footnote_anchor_name(tokens, idx, options, env, slf);
      const caption = slf.rules.footnote_caption(tokens, idx, options, env, slf);
      let refid = id;
      if (tokens[idx].meta.subId > 0) refid += `:${tokens[idx].meta.subId}`;
      return `<sup class="footnote-ref"><a href="#fn${id}" id="fnref${refid}">${caption}</a></sup>`;
  }

  /**
   * Fonction pour générer l'ouverture du bloc de notes de bas de page.
   * @param {Array} tokens - Tableau des tokens.
   * @param {number} idx - Index du token actuel.
   * @param {Object} options - Options de rendu.
   * @returns {string} - HTML de l'ouverture du bloc de notes de bas de page.
   */
  function render_footnote_block_open(tokens, idx, options) {
      return (options.xhtmlOut ? '<hr class="footnotes-sep" />\n' : '<hr class="footnotes-sep">\n') + '<section class="footnotes">\n' + '<ol class="footnotes-list">\n';
  }

  /**
   * Fonction pour générer la fermeture du bloc de notes de bas de page.
   * @returns {string} - HTML de la fermeture du bloc de notes de bas de page.
   */
  function render_footnote_block_close() {
      return "</ol>\n</section>\n";
  }

  /**
   * Fonction pour générer l'ouverture d'une note de bas de page.
   * @param {Array} tokens - Tableau des tokens.
   * @param {number} idx - Index du token actuel.
   * @param {Object} options - Options de rendu.
   * @param {Object} env - Environnement de rendu.
   * @param {Object} slf - Fonctions de rendu.
   * @returns {string} - HTML de l'ouverture d'une note de bas de page.
   */
  function render_footnote_open(tokens, idx, options, env, slf) {
      let id = slf.rules.footnote_anchor_name(tokens, idx, options, env, slf);
      if (tokens[idx].meta.subId > 0) id += `:${tokens[idx].meta.subId}`;
      return `<li id="fn${id}" class="footnote-item">`;
  }

  /**
   * Fonction pour générer la fermeture d'une note de bas de page.
   * @returns {string} - HTML de la fermeture d'une note de bas de page.
   */
  function render_footnote_close() {
      return "</li>\n";
  }

  /**
   * Fonction pour générer l'ancre de retour de la note de bas de page.
   * @param {Array} tokens - Tableau des tokens.
   * @param {number} idx - Index du token actuel.
   * @param {Object} options - Options de rendu.
   * @param {Object} env - Environnement de rendu.
   * @param {Object} slf - Fonctions de rendu.
   * @returns {string} - HTML de l'ancre de retour de la note de bas de page.
   */
  function render_footnote_anchor(tokens, idx, options, env, slf) {
      let id = slf.rules.footnote_anchor_name(tokens, idx, options, env, slf);
      if (tokens[idx].meta.subId > 0) id += `:${tokens[idx].meta.subId}`
      /* ↩ with escape code to prevent display as Apple Emoji on iOS */;
      return ` <a href="#fnref${id}" class="footnote-backref">\u21a9\ufe0e</a>`;
  }

  /**
   * Fonction principale du plugin de notes de bas de page.
   * @param {Object} md - Instance de markdown-it.
   */
  function footnote_plugin(md) {
      const parseLinkLabel = md.helpers.parseLinkLabel;
      const isSpace = md.utils.isSpace;

      // Définir les règles de rendu pour les notes de bas de page
      md.renderer.rules.footnote_ref = render_footnote_ref;
      md.renderer.rules.footnote_block_open = render_footnote_block_open;
      md.renderer.rules.footnote_block_close = render_footnote_block_close;
      md.renderer.rules.footnote_open = render_footnote_open;
      md.renderer.rules.footnote_close = render_footnote_close;
      md.renderer.rules.footnote_anchor = render_footnote_anchor;

      // Définir les règles d'aide pour les notes de bas de page
      md.renderer.rules.footnote_caption = render_footnote_caption;
      md.renderer.rules.footnote_anchor_name = render_footnote_anchor_name;

      /**
       * Fonction pour traiter la définition des blocs de notes de bas de page.
       * @param {Object} state - État actuel du parseur markdown-it.
       * @param {number} startLine - Ligne de début du bloc.
       * @param {number} endLine - Ligne de fin du bloc.
       * @param {boolean} silent - Mode silencieux.
       * @returns {boolean} - True si le bloc est valide, false sinon.
       */
      function footnote_def(state, startLine, endLine, silent) {
          const start = state.bMarks[startLine] + state.tShift[startLine];
          const max = state.eMarks[startLine];
          // La ligne doit avoir au moins 5 caractères - "[^x]:"
          if (start + 4 > max) return false;
          if (state.src.charCodeAt(start) !== 91 /* [ */) return false;
          if (state.src.charCodeAt(start + 1) !== 94 /* ^ */) return false;
          let pos;
          for (pos = start + 2; pos < max; pos++) {
              if (state.src.charCodeAt(pos) === 32) return false;
              if (state.src.charCodeAt(pos) === 93 /* ] */) {
                  break;
              }
          }
          if (pos === start + 2) return false;
          // Pas de labels de notes de bas de page vides
          if (pos + 1 >= max || state.src.charCodeAt(++pos) !== 58 /* : */) return false;
          if (silent) return true;
          pos++;
          if (!state.env.footnotes) state.env.footnotes = {};
          if (!state.env.footnotes.refs) state.env.footnotes.refs = {};
          const label = state.src.slice(start + 2, pos - 2);
          state.env.footnotes.refs[`:${label}`] = -1;
          const token_fref_o = new state.Token("footnote_reference_open", "", 1);
          token_fref_o.meta = {
              label: label
          };
          token_fref_o.level = state.level++;
          state.tokens.push(token_fref_o);
          const oldBMark = state.bMarks[startLine];
          const oldTShift = state.tShift[startLine];
          const oldSCount = state.sCount[startLine];
          const oldParentType = state.parentType;
          const posAfterColon = pos;
          const initial = state.sCount[startLine] + pos - (state.bMarks[startLine] + state.tShift[startLine]);
          let offset = initial;
          while (pos < max) {
              const ch = state.src.charCodeAt(pos);
              if (isSpace(ch)) {
                  if (ch === 9) {
                      offset += 4 - offset % 4;
                  } else {
                      offset++;
                  }
              } else {
                  break;
              }
              pos++;
          }
          state.tShift[startLine] = pos - posAfterColon;
          state.sCount[startLine] = offset - initial;
          state.bMarks[startLine] = posAfterColon;
          state.blkIndent += 4;
          state.parentType = "footnote";
          if (state.sCount[startLine] < state.blkIndent) {
              state.sCount[startLine] += state.blkIndent;
          }
          state.md.block.tokenize(state, startLine, endLine, true);
          state.parentType = oldParentType;
          state.blkIndent -= 4;
          state.tShift[startLine] = oldTShift;
          state.sCount[startLine] = oldSCount;
          state.bMarks[startLine] = oldBMark;
          const token_fref_c = new state.Token("footnote_reference_close", "", -1);
          token_fref_c.level = --state.level;
          state.tokens.push(token_fref_c);
          return true;
      }

      /**
       * Fonction pour traiter les notes de bas de page en ligne (^[...]).
       * @param {Object} state - État actuel du parseur markdown-it.
       * @param {boolean} silent - Mode silencieux.
       * @returns {boolean} - True si la note de bas de page est valide, false sinon.
       */
      function footnote_inline(state, silent) {
          const max = state.posMax;
          const start = state.pos;
          if (start + 2 >= max) return false;
          if (state.src.charCodeAt(start) !== 94 /* ^ */) return false;
          if (state.src.charCodeAt(start + 1) !== 91 /* [ */) return false;
          const labelStart = start + 2;
          const labelEnd = parseLinkLabel(state, start + 1);
          // Le parseur n'a pas trouvé ']', donc ce n'est pas une note valide
          if (labelEnd < 0) return false;
          // Nous avons trouvé la fin du lien, et nous savons que c'est un lien valide;
          // donc tout ce qu'il reste à faire est d'appeler le tokenizer.

          if (!silent) {
              if (!state.env.footnotes) state.env.footnotes = {};
              if (!state.env.footnotes.list) state.env.footnotes.list = [];
              const footnoteId = state.env.footnotes.list.length;
              const tokens = [];
              state.md.inline.parse(state.src.slice(labelStart, labelEnd), state.md, state.env, tokens);
              const token = state.push("footnote_ref", "", 0);
              token.meta = {
                  id: footnoteId
              };
              state.env.footnotes.list[footnoteId] = {
                  content: state.src.slice(labelStart, labelEnd),
                  tokens: tokens
              };
          }
          state.pos = labelEnd + 1;
          state.posMax = max;
          return true;
      }

      /**
       * Fonction pour traiter les références de notes de bas de page ([^...]).
       * @param {Object} state - État actuel du parseur markdown-it.
       * @param {boolean} silent - Mode silencieux.
       * @returns {boolean} - True si la référence de note de bas de page est valide, false sinon.
       */
      function footnote_ref(state, silent) {
          const max = state.posMax;
          const start = state.pos;
          // Doit être au moins 4 caractères - "[^x]"
          if (start + 3 > max) return false;
          if (!state.env.footnotes || !state.env.footnotes.refs) return false;
          if (state.src.charCodeAt(start) !== 91 /* [ */) return false;
          if (state.src.charCodeAt(start + 1) !== 94 /* ^ */) return false;
          let pos;
          for (pos = start + 2; pos < max; pos++) {
              if (state.src.charCodeAt(pos) === 32) return false;
              if (state.src.charCodeAt(pos) === 10) return false;
              if (state.src.charCodeAt(pos) === 93 /* ] */) {
                  break;
              }
          }
          if (pos === start + 2) return false;
          // Pas de labels de notes de bas de page vides
          if (pos >= max) return false;
          pos++;
          const label = state.src.slice(start + 2, pos - 1);
          if (typeof state.env.footnotes.refs[`:${label}`] === "undefined") return false;
          if (!silent) {
              if (!state.env.footnotes.list) state.env.footnotes.list = [];
              let footnoteId;
              if (state.env.footnotes.refs[`:${label}`] < 0) {
                  footnoteId = state.env.footnotes.list.length;
                  state.env.footnotes.list[footnoteId] = {
                      label: label,
                      count: 0
                  };
                  state.env.footnotes.refs[`:${label}`] = footnoteId;
              } else {
                  footnoteId = state.env.footnotes.refs[`:${label}`];
              }
              const footnoteSubId = state.env.footnotes.list[footnoteId].count;
              state.env.footnotes.list[footnoteId].count++;
              const token = state.push("footnote_ref", "", 0);
              token.meta = {
                  id: footnoteId,
                  subId: footnoteSubId,
                  label: label
              };
          }
          state.pos = pos;
          state.posMax = max;
          return true;
      }

      /**
       * Fonction pour coller les tokens de notes de bas de page à la fin du flux de tokens.
       * @param {Object} state - État actuel du parseur markdown-it.
       */
      function footnote_tail(state) {
          let tokens;
          let current;
          let currentLabel;
          let insideRef = false;
          const refTokens = {};
          if (!state.env.footnotes) {
              return;
          }
          state.tokens = state.tokens.filter((function(tok) {
              if (tok.type === "footnote_reference_open") {
                  insideRef = true;
                  current = [];
                  currentLabel = tok.meta.label;
                  return false;
              }
              if (tok.type === "footnote_reference_close") {
                  insideRef = false;
                  // Préfixer ':' pour éviter le conflit avec les membres de Object.prototype
                  refTokens[":" + currentLabel] = current;
                  return false;
              }
              if (insideRef) {
                  current.push(tok);
              }
              return !insideRef;
          }));
          if (!state.env.footnotes.list) {
              return;
          }
          const list = state.env.footnotes.list;
          state.tokens.push(new state.Token("footnote_block_open", "", 1));
          for (let i = 0, l = list.length; i < l; i++) {
              const token_fo = new state.Token("footnote_open", "", 1);
              token_fo.meta = {
                  id: i,
                  label: list[i].label
              };
              state.tokens.push(token_fo);
              if (list[i].tokens) {
                  tokens = [];
                  const token_po = new state.Token("paragraph_open", "p", 1);
                  token_po.block = true;
                  tokens.push(token_po);
                  const token_i = new state.Token("inline", "", 0);
                  token_i.children = list[i].tokens;
                  token_i.content = list[i].content;
                  tokens.push(token_i);
                  const token_pc = new state.Token("paragraph_close", "p", -1);
                  token_pc.block = true;
                  tokens.push(token_pc);
              } else if (list[i].label) {
                  tokens = refTokens[`:${list[i].label}`];
              }
              if (tokens) state.tokens = state.tokens.concat(tokens);
              let lastParagraph;
              if (state.tokens[state.tokens.length - 1].type === "paragraph_close") {
                  lastParagraph = state.tokens.pop();
              } else {
                  lastParagraph = null;
              }
              const t = list[i].count > 0 ? list[i].count : 1;
              for (let j = 0; j < t; j++) {
                  const token_a = new state.Token("footnote_anchor", "", 0);
                  token_a.meta = {
                      id: i,
                      subId: j,
                      label: list[i].label
                  };
                  state.tokens.push(token_a);
              }
              if (lastParagraph) {
                  state.tokens.push(lastParagraph);
              }
              state.tokens.push(new state.Token("footnote_close", "", -1));
          }
          state.tokens.push(new state.Token("footnote_block_close", "", -1));
      }

      // Ajouter les règles de traitement des notes de bas de page au parseur markdown-it
      md.block.ruler.before("reference", "footnote_def", footnote_def, {
          alt: [ "paragraph", "reference" ]
      });
      md.inline.ruler.after("image", "footnote_inline", footnote_inline);
      md.inline.ruler.after("footnote_inline", "footnote_ref", footnote_ref);
      md.core.ruler.after("inline", "footnote_tail", footnote_tail);
  }

  return footnote_plugin;
}));
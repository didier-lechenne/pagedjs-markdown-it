import "../dependencies/markdown-it.js";
import frontMatter from '../dependencies/markdown-it-front-matter.js';
import "../dependencies/markdown-it-footnote.js";
import "../dependencies/markdown-it-sup.js";
import "../dependencies/markdown-it-deflist.js";
import "../dependencies/markdown-it-mark.js";
import "../dependencies/markdown-it-sub.js";
import "../dependencies/markdown-it-abbr.js";
import "../dependencies/markdown-it-container.js";
import "../dependencies/markdown-it-attrs.js";
import obsidianEmbedsPlugin from '../dependencies/markdown-it-obsidian.js';
import { bracketed_spans_plugin } from "../dependencies/markdown-it-bracketed-spans.js";
import shortCode  from '../dependencies/shortCode.js';
import "../dependencies/js-yaml.js";

// Variable pour stocker les métadonnées extraites
let metadata = {};

// Loading Markdownit and its plugins
let md = window.markdownit({html: true, typographer: false, linkify: true});
md.use(markdownitFootnote);
md.use(markdownitSup);
md.use(markdownitDeflist);
md.use(markdownitMark);
md.use(markdownitSub);
md.use(markdownitAbbr);
md.use(markdownitContainer, 'columns');
md.use(markdownitContainer, 'glossary', { marker: '¶' });
md.use(markdownitContainer, 'term');
md.use(markdownitContainer, 'post');
md.use(markdownitContainer, 'content');
md.use(markdownitContainer, 'items');
md.use(markdownitContainer, 'flex');
md.use(markdownitContainer, 'insert');
md.use(markdownItAttrs, {
    leftDelimiter: '{',
    rightDelimiter: '}',
    allowedAttributes: []
});

bracketed_spans_plugin(md);

md.use(obsidianEmbedsPlugin, {
  pathPrefix: 'esadpyrenees/content/text/' 
});

md.use(shortCode);

md.use(frontMatter, function(fm) {
  // Cette fonction sera automatiquement appelée quand le frontmatter sera détecté
  try {
    metadata = window.jsyaml.load(fm); 
    console.log("Frontmatter détecté et traité :", fm);
  } catch (e) {
    console.error('Erreur lors du parsing du frontmatter YAML:', e);
    metadata = {};
  }
});



/**
 * Awaits a Markdown string to convert it and put it in a specific innerHTML's tag
 * @param {String} id id of the tag
 * @param {Promise} response promise that contains the markdown text to insert
 */

export function mdToHtml(text) {
    metadata = {};
    const html = md.render(text);
    return {
        html,
        metadata: { ...metadata }
    };
}


export function convertInline(text) {
  return md.renderInline(text);
}








// Exporter la fonction initializeFootnotes pour pouvoir l'utiliser dans d'autres modules si nécessaire
export  function processFootNotesToSideNotes(opts) {
  'use strict';
  var selector = opts.rootSel + ' .footnote-ref';
  //console.log('Selector:', selector);

  var footNotesAnchors = document.querySelectorAll(selector);
  //console.log('Footnote anchors:', footNotesAnchors);

  if (footNotesAnchors.length === 0) {
    //console.warn('No footnote anchors found. Check the selector and HTML structure.');
    return [];
  }

  var sidenotes = [],
      i = 1; // Note numbering

  Array.prototype.forEach.call(footNotesAnchors, function (ref) {
    var anchor = ref.querySelector("a");
    var id = anchor.getAttribute('href').replace('#', '');
    var target = document.getElementById(id);
    var back = target.querySelector('a[href^="#fnref"]');
    if (back) back.parentElement.removeChild(back);

    var node = document.createElement('aside');
    node.classList.add('sn-note');
    node.setAttribute('data-ref', i);
    node.innerHTML = target.innerHTML;

    var label = document.createElement('label');
    label.className = "sn-toggle-label";
    label.setAttribute("for", "sn-note-" + id);
    label.textContent = anchor.textContent;
    var input = document.createElement('input');
    input.type = "checkbox";
    input.id = "sn-note-" + id;
    input.className = "sn-toggle";

    var image = node.querySelector('img');
    if (image) {
      var alt = image.getAttribute('alt');
      if (alt) {
        var caption = document.createElement('span');
        caption.className = "caption";
        caption.textContent = alt;
        image.after(caption);
      }
    }

    var sidenote = {};
    sidenote.id = id;
    sidenote.ref = ref;
    sidenote.label = label;
    sidenote.input = input;
    sidenote.node = node;
    sidenote.num = i;
    sidenotes.push(sidenote);
    i++;
  });

  var footNotesConts = document.querySelectorAll(opts.rootSel + ' ' + opts.footNotesContainerSel);
  //console.log('Footnotes containers:', footNotesConts);

  if (footNotesConts.length === 0) {
    //console.warn('No footnotes containers found. Check the selector and HTML structure.');
  }

  Array.prototype.forEach.call(footNotesConts, function (footNoteCont) {
    footNoteCont.parentNode.removeChild(footNoteCont);
  });

  return sidenotes;
};

export  function initializeFootnotes(options) {
  //console.log("initializeFootnotes appelé");
  'use strict';
  var opts = options || {
    rootSel: '#main',
    footNotesContainerSel: '.footnotes-list',
    footNoteIdPattern: 'fn',
    footNoteAnchorIdStart: 'fn',
    sideNoteClass: 'sn-note'
  };

  var renderSideNotes = function renderSideNotes(sidenotes) {
    sidenotes.forEach(function (note) {
      var container = note.ref.parentElement;
      container.insertBefore(note.label, note.ref);
      container.insertBefore(note.input, note.ref);
      container.insertBefore(note.node, note.ref);
      container.removeChild(note.ref);
    });
  };

  var notes = processFootNotesToSideNotes(opts);
  //console.log('Sidenotes:', notes);
  renderSideNotes(notes);
};

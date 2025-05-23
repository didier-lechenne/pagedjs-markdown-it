/**
 * Script qui :
 * - Récupère les appels de notes de bas de page générés par l'extension MarkdownItFootnote.
 * - Pour chaque appel, récupère la note de bas de page correspondante (située à la fin du <main>) :
 *   - Supprime la référence de retour à l'appel de la note.
 *   - Crée un <span class="margin-note"> en marge.
 *   - Insère le contenu de la note à l'intérieur du <span>.
 *   - Injecte le <span> après l'appel.
 *   - Supprime l'appel.
 * Auteur : [Votre Nom]
 */

let noteName = "imagenote";

// Fonction pour récupérer tous les blocs pertinents dans un élément
function getBlocks(element) {
    return element.querySelectorAll('div, p, blockquote, section, article, h1, h2, h3, h4, h5, h6, figure');
}

// Fonction pour désempaqueter (unwrap) les enfants de niveau bloc d'un élément
function unwrapBlockChildren(element) {
    const blocks = getBlocks(element);
    blocks.forEach(block => {
        block.insertAdjacentHTML("beforebegin", block.innerHTML);
        block.remove();
    });
    const remainingBlocks = getBlocks(element);
    if (remainingBlocks.length) {
        unwrapBlockChildren(element); // Appel récursif s'il reste des blocs
    }
    return element;
}

// Gestionnaire personnalisé pour Paged.js
class noteWrap extends Paged.Handler {
    constructor(chunker, polisher, caller) {
        super(chunker, polisher, caller);
    }

    beforeParsed(content) {
        // Gestion des notes de bas de page en notes de marge
        const footnoteCalls = content.querySelectorAll(".footnote-ref");
        footnoteCalls.forEach(call => {
            // Récupérer le contenu de la note
            const noteId = call.querySelector("a").getAttribute('href').slice(1); // Supprime le '#' initial
            const note = content.querySelector(`#${noteId}`);
            
            if (note) {
                // Supprimer la référence de retour
                const backRef = note.querySelector('.footnote-backref');
                if (backRef) {
                    backRef.parentElement.removeChild(backRef);
                }
                
                // Créer la note en marge
                const marginNote = document.createElement('span');
                marginNote.className = noteName;
                
                // Désempaqueter le contenu de la note
                const unwrappedNote = unwrapBlockChildren(note);
                marginNote.innerHTML = unwrappedNote.innerHTML;
                
                // Injecter le <span> après l'appel, avec un espace insécable et mince (U+202F)
                // call.insertAdjacentHTML('afterend', '&#8239;');
                call.after(marginNote);
                
                // Supprimer l'appel
                call.parentElement.removeChild(call);
            }
        });
    }


}

// Enregistrer le gestionnaire personnalisé avec Paged.js
Paged.registerHandlers(noteWrap);

export { noteWrap, getBlocks, unwrapBlockChildren }; // Exporter les fonctions et la classe si nécessaire

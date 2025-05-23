(function() {
    let encartCounter = 1; // Initialiser le compteur

    /**
     * Fonction pour ajouter un wrapper autour des éléments avec la classe 'insert'
     * @param {HTMLElement} context - Le contexte dans lequel rechercher les éléments
     */
    function addWrapper(context) {
        // Sélectionner tous les éléments avec la classe 'insert' dans le contexte donné
        const wrapperElements = context.querySelectorAll('.insert');

        // Parcourir chaque élément et l'envelopper dans un div avec la classe 'insert'
        wrapperElements.forEach(element => {
            wrapElement(element);
        });
    }

    /**
     * Fonction pour envelopper un élément dans un div avec la classe 'insert'
     * @param {HTMLElement} element - L'élément à envelopper
     */
    function wrapElement(element) {
        // Créer un nouveau div
        const newDiv = document.createElement('div');
        newDiv.className = 'insert';

        // Ajouter un identifiant unique avec le compteur
        newDiv.id = `encart_${encartCounter}`;
        newDiv.setAttribute('data-id', `encart_${encartCounter}`);
        encartCounter++;

        // Définir des variables CSS
        newDiv.style.setProperty('--printwidth', '3');
        newDiv.style.setProperty('--printheight', '2');
        newDiv.style.setProperty('--alignself', 'start');


        // Filtrer et déplacer les classes de l'élément (sauf 'insert') vers le nouveau div
        const filteredClasses = [...element.classList].filter(c => c !== 'insert');
        newDiv.classList.add(...filteredClasses);

        // Déplacer tous les styles en ligne de l'élément vers le nouveau div
        newDiv.style.cssText += element.style.cssText;

        // Enlever les classes de l'élément wrapper
        element.classList.remove(...element.classList);

        // Enlever les styles de l'élément wrapper
        element.style.cssText = '';

        // Insérer le nouveau div avant l'élément actuel
        element.parentNode.insertBefore(newDiv, element);

        // Déplacer l'élément actuel à l'intérieur du nouveau div
        newDiv.appendChild(element);
        // console.log('Wrapped element:', newDiv);
    }

    // Mode écran
    addWrapper(document);

    // Mode impression
    if (typeof Paged !== "undefined") {
        Paged.registerHandlers(
            class extends Paged.Handler {
                constructor(chunker, polisher, caller) {
                    super(chunker, polisher, caller);
                }

                afterLayout(pages) {
                    pages.forEach(page => {
                        addWrapper(page);
                    });
                }
            }
        );
    }
})();

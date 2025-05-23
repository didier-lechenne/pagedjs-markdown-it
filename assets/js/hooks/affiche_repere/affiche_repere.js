const pathHook = "assets/js/hooks/affiche_repere/affiche_repere.css";
loadCSS(pathHook);

// Définir les touches par défaut
const defaultKeys = {
    previsualisation: "w",
    repere: ";",  // ctrl + ;
    marginbox: "m"
};


function init(handler, element) {
    
    element.addEventListener("keydown", (event) => {
        const body = document.getElementsByTagName("body")[0];

        // Vérifier si la touche appuyée correspond à la touche définie pour la prévisualisation
        if (event.key === handler.previsualisation) {
            body.classList.toggle("interface-preview");
        }

        // Vérifier si la combinaison de touches (Ctrl + touche) est enfoncée pour les repères
        if (event.ctrlKey && event.key === handler.repere) {
            body.classList.toggle("hideMarker");
        }

        // Vérifier si la touche appuyée correspond à la touche définie pour la marginbox
        if (event.key === handler.marginbox) {
            body.classList.toggle("marginbox");
        }
    });
}

// Initialiser les raccourcis clavier même si Paged n'est pas chargé
init(defaultKeys, document);

// Si Paged est chargé, enregistrer le gestionnaire
if (typeof Paged !== "undefined") {
    Paged.registerHandlers(class extends Paged.Handler {
        constructor(chunker, polisher, caller) {
            super(chunker, polisher, caller);
            // Définir les touches par défaut
            this.previsualisation = defaultKeys.previsualisation;
            this.repere = defaultKeys.repere;
            this.marginbox = defaultKeys.marginbox;
        }

        afterRendered(pages) {
            loadCSS(pathHook);
            pages.forEach(page => {
                init(this, page.element);
            });
        }
        afterParsed(pages){
            // console.info("Plugin → displayMarker");
          }

        setKey(newKey, keyType) {
            if (keyType === "previsualisation") {
                this.previsualisation = newKey;
            } else if (keyType === "repere") {
                this.repere = newKey;
            } else if (keyType === "marginbox") {
                this.marginbox = newKey;
            }
        }
    });
}


  
  function loadCSS(href) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.media = 'all'; // Appliquer par défaut à tous les médias
  
    document.head.appendChild(link);
  }
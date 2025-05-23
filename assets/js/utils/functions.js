// import { pageMode } from "./utils/pageMode.js";

// // Vérifiez une condition
// if (["screen", "layout"].includes(pageMode)) {
//     // Utilisez la fonction import() dynamique pour charger le module
//     import("./hooks/hooks.js").then(module => {
//         // Utilisez le module importé
//         module.exampleHook(); // Appelle la fonction exampleHook du module importé
//     }).catch(err => {
//         console.error("Erreur lors de l'importation du module:", err);
//     });
// }




// Fonction de journalisation conditionnelle
export function logDebug(message) {
    const DEBUG_MODE = false; // Changez à `true` pour activer les logs de débogage
    if (DEBUG_MODE) {
        console.log(message);
    }
}


export  function wrap(element, wrapper) {
    element.parentNode.insertBefore(wrapper, element);
    wrapper.appendChild(element);
}

export function slugify(text) {
    return text
        .toString() // Convertir l'entrée en chaîne de caractères au cas où ce ne serait pas déjà une chaîne.
        .normalize('NFD') // Normaliser la chaîne en utilisant la forme décomposée pour séparer les caractères de base et leurs diacritiques.
        .replace(/[\u0300-\u036f]/g, '') // Supprimer les diacritiques (accents, cédilles, etc.) qui ont été séparés.
        .toLowerCase() // Convertir la chaîne en minuscules pour assurer une uniformité.
        .trim() // Supprimer les espaces blancs en début et en fin de la chaîne.
        .replace(/[^a-z0-9 -]/g, '') // Supprimer tous les caractères non alphanumériques, sauf les espaces et les tirets.
        .replace(/\s+/g, '-') // Remplacer les espaces (un ou plusieurs) par un seul tiret.
        .replace(/-+/g, '-') // Remplacer les occurrences de plusieurs tirets consécutifs par un seul tiret.
        .replace(/^-+|-+$/g, ''); // Supprimer les tirets en début et en fin de la chaîne.
}

export function breakAnchors(text) {
    // Remplace chaque ancre <a>...</a> dans le textument
    return text.replace(/<a(.+?)>(.+?)<\/a>/gi, (match, p1, p2) => {
        // Modifie le texte de l'ancre en ajoutant des opportunités de saut de ligne
        let anchorText = p2
            .replace(/\/\//g, '//<wbr>')  // Ajoute <wbr> après les doubles slash (//)
            .replace(/,/g, ',<wbr>')      // Ajoute <wbr> après les virgules (,)
            .replace(/(\/|<!|\~|\-|\.|\,|\_|\?|\#|\&|\%)/g, "<wbr>$1") // Ajoute <wbr> avant certains caractères spéciaux
            .replace(/-/g, '<wbr>&#8209;'); // Remplace les tirets (-) par <wbr>&#8209; pour empêcher la rupture à cet endroit

        // Reconstruit l'ancre avec le texte modifié
        return `<a${p1}>${anchorText}</a>`;
    });
}

export function isTrue(value) {
    // Vérifie si value est un booléen et le convertit en chaîne si nécessaire
    if (typeof value === 'boolean') {
        value = value ? 'true' : 'false';
    }
    return value.trim().toLowerCase() === 'true';
}

export function loadCSS(href) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    // link.media = 'all'; // Appliquer par défaut à tous les médias
    document.head.appendChild(link);
}

export function addcss(css){
    var head = document.getElementsByTagName('head')[0];
    var s = document.createElement('style');
    s.setAttribute('type', 'text/css');
    if (s.styleSheet) {   // IE
        s.styleSheet.cssText = css;
    } else {// the world
        s.appendChild(document.createTextNode(css));
    }
    head.appendChild(s);
  }


export function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.type = 'text/javascript';
        script.defer = true;

        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Échec du chargement du script : ${src}`));

        document.head.appendChild(script);
    });
}

export async function loadModule(modulePath) {
    // Assurez-vous que cette fonction retourne une promesse
    return new Promise((resolve, reject) => {
        import(modulePath)
            .then(module => resolve(module))
            .catch(err => reject(err));
    });
}

export function loadScriptModule(src) {
    return new Promise((resolve, reject) => {
        // Vérifier si le script est déjà présent dans le document
        if (document.querySelector(`script[src="${src}"]`)) {
            return resolve(); // Le script est déjà chargé
        }

        const script = document.createElement('script');
        script.src = src;
        script.type = 'module';
        script.defer = true;

        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Échec du chargement du script : ${src}`));

        document.head.appendChild(script);
    });
}

function convertSpanToFigure(spanToFig) {
    // Sélectionner tous les éléments <span> avec la classe spécifiée
    const spans = document.querySelectorAll(spanToFig);

    spans.forEach(span => {
        // Créer un nouvel élément <figure>
        const figure = document.createElement('figure');

        // Copier tous les attributs du <span> vers le <figure>
        Array.from(span.attributes).forEach(attr => {
            figure.setAttribute(attr.name, attr.value);
        });

        // Créer un nouvel élément <figcaption>
        const figurecaption = document.createElement('figcaption');
        const figcaptionSpan = span.querySelector('span.figcaption');
        if (figcaptionSpan) {
            // Copier tous les attributs du <span class="figcaption"> vers le <figurecaption>
            Array.from(figcaptionSpan.attributes).forEach(attr => {
                figurecaption.setAttribute(attr.name, attr.value);
            });
            figurecaption.innerHTML = figcaptionSpan.innerHTML;
        }

        // Ajouter l'image au <figure>
        const img = span.querySelector('img');
        if (img) {
            figure.appendChild(img.cloneNode(true));
        }

        // Ajouter le <figurecaption> au <figure>
        figure.appendChild(figurecaption);

        // Remplacer le <span> par le <figure>
        span.parentNode.replaceChild(figure, span);
    });
}

export function moveFiguresToSection(mainSection, slug) {
    // Convertir les éléments <span> en éléments <figure>
    convertSpanToFigure('span.figure.figmove');

    // Trouver toutes les figures dans la section principale
    const figures = mainSection.querySelectorAll('.figmove');

    // Si aucune figure n'est trouvée, il n'y a rien à déplacer
    if (figures.length === 0) {
        return;
    }

    // Créer une nouvelle section pour les figures
    let figuresSection = document.createElement('section');
    figuresSection.id = `${slug}-figure`;
    figuresSection.className = 'figures_page';
    figuresSection.setAttribute('markdown', '1');
    figuresSection.setAttribute('data-figures-count', figures.length);

    // Créer un conteneur <div class="content"> pour contenir les figures
    let contentDiv = document.createElement('div');
    contentDiv.className = 'content';
    contentDiv.setAttribute('markdown', '1');

    // Ajouter les figures dans le conteneur
    figures.forEach(figure => {
        contentDiv.appendChild(figure);
    });

    // Ajouter le conteneur dans la nouvelle section
    figuresSection.appendChild(contentDiv);

    // Insérer la nouvelle section après la section principale
    mainSection.insertAdjacentElement('afterend', figuresSection);
}

async function fonctionAsynchrone() {
    console.log("Début");
    await new Promise(resolve => setTimeout(resolve, 5000)); // Attend 5 secondes
    console.log("Fin");
}


export function getDPI() {
    const dpi = window.devicePixelRatio * 96; // 96 DPI est la valeur standard
    return dpi;
}

      
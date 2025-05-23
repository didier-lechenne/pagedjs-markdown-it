// Fonction pour obtenir les paramètres de l'URL
export function getUrlParams() {
    return new URLSearchParams(window.location.search);
}

// Fonction pour déterminer le mode de la page
export function getPageMode() {
    const params = getUrlParams();

    if (params.has('print') && params.has('layout')) {
        return 'print&layout';
    } else if (params.has('print')) {
        return 'print';
    } else if (params.has('layout')) {
        return 'layout';
    } else {
        return 'screen'; // Valeur par défaut si aucun paramètre n'est présent
    }
}

// Exporter la fonction pour utilisation dans d'autres modules
export const pageMode = getPageMode();
document.addEventListener('DOMContentLoaded', () => {
    // Ajouter la classe au body
    // document.body.classList.add(pageMode);
});
// console.info(pageMode);


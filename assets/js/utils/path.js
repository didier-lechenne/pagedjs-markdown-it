import { readYAML } from './yamlReader.js';

let themePath = '';

/**
 * Fonction pour lire le fichier book.yml et obtenir la valeur de 'book'.
 * @returns {Promise<string>} - Une promesse qui se résout en une chaîne de caractères.
 */


/**
 * Fonction pour lire le fichier config.yml et obtenir la valeur de 'theme'.
 * @returns {Promise<string>} - Une promesse qui se résout en une chaîne de caractères.
 */
async function getTheme() {
    try {
        const data = await readYAML('config.yml');
        themePath = `${data.theme}`; // Correction de la syntaxe
        return themePath;
    } catch (error) {
        throw new Error(`Erreur lors de la lecture de config.yml: ${error.message}`);
    }
}

// Fonction pour initialiser les valeurs
async function initialize() {
    try {
        themePath = await getTheme();

        // Définir les attributs dataset
        document.body.dataset.theme = themePath;

    } catch (error) {
        console.error(error);
    }
}

// Appeler la fonction initialize
initialize();

// Exporter les variables pour une utilisation dans d'autres modules
export { themePath };

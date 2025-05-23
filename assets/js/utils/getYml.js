import {  themePath } from './path.js';
import { readYAML } from './yamlReader.js';

// Fonction générique pour lire un fichier YAML et retourner le contenu
export async function loadConfig(filePath) {
    try {
        const config = await readYAML(filePath);
        return config;
    } catch (error) {
        console.error(`Failed to load configuration from ${filePath}:`, error);
        throw error; // Relancer l'erreur si nécessaire
    }
}

// Fonction asynchrone pour charger les configurations
async function loadConfigurations() {
    const config = await loadConfig(`config.yml`);
    const data = await loadConfig(`config.yml`);
    const options = await loadConfig(`${themePath}/options.yml`);
    return { config, data, options };
}

// Exporter les configurations chargées
export const { config, data, options } = await loadConfigurations();

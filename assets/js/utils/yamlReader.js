import "../dependencies/js-yaml.js";

/**
 * Function to read a YAML file from a URL.
 * @param {string} url - The URL of the YAML file.
 * @returns {Promise<object>} - A promise that resolves to a JavaScript object.
 */
export async function readYAML(url) {
    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }

        const text = await response.text();
        const data = jsyaml.load(text); // Use YAML.parse if needed

        return data;
    } catch (error) {
        console.error(`Erreur : ${error.message}`);
        throw new Error(`Erreur : ${error.message}`);
    }
}

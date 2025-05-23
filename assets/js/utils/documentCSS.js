import { options } from './getYml.js';
import { isTrue } from './functions.js';


// Fonction pour générer les marges CSS
function generateMargins(margins) {
    let css = '';
    for (const [position, value] of Object.entries(margins)) {
        if (value) {
            css += `margin-${position}: ${value}mm;\n`;
        }
    }
    return css;
}

// Fonction pour générer le CSS pour l'impression
function generatePrintCSS({
    width,
    height,
    margin_top,
    margin_bottom,
    margin_left,
    margin_right,
    bleed,
    marks,
    page_left_margin_top,
    page_left_margin_bottom,
    page_left_margin_left,
    page_left_margin_right,
    page_right_margin_top,
    page_right_margin_bottom,
    page_right_margin_left,
    page_right_margin_right
}) {
    // Regrouper toutes les marges
    const generalMargins = { top: margin_top, bottom: margin_bottom, left: margin_left, right: margin_right };
    const leftPageMargins = { top: page_left_margin_top, bottom: page_left_margin_bottom, left: page_left_margin_left, right: page_left_margin_right };
    const rightPageMargins = { top: page_right_margin_top, bottom: page_right_margin_bottom, left: page_right_margin_left, right: page_right_margin_right };

    return `
        @media print {

            @page {
                --g-column-count: 1;
                --g-column-offset: 0;
                --g-column-gutter: 3mm;
                --g-row-count: 1;
                --g-row-offset: 0;
                --g-row-gutter: 3mm;

                size: ${width}mm ${height}mm;

                ${generateMargins(generalMargins)}

                ${isTrue(bleed) ? 'bleed: 6mm;' : ''}
                ${isTrue(marks) ? 'marks: crop;' : ''}
            }

            @page:left {
                ${generateMargins(leftPageMargins)}
            }

            @page:right {
                ${generateMargins(rightPageMargins)}
            }

            @footnote {
                float: bottom;
            }
        }
    `;
}

// Générer le CSS basé sur l'objet de configuration
const cssContent = generatePrintCSS({
    width: options.width,
    height: options.height,
    margin_top: options.margin_top,
    margin_bottom: options.margin_bottom,
    margin_left: options.margin_left,
    margin_right: options.margin_right,
    bleed: options.bleed,
    marks: options.marks,
    page_left_margin_top: options.page_left_margin_top,
    page_left_margin_bottom: options.page_left_margin_bottom,
    page_left_margin_left: options.page_left_margin_left,
    page_left_margin_right: options.page_left_margin_right,
    page_right_margin_top: options.page_right_margin_top,
    page_right_margin_bottom: options.page_right_margin_bottom,
    page_right_margin_left: options.page_right_margin_left,
    page_right_margin_right: options.page_right_margin_right
});


// Fonction pour générer et ajouter une feuille de style dynamiquement
function generateAndAddStyle(cssContent) {
    // Créer un élément <style>
    const styleElement = document.createElement('style');

    // Définir le type de l'élément <style>
    styleElement.type = 'text/css';

    // Définir le contenu de l'élément <style>
    if (styleElement.styleSheet) {
        // Pour IE
        styleElement.styleSheet.cssText = cssContent;
    } else {
        // Pour les autres navigateurs
        styleElement.appendChild(document.createTextNode(cssContent));
    }

    // Ajouter l'élément <style> au <head> du document
    document.head.appendChild(styleElement);
}

// Exporter la fonction pour générer et ajouter la feuille de style
export function addPrintCSS() {
    generateAndAddStyle(cssContent);
}

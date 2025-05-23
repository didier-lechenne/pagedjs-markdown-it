import { slugify } from '../utils/functions.js';
import { convertInline } from "../utils/converter.js";


let globalFigureCounter = 0;
let globalfigureGridCounter = 0;

export default function shortCode(md) {
    const shortcodeTypes = ['image', 'imagenote', 'figure', 'insertFig', 'showFig', 'imgfullPage', 'imgfullSpread', 'video', 'imagegrid'];
    const attrTypes = ['class', 'caption', 'print', 'poster', 'col', 'printcol', 'width', 'printwidth', 'printrow', 'printheight', 'alignself', 'imgX', 'imgY', 'imgW'];


    const regex = new RegExp(`\\(\\s*(${shortcodeTypes.join('|')})\\s*:\\s*([^\\s]+)\\s*(.*?)\\s*\\)`, 'g');

    md.core.ruler.before('normalize', 'custom_shortcut', (state) => {
        state.src = state.src.replace(regex, (match, type, src, attributesString) => {
            const id = slugify(src);
            let figureNumber = globalFigureCounter;
            let figureGrid = globalfigureGridCounter;

            const parsedData = parseShortcut(type, src, attributesString, attrTypes);

            if (type === 'figure') {
                globalFigureCounter++;
                figureNumber = globalFigureCounter;
            }
            if (type === 'imagegrid' || type === 'image') {
                globalfigureGridCounter++;
                figureGrid = globalfigureGridCounter;
            }
            return generateHTML(parsedData, figureNumber, id, figureGrid);
        });
    });
}



function generateHTML(parsedData, figureNumber, id, figureGrid) {
    const { type, src, attributes } = parsedData;
    const srcWithPath = `${src}`;
    const posterWithPath = attributes.poster ? `${attributes.poster}` : '';
    const styleAttr = generateInlineStyles(attributes);
    let out = '';

    switch (type) {
        case 'image':
            out = `<figure class="figure image ${attributes.class || ''}" id="image_${figureGrid}" style="${styleAttr}">`;
            out += `<img src="${srcWithPath}" alt="${attributes.caption || ''}">`;
            if (attributes.caption) {
                out += `<figcaption class="figcaption">${convertInline(attributes.caption)}</figcaption>`;
            }
            out += `</figure>`;
            break;

        case 'imagenote':
            out = `<span class="imagenote sideNote ${attributes.class || ''}" id="${id}">`;
            out += `<img src="${srcWithPath}" alt="${attributes.caption || ''}">`;
            if (attributes.caption) {
                out += `<span class="caption">${convertInline(attributes.caption)}</span>`;
            }
            out += `</span>`;
            break;

        case 'figure':
            out = `<span data-ref="fig. ${figureNumber}" data-caption="${attributes.caption || ''}" data-id="${id}-${figureNumber}" data-style="${styleAttr}" data-class="figure ${attributes.class || ''}" data-src="${srcWithPath}" class="spanMove figure_call" id="${id}-call">[<a href="#${id}-${figureNumber}">fig. ${figureNumber}</a>]</span>`;
            out += `<span class="figure figmove ${attributes.class || ''}" id="${id}-${figureNumber}" style="${styleAttr}">`;
            out += `<img src="${srcWithPath}" alt="${attributes.caption || ''}">`;
            if (attributes.caption) {
                out += `<span class="figcaption"><span class="figure_reference">fig. ${figureNumber}</span> ${convertInline(attributes.caption)} <a href='#${id}-call' class='figure_call_back'>↩</a></span>`;
            }
            out += `</span>`;
            break;

        case 'insertFig':
            out = `<span class="figure_call" id="${id}-call">[<a href="#${id}-${figureNumber}">fig. ${figureNumber}</a>]</span>`;
            break;

        case 'showFig':
            out = `<figure class="figure ${attributes.class || ''}" id="${id}-${figureNumber}" style="${styleAttr}">`;
            out += `<img src="${srcWithPath}" alt="${attributes.caption || ''}">`;
            if (attributes.caption) {
                out += `<figcaption class="figcaption"><span class="figure_reference">fig. ${figureNumber}</span> ${convertInline(attributes.caption)} <a href='#${id}-call' class='figure_call_back'>↩</a></figcaption>`;
            }
            out += `</figure>`;
            break;

        case 'imgfullPage':
            out = `<span class="pagedjs_full-page_content ${attributes.class || ''}" style="${styleAttr}">`;
            out += `<img id="${id}" class="full-page-img ${attributes.class || ''}" src="${srcWithPath}">`;
            out += `</span>`;
            break;

        case 'imgfullSpread':
            out = `<div class="pagedjs_full-spread_container">`;
            out += `<figure id="${id}" class="full-spread-img pagedjs_full-spread-elem pagedjs_full-spread_content">`;
            out += `<img src="${srcWithPath}">`;
            out += `</figure></div>`;
            break;

        case 'video':
            const videoService = determineService(src);
            const videoID = extractVideoID(src, videoService);
            const videoUrl = generateVideoUrl(videoService, videoID, src);

            out = `<figure id="video_${figureGrid}" class="videofigure figure ${attributes.class || ''}" style="${styleAttr}" data-src="${videoUrl}">
                    <div class='video' ${posterWithPath ? `style='background-image:url(${posterWithPath})'` : ''}>
                        <iframe
                            allowtransparency="true"
                            scrolling="no"
                            width="640"
                            height="360"
                            src="${videoUrl}"
                            frameborder="0"
                            allowfullscreen
                            allow="accelerometer;  clipboard-write; encrypted-media; gyroscope; picture-in-picture">
                        </iframe>
                    </div>
                    ${attributes.caption ? `<figcaption class='figcaption'>${convertInline(attributes.caption)}</figcaption>` : ''}
                </figure>`;
            break;

        case 'imagegrid':
            out = `<figure class="resize ${attributes.class || ''}" id="figure_${figureGrid}" style="${styleAttr}">`;
            out += `<img  data-id="figure_${figureGrid}" class="" src="${srcWithPath}"  alt="${attributes.caption || ''}">`;
            if (attributes.caption) {
                out += `<figcaption class="figcaption"><span class="figure_reference">fig. ${figureGrid}</span> ${convertInline(attributes.caption)}</figcaption>`;
            }
            out += `</figure>`;

            break;

        default:
            return '';
    }
    return out;
}

function parseShortcut(type, src, attributesString, allowedAttrTypes) {
    const attrs = {};
    
    // Gère les attributs avec ou sans guillemets, et avec des espaces dans les valeurs
    // Format: attrName: "value with spaces" ou attrName: singleWordValue
    const regex = /(\w+)\s*:\s*(?:"([^"]*)"|\s*([^:\s]+(?:\s+[^:\s]+)*)\s*(?=\s+\w+\s*:|$))/g;
    
    let match;
    while ((match = regex.exec(attributesString)) !== null) {
        const key = match[1].trim();
        // La valeur peut être soit dans le groupe 2 (avec guillemets) soit dans le groupe 3 (sans guillemets)
        const value = (match[2] !== undefined) ? match[2] : match[3];
        
        if (allowedAttrTypes.includes(key)) {
            attrs[key] = value.trim();
        }
    }

    return {
        type,
        src,
        attributes: attrs
    };
}

function generateInlineStyles(attributes) {
    let styles = '';

    if (attributes.col) styles += `--col: ${attributes.col}; `;
    if (attributes.printcol) styles += `--printcol: ${attributes.printcol}; `;
    if (attributes.width) styles += `--width: ${attributes.width}; `;
    if (attributes.printwidth) styles += `--printwidth: ${attributes.printwidth}; `;
    if (attributes.printrow) styles += `--printrow: ${attributes.printrow}; `;
    if (attributes.printheight) styles += `--printheight: ${attributes.printheight}; `;
    if (attributes.alignself) styles += `--alignself: ${attributes.alignself}; `;
    if (attributes.imgX) styles += `--imgX: ${attributes.imgX}; `;
    if (attributes.imgY) styles += `--imgY: ${attributes.imgY}; `;
    if (attributes.imgW) styles += `--imgW: ${attributes.imgW}; `;

    return styles;
}

// Expressions régulières pour extraire les identifiants vidéo pour différents services
const ytRegex = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
const vimeoRegex = /https?:\/\/(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/([^/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/;
const preziRegex = /^https:\/\/prezi.com\/([^\/\s]+)/;
const mfrRegex = /^http(?:s?):\/\/(?:www\.)?mfr\.osf\.io\/render\?url=http(?:s?):\/\/osf\.io\/([a-zA-Z0-9]{1,5})\/\?action=download/;
const EMBED_REGEX = /@\[([a-zA-Z].+)]\([\s]*(.*?)[\s]*(?:,\s*class="([^"]+)")?\s*(?:,\s*poster="([^"]+)")?\s*(?:,\s*caption="([^"]+)")?\s*(?:,\s*style="([^"]+)")?\s*\)/im;

function determineService(url) {
    if (ytRegex.test(url)) {
        return 'youtube';
    } else if (vimeoRegex.test(url)) {
        return 'vimeo';
    } else if (preziRegex.test(url)) {
        return 'prezi';
    } else if (mfrRegex.test(url)) {
        return 'osf';
    }
    return null;
}

function extractVideoID(url, service) {
    switch (service) {
        case 'youtube':
            return youtubeParser(url);
        case 'vimeo':
            return vimeoParser(url);
        case 'prezi':
            return preziParser(url);
        case 'osf':
            return mfrParser(url);
        default:
            return url;
    }
}

function generateVideoUrl(service, videoID, url) {
    switch (service) {
        case 'youtube':
            return `https://www.youtube${url.includes('youtube-nocookie.com') ? '-nocookie' : ''}.com/embed/${videoID}?rel=0`;
        case 'vimeo':
            return `https://player.vimeo.com/video/${videoID}`;
        case 'prezi':
            return `https://prezi.com/embed/${videoID}`;
        case 'osf':
            return `https://mfr.osf.io/render?url=${url}`;
        default:
            return url;
    }
}

function youtubeParser(url) {
    const regex = /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

function vimeoParser(url) {
    const regex = /vimeo.*\/(\d+)/i;
    const match = url.match(regex);
    return match ? match[1] : null;
}

function preziParser(url) {
    const regex = /prezi.com\/([^\/\s]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

function mfrParser(url) {
    const regex = /^(.*)$/;
    const match = url.match(regex);
    return match ? match[0] : null;
}

/**
 * Plugin markdown-it pour gérer la syntaxe d'embeds spécifique à Obsidian: ![[Nom du fichier]]
 */
const obsidianEmbedsPlugin = function (md, options = {}) {
    // Options par défaut
    const defaults = {
        // Fonction pour déterminer le type d'un fichier à partir de son extension
        getFileType: (filename) => {
            const ext = filename.split('.').pop()?.toLowerCase() || '';
            const imageExts = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'];
            const audioExts = ['mp3', 'wav', 'ogg'];
            const videoExts = ['mp4', 'webm'];
            if (imageExts.indexOf(ext) >= 0)
                return 'image';
            if (audioExts.indexOf(ext) >= 0)
                return 'audio';
            if (videoExts.indexOf(ext) >= 0)
                return 'video';
            if (ext === 'pdf')
                return 'pdf';
            return 'markdown';
        },
        // Classe CSS pour le conteneur d'embed
        containerClass: 'obsidian-embed',
        // Préfixe à ajouter aux chemins de fichiers médias
        pathPrefix: '',
        // ID unique pour les embeds (utile pour éviter les collisions)
        uniqueId: Math.random().toString(36).substring(2, 10)
    };
    
    // Fusionner les options utilisateur avec les options par défaut
    const opts = { ...defaults, ...options };
    
    // Compteur pour générer des IDs uniques
    let embedCounter = 0;
    
    /**
     * Génère un ID unique pour un embed
     * @returns ID unique
     */
    function generateEmbedId() {
        return `embed-${opts.uniqueId}-${embedCounter++}`;
    }
    
    /**
     * Rend un fichier média en HTML en fonction de son type
     * @param filename - Nom du fichier
     * @param type - Type de fichier (image, audio, video, pdf)
     * @returns HTML pour l'embed
     */
    function renderMedia(filename, type) {
        const path = `${opts.pathPrefix}${filename}`;
        switch (type) {
            case 'image':
                return `<img src="${path}" alt="${filename}" class="embed-image" loading="lazy" />`;
            case 'audio':
                return `<audio controls src="${path}" class="embed-audio"></audio>`;
            case 'video':
                return `<video controls src="${path}" class="embed-video" loading="lazy"></video>`;
            case 'pdf':
                return `<object data="${path}" type="application/pdf" class="embed-pdf" width="100%" height="500px">
                  <p>Ce navigateur ne prend pas en charge l'affichage des PDF. <a href="${path}" target="_blank">Télécharger le PDF</a></p>
                </object>`;
            default:
                return `<a href="${path}" class="embed-link" target="_blank">Voir le fichier: ${filename}</a>`;
        }
    }
    
    /**
     * Normalise un nom de fichier en gérant les extensions et les chemins relatifs
     * @param filename - Nom de fichier brut
     * @returns Nom de fichier normalisé
     */
    function normalizeFilename(filename) {
        // Supprimer tout caractère de formatage restant
        let normalized = filename.replace(/[\[\]]/g, '').trim();
        
        // Si le chemin ne contient pas d'extension et que c'est un fichier markdown, ajouter .md
        if (!normalized.includes('.')) {
            normalized += '.md';
        }
        
        // Ajouter le préfixe du chemin si configuré
        if (opts.pathPrefix) {
            normalized = opts.pathPrefix + normalized;
        }
        
        return normalized;
    }
    
    // Stockage temporaire pour les embeds générés
    const embedsStore = [];
    
    // Marqueur pour les embeds
    const EMBED_MARKER = 'OBSIDIAN_EMBED_' + Math.random().toString(36).substring(2, 8) + '_';
    
    // Règle pour la première passe : remplacer les embeds par des marqueurs uniques
    function embedsRuleMarker(state) {
        // Regex améliorée pour capturer différentes variations de la syntaxe
        const embedRegex = /!\[\[(.*?)\]\]|!\[\[(.+?\])|!\[\](.+?\]\])/g;
        
        for (let i = 0; i < state.tokens.length; i++) {
            if (state.tokens[i].type === 'inline' && state.tokens[i].children) {
                const inlineTokens = state.tokens[i].children;
                let j = 0;
                
                while (j < inlineTokens.length) {
                    const token = inlineTokens[j];
                    
                    if (token.type === 'text') {
                        let match;
                        let lastIndex = 0;
                        const textContent = token.content;
                        const newTokens = [];
                        
                        while ((match = embedRegex.exec(textContent)) !== null) {
                            // Ajouter le texte avant l'embed
                            if (match.index > lastIndex) {
                                const textToken = new state.Token('text', '', 0);
                                textToken.content = textContent.slice(lastIndex, match.index);
                                newTokens.push(textToken);
                            }
                            
                            // Récupérer le nom du fichier - prendre la première capture non nulle
                            const filename = (match[1] || match[2] || match[3] || '').trim();
                            
                            // Si le nom de fichier n'est pas vide
                            if (filename) {
                                // Créer un marqueur unique pour cet embed
                                const embedId = embedsStore.length;
                                const marker = EMBED_MARKER + embedId + '_';
                                
                                // Stocker les informations de l'embed pour la seconde passe
                                embedsStore.push({
                                    id: generateEmbedId(),
                                    filename: filename,
                                    normalizedFilename: normalizeFilename(filename),
                                    fileType: opts.getFileType(filename)
                                });
                                
                                // Ajouter un token texte avec le marqueur
                                const markerToken = new state.Token('embed_marker', '', 0);
                                markerToken.content = marker;
                                markerToken.meta = { embedId };
                                newTokens.push(markerToken);
                            } else {
                                // Si le match existe mais le filename est vide, on garde le texte original
                                const textToken = new state.Token('text', '', 0);
                                textToken.content = match[0];
                                newTokens.push(textToken);
                            }
                            
                            lastIndex = match.index + match[0].length;
                        }
                        
                        // Ajouter le texte restant après le dernier embed
                        if (lastIndex < textContent.length) {
                            const textToken = new state.Token('text', '', 0);
                            textToken.content = textContent.slice(lastIndex);
                            newTokens.push(textToken);
                        }
                        
                        // Si des embeds ont été trouvés, remplacer le token actuel par les nouveaux tokens
                        if (newTokens.length > 0) {
                            inlineTokens.splice(j, 1, ...newTokens);
                            j += newTokens.length;
                            continue;
                        }
                    }
                    
                    j++;
                }
            }
        }
    }
    
    // Règle de rendu pour le type embed_marker
    md.renderer.rules.embed_marker = function(tokens, idx) {
        const token = tokens[idx];
        const embedId = token.meta.embedId;
        const embed = embedsStore[embedId];
        
        if (!embed) {
            return token.content; // Fallback au marqueur si l'embed n'est pas trouvé
        }
        
        const { id, normalizedFilename, fileType } = embed;
        
        // Générer le HTML approprié pour l'embed
        if (fileType !== 'markdown') {
            // Pour les fichiers médias, générer le HTML approprié directement
            const mediaHtml = renderMedia(normalizedFilename, fileType);
            return `<div id="${id}" class="${opts.containerClass}" data-filename="${normalizedFilename}">${mediaHtml}</div>`;
        } else {
            // Pour les fichiers markdown, créer un élément qui sera mis à jour via JavaScript
            return `<div id="${id}" class="${opts.containerClass} embed-markdown" data-filename="${normalizedFilename}" data-src="${normalizedFilename}">
                <div class="embed-loading">Chargement...</div>
            </div>`;
        }
    };
    
    // Ajouter les règles au pipeline de traitement
    md.core.ruler.after('inline', 'obsidian_embeds_marker', embedsRuleMarker);
    
    // Créer l'API
    const api = {
        setPathPrefix: function (prefix) {
            if (typeof prefix === 'string') {
                opts.pathPrefix = prefix;
            }
        }
    };
    
    // Exposer l'API
    md.obsidianEmbeds = api;
    
    // Initialiser le chargement des embeds Markdown au chargement de la page
    if (typeof window !== 'undefined') {
        // Fonction pour initialiser le chargement des embeds Markdown
        function initEmbeds() {
            // Trouver tous les embeds Markdown
            const embeds = document.querySelectorAll('.embed-markdown[data-src]');
            embeds.forEach(loadEmbed);
            
            // Observer les mutations du DOM pour charger les nouveaux embeds
            if (typeof MutationObserver !== 'undefined') {
                const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        if (mutation.type === 'childList') {
                            mutation.addedNodes.forEach((node) => {
                                if (node.nodeType === 1) { // ELEMENT_NODE
                                    // Chercher les embeds dans le nouveau nœud
                                    const newEmbeds = node.querySelectorAll ? 
                                        node.querySelectorAll('.embed-markdown[data-src]') : [];
                                    newEmbeds.forEach(loadEmbed);
                                    
                                    // Vérifier si le nœud lui-même est un embed
                                    if (node.classList && 
                                        node.classList.contains('embed-markdown') && 
                                        node.hasAttribute('data-src')) {
                                        loadEmbed(node);
                                    }
                                }
                            });
                        }
                    });
                });
                
                observer.observe(document.body, { 
                    childList: true, 
                    subtree: true 
                });
            }
        }
        
        // Fonction pour charger un embed Markdown
        function loadEmbed(element) {
            // Vérifier si l'élément a déjà été chargé
            if (element.getAttribute('data-loaded') === 'true') {
                return;
            }
            
            const src = element.getAttribute('data-src');
            if (!src) return;
            
            // Marquer l'élément comme étant en cours de chargement
            element.setAttribute('data-loading', 'true');
            
            // Charger le contenu du fichier
            fetch(src)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Fichier non trouvé (${response.status})`);
                    }
                    return response.text();
                })
                .then(markdownContent => {
                    // Utiliser la fonction de rendu Markdown
                    let renderedHTML;
                    if (typeof window.mdToHtml === 'function') {
                        // Utiliser votre fonction mdToHtml si disponible
                        
                        renderedHTML = window.mdToHtml(markdownContent);
                    } else if (md && typeof md.render === 'function') {
                        // Fallback sur l'instance markdown-it
                        // Créer une nouvelle instance pour éviter les boucles infinies
                        
                        const mdTemp = window.markdownit ? window.markdownit({html: true}) : null;
                        if (mdTemp) {
                            
                            renderedHTML = mdTemp.render(markdownContent);
                        } else {
                            console.log("alla");
                            renderedHTML = md.render(markdownContent);
                        }
                    } else {
                        // Fallback simple
                        renderedHTML = `<pre>${markdownContent}</pre>`;
                    }
                    
                    // Mettre à jour le contenu de l'élément
                    element.innerHTML = `<div class="embed-content">${renderedHTML}</div>`;
                    element.setAttribute('data-loading', 'false');
                    element.setAttribute('data-loaded', 'true');
                })
                .catch(error => {
                    console.error(`Erreur lors du chargement de ${src}:`, error);
                    element.innerHTML = `<div class="embed-error">Erreur lors du chargement: ${error.message}</div>`;
                    element.setAttribute('data-loading', 'false');
                    element.setAttribute('data-error', 'true');
                });
        }
        
        // Attendre que le DOM soit chargé
        window.addEventListener('DOMContentLoaded', initEmbeds);
        // Ou si le DOM est déjà chargé, initialiser immédiatement
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            setTimeout(initEmbeds, 1);
        }
    }
};

export default obsidianEmbedsPlugin;
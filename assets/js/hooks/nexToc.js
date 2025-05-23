// Fonction pour créer le sommaire
function createToc(config) {
    const content = config.content;
    const tocElement = config.tocElement;
    const titleElements = config.titleElements;
  
    // Sélectionner l'élément où le sommaire sera inséré
    let tocElementDiv = content.querySelector(tocElement);
    if (!tocElementDiv) {
      return console.warn('Couldn’t start the TOC');
    }
  
    // Réinitialiser le contenu de l'élément TOC
    tocElementDiv.innerHTML = '';
    let tocUl = document.createElement('ul');
    tocUl.id = 'list-toc-generated';
    tocElementDiv.appendChild(tocUl);
  
    // Ajouter une classe à tous les éléments de titre
    let tocElementNbr = 0;
    titleElements.forEach((selector, index) => {
      let titleHierarchy = index + 1;
      let titleElements = content.querySelectorAll(selector);
  
      titleElements.forEach(element => {
        // Vérifier si l'élément doit être affiché
        if (
          !(element.closest('section')?.classList.contains('toc-ignore') ||
            element.closest('section')?.classList.contains('toc'))
        ) {
          // Ajouter des classes à l'élément
          element.classList.add('title-element');
          element.setAttribute('data-title-level', titleHierarchy);
  
          // Ajouter un id si inexistant
          tocElementNbr++;
          if (element.id === '') {
            element.id = 'title-element-' + tocElementNbr;
          }
  
          let newIdElement = element.id; // Vous pouvez utiliser cette variable si nécessaire
        }
      });
    });
  
    // Créer la liste du TOC
    let tocElements = content.querySelectorAll('.title-element');
  
    tocElements.forEach(tocElement => {
      let tocNewLi = document.createElement('li');
  
      // Ajouter des classes pour la hiérarchie du TOC
      tocNewLi.classList.add('toc-element');
      tocNewLi.classList.add('toc-element-level-' + tocElement.dataset.titleLevel);
  
      // Ajouter des classes supplémentaires pour le style
      let classes = [
        ...tocElement.className.split(' '),
        ...tocElement.closest('section')?.className.split(' ')
      ];
  
      classes.forEach(meta => {
        if (meta && meta !== 'title-element') {
          tocNewLi.classList.add(`toc-${meta}`);
        }
      });
  
      // Conserver les classes des éléments de titre
      tocElement.classList.forEach(cls => {
        if (cls !== 'title-element') {
          tocNewLi.classList.add(cls);
        }
      });
  
      // Créer l'élément du TOC
      tocNewLi.innerHTML = `<a href="#${tocElement.id}">${tocElement.innerHTML}</a>`;
      tocUl.appendChild(tocNewLi);
    });
  }
  
  // Classe de gestion des pages
  class handlers extends Paged.Handler {
    constructor(chunker, polisher, caller) {
      super(chunker, polisher, caller);
    }
  
    beforeParsed(content) {          
      // Supprimer le nav original
      const original_nav = content.querySelector('#nav');
      if (original_nav) {
        original_nav.innerHTML = "";
      }
  
      // Construire une nouvelle TOC avec la fonction createToc
      createToc({
        content: content,
        tocElement: '#nav',
        titleElements: ['main h2', 'main .default h3']
      });
    }
  }
  
  // Enregistrer les gestionnaires
  Paged.registerHandlers(handlers);
  
function initializeInterface(document) {
    let interfaceHeader = document.querySelector("#interface-header");
    let sectorTitle = interfaceHeader.querySelector(".gjs-sm-sector-title");
    let isDragging = false;
    let offsetX, offsetY;

    // Fonction pour rendre la fenêtre déplaçable
    sectorTitle.addEventListener("mousedown", function(e) {
        isDragging = true;
        offsetX = e.clientX - interfaceHeader.getBoundingClientRect().left;
        offsetY = e.clientY - interfaceHeader.getBoundingClientRect().top;
    });

    document.addEventListener("mousemove", function(e) {
        if (isDragging) {
            let left = e.clientX - offsetX;
            let top = e.clientY - offsetY;

            // Limiter le déplacement à l'intérieur de la fenêtre du navigateur
            if (left < 0) left = 0;
            if (top < 0) top = 0;
            if (left + interfaceHeader.offsetWidth > window.innerWidth) left = window.innerWidth - interfaceHeader.offsetWidth;
            if (top + interfaceHeader.offsetHeight > window.innerHeight) top = window.innerHeight - interfaceHeader.offsetHeight;

            interfaceHeader.style.left = left + "px";
            interfaceHeader.style.top = top + "px";
        }
    });

    document.addEventListener("mouseup", function() {
        isDragging = false;
    });

    adjust_interface(document);

}

function includeHTML() {
    const header = `<header id="interface-header"></header>`;
    document.body.insertAdjacentHTML("afterbegin", header);
    fetch("assets/js/hooks/interface/interface.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("interface-header").innerHTML = data;
            // interfaceEvents();
            initializeInterface(document);
        })
        .catch(error => {
            console.error("Error fetching interface.html:", error);
        });
}

class InterfacePaged extends Paged.Handler {
    constructor(chunker, polisher, caller) {
        super(chunker, polisher, caller);
    }

    beforeParsed(content) {
        includeHTML();
    }

    afterPageLayout(pageElement, page, breakToken) {
        const nbr = page.id.replace("page-", "");
        const span = document.querySelector("#nrb-pages");
        if (span) {
            span.innerHTML = nbr;
        } else {
            console.log("Element with ID 'nrb-pages' not found.");
        }

        
    }

    afterParsed(pages){
        
      }
}

Paged.registerHandlers(InterfacePaged);


function adjust_interface(document){

    document.querySelector("#rd2").checked = "true";

    /* MARGIN BOXES ---------------------------------*/
    let marginButton = document.querySelector('#label-marginbox-toggle');
    let marginToggle = document.querySelector("#marginbox-toggle");
    
    // Récupérer l'état sauvegardé depuis localStorage
    const savedMarginState = localStorage.getItem('marginboxToggleState');
    
    // Appliquer l'état sauvegardé au chargement
    if (savedMarginState === 'true') {
        marginToggle.checked = true;
        body.classList.add('marginbox');
        marginButton.innerHTML = "• Margins";
    } else {
        marginToggle.checked = false;
        body.classList.remove('marginbox');
        marginButton.innerHTML = "Margins";
    }
    
    // Écouter les changements et sauvegarder dans localStorage
    marginToggle.addEventListener("input", (e) => {
        if(e.target.checked){
            body.classList.add('marginbox');
            marginButton.innerHTML = "• Margins";
            // Sauvegarder l'état dans localStorage
            localStorage.setItem('marginboxToggleState', 'true');
        }else{
            body.classList.remove('marginbox');
            marginButton.innerHTML = "Margins";
            // Sauvegarder l'état dans localStorage
            localStorage.setItem('marginboxToggleState', 'false');
        }
    });

/* PREVIEW ---------------------------------*/
    let previewButton = document.querySelector('#label-preview-toggle');
    let previewToggle = document.querySelector("#preview-toggle");
    
    // Récupérer l'état sauvegardé depuis localStorage
    const savedPreviewState = localStorage.getItem('previewToggleState');
    
    // Appliquer l'état sauvegardé au chargement
    if (savedPreviewState === 'true') {
        previewToggle.checked = true;
        body.classList.add('interface-preview');
        previewButton.innerHTML = "• Preview";
    } else {
        previewToggle.checked = false;
        body.classList.remove('interface-preview');
        previewButton.innerHTML = "Preview";
    }
    
    // Écouter les changements et sauvegarder dans localStorage
    previewToggle.addEventListener("input", (e) => {
        if(e.target.checked){
            /* preview mode */
            body.classList.add('interface-preview');
            previewButton.innerHTML = "• Preview";
            // Sauvegarder l'état dans localStorage
            localStorage.setItem('previewToggleState', 'true');
        }else{
            body.classList.remove('interface-preview');
            previewButton.innerHTML = "Preview";
            // Sauvegarder l'état dans localStorage
            localStorage.setItem('previewToggleState', 'false');
        }
    });
    /* MARKERS (grid) ---------------------------------*/
    let markerButton = document.querySelector('#label-marker-toggle');
    let markerToggle = document.querySelector("#marker-toggle");
    
    // Récupérer l'état sauvegardé depuis localStorage
    const savedMarkerState = localStorage.getItem('markerToggleState');
    
    // Appliquer l'état sauvegardé au chargement
    if (savedMarkerState === 'true') {
        markerToggle.checked = true;
        body.classList.remove('hideMarker');
        markerButton.innerHTML = "• Markers";
    } else {
        markerToggle.checked = false;
        body.classList.add('hideMarker');
        markerButton.innerHTML = "Markers";
    }
    
    // Écouter les changements et sauvegarder dans localStorage
    markerToggle.addEventListener("input", (e) => {
        if(e.target.checked){
            /* preview mode */
            body.classList.remove('hideMarker');
            markerButton.innerHTML = "• Markers";
            // Sauvegarder l'état dans localStorage
            localStorage.setItem('markerToggleState', 'true');
        }else{
            body.classList.add('hideMarker');
            markerButton.innerHTML = "Markers";
            // Sauvegarder l'état dans localStorage
            localStorage.setItem('markerToggleState', 'false');
        }
    });

};
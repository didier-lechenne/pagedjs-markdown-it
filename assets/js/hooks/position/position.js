/*!
 * didier lechenne
 *
 * JavaScript - Image Pan Drag and Zoom
 * https://andrewnoske.com/wiki/JavaScript_-_Image_Pan_and_Zoom_Demo
 *
 * press shiftKey for zoomming
 *
 */

// print mode
import { data, options } from "../../utils/getYml.js";
import { TurndownService } from './turndown.js';

const turndownService = new TurndownService();


class DragZoom extends Paged.Handler {
	constructor(chunker, polisher, caller) {
		super(chunker, polisher, caller);
	}
	afterPreview(pages) {
		dragZoom(pages);
	}
	afterRendered(pages) {
		createControls();
	}
}

Paged.registerHandlers(DragZoom);

function createTemplateIndex(parts) {
    const index = {};
    parts.forEach(part => {
        if (!index[part.template]) {
            index[part.template] = [];
        }
        index[part.template].push(part);
    });
    return index;
}


function dragZoom(pages) {

	let imgDiv = null; // Image being dragged and panned.
	let prevX; // Previous x position of mouse (starting with start pos).
	let prevY; // Previous y position of mouse (starting with start pos).
    let usefull_classes = "";
    let currentClass = null;
    let resetCursorTimeout;
    let getCol;
    let getRow;
    let selected;

	const dragIcon = document.createElement('img');
	dragIcon.src = "assets/js/hooks/position/drag_image.png";

    document.body.dataset.mode = 'layout';


   

    
    const handleMouseOver = (e) => {

        const search = shortCode(e);
        // parent est l'element html (<div class="insert">)
        const parent = search[0];
        // console.log(parent);
        // shortCode est le nom du shortCode (insert)
        const shortCode_is = search[1];


        parent.style.cursor = 'help';

        if (!parent.classList.contains('selected')) {
            parent.classList.add('hover');
        }

		if (!e.shiftKey) return;

        parent.classList.remove('hover');
        
        const section = parent.closest('section');
        if (section) {
            let elements = section.querySelectorAll('div, figure, .figure');
            for (let elem of elements) {
                elem.classList.remove('selected');
            }
        }
        
        parent.classList.add('selected');


        document.querySelector("#rd1").checked = "true";

        if (shortCode_is == "resize") {
            // a modifier Vérifiez si e.target est un élément <img>
            if (e.target.tagName.toLowerCase() === 'img') {
                imgDiv = e.target;
            } else {
                // Si ce n'est pas le cas, recherchez l'élément <img> à l'intérieur de l'élément <figure>
                const figure = e.target.closest('figure');
                if (figure) {
                    imgDiv = figure.querySelector('img');
                } 
            }
        }

        
        if (section) {
            let getCol = getComputedStyle(section).getPropertyValue('--grid-col').trim();
            let getRow = getComputedStyle(section).getPropertyValue('--grid-row').trim();
        
            if (getCol === '' || getRow === '') {
                getCol = 12;
                getRow = 1;
                adjustInputMaxValues(getCol, getRow);
            } else if (getCol === undefined || getRow === undefined) {
                getCol = 12;
                getRow = 1;
                adjustInputMaxValues(getCol, getRow);
            } else {
                adjustInputMaxValues(getCol, getRow);
            }
        } else {
            console.error('No section element found');
        }
            
    
        const cssProperties = getCSSProperties(parent,imgDiv);
		const imgID = getImgID(parent);
        
        // const newDiv = document.createElement('div');
        // newDiv.className = 'info';
        // body.appendChild(newDiv);

        // document.querySelector(".info").textContent = shortCode_is;
        // e.target.setAttribute('data-before', shortCode_is);

        updateUI(imgID, cssProperties,  imgDiv, shortCode_is)
		addEventListeners(parent, imgID, imgDiv, cssProperties);
	};

    function adjustInputMaxValues (getCol, getRow) {   
        const ColInput = document.querySelector("#col");
        const WidthInput = document.querySelector("#width");
        const printColInput = document.querySelector("#printcol");
        const printWidthInput = document.querySelector("#printwidth");
        const printRowInput = document.querySelector("#printrow");
        const printHeightInput = document.querySelector("#printheight");
    
        ColInput.setAttribute('max', getCol);
        WidthInput.setAttribute('max', getCol);
        printColInput.setAttribute('max', getCol);
        printWidthInput.setAttribute('max', getCol);
        printRowInput.setAttribute('max', getRow);
        printHeightInput.setAttribute('max', getRow);
    }

	const handleDragStart = (e) => {
        if ( !e.shiftKey) return;

        if (e.target.tagName.toLowerCase() === 'img') {
            imgDiv = e.target;
            prevX = e.clientX;
            prevY = e.clientY;
            e.target.style.cursor = 'grab';
        } else {
            // e.target.style.cursor = 'help';

            // Si ce n'est pas le cas, recherchez l'élément <img> à l'intérieur de l'élément <figure>
            const figure = e.target.closest('figure');
            if (figure) {
                imgDiv = figure.querySelector('img');
            } else {
                console.error('No <img> element found within the <figure> element');
                return;
            }
        }


	};

	const handleDragOver = (event) => {
        if ( !event.shiftKey || !imgDiv ) return;

       
        event.preventDefault(); // Permettre le glisser-déposer
        event.target.style.cursor = 'grab';

		const x = event.clientX;
		const y = event.clientY;

		translateDiv(imgDiv, x - prevX, y - prevY);

		prevX = x;
		prevY = y;

        
	};

    function translateDiv(div, x, y) {
        const parentWidth = div.parentElement.offsetWidth;
        const parentHeight = div.parentElement.offsetHeight;
    
        // Obtenir les valeurs actuelles des variables CSS personnalisées
        const currentX = parseFloat(getComputedStyle(div.parentElement).getPropertyValue("--imgX")) || 0;
        const currentY = parseFloat(getComputedStyle(div.parentElement).getPropertyValue("--imgY")) || 0;
    
        // Calculer les nouvelles positions
        const newX = currentX + (x / parentWidth * 100);
        const newY = currentY + (y / parentHeight * 100);
    
        // Définir les nouvelles valeurs des variables CSS personnalisées
        div.parentElement.style.setProperty("--imgX", newX);
        div.parentElement.style.setProperty("--imgY", newY);
    }
    
    const handleDragEnd = (event) => {
        // if ( !event.shiftKey  ) return;

        event.target.style.cursor = 'default'; 

        const parent = event.target.closest('figure');
    
        // Vérifiez que parent n'est pas null ou undefined
        if (!parent) {
            console.error('Parent element not found');
            return;
        }
    
        // Vérifiez que imgDiv est défini
        if (!imgDiv) {
            console.error('imgDiv is not defined');
            return;
        }
        // console.log("dragEnd");
        layoutHelperLog(parent);
    };
    
    let scrollTimeout;
    const handleMouseWheel = (e) => {
        if (!e.target || e.target.height == 0 || e.target.width == 0 || !e.shiftKey) return;

            imgDiv = e.target;
            const delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
            const scaleAmount = 1.0 + (delta * 5 / 90.0);
            const maxWidth = 10000;
            const minWidth = 100;
            const relResizePosX = e.layerX / e.target.width;
            const relResizePosY = e.layerY / e.target.height;
        
            const imgID = getImgID(e.target);
            const parent = e.target.closest('figure');
            const cssProperties = getCSSProperties(parent,imgDiv);

            const imgSrc = imgDiv.src;
            const relativePath = getRelativePath(imgSrc);
        
            // Ajouter le style du curseur zoom-in ou zoom-out
            if (delta > 0) {
                e.target.style.cursor = 'zoom-in';
            } else {
                e.target.style.cursor = 'zoom-out';
            }

            resizeDiv(e.target, scaleAmount, maxWidth, minWidth, relResizePosX, relResizePosY, imgID, cssProperties,  imgDiv, relativePath);

            // Annuler le délai précédent si un nouvel événement se produit
            clearTimeout(resetCursorTimeout);

            // Définir un nouveau délai pour réinitialiser le curseur après 500 ms d'inactivité
            resetCursorTimeout = setTimeout(() => {
                e.target.style.cursor = 'help'; // ou 'info' si vous préférez
                layoutHelperLog(e.target.parentElement);
            }, 500);

    };

    function resizeDiv(div, scaleAmount, maxWidth, minWidth, relResizePosX, relResizePosY, imgID, cssProperties,  imgDiv, relativePath) {
        const oldWidth = div.offsetWidth;
        const oldHeight = div.offsetHeight;
        let newWidth = scaleAmount * oldWidth;
        if (newWidth > maxWidth) newWidth = maxWidth;
        if (newWidth < minWidth) newWidth = minWidth;
        const resizeFract = (newWidth - oldWidth) / oldWidth;
    
        const parentWidth = div.parentElement.offsetWidth;
        const newWidthPercentage = (newWidth / parentWidth) * 100;

        div.parentElement.style.setProperty("--imgW", newWidthPercentage);
        // div.style.width = newWidthPercentage + '%';
    
        const parentHeight = div.parentElement.offsetHeight;
        const newLeftPercentage = ((-oldWidth * resizeFract * relResizePosX) + div.offsetLeft) / parentWidth * 100;
        const newTopPercentage = ((-oldHeight * resizeFract * relResizePosY) + div.offsetTop) / parentHeight * 100;
    
        div.parentElement.style.setProperty("--imgX", newLeftPercentage);
        div.parentElement.style.setProperty("--imgY", newTopPercentage);
    }

    const handleMouseOut = (e) => {
        const search = shortCode(e);
        const parent = search[0];
        // console.log(parent);
        parent.classList.remove('hover');
        if (!e.shiftKey) return;
        parent.classList.remove('hover');

        if (currentClass) {
            // document.body.classList.remove(currentClass);
            // currentClass = null;
        }
    };
    
	const handleArrowKeys = (e) => {
		if (!imgDiv || !e.shiftKey) return;
		const step = 1;
		switch (e.key) {
			case "ArrowUp":
				translateDiv(imgDiv, 0, -step);
                layoutHelperLog(imgDiv.parentElement);
				break;
			case "ArrowDown":
				translateDiv(imgDiv, 0, step);
                layoutHelperLog(imgDiv.parentElement);
				break;
			case "ArrowLeft":
				translateDiv(imgDiv, -step, 0);
                layoutHelperLog(imgDiv.parentElement);
				break;
			case "ArrowRight":
				translateDiv(imgDiv, step, 0);
                layoutHelperLog(imgDiv.parentElement);
				break;
		}
	};

	const addPanAndZoomToImagesByClass = (className) => {
        const allFigures = document.querySelectorAll('.figure');
        allFigures.forEach(figure => {
            if (figure.classList.contains(className)) {
                figure.addEventListener('mouseover', handleMouseOver, false);
                figure.addEventListener('mouseout', handleMouseOut, false);
                // figure.addEventListener('dragstart', handleDragStart, false);
                // figure.addEventListener('dragover', handleDragOver, false);
                // figure.addEventListener('mousewheel', handleMouseWheel, false);
                figure.addEventListener('dragend', handleDragEnd, false);
            }
        });

        const allResizes = document.querySelectorAll('.resize');
        allResizes.forEach(resize => {
            if (resize.classList.contains(className)) {
                resize.addEventListener('mouseover', handleMouseOver, false);
                resize.addEventListener('mouseout', handleMouseOut, false);
                resize.addEventListener('dragstart', handleDragStart, false);
                resize.addEventListener('dragover', handleDragOver, false);
                resize.addEventListener('mousewheel', handleMouseWheel, false);
                resize.addEventListener('dragend', handleDragEnd, false);
            }
        });

        const allEncarts = document.querySelectorAll('.insert');
        allEncarts.forEach(insert => {
            if (insert.classList.contains(className)) {
                insert.addEventListener("mouseover", handleMouseOver);
                insert.addEventListener('mouseout', handleMouseOut, false);
            }
        });
    
        // const allLegendes = document.querySelectorAll('.legende');
        // allLegendes.forEach(legende => {
        //     if (legende.classList.contains(className)) {
        //         legende.addEventListener("mouseover", handleMouseOver, false);
        //         legende.addEventListener('mouseout', handleMouseOut, false);
        //     }
        // });
    
        // Ajouter un écouteur d'événements pour keydown sur le document
        document.addEventListener('keydown', handleArrowKeys);
    };

	addPanAndZoomToImagesByClass('figure');
    addPanAndZoomToImagesByClass('resize');
    addPanAndZoomToImagesByClass('insert');

	const copyButton = document.querySelector('.copy .button');
	copyButton.addEventListener('click', handleCopyButtonClick);
}

function getImgID(parent) {
	// const parent = element.closest('figure');
    if (parent){
        const idDocument = parent.getAttribute('data-id');
        return idDocument.match(/\d+$/)[0];
    }
}

function getCSSProperties(parent, imgDiv) {
    const col = parent.style.getPropertyValue('--col') ;
    const width = parent.style.getPropertyValue('--width');
    const printcol = parent.style.getPropertyValue('--printcol') ;
    const printwidth = parent.style.getPropertyValue('--printwidth');
    const printrow = parent.style.getPropertyValue('--printrow') ;
    const printheight = parent.style.getPropertyValue('--printheight');
    const align_self = parent.style.getPropertyValue('--alignself') ;
    const figcaption_arrow = parent.style.getPropertyValue('--figcaption_arrow') ;

    // Ajouter imgX, imgY, et imgW
    const imgX = parent.style.getPropertyValue('--imgX');
    const imgY = parent.style.getPropertyValue('--imgY');
    const imgW = parent.style.getPropertyValue('--imgW');

    return {
        col,
        width,
        printcol,
        printwidth,
        printrow,
        printheight,
        align_self,
        figcaption_arrow,
        imgX,
        imgY,
        imgW
    };
}

function shortCode(e) {
    if (e.target.closest('.resize')) {
        return [e.target.closest('.resize'), "resize"];
    }
    if (e.target.closest('.image')) {
        return [e.target.closest('.image'), "image"];
    }
    if (e.target.closest('.figure')) {
        return [e.target.closest('.figure'), "figure"];
    }

    if (e.target.closest('.insert')) {
        return [e.target.closest('.insert'), "insert"];
    }
    return undefined;
}

function updateUI(imgID, cssProperties,  imgDiv, shortCode_is) {
	const { col, width, printcol, printwidth, printrow, printheight, align_self, figcaption_arrow, imgX, imgY, imgW } = cssProperties;

	document.querySelector("#col").value = Number(col);
	document.querySelector("#width").value = Number(width);
	document.querySelector("#printcol").value = Number(printcol);
	document.querySelector("#printwidth").value = Number(printwidth);
	document.querySelector("#printrow").value = Number(printrow);
	document.querySelector("#printheight").value = Number(printheight);
	document.querySelector("#align_self").value = align_self;
	document.querySelector("#figcaption_arrow").value = figcaption_arrow;
    
    const label = document.querySelector("#label_rd1");
    label.setAttribute('data-name', `#${shortCode_is}_${imgID}`);
    const dataShortCode = document.querySelector("#position");
    dataShortCode.setAttribute('data-shortcode', `${shortCode_is}`);
}

function getRelativePath(url) {
    const urlObj = new URL(url);
    let relativePath = urlObj.pathname + urlObj.search + urlObj.hash;
    if (relativePath.startsWith('/')) {
        relativePath = relativePath.substring(1);
    }
    return relativePath;
}

function addEventListeners(parent, imgID, imgDiv) {
    // Fonction pour définir les propriétés CSS personnalisées
    function setCSSProperties(element, properties) {
        for (const [key, value] of Object.entries(properties)) {
            element.style.setProperty(key, value);
        }
    }

    // Fonction pour calculer les positions X et Y
    function calculatePosition(parentWidth, parentHeight, imgWidth, imgHeight, alignX, alignY) {
        const imgX = (parentWidth - imgWidth) * alignX / parentWidth * 100;
        const imgY = (parentHeight - imgHeight) * alignY / parentHeight * 100;
        return { imgX, imgY };
    }

    // Fonction pour ajuster le contenu
    function adjustContent(parent, imgDiv) {
        const parentHeight = parent.offsetHeight;
        const originalWidth = imgDiv.naturalWidth;
        const originalHeight = imgDiv.naturalHeight;
        const newWidth = (originalWidth / originalHeight) * parentHeight;
        const imgW = (newWidth / parent.offsetWidth) * 100;
        const imgY = 0;
        const parentWidth = parent.offsetWidth;
        const imgDragWidth = imgDiv.offsetWidth;
        const imgX = (parentWidth - imgDragWidth) / 2 / parentWidth * 100;

        setCSSProperties(imgDiv.parentElement, {
            '--imgW': imgW,
            '--imgX': imgX,
            '--imgY': imgY
        });

        layoutHelperLog(parent);
    }

    // Fonction pour remplir le bloc
    function fillBlock(parent, imgDiv) {
        const parentWidth = parent.offsetWidth;
        const parentHeight = parent.offsetHeight;
        const imgW = 100;
        const { imgX, imgY } = calculatePosition(parentWidth, parentHeight, imgDiv.offsetWidth, imgDiv.offsetHeight, 0.5, 0.5);

        setCSSProperties(imgDiv.parentElement, {
            '--imgW': imgW,
            '--imgX': imgX,
            '--imgY': imgY
        });

        layoutHelperLog(parent);
    }

    // Fonction pour positionner l'image
    function positionImage(parent, imgDiv, alignX, alignY) {
        const parentWidth = parent.offsetWidth;
        const parentHeight = parent.offsetHeight;
        const imgDragWidth = imgDiv.offsetWidth;
        const imgDragHeight = imgDiv.offsetHeight;
        const { imgX, imgY } = calculatePosition(parentWidth, parentHeight, imgDragWidth, imgDragHeight, alignX, alignY);

        setCSSProperties(imgDiv.parentElement, {
            '--imgX': imgX,
            '--imgY': imgY
        });

        layoutHelperLog(parent);
    }

    // Fonction pour gérer l'alignement de l'image
    function handleAlignSelf(parent, imgDiv, alignSelfValue) {
        setCSSProperties(imgDiv.parentElement, {
            '--alignself': alignSelfValue
        });

        layoutHelperLog(parent);
    }

    // Sélecteurs
    const remplirBloc = document.querySelector("#remplir_bloc");
    const ajusterContenu = document.querySelector("#ajuster_contenu");
    const topLeft = document.querySelector("#top_left");
    const topMiddle = document.querySelector("#top_middle");
    const topRight = document.querySelector("#top_right");
    const middleLeft = document.querySelector("#middle_left");
    const middleMiddle = document.querySelector("#middle_middle");
    const middleRight = document.querySelector("#middle_right");
    const bottomLeft = document.querySelector("#bottom_left");
    const bottomMiddle = document.querySelector("#bottom_middle");
    const bottomRight = document.querySelector("#bottom_right");
    const align_self = document.querySelector("#align_self");

    // Événements
    remplirBloc.onclick = function (e) {
        fillBlock(parent, imgDiv);
    };

    ajusterContenu.onclick = function (e) {
        adjustContent(parent, imgDiv);
    };

    topLeft.onclick = function (e) {
        positionImage(parent, imgDiv, 0, 0);
    };

    topMiddle.onclick = function (e) {
        positionImage(parent, imgDiv, 0.5, 0);
    };

    topRight.onclick = function (e) {
        positionImage(parent, imgDiv, 1, 0);
    };

    middleLeft.onclick = function (e) {
        positionImage(parent, imgDiv, 0, 0.5);
    };

    middleMiddle.onclick = function (e) {
        positionImage(parent, imgDiv, 0.5, 0.5);
    };

    middleRight.onclick = function (e) {
        positionImage(parent, imgDiv, 1, 0.5);
    };

    bottomLeft.onclick = function (e) {
        positionImage(parent, imgDiv, 0, 1);
    };

    bottomMiddle.onclick = function (e) {
        positionImage(parent, imgDiv, 0.5, 1);
    };

    bottomRight.onclick = function (e) {
        positionImage(parent, imgDiv, 1, 1);
    };

    align_self.onclick = function (e) {
        handleAlignSelf(parent, imgDiv, align_self.value);
    };

    function handleClick(event, propertyName) {
        const value = event.target.value;
        parent.style.setProperty(propertyName, value);
        layoutHelperLog(parent);
    }

    const elements = [
        { selector: "#printcol", property: "--printcol" },
        { selector: "#col", property: "--col" },
        { selector: "#width", property: "--width" },
        { selector: "#printwidth", property: "--printwidth" },
        { selector: "#printrow", property: "--printrow" },
        { selector: "#printheight", property: "--printheight" },
        { selector: "#align_self", property: "--alignself" }
    ];

    elements.forEach(element => {
        const elem = document.querySelector(element.selector);
        if (elem) {
            elem.onclick = function (e) {
                handleClick(e, element.property);
            };
        } else {
            console.error(`Element with selector ${element.selector} not found.`);
        }
    });
}

function layoutHelperLog(parent) {
    const is_image = parent.classList.contains('image');
    const is_encart = parent.classList.contains('insert');
    const is_imagegrid = parent.classList.contains('resize');
    const is_figure = parent.classList.contains('figure');

    let usefull_classes = "";
    let properties = ["col", "width", "printcol", "printwidth", "printrow", "printheight", "alignself", "imgX", "imgY", "imgW"];
    let i = "";
    let url = "";

    if (!is_encart) {
        i = parent.querySelector("img");
        if (i) {
            url = i.getAttribute('src');
            // console.log(parent);
            // console.log(i);
            // console.log(url);
        }
    }

    const fc = parent.querySelector("figcaption");
    let caption = "";
    // console.log(fc);
    // textContent a verifier
    if (fc && fc.textContent.trim()) {
        const clone = fc.cloneNode(true);
        if (is_figure) {
            const toremove = clone.querySelectorAll('.figure_call_back, .figure_reference');
            toremove.forEach(e => {
                e.remove();
            });
        }
        caption = `caption: ${turndownService.turndown(clone.innerHTML)}`;
    }

    usefull_classes = parent.className.replace(/selected/g, "").replace(/selected/g, "").replace(/hover/g, "").replace(/cursor/g, "").replace(/figure/g, "").replace(/image/g, "").replace(/insert/g, "").replace(/resize/g, "").replace(/figmove/g, "").replace(/icono/g, "").trim();
    const classes = usefull_classes ? `class: ${usefull_classes}` : "";
    // console.log(usefull_classes);
    // console.log(classes);

    let code = "";
    let inlinestyles = "";
    if (!is_encart) {
        properties.forEach(prop => {
            const val = parent.style.getPropertyValue(`--${prop}`);
            if (val) {
                inlinestyles += `${prop}:${val} `;
            }
        });
        code = `(figure: ${url} ${inlinestyles} ${classes} ${caption})`;
        if (is_imagegrid) code = `(imagegrid: ${url} ${inlinestyles} ${classes} ${caption})`;
        if (is_image) code = `(image: ${url} ${inlinestyles} ${classes} ${caption})`;
    } else {
        const styles = parent.style;
        for (let i = 0; i < styles.length; i++) {
            const property = styles[i];
            const value = styles.getPropertyValue(property);
            inlinestyles += `${property}:${value}; `;
        }
        code = `{.insert ${usefull_classes.split(' ').map(cls => `.${cls}`).join(' ')} style="${inlinestyles}"}`;
    }

     console.log(code);

    let input = document.querySelector("#showCode");
    input.value = code;

    let cssoutput = document.querySelector(".cssoutput");
    cssoutput.textContent = code;

    if (navigator.clipboard) {
        copyCode(code);
    } else {
        input.select();
        document.execCommand('copy');
    }
}

async function copyCode(code) {
    try {
        await navigator.clipboard.writeText(code);
        document.querySelector(".copy").classList.add("copied");
        setTimeout(() => {
            document.querySelector(".copy").classList.remove("copied");
        }, 1000);
    } catch (err) {
        console.error('Failed to copy: ', err);
    }
}

function handleCopyButtonClick() {
	const contentToCopy = document.querySelector('.cssoutput');
	const copiedId = document.querySelector('#copied');
	copiedId.textContent = "";

	const textContent = contentToCopy.innerHTML
		// .replace(/<br\s*\/?>/g, '\n')
		// .replace(/&amp;/g, '&')
		// .replace(/&lt;/g, '<')
		// .replace(/&gt;/g, '>')
		// .replace(/&quot;/g, '"')
		// .replace(/&#39;/g, "'");

	navigator.clipboard.writeText(textContent)
		.then(() => {
			// copiedId.textContent = "Copied!";
            console.log(textContent)
			setTimeout(() => {
				copiedId.textContent = "";
			}, 2000);
		})
		.catch(() => {
			copiedId.textContent = "Error!";
			setTimeout(() => {
				copiedId.textContent = "";
			}, 2000);
		});
}

function createControls() {
	let html = `<div class="tab" id="position" data-shortCode="">
	<input type="checkbox" id="rd1" name="rd" class="input-pgjs_Img" >
		<label class="tab-label" id="label_rd1" for="rd1" data-name="Layout" ></label>
		<div class="gjs-sm-properties tab-content">
			<div class="gjs-sm-properties ui_screen">

				<div class="gjs-sm-property ">
					<div class="gjs-sm-label" >
						<span class="" title="">col <span class="color">↦</span> <br>(screen)</span>
					</div>
					<div class="gjs-fields">
						<div class="gjs-field arrow">
							<input class="reset-this" type="number" id="col" name="col" min="1" max="12" value="1"  >
						</div>
					</div>
				</div>
				<div class="gjs-sm-property">
					<div class="gjs-sm-label" >
						<span class="" title="">width <span class="color">↔</span><br>(screen)</span>
					</div>
					<div class="gjs-fields">
						<div class="gjs-field arrow">
							<input class="reset-this" type="number" id="width" name="width" min="1" max="12" value="1"  >
						</div>
					</div>
				</div>
			</div>

			<div class="gjs-sm-properties">
			<hr>
					<div class="gjs-sm-property">
						<div class="gjs-sm-label" >
							<span class="" title="">col <span class="color">↦</span><br>(print)</span>
						</div>
						<div class="gjs-fields">
							<div class="gjs-field arrow">
								<input class="reset-this" type="number" id="printcol" name="printcol" min="1" max="12" value="1"  >
							</div>
						</div>
					</div>
					<div class="gjs-sm-property">
						<div class="gjs-sm-label" >
							<span class="" title="">width <span class="color">↔</span><br>(print)</span>
						</div>
						<div class="gjs-fields">
							<div class="gjs-field arrow">
								<input class="reset-this" type="number" id="printwidth" name="printwidth" min="1" max="12" value="1"  >
							</div>
						</div>
					</div>
			</div>

			<div class="gjs-sm-properties ui_row">
					<div class="gjs-sm-property">
						<div class="gjs-sm-label" >
							<span class="gjs-sm-icon" title="">row <span class="color">↧</span><br>(print)</span>
						</div>
						<div class="gjs-fields">
							<div class="gjs-field arrow">
								<input class="reset-this" type="number" id="printrow" name="printrow" min="1" max="12" value="1" >
							</div>
						</div>
					</div>
					<div class="gjs-sm-property">
						<div class="gjs-sm-label" >
							<span class="gjs-sm-icon" title="">height <span class="color">↕</span><br>(print)</span>
						</div>
						<div class="gjs-fields">
							<div class="gjs-field  arrow">
								<input class="reset-this" type="number" id="printheight" name="printheight" min="1" max="12" value="1" >
							</div>
						</div>
					</div>
			</div>

			<div class="gjs-sm-properties ui_alignself">
					<hr>
						<div class="gjs-sm-label" >
							<span class="gjs-sm-icon" title="">Alignement vertical <span class="color">↕</span></span>
						</div>
						<div class="gjs-fields" >
							<div class="gjs-field gjs-select">
								<span id="gjs-sm-input-holder">
									<select class="reset-this" id="align_self" name="align_self" >
										<option value="start" selected>start</option>
										<option value="center">center</option>
										<option value="end">end</option>
									</select>
								</span>
								<div class="gjs-sel-arrow">
									<div class="gjs-d-s-arrow"></div>
								</div>
							</div>
						</div>

			</div>

			<div class="gjs-sm-properties ui_arrow">
					<hr>
						<div class="gjs-sm-label" >
							<span class="gjs-sm-icon" title="">Direction des flèches</span>
						</div>
						<div class="gjs-fields" >
							<div class="gjs-field gjs-select">
								<span id="gjs-sm-input-holder">
									<select class="reset-this" id="figcaption_arrow" name="figcaption_arrow" >
										<option value="top" selected>Top</option>
										<option value="bottom">Bottom</option>
										<option value="left">Left</option>
										<option value="right">Right</option>
										<option value="up_right">Top right</option>
										<option value="down_right">Bottom right</option>
										<option value="up_left">Top left</option>
										<option value="down_left">Bottom left</option>
									</select>
								</span>
								<div class="gjs-sel-arrow">
									<div class="gjs-d-s-arrow"></div>
								</div>
							</div>
						</div>

			</div>

			<div class="gjs-sm-properties ui_resize">
			<hr>
							<div class="gjs-sm-property">
								<div class="carre">
									<div class="box">
										<input class="reset-this" type="radio" id="top_left" name="top_left">
											<label class="reset-this gjs-radio-item-label" for="top_left" id="label_top_left">•</label>
									</div>
									<div class="box">
										<input class="reset-this" type="radio" id="top_middle" name="top_middle">
											<label class="reset-this gjs-radio-item-label" for="top_middle" id="label_top_middle">•</label>
									</div>
									<div class="box">
										<input class="reset-this" type="radio" id="top_right" name="top_right">
											<label class="reset-this gjs-radio-item-label" for="top_right" id="label_top_right">•</label>
									</div>
									<div class="box">
										<input class="reset-this" type="radio" id="middle_left" name="middle_left">
											<label class="reset-this gjs-radio-item-label" for="middle_left" id="label_middle_left">•</label>
									</div>
									<div class="box">
										<input class="reset-this" type="radio" id="middle_middle" name="middle_middle">
											<label class="reset-this gjs-radio-item-label" for="middle_middle" id="label_middle_middle">•</label>
									</div>
									<div class="box">
										<input class="reset-this" type="radio" id="middle_right" name="middle_right">
											<label class="reset-this gjs-radio-item-label" for="middle_right" id="label_middle_right">•</label>
									</div>
									<div class="box">
										<input class="reset-this" type="radio" id="bottom_left" name="bottom_left">
											<label class="reset-this gjs-radio-item-label" for="bottom_left" id="label_bottom_left">•</label>
									</div>
									<div class="box">
										<input class="reset-this" type="radio" id="bottom_middle" value"bottom_middle" name="bottom_middle">
										<label class="reset-this gjs-radio-item-label" for="bottom_middle" id="label_bottom_middle">•</label>
									</div>
									<div class="box">
										<input class="reset-this" type="radio" id="bottom_right" value"bottom_right" name="bottom_right">
										<label class="reset-this gjs-radio-item-label" for="bottom_right" id="label_bottom_right">•</label>
									</div>
								</div>
							</div>
							<div class="gjs-sm-property">
								<div class="gjs-fields">
									<div class="gjs-field">
										<span class="gjs-radio-item">
											<input class="reset-this" type="checkbox" id="ajuster_contenu" name="ajuster_contenu">
												<label class="reset-this gjs-radio-item-label" for="ajuster_contenu" id="label_ajuster_contenu">Adjust content</label>
										</span>
									</div>
								</div>
								<div class="gjs-fields">
									<div class="gjs-field">
										<span class="gjs-radio-item">
											<input class="reset-this" type="checkbox" id="remplir_bloc" name="remplir_bloc">
												<label class="reset-this gjs-radio-item-label" for="remplir_bloc" id="label_remplir_bloc">Fill block</label>
										</span>
									</div>
								</div>
							</div>
			</div>

			<div class="gjs-sm-properties ">
			<hr>
						<div class="copy">
							<span class="right" data-state="closed">
								<button class="button">
									<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-sm">
										<path fill-rule="evenodd" clip-rule="evenodd" d="M12 4C10.8954 4 10 4.89543 10 6H14C14 4.89543 13.1046 4 12 4ZM8.53513 4C9.22675 2.8044 10.5194 2 12 2C13.4806 2 14.7733 2.8044 15.4649 4H17C18.6569 4 20 5.34315 20 7V19C20 20.6569 18.6569 22 17 22H7C5.34315 22 4 20.6569 4 19V7C4 5.34315 5.34315 4 7 4H8.53513ZM8 6H7C6.44772 6 6 6.44772 6 7V19C6 19.5523 6.44772 20 7 20H17C17.5523 20 18 19.5523 18 19V7C18 6.44772 17.5523 6 17 6H16C16 7.10457 15.1046 8 14 8H10C8.89543 8 8 7.10457 8 6Z" fill="currentColor"></path>
									</svg>Copy markdown
								</button>
							</span>
                            <span id="copied"></span>
						</div>
                        <input id="showCode" value="code">
						<div class="cssoutput-wrapper hide">
							<pre class="cssoutput"></pre>
						</div>
			</div>
		</div>
</div>
`;
	let interfaceHeader = document.querySelector("#interface-header");
	let tabs = interfaceHeader.querySelectorAll(".tab");
	let last_tab = tabs[tabs.length - 1];
	//console.log("last = " + last_tab);
	last_tab.insertAdjacentHTML("afterend", html)
}

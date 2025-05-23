/*!
 * didier lechenne
 *
 * JavaScript - Image Pan Drag and Zoom 
 * https: //andrewnoske.com/wiki/JavaScript_-_Image_Pan_and_Zoom_Demo
 *
 * press shiftKey for zoomming
 *
 */

// print mode
class DragZoom extends Paged.Handler {
	constructor(chunker, polisher, caller) {
		super(chunker, polisher, caller);
	}
	afterPreview(pages) {
		dragZoom(pages);
	}
	afterRendered(pages) {
		// insertion d'un bloc pour les modeles img
		createControls();
	}
}

Paged.registerHandlers(DragZoom);


function dragZoom(pages) {

	var imgDiv = null; // Image being dragged and panned.
	var prevX; // Previous x position of mouse (starting with start pos).
	var prevY; // Previous y position of mouse (starting with start pos).

	var dragIcon = document.createElement('img');
	dragIcon.src = "assets/js/hooks/position/drag_image.png";


	/**
	 * Handler for drag event on our draggable images.
	 * @param {DragEvent} event The drag event.
	 */
	function handleDragStart(e) {
		imgDiv = e.target;
		prevX = e.clientX;
		prevY = e.clientY;
		e.dataTransfer.setDragImage(dragIcon, 0, 0);
	}


	/**
	 * Handler for dragging an image.
	 * @param {MouseEvent} event The mouse event.
	 */
	function handleDragOver(event) {
		if (!imgDiv) return;
		var x = event.clientX;
		var y = event.clientY;
		translateDiv(imgDiv, x - prevX, y - prevY);
		prevX = x;
		prevY = y;
	}

	function handleDragEnd(event) {
		let imgID = "";
		let parent = event.target.closest('figure');
		let idDocument = parent.getAttribute('data-id');
		imgID = idDocument.match(/\d+$/)[0];

		let imgX ;
		let imgY ;
		let imgW ;
		let imgH ;
		let col ;
		let width;
		let printcol;
		let printwidth ;
		let printrow ;
		let printheight ;
		let align_self ;
		let snippets ;

		col = parent.style.getPropertyValue('--col');
		width = parent.style.getPropertyValue('--width');
		printcol = parent.style.getPropertyValue('--printcol');
		printwidth = parent.style.getPropertyValue('--printwidth');
		printrow = parent.style.getPropertyValue('--printrow');
		printheight = parent.style.getPropertyValue('--printheight');
		align_self = parent.style.getPropertyValue('--alignself');
		snippets = "resize";

		updatecss(imgID, imgX, imgY, imgW, col, width, printcol, printwidth, printrow, printheight, align_self, snippets);
	}

	/**
	 * Move a div tag (where div should be set with position:absolute).
	 * @param {Element} e The HTML element to move.
	 * @param {number} x The amount to translate the element in x
	 *    (positive value moves right, negative value moves left).
	 * @param {number} y The amount to translate the element in y
	 *    (positive value moves up, negative value moves down).
	 */

	function translateDiv(div, x, y) {
		var parentWidth = div.parentElement.offsetWidth; // Largeur totale du conteneur parent en pixels
		var parentHeight = div.parentElement.offsetHeight; // Hauteur totale du conteneur parent en pixels
		var newX = parseFloat(div.style.left || 0) + (x / parentWidth * 100);
		var newY = parseFloat(div.style.top || 0) + (y / parentHeight * 100);
		div.style.left = newX + '%';
		div.style.top = newY + '%';

		let imgX = "";
		let imgY = "";
		let imgW = "";
		// Mettre à jour les coordonnées de l'image dans les variables globales
		imgX = newX;
		imgY = newY;
		imgW = div.style.width;
	}


	/**
	 * Handler
	 for zooming an image by mouse wheel scrolling over it with shiftKey pressed.
	 * @param {Event} e Event.
	 */

	function handleMouseWheel(e) {


		// Vérifie si la cible de l'événement est valide et que Shift est enfoncé
		if (!e.target || e.target.height == 0 || e.target.width == 0 || !e.shiftKey) return;



		/* important */
		// Supprime la propriété "height" de l'élément imgDiv
		// imgDiv.style.removeProperty("height");
		/*  */

		// Calcule delta qui représente le changement de la molette de la souris
		var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));

		// Définit un facteur de vitesse pour le zoom
		var speedFactor = 5; // Vous pouvez ajuster cette valeur selon vos besoins

		// Calcule la variation de l'échelle en fonction de delta et du facteur de vitesse
		var scaleVariation = delta * speedFactor;

		// Calcule le facteur d'échelle en ajoutant la variation à l'échelle actuelle
		var scaleAmount = 1.0 + (scaleVariation / 90.0);

		// Définit les largeurs maximale et minimale pour l'élément imgDiv ?
		var maxWidth = 10000;
		var minWidth = 100;

		// Calcule les positions relatives de redimensionnement par rapport à l'image
		var relResizePosX = e.layerX / e.target.width;
		var relResizePosY = e.layerY / e.target.height;

		// Appelle la fonction resizeDiv pour redimensionner l'élément imgDiv
		resizeDiv(imgDiv, scaleAmount, maxWidth, minWidth, relResizePosX, relResizePosY);
	}

	/**
	 * Resizes a div tag about a particular point (scale and translate).
	 * @param {Element} e The HTML element to resize.
	 * @param {number} scaleAmount The amount to scale the element by
	 *    (a value > 1 makes it bigger, a value < 1 makes it smaller).
	 * @param {number} maxWidth The maxiumum width of the image in pixels
	 *    (it won't scale larger than this).
	 * @param {number} minWidth The minimum width of the image in pixels
	 *    (it won't scale smaller than this).
	 * @param {number} relResizePosX The relative position of the image,
	 *    along x, to resize from. A value of 0.5 means it will resize
	 *    about the very center in x, and 0, means it resizes from the
	 *    left edge.
	 * @param {number} relResizePosY The relative position of the image,
	 *    along y, to resize from. A value of 0.5 means it will resize
	 *    about the very center in y, and 0, means it resizes from the
	 *    top edge.
	 */
	function resizeDiv(div, scaleAmount, maxWidth, minWidth, relResizePosX, relResizePosY) {
		let imgID ;
		let imgX ;
		let imgY ;
		let imgW ;
		let imgH ;
		let col ;
		let width;
		let printcol;
		let printwidth ;
		let printrow ;
		let printheight ;
		let align_self ;
		let snippets ;

		let parent = div.parentNode;
		// let parent = div.closest('figure');
		let idDocument = parent.getAttribute('data-id');
		imgID = idDocument.match(/\d+$/)[0];

		var oldWidth = div.offsetWidth;
		var oldHeight = div.offsetHeight;
		var newWidth = scaleAmount * oldWidth;
		if (newWidth > maxWidth) {
			newWidth = maxWidth;
		}
		if (newWidth < minWidth) {
			newWidth = minWidth;
		}
		var resizeFract = (newWidth - oldWidth) / oldWidth;

		// Scale:
		var parentWidth = div.parentElement.offsetWidth; // Largeur totale du conteneur parent en pixels
		var newWidthPercentage = (newWidth / parentWidth) * 100; // Convertit newWidth en pourcentage
		div.style.width = newWidthPercentage + '%'; // Définit la largeur de div en pourcentage

		// Translate:
		var parentHeight = div.parentElement.offsetHeight; // Hauteur totale du conteneur parent en pixels
		var newLeftPercentage = ((-oldWidth * resizeFract * relResizePosX) + div.offsetLeft) / parentWidth * 100; // Convertit la position gauche en pourcentage
		var newTopPercentage = ((-oldHeight * resizeFract * relResizePosY) + div.offsetTop) / parentHeight * 100; // Convertit la position top en pourcentage
		div.style.left = newLeftPercentage + '%'; // Définit la position gauche de div en pourcentage
		div.style.top = newTopPercentage + '%'; // Définit la position top de div en pourcentage




		imgX = div.style.left;
		imgY = div.style.top;
		imgW = div.style.width;
		imgH = div.style.height;



		col = parent.style.getPropertyValue('--col');
		width = parent.style.getPropertyValue('--width');
		printcol = parent.style.getPropertyValue('--printcol');
		printwidth = parent.style.getPropertyValue('--printwidth');
		printrow = parent.style.getPropertyValue('--printrow');
		printheight = parent.style.getPropertyValue('--printheight');
		align_self = parent.style.getPropertyValue('--alignself');
		snippets = "resize";


		updatecss(imgID, imgX, imgY, imgW, col, width, printcol, printwidth, printrow, printheight, align_self, snippets);
	}

	function handleMouseOver(e) {
		if (!e.shiftKey) return;
		let imgID;
		let imgDrag;
		let imgX;
		let imgY;
		let imgW;
		let snippets;
		let resize; // Déclaration de la variable resize
		let section;
		let page;
		
		
		imgDiv = e.target;
		
		// console.log("alors= " + e.target);

		document.querySelector("#rd1").checked = "checked";

		let pagedjs_area = e.target.closest('.pagedjs_named_page');
		if (!pagedjs_area) {
			pagedjs_area = e.target.closest('.grid_12');
		};

		let printWidthInput = document.querySelector("#printwidth");
		let WidthInput = document.querySelector("#width");
		let ColInput = document.querySelector("#col");
		let printColInput = document.querySelector("#printcol");
		// let computedStyle = getComputedStyle(pagedjs_area);
		// const columnCount = computedStyle.getPropertyValue('--g-column-count').trim();
		const columnCount = "12";

		// Ajuster la valeur maximale
		ColInput.setAttribute('max', columnCount);
		WidthInput.setAttribute('max', columnCount);
		printColInput.setAttribute('max', columnCount);
		printWidthInput.setAttribute('max', columnCount);

		let printHeightInput = document.querySelector("#printheight");
		let printRowInput = document.querySelector("#printrow");
		// const rowCount = computedStyle.getPropertyValue('--g-row-count').trim();
		const rowCount = "10";

		// Ajuster la valeur maximale
		printRowInput.setAttribute('max', rowCount);
		printHeightInput.setAttribute('max', rowCount);





		let element = e.target; // Initialisation de la variable element
		section = element.closest('.section'); 
		page = section.getAttribute('data-article');

		const label = document.querySelector("#label_rd1");
		const ui_row = document.querySelector(".ui_row");
		const ui_resize = document.querySelector(".ui_resize");
		const ui_alignself = document.querySelector(".ui_alignself");
		let col, width, printcol, printwidth, printrow, printheight, align_self, figcaption_arrow; // Déclaration des variables pour éviter l'erreur "snippets is not defined"

		let parent = e.target.closest('figure');
		if (parent) {
			const idDocument = parent.getAttribute('data-id');
			label.setAttribute('data-name', '[data-id="' + idDocument + '"]');
			imgID = idDocument.match(/\d+$/)[0];
			imgDrag = parent.querySelector('img');

			if (!parent.classList.contains('resize')) {
				resize = false; // Assignation de la valeur false à resize
				ui_row.classList.add("hide");
				ui_resize.classList.add("hide");
				ui_alignself.classList.remove("hide");

				// console.log(parent);
				let parentparent = parent.closest('div');
				// console.log(gridparent);
				snippets = "img"; // Mettre à jour snippets pour indiquer une image dans une grille

				if (parentparent && parentparent.classList.contains('image_grid')) {

				} else {
					snippets = false;
				}

			} else {
				resize = true; // Assignation de la valeur true à resize
				snippets = "resize";
				ui_row.classList.remove("hide");
				ui_resize.classList.remove("hide");
				ui_alignself.classList.add("hide");

				imgX = imgDrag.style.left;
				imgY = imgDrag.style.top;
				imgW = imgDrag.style.width;
			}
		} else {
			parent = e.target.closest('.legende');
			if (parent) {
				const ui_arrow = document.querySelector(".ui_arrow");
				const idDocument = parent.getAttribute('data-id');
				imgID = idDocument.match(/\d+$/)[0];
				label.setAttribute('data-name', '.' + page + ' [data-id="' + idDocument + '"]');
				imgDrag = parent;
				resize = true;
				snippets = "legende_grid"; // Mettre à jour snippets pour indiquer un insert
				ui_arrow.classList.add("hide");
				ui_row.classList.remove("hide");
				ui_resize.classList.add("hide");
				ui_alignself.classList.remove("hide");
			} else {
				parent = e.target.closest('.insert.resize');
				if (parent) {
					const idDocument = parent.getAttribute('data-id');
					label.setAttribute('data-name', '[data-id="' + idDocument + '"]');
					imgID = idDocument.match(/\d+$/)[0];
					imgDrag = parent;
					resize = true;
					snippets = "encart_resize"; // Mettre à jour snippets pour indiquer un insert
					ui_row.classList.remove("hide");
					ui_resize.classList.add("hide");
					ui_alignself.classList.remove("hide");
				} else {
					parent = e.target.closest('.insert');
					idDocument = parent.getAttribute('data-id');
					label.setAttribute('data-name', '[data-id="' + idDocument + '"]');
					imgID = idDocument.match(/\d+$/)[0];
					imgDrag = parent;
					resize = false;
					snippets = "encart_grid"; // Mettre à jour snippets pour indiquer un insert
					ui_row.classList.add("hide");
					ui_resize.classList.add("hide");
					ui_alignself.classList.remove("hide");
				}
			}
		}


		col = parent.style.getPropertyValue('--col');
		width = parent.style.getPropertyValue('--width');
		printcol = parent.style.getPropertyValue('--printcol');
		printwidth = parent.style.getPropertyValue('--printwidth');
		printrow = parent.style.getPropertyValue('--printrow');
		printheight = parent.style.getPropertyValue('--printheight');
		align_self = parent.style.getPropertyValue('--alignself');
		figcaption_arrow = parent.style.getPropertyValue('--figcaption_arrow');

		/* mise à jour des valeurs dans les inputs */
		document.querySelector("#col").value = Number(col);
		document.querySelector("#width").value = Number(width);
		document.querySelector("#printcol").value = Number(printcol);
		document.querySelector("#printwidth").value = Number(printwidth);
		document.querySelector("#printrow").value = Number(printrow);
		document.querySelector("#printheight").value = Number(printheight);
		document.querySelector("#align_self").value = align_self;
		document.querySelector("#figcaption_arrow").value = figcaption_arrow;

		updatecss(imgID, imgX, imgY, imgW, col, width, printcol, printwidth, printrow, printheight, align_self, snippets);


		document.querySelector("#remplir_bloc").onclick = function (e) {
			if (!resize) return;
			// Largeur de l'élément parent 
			// Parent element width
			var parentWidth = parent.offsetWidth;

			// Hauteur de l'élément parent 
			// Parent element height
			var parentHeight = parent.offsetHeight;

			// Appliquer la largeur de l'élément parent à imgDrag 
			// Applying parent element width to imgDrag
			imgDrag.style.width = '100%';

			// Ajuster la position horizontale de l'élément imgDrag au centre de son parent 
			// Adjusting imgDrag horizontal position to center of its parent
			var imgX = (parentWidth - imgDrag.offsetWidth) / 2 / parentWidth * 100;

			// Ajuster la position verticale de l'élément imgDrag au centre de son parent 
			// Adjusting imgDrag vertical position to center of its parent
			var imgY = (parentHeight - imgDrag.offsetHeight) / 2 / parentHeight * 100;

			// Appliquer les pourcentages pour centrer l'élément imgDrag 
			// Applying percentages to center imgDrag element
			imgDrag.style.left = imgX + '%';
			imgDrag.style.top = imgY + '%';

			updatecss(imgID, imgX, imgY, imgW, col, width, printcol, printwidth, printrow, printheight, align_self, snippets);
		};

		document.querySelector("#ajuster_contenu").onclick = function (e) {
			if (!resize) return;

			// Hauteur de l'élément parent 
			// Parent element height
			var parentHeight = parent.offsetHeight;

			// Calculer la largeur de l'image en fonction de la hauteur du parent et de son ratio original 
			// Calculate image width based on parent height and its original ratio
			var originalWidth = imgDrag.naturalWidth; // Largeur originale de l'image
			// Original image width
			var originalHeight = imgDrag.naturalHeight; // Hauteur originale de l'image
			// Original image height
			var newWidth = (originalWidth / originalHeight) * parentHeight;

			// Appliquer la largeur calculée à imgDrag en pourcentage 
			// Apply calculated width to imgDrag in percentage
			imgDrag.style.width = (newWidth / parent.offsetWidth) * 100 + '%';

			// Positionnement en x pour centrer imgDrag horizontalement à gauche (left = 0) 
			// Positioning in x to center imgDrag horizontally to the left (left = 0)
			var imgX = 0;

			// Positionnement en y pour centrer imgDrag verticalement 
			// Positioning in y to center imgDrag vertically
			var imgY = 0;

			imgDrag.style.left = imgX + '%';
			imgDrag.style.top = imgY + '%';

			// Mettre à jour la largeur de l'image en pourcentage 
			// Update image width in percentage
			var imgW = 100;

			// Calculer les pourcentages pour centrer l'élément imgDrag 
			// Calculate percentages to center imgDrag element
			var parentWidth = parent.offsetWidth;
			var imgDragWidth = imgDrag.offsetWidth;
			var imgX = (parentWidth - imgDragWidth) / 2 / parentWidth * 100;

			// Appliquer les pourcentages pour centrer l'élément imgDrag 
			// Apply percentages to center imgDrag element
			imgDrag.style.left = imgX + '%';




			updatecss(imgID, imgX, imgY, imgW, col, width, printcol, printwidth, printrow, printheight, align_self, snippets);
		};

		document.querySelector("#top_left").onclick = function (e) {
			if (!resize) return;
			// Positionnement en x pour aligner à gauche (0%) 
			// Positioning in x to align left (0%)
			var imgX = 0;

			// Positionnement en y pour aligner en haut (0%) 
			// Positioning in y to align top (0%)
			var imgY = 0;

			imgDrag.style.left = imgX + '%';
			imgDrag.style.top = imgY + '%';

			updatecss(imgID, imgX, imgY, imgW, col, width, printcol, printwidth, printrow, printheight, align_self, snippets);
		};

		document.querySelector("#top_middle").onclick = function (e) {
			if (!resize) return;
			// Largeur de l'élément parent 
			// Parent element width
			var parentWidth = parent.offsetWidth;

			// Largeur de l'élément imgDrag 
			// imgDrag element width
			var imgDragWidth = imgDrag.offsetWidth;

			// Calcul de la position en % pour centrer horizontalement 
			// Calculate position in % to center horizontally
			var imgX = ((parentWidth - imgDragWidth) / 2) / parentWidth * 100;

			// Positionnement en y pour aligner en haut (0%) 
			// Positioning in y to align top (0%)
			var imgY = 0;

			imgDrag.style.left = imgX + '%';
			imgDrag.style.top = imgY + '%'; // En pourcentage car positionnement en haut
			// In percentage as positioning top


			updatecss(imgID, imgX, imgY, imgW, col, width, printcol, printwidth, printrow, printheight, align_self, snippets);

		};

		document.querySelector("#top_right").onclick = function (e) {
			if (!resize) return;
			// Largeur de l'élément parent
			var parentWidth = parent.offsetWidth;

			// Largeur de l'élément imgDrag
			var imgDragWidth = imgDrag.offsetWidth;

			// Positionnement en x pour aligner à droite (100% - largeur de imgDrag)
			var imgX = (parentWidth - imgDragWidth) / parentWidth * 100;

			// Positionnement en y pour aligner en haut (0%)
			var imgY = 0;

			imgDrag.style.left = imgX + '%';
			imgDrag.style.top = imgY + '%';

			updatecss(imgID, imgX, imgY, imgW, col, width, printcol, printwidth, printrow, printheight, align_self, snippets);
		};

		document.querySelector("#middle_left").onclick = function (e) {
			if (!resize) return;

			// Positionnement en x pour aligner à gauche (0%)
			// Positioning in x to align left (0%)
			var imgX = 0;

			// Hauteur de l'élément parent
			// Parent element height
			var parentHeight = parent.offsetHeight;

			// Hauteur de l'élément imgDrag
			// imgDrag element height
			var imgDragHeight = imgDrag.offsetHeight;

			// Positionnement en y pour centrer verticalement ((hauteur_parent - hauteur_imgDrag) / 2)
			// Positioning in y to center vertically ((parent height - imgDrag height) / 2)
			var imgY = (parentHeight - imgDragHeight) / 2 / parentHeight * 100;

			imgDrag.style.left = imgX + '%';
			imgDrag.style.top = imgY + '%';


			updatecss(imgID, imgX, imgY, imgW, col, width, printcol, printwidth, printrow, printheight, align_self, snippets);
		};

		document.querySelector("#middle_middle").onclick = function (e) {
			if (!resize) return;

			// Calculer les pourcentages pour centrer l'élément imgDrag
			// Calculate percentages to center the imgDrag element
			var parentWidth = parent.offsetWidth;
			var parentHeight = parent.offsetHeight;
			var imgDragWidth = imgDrag.offsetWidth;
			var imgDragHeight = imgDrag.offsetHeight;
			var imgX = (parentWidth - imgDragWidth) / 2 / parentWidth * 100;
			var imgY = (parentHeight - imgDragHeight) / 2 / parentHeight * 100;

			// Appliquer les pourcentages pour centrer l'élément imgDrag
			// Apply percentages to center the imgDrag element
			imgDrag.style.left = imgX + '%';
			imgDrag.style.top = imgY + '%';

			updatecss(imgID, imgX, imgY, imgW, col, width, printcol, printwidth, printrow, printheight, align_self, snippets);
		};

		document.querySelector("#middle_right").onclick = function (e) {
			if (!resize) return;
			var parentWidth = parent.offsetWidth;
			var parentHeight = parent.offsetHeight;
			var imgDragWidth = imgDrag.offsetWidth;
			var imgDragHeight = imgDrag.offsetHeight;

			// Positionnement en x pour aligner à droite
			// Positioning in x to align to the right
			var imgX = 100 - (imgDragWidth / parentWidth * 100); // Calcul de la position en pourcentage
			// Calculate position in percentage

			// Positionnement en y pour centrer verticalement
			// Positioning in y to center vertically
			var imgY = (parentHeight - imgDragHeight) / 2 / parentHeight * 100;

			imgDrag.style.left = imgX + '%';
			imgDrag.style.top = imgY + '%';


			updatecss(imgID, imgX, imgY, imgW, col, width, printcol, printwidth, printrow, printheight, align_self, snippets);
		};

		document.querySelector("#bottom_left").onclick = function (e) {
			if (!resize) return;
			// Positionnement en x pour aligner à gauche (0%)
			// Positioning in x to align to the left (0%)
			var imgX = 0;

			// Hauteur de l'élément parent
			// Parent element height
			var parentHeight = parent.offsetHeight;

			// Hauteur de l'élément imgDrag
			// imgDrag element height
			var imgDragHeight = imgDrag.offsetHeight;

			// Positionnement en y pour placer en bas ((hauteur_parent - hauteur_imgDrag))
			// Positioning in y to place at the bottom ((parent height - imgDrag height))
			var imgY = parentHeight - imgDragHeight;

			imgDrag.style.left = imgX + '%';
			imgDrag.style.top = (imgY / parentHeight) * 100 + '%';


			updatecss(imgID, imgX, imgY, imgW, col, width, printcol, printwidth, printrow, printheight, align_self, snippets);
		};

		document.querySelector("#bottom_middle").onclick = function (e) {
			if (!resize) return;
			// Largeur de l'élément parent
			// Parent element width
			var parentWidth = parent.offsetWidth;

			// Largeur de l'élément imgDrag
			// imgDrag element width
			var imgDragWidth = imgDrag.offsetWidth;

			// Hauteur de l'élément parent
			// Parent element height
			var parentHeight = parent.offsetHeight;

			// Hauteur de l'élément imgDrag
			// imgDrag element height
			var imgDragHeight = imgDrag.offsetHeight;

			// Positionnement en x pour centrer
			// Positioning in x to center
			var imgX = (parentWidth - imgDragWidth) / 2 / parentWidth * 100;

			// Positionnement en y pour placer en bas ((hauteur_parent - hauteur_imgDrag) / hauteur_parent * 100)
			// Positioning in y to place at the bottom ((parent height - imgDrag height) / parent height * 100)
			var imgY = (parentHeight - imgDragHeight) / parentHeight * 100;


			imgDrag.style.left = imgX + '%';
			imgDrag.style.top = imgY + '%';

			updatecss(imgID, imgX, imgY, imgW, col, width, printcol, printwidth, printrow, printheight, align_self, snippets);
		};

		document.querySelector("#bottom_right").onclick = function (e) {
			if (!resize) return;
			// Largeur de l'élément parent
			// Parent element width
			var parentWidth = parent.offsetWidth;

			// Largeur de l'élément imgDrag
			// imgDrag element width
			var imgDragWidth = imgDrag.offsetWidth;

			// Hauteur de l'élément parent
			// Parent element height
			var parentHeight = parent.offsetHeight;

			// Hauteur de l'élément imgDrag
			// imgDrag element height
			var imgDragHeight = imgDrag.offsetHeight;

			// Positionnement en x pour aligner à droite ((largeur_parent - largeur_imgDrag) / largeur_parent * 100)
			// Positioning in x to align to the right ((parent width - imgDrag width) / parent width * 100)
			var imgX = (parentWidth - imgDragWidth) / parentWidth * 100;

			// Positionnement en y pour placer en bas ((hauteur_parent - hauteur_imgDrag) / hauteur_parent * 100)
			// Positioning in y to place at the bottom ((parent height - imgDrag height) / parent height * 100)
			var imgY = (parentHeight - imgDragHeight) / parentHeight * 100;


			imgDrag.style.left = imgX + '%';
			imgDrag.style.top = imgY + '%';

			updatecss(imgID, imgX, imgY, imgW, col, width, printcol, printwidth, printrow, printheight, align_self, snippets);
		};

		document.querySelector("#printcol").onclick = function (e) {
			var columnMax = parseInt(this.max);
			var printWidthID = document.getElementById('printwidth');
			var printWidthInput = parseInt(printWidthID.value);
			var printColValue = parseInt(this.value);
			var newPrintWidthValue = columnMax - printColValue;
			if ((printWidthInput + printColValue) > (columnMax + 1)) {
				newWidth = (printWidthInput - 1).toString();
				printWidthID.value = newWidth;
				parent.style.setProperty('--printwidth', newWidth);
			}
			printWidthID.setAttribute('max', newPrintWidthValue + 1);

			var printcol = e.target.value;
			parent.style.setProperty('--printcol', printcol);
			var col = parent.style.getPropertyValue('--col');
			var width = parent.style.getPropertyValue('--width');
			var printwidth = parent.style.getPropertyValue('--printwidth');
			var printrow = parent.style.getPropertyValue('--printrow');
			var printheight = parent.style.getPropertyValue('--printheight');

			updatecss(imgID, imgX, imgY, imgW, col, width, printcol, printwidth, printrow, printheight, align_self, snippets);
		};

		document.querySelector("#col").onclick = function (e) {
			var columnMax = parseInt(this.max);
			var WidthID = document.getElementById('width');
			var WidthInput = parseInt(WidthID.value);
			var ColValue = parseInt(this.value);
			var newWidthValue = columnMax - ColValue;
			if ((WidthInput + ColValue) > (columnMax + 1)) {
				newWidth = (WidthInput - 1).toString();
				WidthID.value = newWidth;
				parent.style.setProperty('--width', newWidth);
			}
			WidthID.setAttribute('max', newWidthValue + 1);

			const col = e.target.value;
			parent.style.setProperty('--col', col);
			var printcol = parent.style.getPropertyValue('--printcol');
			var width = parent.style.getPropertyValue('--width');
			var printwidth = parent.style.getPropertyValue('--printwidth');
			var printrow = parent.style.getPropertyValue('--printrow');
			var printheight = parent.style.getPropertyValue('--printheight');

			updatecss(imgID, imgX, imgY, imgW, col, width, printcol, printwidth, printrow, printheight, align_self, snippets);
		};

		document.querySelector("#width").onclick = function (e) {
			var width = e.target.value;
			parent.style.setProperty('--width', width);
			var col = parent.style.getPropertyValue('--col');
			var printcol = parent.style.getPropertyValue('--printcol');
			var printwidth = parent.style.getPropertyValue('--printwidth');
			var printrow = parent.style.getPropertyValue('--printrow');
			var printheight = parent.style.getPropertyValue('--printheight');

			updatecss(imgID, imgX, imgY, imgW, col, width, printcol, printwidth, printrow, printheight, align_self, snippets);
		};

		document.querySelector("#printwidth").onclick = function (e) {
			var printwidth = e.target.value;
			parent.style.setProperty('--printwidth', printwidth);
			var col = parent.style.getPropertyValue('--col');
			var width = parent.style.getPropertyValue('--width');
			var printcol = parent.style.getPropertyValue('--printcol');
			var printrow = parent.style.getPropertyValue('--printrow');
			var printheight = parent.style.getPropertyValue('--printheight');

			updatecss(imgID, imgX, imgY, imgW, col, width, printcol, printwidth, printrow, printheight, align_self, snippets);
		};

		document.querySelector("#printrow").onclick = function (e) {
			if (!resize) return;
			var rowMax = parseInt(this.max);
			var printHeightID = document.getElementById('printheight');
			var printheightInput = parseInt(printHeightID.value);
			var printRowValue = parseInt(this.value);
			var newprintheightValue = rowMax - printRowValue;
			if ((printheightInput + printRowValue) > (rowMax + 1)) {
				newWidth = (printheightInput - 1).toString();
				printHeightID.value = newWidth;
				parent.style.setProperty('--printheight', newWidth);
			}
			printHeightID.setAttribute('max', newprintheightValue + 1);

			var printrow = e.target.value;
			parent.style.setProperty("--printrow", printrow);
			var col = parent.style.getPropertyValue('--col');
			var width = parent.style.getPropertyValue('--width');
			var printwidth = parent.style.getPropertyValue('--printwidth');
			var printheight = parent.style.getPropertyValue('--printheight');


			updatecss(imgID, imgX, imgY, imgW, col, width, printcol, printwidth, printrow, printheight, align_self, snippets);
		};

		document.querySelector("#printheight").onclick = function (e) {
			if (!resize) return;
			imgDrag.style.removeProperty("height");
			var printheight = e.target.value;
			parent.style.setProperty("--printheight", printheight);

			updatecss(imgID, imgX, imgY, imgW, col, width, printcol, printwidth, printrow, printheight, align_self, snippets);
		};

		document.querySelector("#align_self").onchange = function (e) {
			var align_self = e.target.value;
			parent.style.setProperty("--alignself", align_self);

			updatecss(imgID, imgX, imgY, imgW, col, width, printcol, printwidth, printrow, printheight, align_self, snippets);
		};



	}




	
	function handleArrowKeys(e) {
		if (!imgDiv || !e.shiftKey) return;
		var step = 1; // Évitez de déplacer l'image de manière significative avec les flèches
		switch (e.key) {
			case "ArrowUp":
				translateDiv(imgDiv, 0, -step);
				break;
			case "ArrowDown":
				translateDiv(imgDiv, 0, step);
				break;
			case "ArrowLeft":
				translateDiv(imgDiv, -step, 0);
				break;
			case "ArrowRight":
				translateDiv(imgDiv, step, 0);
				break;
		}
	}

	/** 
	 * Adds event listeners for .resize :not.resize and .insert
	 * @param {string} className Class name to match.
	 */
	function addPanAndZoomToImagesByClass(className) {
		const allFigures = document.querySelectorAll('figure');
		allFigures.forEach(figure => {
			if (figure.classList.contains(className)) {
				figure.addEventListener('mouseover', function (e) {

					window.addEventListener("keydown", handleArrowKeys, false);
				});
				figure.addEventListener('dragstart', handleDragStart, { passive: true });
				figure.addEventListener('dragover', handleDragOver, { passive: true });
				figure.addEventListener("mousewheel", handleMouseWheel, { passive: true });
				figure.addEventListener('dragend', handleDragEnd, { passive: true });
			}
			figure.addEventListener("mouseover", handleMouseOver, false);
		});

		const allEncarts = document.querySelectorAll('.insert');
		allEncarts.forEach(insert => {
			insert.addEventListener("mouseover", handleMouseOver, false);
			insert.addEventListener('dragstart', handleDragStart, { passive: true });
			insert.addEventListener('dragover', handleDragOver, { passive: true });
			insert.addEventListener('dragend', handleDragEnd, { passive: true });
		});

		const allLegendes = document.querySelectorAll('.legende');
		allLegendes.forEach(legende => {
			legende.addEventListener("mouseover", handleMouseOver, false);
		});

	}
	addPanAndZoomToImagesByClass('resize');





	var copyButton = document.querySelector('.copy .button');

	// Associe un gestionnaire d'événement au click sur le bouton
	copyButton.addEventListener('click', function () {

		// Sélectionne l'élément contenant le contenu à copier
		var contentToCopy = document.querySelector('.cssoutput');
		var copiedId = document.querySelector('#copied');
		copiedId.textContent = "";

		// Obtient le contenu avec les balises <br> et sans conversion des caractères spéciaux
		var textContent = contentToCopy.innerHTML
			.replace(/<br\s*\/?>/g, '\n') // Remplace <br> par des sauts de ligne
			.replace(/&amp;/g, '&')
			.replace(/&lt;/g, '<')
			.replace(/&gt;/g, '>')
			.replace(/&quot;/g, '"')
			.replace(/&#39;/g, "'"); // Restaure les caractères spéciaux

		// Copie le contenu dans le presse-papiers de l'utilisateur
		navigator.clipboard.writeText(textContent)
			.then(function () {
				copiedId.textContent = "Copied!";
				setTimeout(() => {
					copiedId.textContent = "";
				}, 2000);
			})
			.catch(function () {
				// En cas d'erreur, affiche un message d'erreur
				copiedId.textContent = "Error!";
				setTimeout(() => {
					copiedId.textContent = "";
				}, 2000);
			});
	});

	const allFigures = document.querySelectorAll('figure');
	allFigures.forEach(figure => {

	});
}


function updatecss(imgID, imgX, imgY, imgW, col, width, printcol, printwidth, printrow, printheight, align_self, snippets) {
	imgID = imgID.replace(/ /g, "");
	col = col.replace(/ /g, "");
	printcol = printcol.replace(/ /g, "");
	width = width.replace(/ /g, "");
	printwidth = printwidth.replace(/ /g, "");
	printrow = printrow.replace(/ /g, "");
	printheight = printheight.replace(/ /g, "");
	align_self = align_self.replace(/ /g, "");
	imgX = String(imgX).replace(/ /g, "");
	imgY = String(imgY).replace(/ /g, "");
	imgW = String(imgW).replace(/ /g, "");

	if (snippets === "resize") {
		const pgjs_Img =
			`<resize${imgID}
|imgX=${(parseFloat(imgX) / 100 * 100).toFixed(4)}%
|imgY=${(parseFloat(imgY) / 100 * 100).toFixed(4)}%
|imgW=${(parseFloat(imgW) / 100 * 100).toFixed(4)}%
|col=${col}
|width=${width}
|row=${printrow}
|height=${printheight}	
|printcol=${printcol}
|printwidth=${printwidth}
|printrow=${printrow}
|printheight=${printheight}
>`;
		document.querySelector(".cssoutput").innerText = pgjs_Img;
	}
	else if (snippets === "encart_resize") {
		const pgjs_Img =
			`<insert${imgID}|resize
|col=${col}
|width=${width}
|row=${printrow}
|height=${printheight}	
|printcol=${printcol}
|printwidth=${printwidth}
|printrow=${printrow}
|printheight=${printheight}
|alignself=${align_self}
>`;
		document.querySelector(".cssoutput").innerText = pgjs_Img;
	}
	else if (snippets === "encart_grid") {
		const pgjs_Img =
			`<insert${imgID}|grid
|col=${col}
|width=${width}
|printcol=${printcol}
|printwidth=${printwidth}
|alignself=${align_self}
>`;
		document.querySelector(".cssoutput").innerText = pgjs_Img;
	}
	else if (snippets === "img_grid") {
		const pgjs_Img =
			`<img${imgID}|grid
|col=${col}
|width=${width}
|printcol=${printcol}
|printwidth=${printwidth}
|alignself=${align_self}
>`;
		document.querySelector(".cssoutput").innerText = pgjs_Img;
	}
	else if (snippets === "legende_grid") {
		const pgjs_Img =
			`<legende${imgID}
|col=${col}
|width=${width}
|row=${printrow}
|height=${printheight}	
|printcol=${printcol}
|printwidth=${printwidth}
|printrow=${printrow}
|printheight=${printheight}
|alignself=${align_self}
>`;
		document.querySelector(".cssoutput").innerText = pgjs_Img;
	} else {
		const pgjs_Img =
			`<img${imgID}
|col=${col}
|width=${width}
|printcol=${printcol}
|printwidth=${printwidth}
|alignself=${align_self}
>`;
		document.querySelector(".cssoutput").innerText = pgjs_Img;
	}

}

function createControls() {
	let html = `<div class="tab ">
	<input type="checkbox" id="rd1" name="rd" class="input-pgjs_Img" >
		<label class="tab-label" id="label_rd1" for="rd1" data-name="Image"></label>
		<div class="gjs-sm-properties tab-content">
			<div class="gjs-sm-properties">
				<div class="gjs-sm-label" >
					<span class="" title="">start col (screen)</span>
				</div>
				<div class="gjs-sm-property">
					<div class="gjs-sm-label" >
						<span class="" title="">start col (screen)</span>
					</div>
					<div class="gjs-fields">
						<div class="gjs-field arrow">
							<input class="reset-this" type="number" id="col" name="col" min="1" max="13" value="1"  >
						</div>
					</div>
				</div>
				<div class="gjs-sm-property">
					<div class="gjs-sm-label" >
						<span class="" title="">width (screen)</span>
					</div>
					<div class="gjs-fields">
						<div class="gjs-field arrow">
							<input class="reset-this" type="number" id="width" name="width" min="2" max="17" value="3"  >
						</div>
					</div>
				</div>
			</div>

			
			<div class="gjs-sm-properties">
			<hr>
					<div class="gjs-sm-property">
						<div class="gjs-sm-label" >
							<span class="" title="">start col (print)</span>
						</div>
						<div class="gjs-fields">
							<div class="gjs-field arrow">
								<input class="reset-this" type="number" id="printcol" name="printcol" min="1" max="13" value="1"  >
							</div>
						</div>
					</div>
					<div class="gjs-sm-property">
						<div class="gjs-sm-label" >
							<span class="" title="">width (print)</span>
						</div>
						<div class="gjs-fields">
							<div class="gjs-field arrow">
								<input class="reset-this" type="number" id="printwidth" name="printwidth" min="2" max="17" value="3"  >
							</div>
						</div>
					</div>
			</div>

			<div class="gjs-sm-properties ui_row">
					<div class="gjs-sm-property">
						<div class="gjs-sm-label" >
							<span class="gjs-sm-icon" title="">Ligne de&nbsp;début</span>
						</div>
						<div class="gjs-fields">
							<div class="gjs-field arrow">
								<input class="reset-this" type="number" id="printrow" name="printrow" min="1" max="11" value="1" >
							</div>
						</div>
					</div>
					<div class="gjs-sm-property">
						<div class="gjs-sm-label" >
							<span class="gjs-sm-icon" title="">Height</span>
						</div>
						<div class="gjs-fields">
							<div class="gjs-field  arrow">
								<input class="reset-this" type="number" id="printheight" name="printheight" min="1" max="11" value="1" >
							</div>
						</div>
					</div>
			</div>

			<div class="gjs-sm-properties ui_alignself">
					<hr>
						<div class="gjs-sm-label" >
							<span class="gjs-sm-icon" title="">Alignement vertical</span>
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

			<div class="gjs-sm-properties ui_arrow hide">
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
												<label class="reset-this gjs-radio-item-label" for="ajuster_contenu" id="label_ajuster_contenu">Ajuster le contenu</label>
										</span>
									</div>
								</div>
								<div class="gjs-fields">
									<div class="gjs-field">
										<span class="gjs-radio-item">
											<input class="reset-this" type="checkbox" id="remplir_bloc" name="remplir_bloc">
												<label class="reset-this gjs-radio-item-label" for="remplir_bloc" id="label_remplir_bloc">Remplir le bloc</label>
										</span>
									</div>
								</div>
							</div>
			</div>

			
			<div class="gjs-sm-properties">
			<hr>
						<div class="copy">
							<span id="copied"></span>
							<span class="right" data-state="closed">
								<button class="button">
									<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-sm">
										<path fill-rule="evenodd" clip-rule="evenodd" d="M12 4C10.8954 4 10 4.89543 10 6H14C14 4.89543 13.1046 4 12 4ZM8.53513 4C9.22675 2.8044 10.5194 2 12 2C13.4806 2 14.7733 2.8044 15.4649 4H17C18.6569 4 20 5.34315 20 7V19C20 20.6569 18.6569 22 17 22H7C5.34315 22 4 20.6569 4 19V7C4 5.34315 5.34315 4 7 4H8.53513ZM8 6H7C6.44772 6 6 6.44772 6 7V19C6 19.5523 6.44772 20 7 20H17C17.5523 20 18 19.5523 18 19V7C18 6.44772 17.5523 6 17 6H16C16 7.10457 15.1046 8 14 8H10C8.89543 8 8 7.10457 8 6Z" fill="currentColor"></path>
									</svg>Copy code
								</button>
							</span>
						</div>
						<div class="cssoutput-wrapper">
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



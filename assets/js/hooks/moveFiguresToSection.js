// screen mode
moveFiguresToSection(document);

// print mode
if (typeof Paged !== "undefined") {
	Paged.registerHandlers(
		class extends Paged.Handler {
			constructor(chunker, polisher, caller) {
				super(chunker, polisher, caller);
			}
            
			afterLayout(pages) {
				moveFiguresToSection(pages);
			}
		}
	);
}

function moveFiguresToSection(content) {
	
    const sections = content.querySelectorAll('section');
	
    // Appel de la fonction pour convertir les spans en figures, si nécessaire
    convertSpanToFigure("span.figure.figmove");
    // Parcours de chaque section
    sections.forEach((section) => {
		
        const figures = Array.from(section.querySelectorAll('.figmove'));
        // Si aucune figure n'est trouvée dans cette section, passer à la suivante
        if (figures.length === 0) {
            return;
        }

        // Récupérer le slug (id) de la section courante
        const slug = section.id;

        // Créer une nouvelle section pour les figures
        let figuresSection = document.createElement('section');
        figuresSection.id = `${slug}-figure`;
        figuresSection.className = 'figures_page';
        figuresSection.setAttribute('markdown', '1');
        figuresSection.setAttribute('data-figures-count', figures.length);

        // Créer un conteneur <div class="content"> pour contenir les figures
        let contentDiv = document.createElement('div');
        contentDiv.className = 'content';
        contentDiv.setAttribute('markdown', '1');

        // Ajouter les figures dans le conteneur
        figures.forEach(figure => {
            contentDiv.appendChild(figure);
        });

        // Ajouter le conteneur dans la nouvelle section
        figuresSection.appendChild(contentDiv);

        // Insérer la nouvelle section après la section principale
        section.insertAdjacentElement('afterend', figuresSection);
    });


}



function convertSpanToFigure(spanToFig) {
	// Sélectionner tous les éléments <span> avec la classe spécifiée
	const spans = document.querySelectorAll(spanToFig);

	spans.forEach((span) => {
		// Créer un nouvel élément <figure>
		const figure = document.createElement("figure");

		// Copier tous les attributs du <span> vers le <figure>
		Array.from(span.attributes).forEach((attr) => {
			figure.setAttribute(attr.name, attr.value);
		});

		// Créer un nouvel élément <figcaption>
		const figurecaption = document.createElement("figcaption");
		const figcaptionSpan = span.querySelector("span.figcaption");
		if (figcaptionSpan) {
			// Copier tous les attributs du <span class="figcaption"> vers le <figurecaption>
			Array.from(figcaptionSpan.attributes).forEach((attr) => {
				figurecaption.setAttribute(attr.name, attr.value);
			});
			figurecaption.innerHTML = figcaptionSpan.innerHTML;
		}

		// Ajouter l'image au <figure>
		const img = span.querySelector("img");
		if (img) {
			figure.appendChild(img.cloneNode(true));
		}

		// Ajouter le <figurecaption> au <figure>
		figure.appendChild(figurecaption);

		// Remplacer le <span> par le <figure>
		span.parentNode.replaceChild(figure, span);
	});
}

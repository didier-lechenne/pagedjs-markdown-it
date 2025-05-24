import { themePath } from "./path.js";
import { data, options } from "./getYml.js";
import { slugify, breakAnchors, logDebug } from "./functions.js";
import { mdToHtml } from "./converter.js";
import { pageMode } from "./pageMode.js";

export const data_suffix = "_data";
export const export_url_suffix = "/export/" + (options.ep_markdown ? "markdown" : "txt");
export const export_url_suffix_css = "/export/txt";

let globalSectionCounter = 0;
let SectionCounter = 0;


function insertFileMd(part) {
	const mainElement = document.querySelector("main");
	if (!mainElement) {
		console.error("L'élément <main> est introuvable.");
		return;
	}

    globalSectionCounter++;
    let sectionNumber = globalSectionCounter;
	// console.log("insertFileMd section= " + sectionNumber);
	// console.log(sectionNumber);


	const id = slugify(part.title);
	
	let section = document.getElementById(id);

	if (!section) {
		let out = '';
		
		out += `<section  markdown="1" id="${id}"  `;
		out += ` class="show_marker"`;
		// out += `data-section="section_${sectionNumber}"`;
		out += `data-title="${id}"`;
		out += `>`;


		if (
			part.template === "default" || part.template === "blankpage"   || part.template === "modulargrid" || part.template === "sommaire" || part.template === "interview"   || part.template === "references" || part.template === "thanks"   
		) {
			const name = typeof data !== "undefined" ? data.name : "Nom inconnu";
			out += `<div class='runningtitle invisible'><div>${name}</div><div>${part.title}</div></div>`;
		} 
		 

		if (part.template === "appendices"    ) {
			out += `<h2>${part.title}</h2>`;
			out += `<div class="content" markdown="1">`;
			out += `<div class="runningtitle"><div>${
				typeof data !== "undefined" ? data.name : "Nom inconnu"
			}</div><div>${part.title}</div></div>`;
			out += `</div>`;
		}


		out += `</section>`;
		mainElement.insertAdjacentHTML("beforeend", out);
		// section = document.getElementById(id);
		// logDebug(section);
	}

}

function insertPad(part) {
	const mainElement = document.querySelector("main");
	if (!mainElement) {
		console.error("L'élément <main> est introuvable.");
		return;
	}

	globalSectionCounter++;
    const sectionNumber = globalSectionCounter;


	const id = slugify(part.title);
	const titleSlug = slugify(part.title);
	const idSuffix = titleSlug + data_suffix;

	let section = document.getElementById(id);

	// Créer une nouvelle section si elle n'existe pas déjà
	if (!section) {
		let out = '';
		let style = '';
		let getClass = '';
		
		out += `<section  markdown="1" id="${id}"  `;
		if (part.options && part.options.toc) {
			getClass += `toc-${part.options.toc} `;
		}
		if (part.options && part.options.bgColor) {
			out += ` data-bgColor="${part.options.bgColor}"`;
		}
		if (part.options && part.options.grid_col) {
			// out += ` data-grid-col="${part.options.grid_col}"`;
			style += `--grid-col:${part.options.grid_col}; `;
		}
		if (part.options && part.options.grid_col_gutter) {
			// out += ` data-grid-col-gutter="${part.options.grid_col_gutter}"`;
			style += `--grid-col-gutter:${part.options.grid_col_gutter}; `;
		}
		if (part.options && part.options.grid_row) {
			// out += ` data-grid-row="${part.options.grid_row}"`;
			style += `--grid-row:${part.options.grid_row}; `;
		}
		if (part.options && part.options.grid_row_gutter) {
			// out += ` data-grid-row-gutter="${part.options.grid_row_gutter}"`;
			style += `--grid-row-gutter:${part.options.grid_row_gutter}; `;
		}
		if (style) {
			out += ` style="${style}"`;
		}
		
			out += ` class="show_marker ${part.template} ${getClass}"`;

			out += `data-title="${id}"`;
		
		out += `>`;



		if (
			part.template === "default" || part.template === "blankpage"   || part.template === "modulargrid" || part.template === "sommaire" 
		) {
			const name = typeof data !== "undefined" ? data.name : "Nom inconnu";
			out += `<div class='runningtitle invisible'><div>${name}</div><div>${part.title}</div></div>`;
		} 
		 

		if (part.template === "appendices"     ) {
			out += `<h2>${part.title}</h2>`;
			out += `<div class="content" markdown="1">`;
			out += `<div class="runningtitle"><div>${
				typeof data !== "undefined" ? data.name : "Nom inconnu"
			}</div><div>${part.title}</div></div>`;
			out += `</div>`;
		}


		out += `</section>`;
		mainElement.insertAdjacentHTML("beforeend", out);
		// section = document.getElementById(id);
		// logDebug(section);
	}


}

function addCountersToSections() {
    const sections = document.querySelectorAll("section");
    sections.forEach((section, index) => {
        const articleNumber = index + 1;
        section.setAttribute("data-section", `section_${articleNumber}`);
    });
}

function insertPadCss(url) {
	fetch(url)
		.then((response) => {
			if (!response.ok) {
				throw new Error(`Erreur lors du chargement du CSS depuis ${url}`);
			}
			return response.text();
		})
		.then((cssContent) => {
			const styleElement = document.createElement("style");
			styleElement.type = "text/css";
			styleElement.textContent = cssContent;
			document.head.appendChild(styleElement);
			console.log(`Styles injectés depuis ${url}`);
		})
		.catch((error) => {
			console.error("Erreur lors de l'injection des styles:", error);
		});
}

// Fonction pour déterminer si la section doit être chargée en fonction du mode d'affichage
function shouldLoadSection(pageMode, showMode) {
	return (
		(pageMode === "screen" && (showMode === "screen" || showMode === "screen_print")) || // Mode écran
		(pageMode === "print" && (showMode === "print" || showMode === "screen_print")) || // Mode impression
		(pageMode === "layout" && (showMode === "layout" || showMode === "screen" || showMode === "screen_print")) || // Mode mise en page
		(pageMode === "print&layout" && (showMode === "print" || showMode === "layout" || showMode === "screen" || showMode === "screen_print")) // Mode impression et mise en page combinés
	);
}

export async function screenCover(data) {
	// console.log("Received data:", data); // Vérifiez si les données sont définies et non vides
	if (!data || typeof data !== "object") {
		console.warn("Invalid data provided for loadSommaire.");
		return;
	}

	// Extraire les informations nécessaires
	const {
		title,
		subtitle,
		name,
		runningtitle,
		diploma,
		themePath,
		pole,
		mention,
		year,
		pdf,
	} = data;

	// Créer le contenu HTML
	const content = `<header id="header">
        <h1>${title || ""}</h1>
        ${subtitle ? `<h2>${subtitle}</h2>` : ""}
        <div class="runningtitle">
            <div>${name || ""}</div>
            <div>${runningtitle || ""}</div>
        </div>
        <div class="runningfolio">
            <span class="folio"></span>
            <img src="themePath/${themePath}/assets/css/logo.png" alt="ESAD Pyrénées">
            <span class="diploma">${diploma || ""}</span>
        </div>
        <div class="meta">
            <div class="meta-data">
                <p>
                    École supérieure <br class="breakprint">
                    d’art &amp; de design <br class="breakprint">
                    des Pyrénées<br><br class="breakprint">
                    ${pole || ""}
                </p>
            </div>
            <div>
                <p>
                    ${diploma || ""} <br>
                    ${mention || ""}
                </p>
            </div>
            <div>
                <div class="meta-name">${name || ""}</div>
                <div class="meta-year">${year || ""}</div>
            </div>
        </div>
        <nav id="quicklinks">
            <a href="#nav">Lire en ligne</a>
            <a href="?print" title="Web to print">Imprimer</a>
            <a href="${pdf || "#"}">Télécharger</a>
        </nav>
        </header>`;
	document.body.insertAdjacentHTML("afterbegin", content);
}

export async function screenSommaire(sections) {
	
	// Créer l'élément nav
	const navElement = document.createElement("nav");
	navElement.id = "nav";

	// Créer le titre h2
	const heading = document.createElement("h2");
	heading.textContent = "Sommaire";
	navElement.appendChild(heading);

	// Créer la liste ul
	const navList = document.createElement("ul");
	navList.className = "nav-ul";
	navElement.appendChild(navList);

	// Insérer navElement avant l'élément avec l'ID "main"
	const mainElement = document.getElementById("main");
	if (mainElement) {
		document.body.insertBefore(navElement, mainElement);
	} else {
		console.error("L'élément avec l'ID \"main\" n'a pas été trouvé.");
		return; // Retourner si l'élément principal n'est pas trouvé
	}

	// Créer la liste des sections
	sections.forEach((section) => {
		const { title, template, padCSS, show } = section;

		if (template !== "sommaire" && !padCSS && show !== "print") {
			const slug = slugify(title);
			const listItem = document.createElement("li");
			listItem.id = `nav-${slug}`;
			listItem.className = `nav-${template}`;

			const link = document.createElement("a");
			link.href = `#${slug}`;
			link.textContent = title;
			listItem.appendChild(link);

			navList.appendChild(listItem);
		}
	});
}

export async function runningElements(data) {
	const { name, runningtitle, diploma } = data;
	// Créer le contenu HTML
	const content = `<div class="runningtitle">
            <div class="name">${name || ""}</div>
            <div>${runningtitle || ""}</div>
			<div class="montest">${runningtitle || ""}</div>
        </div>
        <div class="runningfolio">
            <span class="folio"></span>
             <img src="${themePath}/assets/css/logo.png" alt="ESAD Pyrénées">
            <span class="diploma">${diploma || ""}</span>
        </div>`;

	const firstSection = document.querySelector("section");
	if (!firstSection) {
		console.error("L'élément <firstSection> est introuvable.");
		return;
	}
	const runningContentDiv = document.createElement('div');
	runningContentDiv.setAttribute('markdown', '1');
	runningContentDiv.classList.add('runningContent');
	firstSection.appendChild(runningContentDiv);
	runningContentDiv.insertAdjacentHTML("afterbegin", content);
	// console.info(runningContentDiv);
}

export function insertTag(part, name, data) {
	// Détermine si la section doit être chargée en fonction du mode d'affichage
	const showMode = part.show || "screen_print"; // Définit 'screen_print' par défaut si 'show' n'est pas renseigné
	const shouldLoad = shouldLoadSection(pageMode, showMode);

    if (!shouldLoad) {
		console.log(`Section ${part.title} non chargée en raison de la restriction du mode d'affichage.`);
		return;
	}
    

    if (shouldLoad) {
        if (part.file) {
            insertFileMd(part, name, data); // Passer 'name' à 'insertFileMd'
        } else if (part.pad) {
            insertPad(part, name, data); 
        }
    }

	if (part.padCSS) {
		insertPadCss(part.padCSS + export_url_suffix_css);
	}
}

export function load(part) {
    // Détermine si la section doit être chargée en fonction du mode d'affichage
    const showMode = part.show || "screen_print";
    const shouldLoad = shouldLoadSection(pageMode, showMode);

    if (!shouldLoad) {
        // Arrête l'exécution si la section ne doit pas être chargée
        return Promise.resolve();
    }

    SectionCounter++;
    let sectionNumber = SectionCounter;
    
    const baseId = slugify(part.title);
    const targetSection = document.getElementById(baseId);
    
    if (!targetSection) {
        console.error(`Élément cible "${baseId}" introuvable.`);
        return Promise.resolve();
    }

    const url = part.file
        ? `${part.file}`
        : part.pad
        ? `${part.pad + export_url_suffix}`
        : null;

    // Si l'URL est définie, charge le contenu
    if (url && shouldLoad) {
        console.info(part.file ? `${part.title} (→ File)` : `(→ Pad) ${part.title}`);

        return fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Échec du chargement du contenu depuis : ${url}`);
                }
                return response.text();
            })
            .then(text => {
                const { html, metadata } = mdToHtml(text);
                let convertedHtml = breakAnchors(html);
                
                console.log(`Options du frontmatter pour ${part.title}:`, metadata);

				applyFrontmatterOptions(targetSection, metadata);


                // Insère le contenu converti en HTML dans la section cible
                const contentDiv = targetSection.querySelector(".content");
                if (contentDiv) {
                    contentDiv.innerHTML += convertedHtml;
                } else {
                    targetSection.innerHTML += convertedHtml;
                }
                return true; // Indique que le chargement a réussi
            })
            .catch(error => {
                console.error(`Erreur lors du chargement de ${part.title} :`, error);
                // Affiche une indication visuelle d'erreur dans la section
                targetSection.innerHTML += `<div class="load-error">Erreur de chargement : ${error.message}</div>`;
                // Important : retourne une promesse résolue pour ne pas interrompre les autres chargements
                return Promise.resolve();
            });
    } else {
        return Promise.resolve();
    }
}

// Fonction pour appliquer les options du frontmatter
function applyFrontmatterOptions(section, options) {
    if (!options || Object.keys(options).length === 0) return;
    
    let style = '';
    let classes = ['show_marker']; // Classe de base
    
    // Options de grille
    if (options.grid_col) style += `--grid-col:${options.grid_col}; `;
    if (options.grid_col_gutter) style += `--grid-col-gutter:${options.grid_col_gutter}; `;
    if (options.grid_row) style += `--grid-row:${options.grid_row}; `;
    if (options.grid_row_gutter) style += `--grid-row-gutter:${options.grid_row_gutter}; `;
    
    // Template
	if (options.template) classes.push(options.template);
	console.log(`Template  = ${options.template}`);
    // if (options.template) classes.push(options.template);
    
    // Classes personnalisées
    if (options.class) {
        const customClasses = options.class.split(' ').filter(c => c.trim());
        classes.push(...customClasses);
    }
    
    // Options TOC
    if (options.toc) classes.push(`toc-${options.toc}`);
    
    // Couleur de fond
    if (options.bgColor) section.setAttribute('data-bgColor', options.bgColor);
    
    // Autres options CSS
    if (options.width) style += `--width:${options.width}; `;
    if (options.height) style += `--height:${options.height}; `;
    
    // Appliquer
    if (style.trim()) section.setAttribute('style', style);
    section.className = classes.join(' ');
}
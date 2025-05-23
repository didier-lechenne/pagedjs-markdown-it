import {  theme} from "./bookPath.js";
import { data, options} from "./getYml.js";
import { isTrue, loadCSS, loadScript, loadModule } from "./functions.js";
import { runningElements } from "./loadData.js";
import { pageMode } from "./pageMode.js";

const recto_verso = options.recto_verso;
const baseline = options.baseline;
const printNotes = options.printNotes; // Définir printNotes ici
const tailwind = options.recto_verso;

export async function screenHead() {
	try {
		// CSS
		loadCSS("/assets/css/modules/reset.css");
		// les styles du livre
		loadCSS(`${theme}/assets/css/styles.css`);

		import("./documentCSS.js").then((module) => {
			module.addPrintCSS();
		});

		// JS

		await loadScript(`${theme}/assets/js/screen/screen.js`);

		loadModule("../hooks/moveFiguresToSection.js");

		const sideNotes = await import("./sideNotesModule.js");
		if (sideNotes.initializeFootnotes) {
			sideNotes.initializeFootnotes();
		} else {
			sideNotes.warn("initializeFootnotes n'est pas définie dans le module.");
		}

		if (printNotes === "marge") {
			loadModule("../hooks/marginNotes/marginNotes.js").then((marginNotes) => {
				if (marginNotes) {
					// Utiliser marginNotes ici
				}
			});
		}
		// import ("../hooks/affiche_repere/affiche_repere.js");
		loadModule("../hooks/affiche_repere/affiche_repere.js");

		loadModule("../dependencies/ragadjust.js");

		if (pageMode === "layout") {
			await loadScript(`${theme}/assets/js/layout/turndown.js`);
			await loadScript(`${theme}/assets/js/layout/layout.js`);
			loadCSS(`${theme}/assets/js/layout/layout.css`);
		}
	} catch (error) {
		console.error("Erreur lors du chargement des modules pour écran :", error);
	}
}

export async function printHead() {
	try {
		// CSS
		// Ajouter dynamiquement les fichiers CSS nécessaires
		loadCSS("/assets/css/modules/reset.css");
		loadCSS("/assets/css/interface.css");

		// Vérifier la valeur de baseline pour charger le CSS conditionnellement
		if (isTrue(baseline)) {
			loadCSS("/assets/css/baseline.css");
		}

		// Vérifier la valeur de recto_verso pour charger le CSS conditionnellement
		if (isTrue(recto_verso)) {
			loadCSS("/assets/css/recto_verso.css");
		}

		// css généré
		import("./documentCSS.js").then((module) => {
			module.addPrintCSS();
		});

		loadCSS(`${theme}/assets/css/styles.css`);
		loadCSS(`${theme}/assets/css/print.css`);


		await import("../dependencies/paged.polyfill.js");

		if (printNotes === "bas") {
			loadModule("../hooks/footNotes.js").then((footNotes) => {
				if (footNotes) {
					// Utiliser footNotes ici
				}
			});
		}

		if (printNotes === "marge") {
			loadModule("../hooks/marginNotes/marginNotes.js").then((marginNotes) => {
				if (marginNotes) {
					// Utiliser marginNotes ici
				}
			});
		}

		
		// JS Importer les fichiers JavaScript requis pour l'impression
		const toc = document.getElementById("sommaire");
		if (toc) {
			loadModule("../hooks/createToc.js");
		}

		loadModule("../hooks/moveFiguresToSection.js");

		loadModule("../hooks/fullPage/csstree.min.js");
		loadModule("../hooks/fullPage/fullPage.js");

		loadModule("../hooks/imageNotes.js");

		loadModule("../hooks/breakUrls.js");

		loadModule("../hooks/affiche_repere/affiche_repere.js");

		loadModule("../hooks/ragadjust_hook.js");

		loadModule("../hooks/reload_in_place.js");

		runningElements(data);

		// JS du livre,
		await loadScript(`${theme}/assets/js/print/print.js`);

		if (pageMode === "print&layout") {
			await loadScript(`${theme}/assets/js/layout/turndown.js`);
			await loadScript(`${theme}/assets/js/layout/layout.js`);
			loadCSS(`${theme}/assets/js/layout/layout.css`);
		}
	} catch (error) {
		console.error(
			"Erreur lors du chargement des modules pour impression :",
			error
		);
	}
}

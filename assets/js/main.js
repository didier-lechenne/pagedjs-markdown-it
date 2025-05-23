import { data, options } from "./utils/getYml.js";
import { themePath } from "./utils/path.js";
import { pageMode } from "./utils/pageMode.js";
import { isTrue, loadCSS, loadScript, getDPI, loadModule } from "./utils/functions.js";
import { screenCover, screenSommaire, insertTag, load, runningElements } from "./utils/loadData.js";
import regexTypo from "./dependencies/typesetting.js";


const name = data.name;
const parts = Array.isArray(data.parts) ? data.parts : [];

async function loadParts() {
	try {
		parts.forEach((part) => insertTag(part, name, data));
		await Promise.all(parts.map((part) => load(part)));
	} catch (error) {
		console.error("Erreur lors du chargement des parties :", error);
	}
}

async function screenCSS() {
    loadCSS(`${themePath}/assets/css/styles.css`);
}

async function screenJS() {
	try {
		await loadModule("../hooks/affiche_repere/affiche_repere.js");
		console.info("Plugin → showMarker");

		import("./hooks/moveFiguresToSection.js");
		console.info("Plugin → moveFiguresToSection");

		await import("./hooks/wrapper.js");
		console.info("Plugin → wrapper");

		const sideNotes = await loadModule("../utils/sideNotesModule.js");
		if (sideNotes.initializeFootnotes) {
			sideNotes.initializeFootnotes();
		} else {
			sideNotes.warn("initializeFootnotes n'est pas définie dans le module.");
		}

		// Obtenir les données de configuration
		const typesetting = options.typesetting;
		if (isTrue(typesetting)) {
			import("./dependencies/ragadjust_screen.js")
			console.info("Plugin → ragadjust");
		}
		
		loadScript(`${themePath}/assets/js/screen/screen.js`);

			if (pageMode === "layout") {
				// en mode screen pas de await. En mode print await requis ???
				import("./layout/layout.js");
				console.info("Plugin → layout");
				loadCSS(`../assets/js/layout/layout.css`);
				document.body.classList.remove("no_reperes");
			}

	} catch (error) {
		console.error("Erreur lors du chargement des JS pour le mode écran :", error);
	}
}

async function printCSS() {
	try {
		loadCSS("/assets/css/modules/reset.css");
		loadCSS("/assets/css/interface.css");

		if (isTrue(options.baseline)) {
			loadCSS("/assets/css/baseline.css");
		}
		if (isTrue(options.recto_verso)) {
			loadCSS("/assets/css/recto_verso.css");
			document.body.classList.add('recto_verso');

		}

		await import("./utils/documentCSS.js").then((module) => module.addPrintCSS());
		loadCSS(`${themePath}/assets/css/styles.css`);
		loadCSS(`${themePath}/assets/css/print.css`);
	} catch (error) {
		console.error("Erreur lors du chargement des CSS :", error);
	}
}

async function printJS() {
	try {
		await import("./dependencies/paged.polyfill.js");
		console.info("Plugin → paged.polyfill.js");

		await import("./hooks/moveFiguresToSection.js");
		console.info("Plugin → moveFiguresToSection");

		if (options.printNotes === "bottom") {
			await import("./hooks/footNotes.js");
			console.info("Plugin → footNotes");
		}

		if (options.printNotes === "margin") {
			await import("./hooks/marginNotes/marginNotes.js");
			console.info("Plugin → marginNotes");
		}

		// const toc = document.querySelector('[data-title="cover"]');
		// if (toc) {
		// 	await import("./hooks/createToc.js");
		// 	console.info("Plugin → createToc");
		// }

		await import("./hooks/affiche_repere/affiche_repere.js");
		console.info("Plugin → showMarker");

		await import("./hooks/breakUrls.js");
		console.info("Plugin → breakUrls");

		if (isTrue(options.imageNotes)) {
			await import("./hooks/imageNotes/imageNotes.js");
			console.info("Plugin → imageNotes");
		} else {
			loadCSS(`../assets/js/hooks/imageNotes/imageNotes.css`);
		}



		await import("./hooks/fullPage/csstree.min.js");
		console.info("Plugin → csstree");

		await import("./hooks/fullPage/fullPage.js");
		console.info("Plugin → fullPage");

		await import("./hooks/wrapper.js");
		console.info("Plugin → wrapper");


		await loadScript(`${themePath}/assets/js/print/print.js`);
		console.info("Theme → print.js");

		await import("./hooks/ragadjust_hook.js");
		console.info("Plugin → ragadjust_hook");

		if (pageMode === "print&layout") {

			await import("./hooks/interface/interface.js");
			console.info("Plugin → interface");
	
			await import("./hooks/position/position.js");
			console.info("Plugin → position");

			loadCSS(`../assets/js/hooks/position/position.css`);
	
		}

		await import("./hooks/reload_in_place.js").then(module => {
			module.moveFast();
			console.info("Plugin → reload_in_place");
		}).catch(err => {
			console.error("Erreur lors de l'importation du module:", err);
		});





	} catch (error) {
		console.error("Erreur lors du chargement des JS :", error);
	}
}

async function main() {
	try {
		await loadParts();

		if (["screen", "layout"].includes(pageMode)) {
            await screenCover(data);
            await screenSommaire(parts);
            await screenCSS();
			await screenJS();

			document.body.style.display = "block";
			document.body.classList.add("screen");
			document.body.classList.add("hideMarker");
			if (pageMode === "layout") {
				document.body.classList.remove("hideMarker");
			}

			

		} else if (["print", "print&layout"].includes(pageMode)) {
			await printCSS();
			await printJS();
			await runningElements(data);

			document.body.style.display = "block";
			document.body.classList.add("print");
			window.PagedPolyfill.preview(); 
			
		}

		if (isTrue(options.typesetting)) {
			regexTypo();
			console.info("Width typesetting");
		}

		console.info("Estimated screen resolution → " + getDPI() + " DPI");
	} catch (error) {
		console.error("Erreur dans la fonction principale :", error);
	}
}

main();

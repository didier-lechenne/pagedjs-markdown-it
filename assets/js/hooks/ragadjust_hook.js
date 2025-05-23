import { options } from "../utils/getYml.js";
import ragadjust from "../dependencies/ragadjust.js";
import { isTrue } from "../utils/functions.js";


// Obtenir les données de configuration
const typesetting = options.typesetting;

class ragadjustHandler extends Paged.Handler {
	constructor(chunker, polisher, caller) {
		super(chunker, polisher, caller);
	}

	beforeParsed(content) {
		// Ajuste les en-têtes en ajoutant une espace insécable après
		// toutes les prépositions listées, et sans aucun mot de la liste blanche.
		if (isTrue(typesetting)) {
			ragadjust('p,h1,h2,h3,h4,h5,h6,li,dl', ['determiners', 'articles', 'conjunctions', 'short_prepositions', 'pronouns' ], [], content);
		}
	}
}

Paged.registerHandlers(ragadjustHandler);

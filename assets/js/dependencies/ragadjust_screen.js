// based on Nathan Ford's Ragadjust 
// https://github.com/nathanford/ragadjust
// "Use it however you like. I'll add a GPL I think as soon as I can." licence

// Forked by Yann Trividic and Nicolas Taffin
// https://github.com/yanntrividic/ragadjustfr

// TODO: 
// Make the tool language independant by supporting the lang attribute
// cleanup the code a bit (maybe get rid of the dictionary thing?)

// Elements in those lists have to be unique in order for the exceptions to work
// French prepositions


const arts = ["un", "une", "le", "la", "les", "du", "de", "des", "au", "aux"];
const dets = ["ce", "ces", "cet", "cette", "mes", "tes", "ses", "mon", "ton", "ma", "ta", "son", "sa", "notre", "votre", "leur", "nos", "vos", "leurs"];
const prons = ["je", "tu", "il", "elle", "on", "nous", "vous", "ils", "elles"];
const conjs = ["mais", "où", "et", "donc", "or", "ni", "car", "ou", "que"];
const short = ["be","he", "an","or","no", "at", "of", "it", "if", "is", "to", "in", "a","à", "y", "en", "de", "sur", "par", "as"];
const preps = ["après", "avant", "avec", "chez", "concernant", "contre", "dans", "depuis", "derrière", "dès", "durant", "entre", "hormis", "jusqu’à", "jusque", "loin", "malgré", "moyennant", "outre", "parmi", "pour", "près", "sans", "selon", "sous", "suivant", "touchant", "très", "vers"];

// English prepositionsoverlay_hook
// preps = /(\s|^|>)((aboard|about|above|across|after|against|along|amid|among|anti|around|before|behind|below|beneath|beside|besides|between|beyond|concerning|considering|despite|down|during|except|excepting|excluding|following|from|inside|into|like|minus|near|onto|opposite|outside|over|past|plus|regarding|round|save|since|than|that|this|through|toward|towards|under|underneath|unlike|until|upon|versus|with|within|without)\s)+/gi,

const case_sensitivity = true;

function make_case_sensitive(l) {
	let title_case = [];
	l.forEach(function (item, i) {
		var word = l[i];
		word = word[0].toUpperCase() + word.slice(1);
		title_case.push(word);
	  });
	return l.concat(title_case);
}

function get_regex_from_array_of_words(l, exceptions) {
	exceptions.forEach(function (item, i) {
		if (l.indexOf(item) != -1) {
			l.splice(l.indexOf(item), 1);
		}
	});
	let reg = case_sensitivity ? make_case_sensitive(l).join("|") : l.join("|");
	//console.log(reg)
	return reg;
}

function build_regex_from_words(l, exceptions) {
	return new RegExp("(\\s|^|>|&#160;|&nbsp;)(((" + get_regex_from_array_of_words(l, exceptions) + ")(\\s))+)" , 'gi');
}

/** This is not applied when we detect the property text-align:justify */
function processSelectors(string) {
	let selectors = string.split(",");
	for(let i = 0 ; i < selectors.length ; i++) {
		selectors[i] = selectors[i].replace(/^\s*(.*)\s*$/, "$1") + ":not([text-align=\"justify\"])";
	}
	string = selectors.join(",")
	// console.log(string);
	return string;
}

function ragadjust(s, method, exceptions = [], content = null) {

	
	let doc;
	if(content) {
		doc = content;
	} else {
		doc = document;
	}
	
	if (doc.querySelectorAll) {
		s = processSelectors(s);
		console.log("ragadjust elements", s, "following those methods:", method)
		var eles = doc.querySelectorAll(s),
			elescount = eles.length,

			dictionary = { // Is used to perform the same operations over each of those words
				"articles": build_regex_from_words(arts, exceptions),
				"determiners": build_regex_from_words(dets, exceptions),
				"pronouns": build_regex_from_words(prons, exceptions),
				"conjunctions": build_regex_from_words(conjs, exceptions),
				"short_prepositions": build_regex_from_words(short, exceptions),
				"prepositions": build_regex_from_words(preps, exceptions),
			},

			smallwords = /(\s|^)(([a-zA-ZÀ-ž-_(]{1,2}('|’)*[a-zA-ZÀ-ž-_,;]{0,1}?\s)+)/gi, // words with 3 or less characters

			dashes = /([-–—])\s/gi,

			emphasis = /(<(strong|em|b|i)>)(([^\s]+\s*){2,3})?(<\/(strong|em|b|i)>)/gi;

		while (elescount-- > 0) {

			var ele = eles[elescount],
					elehtml = ele.innerHTML;
			
			for (const [key, value] of Object.entries(dictionary)) {
				
            if (method.indexOf(key) != -1 || method.indexOf('all') != -1) 
					elehtml = elehtml.replace(value, function(contents, p1, p2) {
				        return p1 + p2.replace(/\s/gi, '&#160;');
				    });
			}		

			if (method.indexOf('small-words') != -1 || method.indexOf('all') != -1) 

				// replace small words
				elehtml = elehtml.replace(smallwords, function(contents, p1, p2) {
					return contents.replace(/\s/gi, '&#160;');
				});

			if (method.indexOf('dashes') != -1 || method.indexOf('all') != -1) 

				// replace small words
				elehtml = elehtml.replace(dashes, function(contents) {
					return contents.replace(/\s/gi, '&#160;');
				}); 

			if (method.indexOf('emphasis') != -1 || method.indexOf('all') != -1) 

				// emphasized text
				elehtml = elehtml.replace(emphasis, function(contents, p1, p2, p3, p4, p5) {
					return p1 + p3.replace(/\s/gi, '&#160;') + p5;
				});

			// doesn't work :(
			// if (method.indexOf('orphans') || method.indexOf('all'))

			// 	// no single words on there own last line
			// 	elehtml = elehtml.replace(orphans, function(contents) {
			// 	 	return contents.replace(/(\s|^&#160;)/, '&#160;')
			// 	});

			ele.innerHTML = elehtml;
		}
	}
};

ragadjust('p,h1,h2,h3,h4,h5,h6,li', ['determiners', 'articles', 'conjunctions', 'short_prepositions', 'pronouns' ]);

const P = new Pokedex.Pokedex();

// Restricted pokemon
const RESTRICTED = ["mewtwo", "lugia", "ho-oh", "kyogre", "groudon", "rayquaza", "dialga", "palkia", "giratina", "reshiram",
					"zekrom", "kyurem", "xerneas", "yveltal", "zygarde", "cosmog", "cosmoem", "solgaleo", "lunala", "necrozma",
					"zacian", "zamazenta", "eternatus", "calyrex"];

// Mythical pokemon
const MYTHICAL = ["mew", "celebi", "jirachi", "deoxys", "phione", "darkrai", "shaymin", "arceus", "victini", "keldeo",
				  "meloetta", "genesect", "diancie", "hoopa", "volcanion", "magearna", "marshadow", "zeraora", "meltan",
				  "zarude"];

// Pokemon that aren't restricted or mythical but should be removed from drafts
const DISALLOWED = ["unown"];

// The highest id of an evolution chain
const EVOLUTION_CHAIN_MAX = 476;

const draftSets = new Array(8)

async function draft() {
	// Make 8 draft sets, each containing 4 pokemon
	for (let i = 0; i < 8; i++) {
		let draftSet = new Array(4);

		for (let j = 0; j < 4; j++) {
			// Generate pokemon until it generates a valid one
			generatorLoop: do {
				try {
					// Gets a random evolution chain from the API
					let newChain = await P.getEvolutionChainById(Math.floor((Math.random() * EVOLUTION_CHAIN_MAX) + 1));

					// Checks if the evolution chain is restricted, mythical, or disallowed
					if (RESTRICTED.includes(newChain.chain.species.name) || MYTHICAL.includes(newChain.chain.species.name) || DISALLOWED.includes(newChain.chain.species.name)) {
						continue generatorLoop;
					}

					// Checks to see if the evolution chain is already in the draft set
					for (let k = 0; k < i && !(i == 0 && j == 0); k++) {
						for (let m = 0; m < j; m++) {
							if (draftSets[k][m].id == newChain.id) {
								continue generatorLoop;
							}
						}
					}

					// Add the evolution chain to the draft set
					console.log('draftSet[' + j + '] = ' + newChain.chain.species.name);
					draftSet[j] = newChain;
					break generatorLoop;

				// If any error is caught, the loop automatically continues 
				} catch (e) {

					if (e.message.includes('Request failed', 0)) {
						// Log whether the error was expected (from calling the API with a bad id) or unexpected
						if (e.message.includes('404', 0)) {
							console.log('Error connecting to API. This is probably expected. Retrying...');
						} else {
							console.log('Unexpected error connecting to API. Retrying...');
						}
					} else {
						// Any non-network error is an issue with the code and should be re-thrown
						throw e;
					}
				}
			} while (true);
		}

		// Add draft set to the list of draft sets
		console.log('draftSets[' + i + '] = ' + draftSet);
		draftSets[i] = draftSet;
	}

	// Create a string that's a list of all the pokemon picked in the draft
	let newHtml = "";

	for (let i = 0; i < draftSets.length; i++) {
		newHtml += '<p>Pick ' + i + ':</p>';
		
		for (let j = 0; j < draftSets[i].length; j++) {
			let chain = draftSets[i][j].chain;

			while (chain.evolves_to.length != 0) {
				chain = chain.evolves_to[0];
			}

			newHtml += '<p>' + chain.species.name + '</p>';
		}

		newHtml += '<hr>';
	}

	// Update HTML to display draft
	$("body").html(newHtml); 
}

draft();
// PokeAPI wrapper class
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

// These evolution chain IDs do not exist within the PokeAPI and shouldn't be called
const INVALID_CHAIN_IDS = [210, 222, 225, 226, 227, 231, 238, 251];

// The highest id of an evolution chain
const EVOLUTION_CHAIN_MAX = 476;

// Contains eight draft sets, each of which contains 4 evolution chains
const draftSets = new Array(8);

// Contains documentFragments which contain visual representations of the draft
const draftDisplays = new Array(8);

/**
 * Populates draftSets with draft sets. Each draft set is an array of four evolution trees.
 */
async function makeDraft() {
	// Make 8 draft sets, each containing 4 pokemon
	for (let i = 0; i < 8; i++) {
		let draftSet = new Array(4);

		for (let j = 0; j < 4; j++) {
			// Generate pokemon until it generates a valid one
			generatorLoop: do {
				try {
					// Gets a random evolution chain from the API
					let newChain;
					let randId = Math.floor((Math.random() * EVOLUTION_CHAIN_MAX) + 1);
					if (!INVALID_CHAIN_IDS.includes(randId, 0)) {
						newChain = await P.getEvolutionChainById(randId);
					} else {
						continue generatorLoop;
					}

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
					// Network requests are possible due to an API failure
					if (e.message.includes('Request failed', 0)) {
						console.log('Error connecting to API. Retrying...')
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
}

/**
 * Returns a formatted card for an evolution chain.
 * @param evolution_chain The evolution family to draw the card for
 * @return The formatted card
 */
async function drawCard(evolution_chain) {
	// Retrieve pokemon information
	let pokemon = await getFinalEvolutionDefault(evolution_chain);

	// Clone template for modification and remove id so the template can be accessed later
	let card = $('#template').clone();
	card.removeAttr('id');

	// Add name
	card.find('#name strong').html(pokemon.species.name.replace('-', ' '));

	// Add types
	for (let i = 0; i < pokemon.types.length; i++) {
		card.find('#types').append(`<img src="/static/img/${pokemon.types[i].type.name}.png" class="pixelate" width="64" height="28"></img>`);
	}

	// Modify card color to match type
	card.addClass(`${pokemon.types[0].type.name}-card`);

	// Add sprite, using the gen vii sprite if possible and gen viii if not
	if (pokemon.sprites.versions['generation-vii'].icons.front_default != null) {
		card.find('#sprite').append(`<img src="${pokemon.sprites.versions['generation-vii'].icons.front_default}" class="pixelate sprite-gen-vii">`);
	} else {
		card.find('#sprite').append(`<img src="${pokemon.sprites.versions['generation-viii'].icons.front_default}" class="pixelate sprite-gen-viii">`);
	}

	// Add abilities
	for (let i = 0; i < pokemon.abilities.length; i++) {
		card.find('#abilities').append(`<div class="col" style='text-transform:capitalize;'>${pokemon.abilities[i].ability.name.replace('-', ' ')}</div>`);
	}

	// Add base stats
	card.find('#hp').html(pokemon.stats[0].base_stat);
	card.find('#atk').html(pokemon.stats[1].base_stat);
	card.find('#def').html(pokemon.stats[2].base_stat);
	card.find('#spa').html(pokemon.stats[3].base_stat);
	card.find('#spd').html(pokemon.stats[4].base_stat);
	card.find('#spe').html(pokemon.stats[5].base_stat);

	// Make new card visible
	card.css('display', 'block');
	return card;
}

/**
 * Returns the final evolution species of an evolution chain.
 * @param evolution_chain The evolution chain
 * @return The species of its final evolution (NOT its pokemon)
 */
async function getFinalEvolutionDefault(evolution_chain) {
	evolution_chain = evolution_chain.chain;

	while (evolution_chain.evolves_to.length != 0) {
		evolution_chain = evolution_chain.evolves_to[0];
	}

	// Get species from chain
	let species = await P.getPokemonSpeciesByName(evolution_chain.species.name);
	
	// Get default form from species
	for (let i = 0; i < species.varieties.length; i++) {
		if (species.varieties[i].is_default) {
			return await P.getPokemonByName(species.varieties[i].pokemon.name);
		}
	}
	
	// Throw error if no default form exists
	throw `Species "${species.name}" has no default form!`;
}

/**
 * Begins a draft.
 */
async function draft() {
	$('body').prepend('<p id="loading" class="text-center">Loading...</p>');
	await makeDraft();
	$('#col-1').append(await drawCard(draftSets[0][0]));
	$('#col-2').append(await drawCard(draftSets[0][1]));
	$('#col-3').append(await drawCard(draftSets[0][2]));
	$('#col-4').append(await drawCard(draftSets[0][3]));
	$('#loading').remove();
}

draft();
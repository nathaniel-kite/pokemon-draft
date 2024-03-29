/**Gradient for coloring the stat bars.*/
const STAT_BAR_GRADIENT = chroma.scale(['#930000', '#cc0000', '#f7000d', '#e3950e', '#d0fe40', '#3fda00', '#1dbd00', '#19a200',
										'#237514', '#006917', '#004b1c']).mode('lrgb');

/**PokeAPI wrapper class.*/
const P = new Pokedex.Pokedex();

/**A list of restricted pokemon to be removed from the draft.*/
const RESTRICTED = ["mewtwo", "lugia", "ho-oh", "kyogre", "groudon", "rayquaza", "dialga", "palkia", "giratina", "reshiram",
					"zekrom", "kyurem", "xerneas", "yveltal", "zygarde", "cosmog", "cosmoem", "solgaleo", "lunala", "necrozma",
					"zacian", "zamazenta", "eternatus", "calyrex"];

/**A list of mythical pokemon to be removed from the draft.*/
const MYTHICAL = ["mew", "celebi", "jirachi", "deoxys", "phione", "darkrai", "shaymin", "arceus", "victini", "keldeo",
				  "meloetta", "genesect", "diancie", "hoopa", "volcanion", "magearna", "marshadow", "zeraora", "meltan",
				  "melmetal", "zarude"];

/**A list of pokemon that aren't restricted or mythical but should be removed from drafts.*/
const DISALLOWED = ["unown"];

/**A list of evolution chain IDs that do not exist within the PokeAPI and shouldn't be called.*/
const INVALID_CHAIN_IDS = [210, 222, 225, 226, 227, 231, 238, 251];

/**The highest id of an evolution chain within PokeAPI's database.*/
const EVOLUTION_CHAIN_MAX = 476;

/**Number of picks per draft. Can be changed to modify draft.*/
const DRAFT_PICK_COUNT = 8;

/**Number of options per pick. Can be changed to modify draft.*/
const DRAFT_OPTION_COUNT = 4;

// Contains eight draft sets, each of which contains 4 evolution chains
const draftSets = new Array(DRAFT_PICK_COUNT);

// Contains documentFragments which contain visual representations of the draft
const draftDisplays = new Array(DRAFT_PICK_COUNT);

// Which pick the user is on
var pick = 1;

// List of chains that have been drafted for each pick
const selections = new Array(DRAFT_PICK_COUNT);

// A list of prerendered cards for each of the selected pokemon
const selectionCards = new Array(DRAFT_PICK_COUNT);

/**
 * Populates draftSets with draft sets. Each draft set is an array of four evolution chains.
 */
async function makeDraft() {
	// Make 8 draft sets, each containing 4 pokemon
	for (let i = 0; i < DRAFT_PICK_COUNT; i++) {

		let draftSet = new Array(DRAFT_OPTION_COUNT);

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

					// Checks to see if the evolution chain is already within the new draft set
					for (let k = 0; k < DRAFT_OPTION_COUNT; k++) {
						if (typeof draftSet[k] != 'undefined') {
							if (draftSet[k].id == newChain.id) {
								continue generatorLoop;
							}
						}
					}

					// Checks to see if the evolution chain is already in earlier draft sets
					for (let k = 0; k < DRAFT_PICK_COUNT /*&& !(i == 0 && j == 0)*/; k++) {
						if (typeof draftSets[k] != 'undefined') {
							for (let m = 0; m < DRAFT_OPTION_COUNT; m++) {
								if (typeof draftSets[k][m] != 'undefined') {
									if (draftSets[k][m].id == newChain.id) {
										continue generatorLoop;
									}
								}
							}
						}
					}

					// Add the evolution chain to the draft set
					draftSet[j] = newChain;
					break generatorLoop;

				// If any error is caught, the loop automatically continues 
				} catch (e) {
					// Network requests are possible due to an API failure
					if (e.message.includes('Request failed', 0)) {
						console.log('Error connecting to API. Retrying...')
					} else {
						// Any non-network error is an issue with the code and the user should be aleryted
						$('body').empty();
						$('body').append('<h1 style="text-align:center;">An unexpected error occured. Refreshing might fix it.</h1>');
						$('body').append(`<p style="text-align:center;">Technical details: ${e}</p>`);
					}
				}
			} while (true);
		}

		// Add draft set to the list of draft sets
		draftSets[i] = draftSet;
	}
}

/**
 * Returns a formatted card for an evolution chain.
 * @param evolution_chain The evolution family to draw the card for
 * @return The formatted card
 */
async function drawCard(evolution_chain, id) {
	// Retrieve pokemon information
	let pokemon = await getFinalEvolutionDefault(evolution_chain);

	// Clone template for modification and remove id so the template can be accessed later
	let card = $('#template').clone();
	card.attr('id', `${id}`);

	// Add name
	card.find('#name').html(pokemon.species.name.replace('-', ' '));

	// Add types
	for (let i = 0; i < pokemon.types.length; i++) {
		card.find('#types').append(`<img src="https://nathaniel-kite.github.io/pokemon-draft/static/img/${pokemon.types[i].type.name}.png" class="pixelate" width="64" height="28" alt="${pokemon.types[i].type.name}"></img>`);
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
		card.find('#abilities').append(`<div class="col d-flex align-items-center text-center justify-content-center" style='text-transform:capitalize;'>${pokemon.abilities[i].ability.name.replace('-', ' ')}</div>`);
	}

	// Add base stat numbers
	card.find('#hp').html(pokemon.stats[0].base_stat);
	card.find('#atk').html(pokemon.stats[1].base_stat);
	card.find('#def').html(pokemon.stats[2].base_stat);
	card.find('#spa').html(pokemon.stats[3].base_stat);
	card.find('#spd').html(pokemon.stats[4].base_stat);
	card.find('#spe').html(pokemon.stats[5].base_stat);

	// Update base stat widths
	card.find('#hp-bar').css('width', `${pokemon.stats[0].base_stat * 150 / 255}%`);
	card.find('#atk-bar').css('width', `${pokemon.stats[1].base_stat * 150 / 255}%`);
	card.find('#def-bar').css('width', `${pokemon.stats[2].base_stat * 150 / 255}%`);
	card.find('#spa-bar').css('width', `${pokemon.stats[3].base_stat * 150 / 255}%`);
	card.find('#spd-bar').css('width', `${pokemon.stats[4].base_stat * 150 / 255}%`);
	card.find('#spe-bar').css('width', `${pokemon.stats[5].base_stat * 150 / 255}%`);

	// Update base stat colors
	card.find('#hp-bar').css('background-color', STAT_BAR_GRADIENT(pokemon.stats[0].base_stat / 255).toString());
	card.find('#atk-bar').css('background-color', STAT_BAR_GRADIENT(pokemon.stats[1].base_stat / 255).toString());
	card.find('#def-bar').css('background-color', STAT_BAR_GRADIENT(pokemon.stats[2].base_stat / 255).toString());
	card.find('#spa-bar').css('background-color', STAT_BAR_GRADIENT(pokemon.stats[3].base_stat / 255).toString());
	card.find('#spd-bar').css('background-color', STAT_BAR_GRADIENT(pokemon.stats[4].base_stat / 255).toString());
	card.find('#spe-bar').css('background-color', STAT_BAR_GRADIENT(pokemon.stats[5].base_stat / 255).toString());

	// Make new card visible
	card.css('display', 'block');
	return card;
}

/**
 * Creates a docFragment with everything needed for a full draft pick and saves it to at draftDisplays at the specified
 * index.
 * @param draftSet the array of evolution chains to render the draft for
 * @param index the index in draftDisplays where the rendered display should be saved
 */
async function renderDraftDisplay(draftSet, index) {
	let display = $(document.createDocumentFragment());

	// Add row to append picks to
	display.append('<div id="set-row" class="row gap-3"></div>');

	// For each chain, append a column, a div to display which one is selected, and the card itself
	for (let i = 0; i < draftSet.length; i++) {

		// Add breakpoint to make display responsive
		if (i == 2) {
			display.find('#set-row').append('<div class="w-100 d-xl-none"</div>');
		}

		// Make a column, put a selectable div in it, make and put the card in the selectable div, then add the onClick function
		display.find('#set-row').append(`<div id="col-${i}" class="col d-flex justify-content-center"></div>`);
		display.find(`#col-${i}`).append(`<div id="select-${i}" class="my-3 flex-grow-1 selectable"></div>`);
		display.find(`#select-${i}`).append(await drawCard(draftSet[i], i));
		display.find(`#select-${i}`).click(select);
	}

	draftDisplays[index] = display;
}

/**
 * Removes the .selected class from selected objects, and gives it to calling object. Also enables and renames
 * the button.
 */
function select() {
	// Unselect old selected
	$('.selected').addClass('selectable');
	$('.selected').removeClass('selected');

	// Select new selected
	$(this).removeClass('selectable');
	$(this).addClass('selected');
	
	// Enable button
	$('#pick-button').html(`Draft ${$(this).find('#name').html()}`);
	$('#pick-button').prop('disabled', false);
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
 * Progresses to the next pick.
 */
async function nextPick() {
	if (pick < DRAFT_PICK_COUNT) {

		// Update display if the next pick has already loaded
		if (!(typeof draftDisplays[pick] == 'undefined')) {

			// Record selection
			selections[pick - 1] = $('.selected').attr('id').slice(-1);
			
			// Updates sprites to display previous picks
			// Sizes new image based on class of the original image (gen-vii or gen-viii)
			if ($('.selected #sprite img').hasClass('sprite-gen-viii')) {
				$(`#pick-${pick}-sprite`).append(`<img src="${$('.selected #sprite img').attr('src')}" class="pixelate previous-pick-gen-viii"></img>`);
			} else {
				$(`#pick-${pick}-sprite`).append(`<img src="${$('.selected #sprite img').attr('src')}" class="pixelate previous-pick-gen-vii"></img>`);
			}
		
			renderSelection(pick - 1);

			// Update pick number, update title
			pick++;
			$('#title ').html(`PokéDraft - Pick ${pick}`);

			// Remove old draft and add new one
			$('#set-row').remove();
			$('#draft-container').prepend(draftDisplays[pick - 1]);

			// Disable button
			$('#pick-button').prop('disabled', true);
			$('#pick-button').html('Select a Pokémon');
		// If the next pick hasn't loaded, try again until it has
		} else {
			// Remove selectable class from each pick and unbind the code that changes the pick
			$('.selectable').unbind();
			$('.selected').unbind();
			$('.selectable').css('padding', '8px');
			$('.selectable').removeClass('selectable');

			// Disable button
			$('#pick-button').html('Loading...');
			$('#pick-button').prop('disabled', true);

			// Call function again after 50 ms
			sleep(50).then(() => { nextPick(); });
		}
	} else {
		selections[pick - 1] = $('.selected').attr('id').slice(-1);
		await renderSelection(pick - 1);
		displayEndPage();

	}
}

/**
 * setTimeouts a function to delay a function for some number of milliseconds.
 */
function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
  }

/**
 * Looks at the 'selections' array, draws the card at the specified id, then stores it in the selectionCards array.
 * @param id the index in the selections array of the card to be rendered
 */
async function renderSelection(id) {
	let chain = draftSets[id][selections[id]];
	selectionCards[id] = await drawCard(chain, id);
}

/**
 * Wipes the body and creates a new page filled with the cards in the selectionCards array.
 */
function displayEndPage() {

	// Empty draft
	$('.container').empty();

	// Add title, hr, and row to display previous picks
	$('.container').append('<div class="py-2 text-center"><h1 id="title">Draft Complete!</h1><hr>');
	$('.container').append('<div id="all-picks" class="row justify-content-center gy-2 py-2"></div>');

	// Add cards for all previously picked pokemon
	for (let i = 0; i < DRAFT_PICK_COUNT; i++) {

		// Wrap lines for desktop every 4 picks, and for tablet every 2
		if (i % 4 == 0 && i != 0) {
			$('#all-picks').append('<div class="w-100"</div>');
		} else if (i % 2 == 0 && i != 0) {
			$('#all-picks').append('<div class="w-100 d-xl-none"</div>');
		}

		// Append column, then append the card to the column
		$('#all-picks').append(`<div id="col-${i}" class="col d-flex justify-content-center"></div>`);
		$(`#col-${i}`).append(selectionCards[i]);
	}

	$('.container').append('<hr><h2 class="py-2 text-center">Good luck!</h2><hr>');
}

/**
 * Begins a draft.
 */
async function draft() {

	// Draw loading text and fill HTML with the correct number of sprite containers (to display picks)
	$('#draft-container').append('<p id="loading" class="text-center">Loading...</p>');
	for (let i = 0; i < DRAFT_PICK_COUNT; i++) {
		$('#previous-picks').append(`<div class="col justify-content-center d-flex"><div id="pick-${i + 1}-sprite" class="previous-pick-container"></div></div>`);
	}

	// Make a draft
	await makeDraft();

	// Render and display the first draft sets
	await renderDraftDisplay(draftSets[0], 0);
	$('#draft-container').append(draftDisplays[0]);
	$('#loading').remove();

	// Render the rest of the draft sets
	for (let i = 0; i < draftSets.length; i++) {
		renderDraftDisplay(draftSets[i], i);
	}
	
	// Set pick button's onClick features
	$('#pick-button').click(nextPick);
}

try {
	draft();
} catch (e) {
	alert(`An unexpected error ocurred. Details: ${e}`);
}

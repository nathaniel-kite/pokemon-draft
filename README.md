# pokemon-draft

This website lets you simulate a Pokémon draft! Draft is designed as a format where you can test your teambuilding skills against a friend. Other formats can get stale when playing against one person, since playing with the same teams can get boring. However, when drafting your team is quite limited; you'll need to get creative to make the strongest team you can!

Note: In order to actually build and battle with your teams, you'll need to use the official games or a site like [Pokémon Showdown](https://pokemonshowdown.com/).

### How to draft

The website is hosted at [https://nathaniel-kite.github.io/pokemon-draft/draft/draft.html](https://nathaniel-kite.github.io/pokemon-draft/draft/draft.html), or you can clone this repository and run it locally. If you do, you'll need to make sure you install the requisite libraries (included at the bottom of this page). Once you've installed the three libraries, you can use `$ flask run` to launch the site.

### How it works:

1. First, use this website to draft a team. You'll choose eight Pokémon, each from a set of four options.
2. Choose your favorite six Pokémon and build a team with them. You can choose their movesets, abilities, EV spreads, items, etc.
3. Start battling!

### Recommended ruleset for teambuilding and battling:

- All games are played as Gen VIII Double battles.
- No restricted or mythical Pokémon, and no Unown. *(These are removed from the draft automatically).*
- No Mega Evolution, Z-Moves, or Dynamax.
- No moves that don't exist in Gen VIII.
- Instead of using a Pokémon you drafted, you may use any Pokémon from its evolution tree, or any of its alternate or regional forms.
- Endless Battle Clause, Evasion Clause, and Gravity Sleep Clause all apply.

### Why this ruleset?

Double battles work well for draft because they help to migitate the RNG inherant in drafting. Sweepers are much stronger in singles, which means a lucky pick could sweep a team quickly with relatively little counterplay. In doubles, you can double target a sweeper to shut it down more easily. Doubles also offers the chance to use support Pokémon, which means normally awful Pokémon can be useful by setting screens, Tailwind, or Taunt. Choosing proper support Pokémon is an important skill when drafting.

Since there are Gen VIII Pokémon in the draft, it wouldn't be fair to use moves that only exist in earlier generations. This is mainly important for near-universal moves like Hidden Power.

Unfortunately, due to PokéAPI's quirks, there is no elegant way to make a draft that incorporates alternate forms or branching final evolutions. The rule which allows you to use alternate forms freely is an attempt to recapture some of the diversity lost by the current draft algorithim, and make a few bad Pokémon more viable. It's possible that in the future, the draft might be reworked to incorporate alternate forms. However, that would likely require constructing an entire new database to work with.

Mega Evolution interacts awkwardly with draft, since it skews the opportunity cost normally associated with choosing a Mega Evolution. Dynamax warps games and is generally considered a frustrating mechanic, and Z-Moves would feel awkard if they were the only regional gimmick available. However, feel free to experiment with these if they interest you!

### Any tips for drafting?

- Stick to the golden ratio of 2 supports / 4 threats. Never go past 2 supports.
- Focus on drafting offense; use your bad picks to find support Pokémon, as they're less critical and easier to come by.
- Remember that most Pokémon with Tailwind, screens, Sticky Web, Spore, or Follow Me/Rage Powder are viable as support Pokémon. This is especially true with other support moves, high speed, or Prankster.
- You need a lot of support to build a Sand, Rain, or Trick Room team. Don't get caught halfway into the archetype.
- Come prepared to deal with dragons! There are lots of good dragon-type threats that come up in the draft!
- Don't blame losses on unlucky drafts. A good player can make a good team out of a bad draft.

### Acknowledgments

Thank you to the contributors of the following libraries, which make this project possible:

- [PokéAPI](pokeapi.co), which provides all the data used by the draft
- [pokeapi-js-wrapper](https://github.com/PokeAPI/pokeapi-js-wrapper), the JavaScript wrapper for PokéAPI
- [Flask](flask.palletsprojects.com), which can be used to host this website on a server
- [chroma.js](https://gka.github.io/chroma.js/), which helps properly display the colors on the stat bars

Developed by Nathaniel Kite. Licensed under GNU General Public License v3.0.

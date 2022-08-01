import random
import json
import pokebase as pb
from requests.exceptions import HTTPError

# The index of the evolution chain with the highest index number
FAMILY_COUNT = 476

# A list of restricted pokemon
RESTRICTED = ["mewtwo", "lugia", "ho-oh", "kyogre", "groudon", "rayquaza", "dialga", "palkia", "giratina", "reshiram",
			  "zekrom", "kyurem" "xerneas", "yveltal", "zygarde", "cosmog", "cosmoem", "solgaleo", "lunala", "necrozma",
			  "zacian", "zamazenta", "eternatus", "calyrex"]

# A list of mythical pokemon
MYTHICAL = ["mew", "celebi", "jirachi", "deoxys", "phione", "darkrai", "shaymin", "arceus", "victini", "keldeo",
			"meloetta", "genesect", "diancie", "hoopa", "volcanion", "magearna", "marshadow", "zeraora", "meltan",
			"zarude"]

def get_draft():
	"""Returns 8 lists of draft sets, each of which is itself a list of 4 pokemon. All pokemon are unique and aren't
	legendary or mythical."""

	# List of evolution chains
	draft = []

	# Get 8 draft sets
	for i in range(8):

		families = []

		# Get 4 families
		for j in range(4):
			retry = True

			# Repeat until it generates a valid family
			while retry:
				retry = False

				try:
					family = pb.evolution_chain(random.randint(1, FAMILY_COUNT))

					# Check restricted list
					if family.chain.species.name in RESTRICTED:
						retry = True

					# Check mythical list
					if family.chain.species.name in MYTHICAL:
						retry = True

					# Check already generated families to remove duplicates
					for evo_chain in families:
						if evo_chain.id == family.id:
							retry = True

					# If it passes all the checks, append it to the list
					if not retry:
						families.append(family)

				# Retry if there was no response
				except HTTPError:
					retry = True
		
		draft.append(families)

	return draft


def draft_json():
	draft = get_draft()
	jsonthing =  json.dumps([ob.__dict__ for ob in draft])

	
def print_draft():
	draft = get_draft()
	i = 1

	for set in draft:

		print(f"Pick {i}:")

		# Print out the most-evolved member of each generated family
		for family in set:
			chain_link = family.chain
			while chain_link.evolves_to:
				chain_link = chain_link.evolves_to[0]
			print(chain_link.species.name.replace("-", " ").title())
		
		print()
		i += 1
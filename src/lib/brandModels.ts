export const BRAND_MODELS: Record<string, string[]> = {
  "Saunier Duval": ["Themaplus Condens", "Isofast Condens", "Thelia", "Semia Condens"],
  Junkers: ["Cerapur Smart", "Cerapur Comfort", "Ceraclass Excellence"],
  Energical: ["Energical 24", "Energical 28", "Energical Pro"],
  Chaffoteaux: ["Pigma Green Evo", "Mira C Green", "Talia Green", "Niagara C Green"],
  Baxi: ["Luna Duo-tec", "Platinum Duo", "Eco Compact"],
  Vaillant: ["ecoTEC plus", "ecoTEC pro", "atmoTEC", "turboTEC"],
  Beretta: ["Mynute Green", "Exclusive Boiler Green", "Ciao Green"],
  Viessmann: ["Vitodens 100-W", "Vitodens 200-W", "Vitopend 100"],
  Bosch: ["Condens 2500 W", "Condens 5000 W", "Gaz 7000 W"],
  Ariston: ["Clas One", "Genus One", "Alteas One"],
  Ferroli: ["Bluehelix Tech", "Divatop", "Energy Top"],
  "ELM Leblanc": ["Egalis Condens", "Megalis Condens", "Acleis"],
  Frisquet: ["Hydroconfort Condensation", "Prestige Condensation"],
  "De Dietrich": ["Naneo", "MCR Home", "Vivadens"],
};

export const ALL_BRANDS = Object.keys(BRAND_MODELS);
export const ALL_MODELS = Object.values(BRAND_MODELS).flat();

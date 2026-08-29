/**
 * Servora Universal Search Engine Configuration
 * Includes Ghanaian Trade Dialect Dictionary, Typo Correction Map,
 * Northern Ghana Regional Neighborhoods, and Ranking Weight Definitions.
 */

// 1. Ghanaian Trade Dialect & Synonym Expansion Dictionary
export const GHANAIAN_TRADE_SYNONYMS: Record<string, string[]> = {
  // Woodwork & Carpentry
  carpenter: ["woodworker", "joiner", "furniture maker", "roofing", "door frame", "wardrobe", "bed frame"],
  woodworker: ["carpenter", "joiner", "cabinet maker", "furniture", "woodwork"],
  furniture: ["carpenter", "woodworker", "chair", "table", "sofa", "bed frame", "dining set"],

  // Auto Mechanics & Fitters
  mechanic: ["fitter", "auto repair", "engine repair", "gearbox", "brake repair", "car servicing", "auto electrician"],
  fitter: ["mechanic", "auto repair", "engine specialist", "car mechanic", "suspension"],
  vulcanizer: ["tyre repair", "tire fix", "wheel alignment", "puncture repair", "tube fix"],
  "auto electrician": ["car wiring", "car battery", "alternator", "starter motor", "car air condition"],

  // Tailoring & Traditional Wear
  tailor: ["seamstress", "sewing", "fashion designer", "fugu", "smock", "dressmaker", "embroidery"],
  seamstress: ["tailor", "sewing", "fashion designer", "dressmaker", "kaba", "slit"],
  sewing: ["tailor", "seamstress", "fashion design", "fugu maker", "alteration"],
  fugu: ["smock", "dagbon smock", "traditional wear", "northern smock", "batakari", "woven cloth"],
  smock: ["fugu", "dagbon fugu", "batakari", "traditional attire", "woven fabric"],

  // Electrical & Solar Power
  electrician: ["electrical wiring", "solar installer", "inverter", "battery backup", "light fitting", "generator repair"],
  solar: ["inverter", "solar panel", "lithium battery", "solar pump", "solar installation", "green energy"],
  inverter: ["solar inverter", "hybrid inverter", "power backup", "battery inverter", "ups"],
  generator: ["genset", "plant", "power generator", "diesel generator", "petrol generator"],
  wiring: ["electrician", "conduit", "house wiring", "3-phase wiring", "distribution board"],

  // Plumbing & Water Systems
  plumber: ["pipe fitter", "borehole pump", "poly tank", "water heater", "drainage", "bathroom plumbing", "sink"],
  borehole: ["water drilling", "submersible pump", "rig lease", "water exploration", "well drilling"],
  "poly tank": ["water storage", "water tank", "overhead tank", "roto tank", "water pump"],
  pipe: ["plumbing", "pvc pipe", "galvanized pipe", "water fitting", "elbow pipe"],

  // Welding & Metal Fabrication
  welder: ["fabricator", "metal gate", "iron rod", "burglar proof", "metal door", "iron works", "canopy frame"],
  fabricator: ["welder", "metal works", "iron gate", "roofing truss", "steel structure"],
  "burglar proof": ["security grill", "window grill", "metal barrier", "welder", "safety bars"],

  // Masonry, Building & Tiling
  mason: ["bricklayer", "tiler", "plastering", "concrete work", "foundation", "building contractor", "cement blocks"],
  tiler: ["tiles fixing", "ceramic tiles", "porcelain tiles", "floor tiling", "wall tiling", "grouting"],
  bricklayer: ["mason", "block layer", "building construction", "mortar work"],
  cement: ["ghacem", "dangote cement", "dzata cement", "concrete", "mortar", "building supplies"],
  "cement mixer": ["concrete mixer", "mixing machine", "building tool rental", "construction plant"],

  // Haulage, Delivery & Transport
  haulage: ["truck", "tipper", "canter", "motorkia", "tricycle", "delivery service", "freight"],
  truck: ["tipper truck", "haulage", "canter", "kia truck", "sand delivery", "gravel delivery"],
  tricycle: ["motorkia", "yellow yellow", "keke", "pragya", "cargo carrier"],

  // Agriculture & Farming
  tractor: ["ploughing", "harrowing", "harvester", "farm equipment", "agribusiness", "rotavator"],
  shea: ["shea butter", "raw shea", "shea nuts", "karite", "organic cosmetic"],
  grain: ["maize", "rice", "soybeans", "millet", "sorghum", "yam", "cereals"],

  // Tech & Electronics
  phone: ["smartphone", "iphone", "samsung", "screen repair", "charging port", "phone unlock"],
  screen: ["phone display", "lcd replacement", "oled screen", "screen repair", "cracked glass"],
  laptop: ["computer repair", "macbook", "windows pc", "hard drive", "ram upgrade", "keyboard replacement"],
  cctv: ["security camera", "surveillance", "ip camera", "dvr installation", "alarm system"],
};

// 2. Common Phonetic & Typo Corrections
export const COMMON_TYPO_MAP: Record<string, string> = {
  cemet: "cement",
  cemnt: "cement",
  mixr: "mixer",
  plubmer: "plumber",
  plumbr: "plumber",
  fiter: "fitter",
  fitterr: "fitter",
  invertr: "inverter",
  invrter: "inverter",
  soler: "solar",
  solr: "solar",
  fuguh: "fugu",
  fuguu: "fugu",
  smok: "smock",
  smokc: "smock",
  iphoen: "iphone",
  scren: "screen",
  scrin: "screen",
  weldr: "welder",
  genrator: "generator",
  genratorr: "generator",
  tractr: "tractor",
  elecrician: "electrician",
  electrisian: "electrician",
  bariklayer: "bricklayer",
  polytnk: "poly tank",
  borhole: "borehole",
};

// 3. Search Stop Words (Filtered during tokenization)
export const SEARCH_STOP_WORDS = new Set([
  "i", "want", "need", "looking", "for", "a", "an", "the", "in", "at", "to",
  "near", "me", "please", "help", "with", "and", "or", "of", "on", "by",
  "ghana", "tamale", "affordable", "cheap", "best", "good", "fast", "reliable",
]);

// 4. Northern Ghana Neighborhood & City Zones
export const NORTHERN_GHANA_ZONES = [
  "Sakasaka",
  "Nyohini",
  "Choggu",
  "Aboabo",
  "Lamashegu",
  "Vitting",
  "Kalariga",
  "Sagnarigu",
  "Dungu",
  "Kanvilli",
  "Jisonayili",
  "Gurugu",
  "Tamale Industrial Area",
  "Kukuo",
  "Fuo",
  "Gumbihini",
  "Vittin Target",
  "Bimbilla",
  "Yendi",
  "Bolgatanga",
  "Wa",
  "Damongo",
  "Bawku",
  "Navrongo",
  "Walewale",
  "Nalerigu",
];

// 5. Ranking Rule Weights Configuration
export const SEARCH_RANKING_WEIGHTS = {
  EXACT_TITLE_MATCH: 100,
  EXACT_CATEGORY_MATCH: 70,
  PREFIX_TITLE_MATCH: 50,
  SYNONYM_MATCH: 40,
  GEO_ZONE_MATCH: 35,
  VERIFIED_TIER_BOOST: 25,
  DESCRIPTION_MATCH: 15,
  RECENCY_BOOST: 10,
  TYPO_TOLERANCE_PENALTY: -15,
};

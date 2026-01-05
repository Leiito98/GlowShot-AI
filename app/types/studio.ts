// app/types/studio.ts

// Sexo mostrado en UI (para prompts seguimos usando man/woman por compat)
export type UXGender = "man" | "woman" | "non_binary";

export type AgeRange =
  | "18_20"
  | "21_24"
  | "25_29"
  | "30_40"
  | "41_50"
  | "51_65"
  | "65_plus";

export type HairColor =
  | "brown"
  | "black"
  | "blonde"
  | "gray"
  | "auburn"
  | "red"
  | "white"
  | "other"
  | "bald";

export type HairLength = "bald" | "buzz" | "short" | "medium" | "long";

export type HairStyle = "straight" | "wavy" | "curly" | "locs";

export type Ethnicity =
  | "white"
  | "black"
  | "east_asian"
  | "hispanic"
  | "middle_eastern"
  | "multiracial"
  | "pacific_islander"
  | "southeast_asian"
  | "south_asian"
  | "other";

export type BodyType =
  | "slim"
  | "regular"
  | "athletic"
  | "medium_large"
  | "large"
  | "plus_size";

export type Attire = "business_formal" | "business_casual" | "smart_casual";

export type Background = "city" | "nature" | "office" | "studio";

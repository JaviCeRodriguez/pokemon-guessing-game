export const POKEMON_HANGMAN_STATUS = {
  IN_PROGRESS: "in_progress",
  WON: "won",
  LOST: "lost",
} as const;

export type PokemonHangmanStatus =
  (typeof POKEMON_HANGMAN_STATUS)[keyof typeof POKEMON_HANGMAN_STATUS];

export interface PokemonHangmanRevealDTO {
  name: string;
  imageUrl: string;
}

export interface PokemonHangmanGameDTO {
  gameToken: string;
  status: PokemonHangmanStatus;
  maxAttempts: number;
  remainingAttempts: number;
  nameLength: number;
  maskedWord: string;
  correctLetters: string[];
  wrongLetters: string[];
  types: string[];
   /**
   * URL del sprite que se usa como silueta/pista visual.
   * Puede estar vacío si PokeAPI no lo provee.
   */
  spriteUrl: string;
  /**
   * URL del cry del Pokémon. Se usa para reproducir audio.
   * Puede estar vacío si PokeAPI no lo provee.
   */
  cryUrl: string;
  reveal?: PokemonHangmanRevealDTO;
}

export interface PokemonHangmanGeneration {
  label: string;
  min: number;
  max: number;
}

export const POKEMON_HANGMAN_GENERATIONS: PokemonHangmanGeneration[] = [
  { label: "Todas las generaciones", min: 1, max: 1025 },
  { label: "Generación 1 (Kanto)", min: 1, max: 151 },
  { label: "Generación 2 (Johto)", min: 152, max: 251 },
  { label: "Generación 3 (Hoenn)", min: 252, max: 386 },
  { label: "Generación 4 (Sinnoh)", min: 387, max: 493 },
  { label: "Generación 5 (Unova)", min: 494, max: 649 },
  { label: "Generación 6 (Kalos)", min: 650, max: 721 },
  { label: "Generación 7 (Alola)", min: 722, max: 809 },
  { label: "Generación 8 (Galar)", min: 810, max: 905 },
  { label: "Generación 9 (Paldea)", min: 906, max: 1025 },
];


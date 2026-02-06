"use server";

import { randomInt } from "node:crypto";

import {
  POKEMON_HANGMAN_GENERATIONS,
  POKEMON_HANGMAN_STATUS,
  type PokemonHangmanGameDTO,
  type PokemonHangmanStatus,
} from "@/components/pokemon-hangman-types";
import { fetchPokemonById } from "@/lib/pokemon-dal";

import { decryptGameToken, encryptGameToken } from "./pokemon-hangman-crypto";

const MAX_ATTEMPTS = 6;

interface PokemonHangmanInternalPokemon {
  id: number;
  name: string; // real pokemon name (server-only, encrypted in token)
  types: string[];
  imageUrl: string;
  cryUrl: string;
  spriteUrl: string;
}

interface PokemonHangmanGameStateV1 {
  v: 1;
  pokemon: PokemonHangmanInternalPokemon;
  maxAttempts: number;
  wrongGuesses: number;
  guessedLetters: string[];
  createdAt: number;
}

function normalizeLetter(input: string): string | null {
  const letter = input.trim().toLowerCase();
  if (!/^[a-z]$/.test(letter)) return null;
  return letter;
}

function getNameLetters(name: string): Set<string> {
  return new Set(name.toLowerCase().match(/[a-z]/g) ?? []);
}

function computeStatus(state: PokemonHangmanGameStateV1): PokemonHangmanStatus {
  if (state.wrongGuesses >= state.maxAttempts) return POKEMON_HANGMAN_STATUS.LOST;

  const nameLetters = getNameLetters(state.pokemon.name);
  const guessed = new Set(state.guessedLetters);
  const allGuessed = Array.from(nameLetters).every((l) => guessed.has(l));
  return allGuessed ? POKEMON_HANGMAN_STATUS.WON : POKEMON_HANGMAN_STATUS.IN_PROGRESS;
}

function buildMaskedWord(name: string, guessedLetters: Set<string>, revealAll: boolean): string {
  return name
    .split("")
    .map((char) => {
      if (char === "-" || char === " ") return char;
      const lower = char.toLowerCase();
      if (revealAll) return char;
      return guessedLetters.has(lower) ? char : "_";
    })
    .join("");
}

function toDto(state: PokemonHangmanGameStateV1): PokemonHangmanGameDTO {
  const status = computeStatus(state);
  const revealAll = status !== POKEMON_HANGMAN_STATUS.IN_PROGRESS;

  const guessed = new Set(state.guessedLetters);
  const nameLower = state.pokemon.name.toLowerCase();

  const correctLetters = Array.from(guessed)
    .filter((l) => nameLower.includes(l))
    .sort((a, b) => a.localeCompare(b));
  const wrongLetters = Array.from(guessed)
    .filter((l) => !nameLower.includes(l))
    .sort((a, b) => a.localeCompare(b));

  const dto: PokemonHangmanGameDTO = {
    gameToken: encryptGameToken(state),
    status,
    maxAttempts: state.maxAttempts,
    remainingAttempts: Math.max(0, state.maxAttempts - state.wrongGuesses),
    nameLength: state.pokemon.name.length,
    maskedWord: buildMaskedWord(state.pokemon.name, guessed, revealAll),
    correctLetters,
    wrongLetters,
    types: state.pokemon.types,
    spriteUrl: state.pokemon.spriteUrl,
    cryUrl: state.pokemon.cryUrl,
    reveal: revealAll
      ? {
          name: state.pokemon.name,
          imageUrl: state.pokemon.imageUrl,
        }
      : undefined,
  };

  return dto;
}

export async function startPokemonHangmanGame(input: { generationIndex: number }): Promise<PokemonHangmanGameDTO> {
  const generationIndex = Number.isFinite(input.generationIndex)
    ? Math.trunc(input.generationIndex)
    : 0;

  const generation = POKEMON_HANGMAN_GENERATIONS[generationIndex] ?? POKEMON_HANGMAN_GENERATIONS[0];
  const randomId = randomInt(generation.min, generation.max + 1);

  const pokemon = await fetchPokemonById(randomId);

  const state: PokemonHangmanGameStateV1 = {
    v: 1,
    pokemon: {
      id: pokemon.id,
      name: pokemon.name,
      types: pokemon.types,
      imageUrl: pokemon.imageUrl,
      cryUrl: pokemon.cryUrl,
      spriteUrl: pokemon.spriteUrl,
    },
    maxAttempts: MAX_ATTEMPTS,
    wrongGuesses: 0,
    guessedLetters: [],
    createdAt: Date.now(),
  };

  return toDto(state);
}

export async function guessPokemonHangmanLetter(input: {
  gameToken: string;
  letter: string;
}): Promise<PokemonHangmanGameDTO> {
  const letter = normalizeLetter(input.letter);
  if (!letter) {
    // No-op, but keep token rotation minimal on invalid input.
    return guessPokemonHangmanNoop(input.gameToken);
  }

  const state = decryptGameToken<PokemonHangmanGameStateV1>(input.gameToken);
  if (state.v !== 1) {
    throw new Error("Unsupported game token version");
  }

  const status = computeStatus(state);
  if (status !== POKEMON_HANGMAN_STATUS.IN_PROGRESS) {
    // Game already ended.
    return toDto(state);
  }

  const guessed = new Set(state.guessedLetters);
  if (guessed.has(letter)) {
    return toDto(state);
  }

  guessed.add(letter);

  const nameLower = state.pokemon.name.toLowerCase();
  const isCorrect = nameLower.includes(letter);

  const nextState: PokemonHangmanGameStateV1 = {
    ...state,
    guessedLetters: Array.from(guessed),
    wrongGuesses: isCorrect ? state.wrongGuesses : state.wrongGuesses + 1,
  };

  return toDto(nextState);
}

async function guessPokemonHangmanNoop(gameToken: string): Promise<PokemonHangmanGameDTO> {
  const state = decryptGameToken<PokemonHangmanGameStateV1>(gameToken);
  if (state.v !== 1) {
    throw new Error("Unsupported game token version");
  }
  return toDto(state);
}


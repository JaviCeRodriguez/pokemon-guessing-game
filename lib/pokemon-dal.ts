import "server-only";
import sharp from "sharp";

interface PokeApiPokemonTypeEntry {
  type: {
    name: string;
  };
}

interface PokeApiPokemonSpritesOtherOfficialArtwork {
  front_default: string | null;
}

interface PokeApiPokemonSpritesOther {
  "official-artwork"?: PokeApiPokemonSpritesOtherOfficialArtwork;
}

interface PokeApiPokemonSprites {
  front_default: string | null;
  other?: PokeApiPokemonSpritesOther;
}

interface PokeApiPokemonCries {
  latest?: string | null;
  legacy?: string | null;
}

interface PokeApiPokemonResponse {
  id: number;
  name: string;
  types: PokeApiPokemonTypeEntry[];
  cries?: PokeApiPokemonCries;
  sprites: PokeApiPokemonSprites;
}

export interface InternalPokemon {
  id: number;
  name: string;
  types: string[];
  cryUrl: string;
  imageUrl: string;
  spriteUrl: string;
}

export async function fetchPokemonById(id: number): Promise<InternalPokemon> {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch pokemon id=${id} status=${response.status}`);
  }

  const data = (await response.json()) as PokeApiPokemonResponse;

  const baseSpriteUrl = data.sprites.front_default || "";

  let darkSpriteDataUrl = "";
  if (baseSpriteUrl) {
    try {
      const spriteRes = await fetch(baseSpriteUrl);
      if (spriteRes.ok) {
        const arrayBuffer = await spriteRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const darkSprite = await sharp(buffer)
          .ensureAlpha()
          .composite([
            {
              input: Buffer.from([0, 0, 0, 255]),
              raw: { width: 1, height: 1, channels: 4 },
              tile: true,
              blend: "in",
            },
          ])
          .png()
          .toBuffer();

        darkSpriteDataUrl = `data:image/png;base64,${darkSprite.toString("base64")}`;
      }
    } catch {
      // Si falla la generación, simplemente no usamos silueta oscura.
      darkSpriteDataUrl = "";
    }
  }

  const pokemon: InternalPokemon = {
    id: data.id,
    name: data.name,
    types: data.types.map((t) => t.type.name),
    cryUrl: data.cries?.latest || data.cries?.legacy || "",
    imageUrl:
      data.sprites.other?.["official-artwork"]?.front_default ||
      data.sprites.front_default ||
      "",
    spriteUrl: darkSpriteDataUrl || baseSpriteUrl || "",
  };

  return pokemon;
}


import { RadioTower } from "lucide-react";

import { PokemonHangman } from "@/components/pokemon-hangman";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-[90rem] flex-col gap-6 px-[clamp(1rem,5vw,4rem)] py-6 sm:py-10">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex max-w-4xl flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline">
              <RadioTower aria-hidden="true" />
              Terminal de campo 001
            </Badge>
            <span className="field-label">Señal en línea</span>
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-4xl leading-[1.05] tracking-tight text-balance sm:text-6xl lg:text-7xl">
            ¿Quién es ese <span className="text-primary">Pokémon?</span>
          </h1>
        </div>
        <p className="max-w-md text-base font-medium leading-relaxed text-muted-foreground sm:text-lg">
          Escuchá su grito, estudiá las pistas y completá el registro antes de agotar los intentos.
        </p>
      </header>

      <PokemonHangman />
    </main>
  );
}

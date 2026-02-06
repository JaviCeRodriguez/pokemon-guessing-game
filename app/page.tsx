import { PokemonHangman } from '@/components/pokemon-hangman'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background p-4 sm:p-8 flex items-center justify-center">
      <div className="w-full max-w-5xl">
        <div className="text-center mb-8 space-y-2">
          <h1 className="text-5xl sm:text-6xl font-black text-primary text-balance">
            {'¿Quién es ese Pokémon?'}
          </h1>
          <p className="text-lg text-muted-foreground">
            {'Pon a prueba tu conocimiento pokémon'}
          </p>
        </div>
        <PokemonHangman />
      </div>
    </main>
  )
}

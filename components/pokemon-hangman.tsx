'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Volume2, RefreshCw, CheckCircle2, XCircle } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { recordWin } from '@/app/actions/game'

interface PokemonData {
  name: string
  types: string[]
  cryUrl: string
  imageUrl: string
  spriteUrl: string
}

const GENERATIONS = [
  { label: 'Todas las generaciones', min: 1, max: 1025 },
  { label: 'Generación 1 (Kanto)', min: 1, max: 151 },
  { label: 'Generación 2 (Johto)', min: 152, max: 251 },
  { label: 'Generación 3 (Hoenn)', min: 252, max: 386 },
  { label: 'Generación 4 (Sinnoh)', min: 387, max: 493 },
  { label: 'Generación 5 (Unova)', min: 494, max: 649 },
  { label: 'Generación 6 (Kalos)', min: 650, max: 721 },
  { label: 'Generación 7 (Alola)', min: 722, max: 809 },
  { label: 'Generación 8 (Galar)', min: 810, max: 905 },
  { label: 'Generación 9 (Paldea)', min: 906, max: 1025 },
]

const TYPE_COLORS: Record<string, string> = {
  normal: 'bg-gray-400',
  fire: 'bg-orange-500',
  water: 'bg-blue-500',
  electric: 'bg-yellow-400',
  grass: 'bg-green-500',
  ice: 'bg-cyan-300',
  fighting: 'bg-red-700',
  poison: 'bg-purple-500',
  ground: 'bg-yellow-700',
  flying: 'bg-indigo-400',
  psychic: 'bg-pink-500',
  bug: 'bg-lime-500',
  rock: 'bg-yellow-800',
  ghost: 'bg-purple-700',
  dragon: 'bg-indigo-700',
  dark: 'bg-gray-800',
  steel: 'bg-gray-500',
  fairy: 'bg-pink-300',
}

const MAX_ATTEMPTS = 6

export function PokemonHangman() {
  const [pokemon, setPokemon] = useState<PokemonData | null>(null)
  const [loading, setLoading] = useState(true)
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set())
  const [wrongGuesses, setWrongGuesses] = useState(0)
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing')
  const [audioPlayed, setAudioPlayed] = useState(false)
  const [selectedGeneration, setSelectedGeneration] = useState(0)
  const [currentStreak, setCurrentStreak] = useState(0)
  const winRecordedRef = useRef(false)

  const fetchRandomPokemon = async () => {
    setLoading(true)
    setGuessedLetters(new Set())
    setWrongGuesses(0)
    setGameStatus('playing')
    setAudioPlayed(false)
    winRecordedRef.current = false

    try {
      const generation = GENERATIONS[selectedGeneration]
      const randomId = Math.floor(Math.random() * (generation.max - generation.min + 1)) + generation.min
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`)
      const data = await response.json()

      const pokemonData: PokemonData = {
        name: data.name,
        types: data.types.map((t: any) => t.type.name),
        cryUrl: data.cries?.latest || data.cries?.legacy || '',
        imageUrl: data.sprites.other['official-artwork'].front_default || data.sprites.front_default,
        spriteUrl: data.sprites.front_default,
      }

      setPokemon(pokemonData)
    } catch (error) {
      console.error('[v0] Error fetching Pokemon:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRandomPokemon()
  }, [])

  useEffect(() => {
    if (!pokemon || gameStatus !== 'playing') return

    const nameLetters = new Set(pokemon.name.replaceAll(/[^a-z]/g, '').split(''))
    const allLettersGuessed = Array.from(nameLetters).every(letter => guessedLetters.has(letter))

    if (allLettersGuessed) {
      setGameStatus('won')
    } else if (wrongGuesses >= MAX_ATTEMPTS) {
      setGameStatus('lost')
    }
  }, [guessedLetters, wrongGuesses, pokemon, gameStatus])

  useEffect(() => {
    if (gameStatus === 'lost') {
      setCurrentStreak(0)
      return
    }

    if (gameStatus !== 'won') return
    if (winRecordedRef.current) return
    winRecordedRef.current = true

    const nextStreak = currentStreak + 1
    setCurrentStreak(nextStreak)

    // Fire-and-forget: if not authenticated, action returns not_authenticated.
    void recordWin({ streak: nextStreak })
  }, [gameStatus, currentStreak])

  const playCry = () => {
    if (pokemon?.cryUrl) {
      const audio = new Audio(pokemon.cryUrl)
      audio.play()
      setAudioPlayed(true)
    }
  }

  const handleLetterClick = (letter: string) => {
    if (gameStatus !== 'playing' || guessedLetters.has(letter)) return

    const newGuessedLetters = new Set(guessedLetters)
    newGuessedLetters.add(letter)
    setGuessedLetters(newGuessedLetters)

    if (!pokemon?.name.includes(letter)) {
      setWrongGuesses(prev => prev + 1)
    }
  }

  const renderWord = () => {
    if (!pokemon) return null

    return pokemon.name.split('').map((char, index) => {
      if (char === '-' || char === ' ') {
        return (
          <span key={`${char}-${index}`} className="inline-block w-4 text-center">
            {char}
          </span>
        )
      }

      const isGuessed = guessedLetters.has(char) || gameStatus !== 'playing'
      return (
        <span
          key={`${char}-${index}`}
          className="inline-block w-10 h-12 mx-1 border-b-4 border-primary text-center text-2xl font-bold uppercase leading-[3rem]"
        >
          {isGuessed ? char : ''}
        </span>
      )
    })
  }

  const renderHangman = () => {
    const parts = [
      // Cabeza
      <circle key="head" cx="60" cy="25" r="10" className="stroke-foreground fill-none stroke-[3]" />,
      // Cuerpo
      <line key="body" x1="60" y1="35" x2="60" y2="60" className="stroke-foreground stroke-[3]" />,
      // Brazo izquierdo
      <line key="leftArm" x1="60" y1="45" x2="50" y2="50" className="stroke-foreground stroke-[3]" />,
      // Brazo derecho
      <line key="rightArm" x1="60" y1="45" x2="70" y2="50" className="stroke-foreground stroke-[3]" />,
      // Pierna izquierda
      <line key="leftLeg" x1="60" y1="60" x2="50" y2="75" className="stroke-foreground stroke-[3]" />,
      // Pierna derecha
      <line key="rightLeg" x1="60" y1="60" x2="70" y2="75" className="stroke-foreground stroke-[3]" />,
    ]

    return (
      <svg className="w-full max-w-[200px] mx-auto" viewBox="0 0 120 100">
        {/* Base */}
        <line x1="10" y1="90" x2="50" y2="90" className="stroke-muted-foreground stroke-[3]" />
        {/* Poste vertical */}
        <line x1="30" y1="90" x2="30" y2="10" className="stroke-muted-foreground stroke-[3]" />
        {/* Viga horizontal */}
        <line x1="30" y1="10" x2="60" y2="10" className="stroke-muted-foreground stroke-[3]" />
        {/* Cuerda */}
        <line x1="60" y1="10" x2="60" y2="15" className="stroke-muted-foreground stroke-[3]" />
        {/* Partes del cuerpo según errores */}
        {parts.slice(0, wrongGuesses)}
      </svg>
    )
  }

  const keyboard = 'abcdefghijklmnopqrstuvwxyz'.split('')

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-xl">
      <CardContent className="space-y-8">
        {/* Selector de generación */}
        <div className="flex justify-center pt-8">
          <div className="w-full max-w-xs">
            <Select
              value={selectedGeneration.toString()}
              onValueChange={(value) => setSelectedGeneration(Number(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona una generación" />
              </SelectTrigger>
              <SelectContent>
                {GENERATIONS.map((gen, index) => (
                  <SelectItem key={gen.label} value={index.toString()}>
                    {gen.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Área de pistas */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 p-6 bg-muted/50 rounded-xl">
          <Button
            onClick={playCry}
            size="lg"
            className="gap-2 shadow-lg hover:scale-105 transition-transform"
            disabled={!pokemon?.cryUrl}
          >
            <Volume2 className="h-5 w-5" />
            {audioPlayed ? 'Reproducir de nuevo' : 'Escuchar grito'}
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">{'Tipos:'}</span>
            {pokemon?.types.map(type => (
              <Badge
                key={type}
                className={`${TYPE_COLORS[type]} text-white border-0 uppercase px-3 py-1 text-sm font-bold shadow-md`}
              >
                {type}
              </Badge>
            ))}
          </div>
        </div>

        {/* Palabra a adivinar */}
        <div className="flex justify-center items-center min-h-[4rem] flex-wrap">
          {renderWord()}
        </div>

        {/* Hangman y sprite */}
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="flex flex-col items-center space-y-4">
            {renderHangman()}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {'Intentos restantes:'}
                <span className={`ml-2 font-bold text-lg ${wrongGuesses >= MAX_ATTEMPTS - 2 ? 'text-destructive' : 'text-primary'}`}>
                  {MAX_ATTEMPTS - wrongGuesses}
                </span>
              </p>
            </div>
          </div>

          {/* Silueta o imagen del Pokémon */}
          <div className="flex justify-center">
            {pokemon && (
              <div className="text-center space-y-4">
                {gameStatus === 'playing' ? (
                  <div className="relative w-48 h-48 flex items-center justify-center">
                    {MAX_ATTEMPTS - wrongGuesses <= 3 ? (
                      <div className="space-y-2 animate-in fade-in-50 zoom-in-50 duration-500 select-none">
                        <img
                          src={pokemon.spriteUrl || "/placeholder.svg"}
                          alt="Silueta misteriosa"
                          className="w-full h-full object-contain brightness-0 pointer-events-none"
                          style={{ filter: 'brightness(0)' }}
                          draggable="false"
                        />
                        <p className="text-xs text-muted-foreground font-medium">
                          {'Pista visual desbloqueada'}
                        </p>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                        <div className="text-center">
                          <p className="text-6xl">{'?'}</p>
                          <p className="text-xs mt-2">
                            {'Pista visual en 3 intentos'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2 animate-in fade-in-50 zoom-in-50 duration-500">
                    <img
                      src={pokemon.imageUrl || "/placeholder.svg"}
                      alt={pokemon.name}
                      className="w-48 h-48 object-contain mx-auto"
                    />
                    <p className="text-2xl font-bold uppercase">{pokemon.name}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mensajes de estado */}
        {gameStatus === 'won' && (
          <div className="flex items-center justify-center gap-2 p-4 bg-green-100 dark:bg-green-950 border-2 border-green-500 rounded-lg animate-in fade-in-50 slide-in-from-bottom-5 duration-300">
            <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            <p className="text-lg font-bold text-green-700 dark:text-green-300">
              {'¡Felicitaciones! ¡Lo atrapaste!'}
            </p>
          </div>
        )}

        {gameStatus === 'lost' && (
          <div className="flex items-center justify-center gap-2 p-4 bg-red-100 dark:bg-red-950 border-2 border-red-500 rounded-lg animate-in fade-in-50 slide-in-from-bottom-5 duration-300">
            <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            <p className="text-lg font-bold text-red-700 dark:text-red-300">
              {`¡Oh no! Era ${pokemon?.name.toUpperCase()}`}
            </p>
          </div>
        )}

        {/* Teclado */}
        <div className="space-y-4">
          <div className="flex flex-wrap justify-center gap-2">
            {keyboard.map(letter => {
              const isGuessed = guessedLetters.has(letter)
              const isCorrect = isGuessed && pokemon?.name.includes(letter)
              const isWrong = isGuessed && !pokemon?.name.includes(letter)
              let variant: 'default' | 'destructive' | 'outline' = 'outline'
              if (isCorrect) variant = 'default'
              else if (isWrong) variant = 'destructive'
              const base = 'w-10 h-10 text-lg font-bold uppercase'
              const correct = isCorrect ? 'bg-primary hover:bg-primary' : ''
              const wrong = isWrong ? 'bg-destructive hover:bg-destructive opacity-50' : ''
              const composed = `${base} ${correct} ${wrong}`.trim()

              return (
                <Button
                  key={letter}
                  onClick={() => handleLetterClick(letter)}
                  disabled={isGuessed || gameStatus !== 'playing'}
                  variant={variant}
                  className={composed}
                >
                  {letter}
                </Button>
              )
            })}
          </div>

          <div className="flex justify-center">
            <Button
              onClick={fetchRandomPokemon}
              size="lg"
              variant="secondary"
              className="gap-2 shadow-lg"
            >
              <RefreshCw className="h-5 w-5" />
              {gameStatus === 'playing' ? 'Nuevo Pokémon' : 'Jugar de nuevo'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

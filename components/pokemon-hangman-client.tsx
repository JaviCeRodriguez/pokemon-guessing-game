"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Check,
  CheckCircle2,
  CircleUserRound,
  Crosshair,
  Headphones,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Volume2,
  X,
  XCircle,
} from "lucide-react";

import { recordWin } from "@/app/actions/game";
import {
  guessPokemonHangmanLetter,
  startPokemonHangmanGame,
} from "@/app/actions/pokemon-hangman";
import {
  POKEMON_HANGMAN_GENERATIONS,
  POKEMON_HANGMAN_STATUS,
  type PokemonHangmanGameDTO,
} from "@/components/pokemon-hangman-types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { createClient as createSupabaseClient } from "@/utils/supabase/client";

const KEYBOARD = "abcdefghijklmnopqrstuvwxyz".split("");

interface MaskedWordProps {
  maskedWord: string;
}

function MaskedWord({ maskedWord }: MaskedWordProps) {
  return (
    <div
      className="flex min-h-16 flex-wrap items-end justify-center gap-x-1 gap-y-3 sm:gap-x-2"
      aria-label={`Palabra: ${maskedWord.replaceAll("_", "letra oculta")}`}
    >
      {maskedWord.split("").map((character, index) => {
        if (character === "-" || character === " ") {
          return (
            <span key={`${character}-${index}`} className="inline-flex size-8 items-center justify-center text-xl font-black">
              {character}
            </span>
          );
        }

        const visible = character !== "_";
        return (
          <span
            key={`${character}-${index}`}
            className={cn(
              "inline-flex h-12 w-9 items-center justify-center border-b-4 font-mono text-2xl font-black uppercase sm:w-11 sm:text-3xl",
              visible ? "border-primary text-foreground" : "border-foreground/30 text-transparent",
            )}
            aria-hidden="true"
          >
            {visible ? character : "•"}
          </span>
        );
      })}
    </div>
  );
}

interface AttemptDisplayProps {
  maxAttempts: number;
  remainingAttempts: number;
}

function AttemptDisplay({ maxAttempts, remainingAttempts }: AttemptDisplayProps) {
  const wrongGuesses = maxAttempts - remainingAttempts;
  const remainingPercentage = (remainingAttempts / maxAttempts) * 100;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="field-label">Integridad de señal</p>
          <p className="mt-1 text-base font-bold text-muted-foreground">
            Intentos restantes: <span className="hud-text text-2xl text-foreground">{remainingAttempts}</span>
          </p>
        </div>
        <div className="flex gap-1.5" aria-label={`${wrongGuesses} errores de ${maxAttempts}`}>
          {Array.from({ length: maxAttempts }, (_, index) => {
            const failed = index < wrongGuesses;
            return (
              <span
                key={index}
                className={cn(
                  "flex size-7 items-center justify-center rounded-full border-2",
                  failed
                    ? "border-destructive bg-destructive text-destructive-foreground"
                    : "border-foreground/20 bg-background text-muted-foreground",
                )}
                aria-hidden="true"
              >
                {failed ? <X /> : <Check />}
              </span>
            );
          })}
        </div>
      </div>
      <Progress value={remainingPercentage} aria-label={`${remainingPercentage}% de intentos disponibles`} />
    </div>
  );
}

interface PokemonScannerProps {
  game: PokemonHangmanGameDTO;
}

function PokemonScanner({ game }: PokemonScannerProps) {
  const gameEnded = game.status !== POKEMON_HANGMAN_STATUS.IN_PROGRESS;
  const visualHintUnlocked = !gameEnded && Boolean(game.spriteUrl) && game.remainingAttempts <= 3;

  return (
    <div className="flex flex-col gap-4">
      <div className="scanner-grid scanner-sweep relative aspect-square min-h-64 overflow-hidden rounded-2xl border-2 border-accent/30 bg-muted/40">
        <div className="absolute inset-4 rounded-full border border-dashed border-accent/50" aria-hidden="true" />
        <div className="absolute inset-10 rounded-full border border-accent/30" aria-hidden="true" />
        <div className="relative flex size-full items-center justify-center p-8">
          {gameEnded ? (
            <Image
              src={game.reveal?.imageUrl || "/placeholder.svg"}
              alt={game.reveal?.name ?? "Pokémon revelado"}
              width={320}
              height={320}
              className="size-full object-contain drop-shadow-[0_16px_20px_hsl(var(--foreground)/0.22)]"
              draggable={false}
            />
          ) : visualHintUnlocked ? (
            <Image
              src={game.spriteUrl}
              alt="Silueta misteriosa del Pokémon"
              width={320}
              height={320}
              className="size-full object-contain brightness-0 drop-shadow-[0_0_14px_hsl(var(--accent)/0.35)] dark:invert"
              draggable={false}
            />
          ) : (
            <Crosshair className="size-24 text-accent/60" strokeWidth={1.25} aria-hidden="true" />
          )}
        </div>
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3 rounded-xl border bg-background/90 px-3 py-2 backdrop-blur">
          <span className="font-mono text-sm font-bold uppercase tracking-wider">
            {gameEnded ? `Registro: ${game.reveal?.name ?? "completo"}` : visualHintUnlocked ? "Pista visual activa" : "Silueta bloqueada"}
          </span>
          {visualHintUnlocked || gameEnded ? (
            <Sparkles className="text-secondary-foreground" aria-hidden="true" />
          ) : (
            <ShieldAlert className="text-muted-foreground" aria-hidden="true" />
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="field-label mr-1">Tipo detectado</span>
        {game.types.map((type) => (
          <Badge key={type} variant="outline" className={cn("pokemon-type uppercase", `pokemon-type-${type}`)}>
            {type}
          </Badge>
        ))}
      </div>
    </div>
  );
}

export function PokemonHangmanClient() {
  const [game, setGame] = useState<PokemonHangmanGameDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuessing, setIsGuessing] = useState(false);
  const [selectedGeneration, setSelectedGeneration] = useState(0);
  const [audioPlayed, setAudioPlayed] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const winRecordedRef = useRef(false);
  const pendingGuessRef = useRef(false);

  const startGame = useCallback(async (generationIndex: number) => {
    setLoading(true);
    setAudioPlayed(false);
    setErrorMessage(null);
    winRecordedRef.current = false;
    pendingGuessRef.current = false;

    try {
      const dto = await startPokemonHangmanGame({ generationIndex });
      setGame(dto);
    } catch {
      setErrorMessage("No pudimos conectar con la base Pokémon. Intentá iniciar una nueva búsqueda.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void startGame(selectedGeneration);
  }, [selectedGeneration, startGame]);

  useEffect(() => {
    if (!game) return;

    if (game.status === POKEMON_HANGMAN_STATUS.LOST) {
      setCurrentStreak(0);
      return;
    }

    if (game.status !== POKEMON_HANGMAN_STATUS.WON || winRecordedRef.current) return;
    winRecordedRef.current = true;

    const nextStreak = currentStreak + 1;
    setCurrentStreak(nextStreak);
    void recordWin({ streak: nextStreak });
  }, [game, currentStreak]);

  useEffect(() => {
    const supabase = createSupabaseClient();
    void supabase.auth
      .getUser()
      .then(({ data }) => setIsAuthenticated(Boolean(data.user)))
      .catch(() => setIsAuthenticated(false));
  }, []);

  const playCry = async () => {
    const cryUrl = game?.cryUrl;
    if (!cryUrl) return;

    try {
      await new Audio(cryUrl).play();
      setAudioPlayed(true);
    } catch {
      setErrorMessage("El audio no pudo reproducirse. Revisá el volumen o los permisos del navegador.");
    }
  };

  const handleLetterClick = useCallback(
    async (letter: string) => {
      if (!game || game.status !== POKEMON_HANGMAN_STATUS.IN_PROGRESS) return;
      if (pendingGuessRef.current) return;
      if (game.correctLetters.includes(letter) || game.wrongLetters.includes(letter)) return;

      pendingGuessRef.current = true;
      setIsGuessing(true);
      setErrorMessage(null);
      try {
        const nextGame = await guessPokemonHangmanLetter({ gameToken: game.gameToken, letter });
        setGame(nextGame);
      } catch {
        setErrorMessage("No pudimos registrar esa letra. Probá nuevamente.");
      } finally {
        pendingGuessRef.current = false;
        setIsGuessing(false);
      }
    },
    [game],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const letter = event.key.toLowerCase();
      if (!/^[a-z]$/.test(letter)) return;
      void handleLetterClick(letter);
    };

    globalThis.addEventListener("keydown", handleKeyDown);
    return () => globalThis.removeEventListener("keydown", handleKeyDown);
  }, [handleLetterClick]);

  if (loading) {
    return (
      <Card aria-busy="true">
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-10 w-full max-w-lg" />
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-[minmax(18rem,0.8fr)_1.2fr]">
          <Skeleton className="aspect-square min-h-64 w-full rounded-2xl" />
          <div className="flex flex-col gap-5">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-56 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!game) {
    return (
      <Alert variant="destructive">
        <XCircle aria-hidden="true" />
        <AlertTitle>Búsqueda interrumpida</AlertTitle>
        <AlertDescription className="flex flex-col items-start gap-4">
          <p>{errorMessage ?? "No pudimos iniciar la partida."}</p>
          <Button variant="outline" onClick={() => void startGame(selectedGeneration)}>
            <RefreshCw data-icon="inline-start" aria-hidden="true" />
            Reintentar
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  const gameEnded = game.status !== POKEMON_HANGMAN_STATUS.IN_PROGRESS;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="gap-5 border-b bg-card/80 p-5 sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={gameEnded ? "secondary" : "default"}>
                {gameEnded ? <ShieldCheck aria-hidden="true" /> : <Crosshair aria-hidden="true" />}
                {gameEnded ? "Registro cerrado" : "Partida activa"}
              </Badge>
              {currentStreak > 0 ? <Badge variant="outline">Racha × {currentStreak}</Badge> : null}
            </div>
            <CardTitle className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl">
              Expediente de identificación
            </CardTitle>
            <CardDescription>Combiná pistas de audio, tipo y silueta para completar el nombre.</CardDescription>
          </div>

          <label className="flex w-full max-w-sm flex-col gap-2">
            <span className="field-label">Región de búsqueda</span>
            <Select value={selectedGeneration.toString()} onValueChange={(value) => setSelectedGeneration(Number(value))}>
              <SelectTrigger aria-label="Seleccionar generación">
                <SelectValue placeholder="Seleccioná una generación" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {POKEMON_HANGMAN_GENERATIONS.map((generation, index) => (
                    <SelectItem key={generation.label} value={index.toString()}>
                      {generation.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </label>
        </div>
      </CardHeader>

      <CardContent className="grid gap-8 p-5 sm:p-7 lg:grid-cols-[minmax(18rem,0.82fr)_minmax(0,1.18fr)] lg:p-8">
        <section className="flex flex-col gap-5" aria-labelledby="scanner-title">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="field-label">Módulo A</p>
              <h2 id="scanner-title" className="mt-1 text-xl font-black">Escáner de campo</h2>
            </div>
            <Badge variant="outline">{game.nameLength} letras</Badge>
          </div>
          <PokemonScanner game={game} />
          <Button onClick={() => void playCry()} size="lg" variant="secondary" disabled={!game.cryUrl} className="w-full">
            {audioPlayed ? <Volume2 data-icon="inline-start" aria-hidden="true" /> : <Headphones data-icon="inline-start" aria-hidden="true" />}
            {audioPlayed ? "Reproducir de nuevo" : "Escuchar grito"}
          </Button>
        </section>

        <section className="flex min-w-0 flex-col gap-7" aria-labelledby="answer-title">
          <div className="flex flex-col gap-4 rounded-2xl border-2 bg-muted/35 p-4 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="field-label">Módulo B</p>
                <h2 id="answer-title" className="mt-1 text-xl font-black">Nombre encriptado</h2>
              </div>
              <span className="font-mono text-sm font-bold text-muted-foreground">A–Z</span>
            </div>
            <MaskedWord maskedWord={game.maskedWord} />
          </div>

          <AttemptDisplay maxAttempts={game.maxAttempts} remainingAttempts={game.remainingAttempts} />

          {game.status === POKEMON_HANGMAN_STATUS.WON ? (
            <Alert aria-live="polite">
              <CheckCircle2 aria-hidden="true" />
              <AlertTitle>¡Felicitaciones! ¡Lo atrapaste!</AlertTitle>
              <AlertDescription>
                Registro completado: {game.reveal?.name?.toUpperCase()} ya forma parte de tu expedición.
              </AlertDescription>
            </Alert>
          ) : null}

          {game.status === POKEMON_HANGMAN_STATUS.LOST ? (
            <Alert variant="destructive" aria-live="polite">
              <XCircle aria-hidden="true" />
              <AlertTitle>{`¡Oh no! Era ${game.reveal?.name?.toUpperCase() ?? ""}`}</AlertTitle>
              <AlertDescription>La señal se perdió, pero podés abrir un expediente nuevo.</AlertDescription>
            </Alert>
          ) : null}

          {errorMessage ? (
            <Alert variant="destructive" aria-live="polite">
              <ShieldAlert aria-hidden="true" />
              <AlertTitle>La señal tuvo una interferencia</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          ) : null}

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <p className="field-label">Teclado de captura</p>
              <span className="text-sm font-bold text-muted-foreground" aria-live="polite">
                {isGuessing ? "Analizando letra…" : "También podés usar tu teclado"}
              </span>
            </div>
            <div className="grid grid-cols-7 justify-items-center gap-2 sm:grid-cols-9" role="group" aria-label="Letras disponibles">
              {KEYBOARD.map((letter) => {
                const isCorrect = game.correctLetters.includes(letter);
                const isWrong = game.wrongLetters.includes(letter);
                const isGuessed = isCorrect || isWrong;
                const variant = isCorrect ? "default" : isWrong ? "destructive" : "outline";
                const stateLabel = isCorrect ? "correcta" : isWrong ? "incorrecta" : "disponible";

                return (
                  <Button
                    key={letter}
                    data-testid={`letter-button-${letter}`}
                    data-state={stateLabel}
                    onClick={() => void handleLetterClick(letter)}
                    disabled={isGuessed || gameEnded || isGuessing}
                    variant={variant}
                    className={cn("size-12 p-0 font-mono text-lg uppercase", isWrong && "line-through opacity-60")}
                    aria-label={`Letra ${letter}, ${stateLabel}`}
                  >
                    {letter}
                  </Button>
                );
              })}
            </div>
          </div>
        </section>
      </CardContent>

      <CardFooter className="flex-col justify-between gap-4 border-t bg-muted/25 p-5 sm:flex-row sm:p-7">
        {isAuthenticated === false ? (
          <div className="flex max-w-xl items-start gap-3 text-base text-muted-foreground">
            <CircleUserRound className="mt-0.5 shrink-0" aria-hidden="true" />
            <p>Iniciá sesión antes de jugar para guardar victorias y aparecer en el ranking.</p>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-base font-bold text-muted-foreground">
            <ShieldCheck aria-hidden="true" />
            <span>{isAuthenticated ? "Progreso conectado" : "Verificando progreso…"}</span>
          </div>
        )}
        <Button onClick={() => void startGame(selectedGeneration)} size="lg" variant={gameEnded ? "default" : "outline"} className="w-full sm:w-auto">
          <RefreshCw data-icon="inline-start" aria-hidden="true" />
          {gameEnded ? "Jugar de nuevo" : "Nuevo Pokémon"}
        </Button>
      </CardFooter>
    </Card>
  );
}

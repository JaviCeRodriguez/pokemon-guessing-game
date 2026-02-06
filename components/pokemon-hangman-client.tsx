"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RefreshCw, CheckCircle2, XCircle, Volume2 } from "lucide-react";

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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient as createSupabaseClient } from "@/utils/supabase/client";

const TYPE_COLORS: Record<string, string> = {
  normal: "bg-gray-400",
  fire: "bg-orange-500",
  water: "bg-blue-500",
  electric: "bg-yellow-400",
  grass: "bg-green-500",
  ice: "bg-cyan-300",
  fighting: "bg-red-700",
  poison: "bg-purple-500",
  ground: "bg-yellow-700",
  flying: "bg-indigo-400",
  psychic: "bg-pink-500",
  bug: "bg-lime-500",
  rock: "bg-yellow-800",
  ghost: "bg-purple-700",
  dragon: "bg-indigo-700",
  dark: "bg-gray-800",
  steel: "bg-gray-500",
  fairy: "bg-pink-300",
};

export function PokemonHangmanClient() {
  const [game, setGame] = useState<PokemonHangmanGameDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedGeneration, setSelectedGeneration] = useState(0);
  const [audioPlayed, setAudioPlayed] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const winRecordedRef = useRef(false);
  const pendingGuessRef = useRef(false);

  const startGame = async (generationIndex: number) => {
    setLoading(true);
    setAudioPlayed(false);
    winRecordedRef.current = false;
    pendingGuessRef.current = false;

    try {
      const dto = await startPokemonHangmanGame({ generationIndex });
      setGame(dto);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void startGame(selectedGeneration);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // When user changes generation, start a fresh game.
    void startGame(selectedGeneration);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGeneration]);

  useEffect(() => {
    if (!game) return;

    if (game.status === POKEMON_HANGMAN_STATUS.LOST) {
      setCurrentStreak(0);
      return;
    }

    if (game.status !== POKEMON_HANGMAN_STATUS.WON) return;
    if (winRecordedRef.current) return;
    winRecordedRef.current = true;

    const nextStreak = currentStreak + 1;
    setCurrentStreak(nextStreak);
    void recordWin({ streak: nextStreak });
  }, [game, currentStreak]);

  useEffect(() => {
    const supabase = createSupabaseClient();
    void supabase.auth
      .getUser()
      .then(({ data }) => {
        setIsAuthenticated(Boolean(data.user));
      })
      .catch(() => {
        setIsAuthenticated(false);
      });
  }, []);

  const playCry = () => {
    const cryUrl = game?.cryUrl;
    if (!cryUrl) return;
    const audio = new Audio(cryUrl);
    audio.play();
    setAudioPlayed(true);
  };

  const handleLetterClick = useCallback(
    async (letter: string) => {
      if (!game) return;
      if (game.status !== POKEMON_HANGMAN_STATUS.IN_PROGRESS) return;
      if (pendingGuessRef.current) return;
      if (game.correctLetters.includes(letter) || game.wrongLetters.includes(letter)) return;

      pendingGuessRef.current = true;
      try {
        const next = await guessPokemonHangmanLetter({ gameToken: game.gameToken, letter });
        setGame(next);
      } finally {
        pendingGuessRef.current = false;
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
    return () => {
      globalThis.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleLetterClick]);

  const renderWord = () => {
    if (!game) return null;

    return game.maskedWord.split("").map((char, index) => {
      if (char === "-" || char === " ") {
        return (
          <span key={`${char}-${index}`} className="inline-block w-4 text-center">
            {char}
          </span>
        );
      }

      const visible = char !== "_";
      return (
        <span
          key={`${char}-${index}`}
          className="inline-block w-10 h-12 mx-1 border-b-4 border-primary text-center text-2xl font-bold uppercase leading-[3rem]"
        >
          {visible ? char : ""}
        </span>
      );
    });
  };

  const renderHangman = () => {
    const wrongGuesses = game ? game.maxAttempts - game.remainingAttempts : 0;
    const parts = [
      <circle key="head" cx="60" cy="25" r="10" className="stroke-foreground fill-none stroke-[3]" />,
      <line key="body" x1="60" y1="35" x2="60" y2="60" className="stroke-foreground stroke-[3]" />,
      <line key="leftArm" x1="60" y1="45" x2="50" y2="50" className="stroke-foreground stroke-[3]" />,
      <line key="rightArm" x1="60" y1="45" x2="70" y2="50" className="stroke-foreground stroke-[3]" />,
      <line key="leftLeg" x1="60" y1="60" x2="50" y2="75" className="stroke-foreground stroke-[3]" />,
      <line key="rightLeg" x1="60" y1="60" x2="70" y2="75" className="stroke-foreground stroke-[3]" />,
    ];

    return (
      <svg className="w-full max-w-[200px] mx-auto" viewBox="0 0 120 100">
        <line x1="10" y1="90" x2="50" y2="90" className="stroke-muted-foreground stroke-[3]" />
        <line x1="30" y1="90" x2="30" y2="10" className="stroke-muted-foreground stroke-[3]" />
        <line x1="30" y1="10" x2="60" y2="10" className="stroke-muted-foreground stroke-[3]" />
        <line x1="60" y1="10" x2="60" y2="15" className="stroke-muted-foreground stroke-[3]" />
        {parts.slice(0, wrongGuesses)}
      </svg>
    );
  };

  const keyboard = "abcdefghijklmnopqrstuvwxyz".split("");

  if (loading || !game) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="space-y-6 p-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
          <div className="text-sm text-muted-foreground">
            <span>{"Intentos restantes:"}</span>{" "}
            <span className="inline-block align-middle">
              <Skeleton className="h-5 w-10" />
            </span>
          </div>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  const wrongGuesses = game.maxAttempts - game.remainingAttempts;
  const gameEnded = game.status !== POKEMON_HANGMAN_STATUS.IN_PROGRESS;

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-xl">
      <CardContent className="space-y-8">
        <div className="flex justify-center pt-8">
          <div className="w-full max-w-xs">
            <Select value={selectedGeneration.toString()} onValueChange={(v) => setSelectedGeneration(Number(v))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona una generación" />
              </SelectTrigger>
              <SelectContent>
                {POKEMON_HANGMAN_GENERATIONS.map((gen, index) => (
                  <SelectItem key={gen.label} value={index.toString()}>
                    {gen.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 p-6 bg-muted/50 rounded-xl">
          <Button
            onClick={playCry}
            size="lg"
            className="gap-2 shadow-lg hover:scale-105 transition-transform"
            disabled={!game.cryUrl}
          >
            <Volume2 className="h-5 w-5" />
            {audioPlayed ? "Reproducir de nuevo" : "Escuchar grito"}
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">{"Tipos:"}</span>
            {game.types.map((type) => (
              <Badge
                key={type}
                className={`${TYPE_COLORS[type] ?? "bg-gray-500"} text-white border-0 uppercase px-3 py-1 text-sm font-bold shadow-md`}
              >
                {type}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex justify-center items-center min-h-[4rem] flex-wrap">{renderWord()}</div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="flex flex-col items-center space-y-4">
            {renderHangman()}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {"Intentos restantes:"}
                <span
                  className={`ml-2 font-bold text-lg ${
                    wrongGuesses >= game.maxAttempts - 2 ? "text-destructive" : "text-primary"
                  }`}
                >
                  {game.remainingAttempts}
                </span>
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="text-center space-y-4">
              {gameEnded && (
                <div className="space-y-2 animate-in fade-in-50 zoom-in-50 duration-500">
                  <img
                    src={game.reveal?.imageUrl || "/placeholder.svg"}
                    alt={game.reveal?.name ?? "Pokemon"}
                    className="w-48 h-48 object-contain mx-auto"
                    draggable="false"
                  />
                  <p className="text-2xl font-bold uppercase">{game.reveal?.name}</p>
                </div>
              )}
              {!gameEnded && game.spriteUrl && game.remainingAttempts <= 3 && (
                <div className="relative w-48 h-48 flex flex-col items-center justify-center select-none">
                  <img
                    src={game.spriteUrl || "/placeholder.svg"}
                    alt="Silueta misteriosa"
                    className="w-full h-full object-contain brightness-0 pointer-events-none"
                    style={{ filter: "brightness(0)" }}
                    draggable="false"
                  />
                  <p className="text-xs text-muted-foreground font-medium mt-2">
                    {"Pista visual desbloqueada"}
                  </p>
                </div>
              )}
              {!gameEnded && (!game.spriteUrl || game.remainingAttempts > 3) && (
                <div className="w-48 h-48 flex items-center justify-center text-muted-foreground/30 select-none">
                  <div className="text-center">
                    <p className="text-6xl">{"?"}</p>
                    <p className="text-xs mt-2">{"Adivina para revelar"}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {game.status === POKEMON_HANGMAN_STATUS.WON && (
          <div className="flex items-center justify-center gap-2 p-4 bg-green-100 dark:bg-green-950 border-2 border-green-500 rounded-lg animate-in fade-in-50 slide-in-from-bottom-5 duration-300">
            <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            <p className="text-lg font-bold text-green-700 dark:text-green-300">
              {"¡Felicitaciones! ¡Lo atrapaste!"}
            </p>
          </div>
        )}

        {game.status === POKEMON_HANGMAN_STATUS.LOST && (
          <div className="flex items-center justify-center gap-2 p-4 bg-red-100 dark:bg-red-950 border-2 border-red-500 rounded-lg animate-in fade-in-50 slide-in-from-bottom-5 duration-300">
            <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            <p className="text-lg font-bold text-red-700 dark:text-red-300">
              {`¡Oh no! Era ${game.reveal?.name?.toUpperCase() ?? ""}`}
            </p>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex flex-wrap justify-center gap-2">
            {keyboard.map((letter) => {
              const isCorrect = game.correctLetters.includes(letter);
              const isWrong = game.wrongLetters.includes(letter);
              const isGuessed = isCorrect || isWrong;

              let variant: "default" | "destructive" | "outline" = "outline";
              if (isCorrect) variant = "default";
              else if (isWrong) variant = "destructive";

              const base = "w-10 h-10 text-lg font-bold uppercase";
              const correct = isCorrect ? "bg-primary hover:bg-primary" : "";
              const wrong = isWrong ? "bg-destructive hover:bg-destructive opacity-50" : "";
              const composed = `${base} ${correct} ${wrong}`.trim();

              return (
                <Button
                  key={letter}
                  data-testid={`letter-button-${letter}`}
                  onClick={() => void handleLetterClick(letter)}
                  disabled={isGuessed || game.status !== POKEMON_HANGMAN_STATUS.IN_PROGRESS || pendingGuessRef.current}
                  variant={variant}
                  className={composed}
                >
                  {letter}
                </Button>
              );
            })}
          </div>

          <div className="flex flex-col items-center gap-1">
            <Button
              onClick={() => void startGame(selectedGeneration)}
              size="lg"
              variant="secondary"
              className="gap-2 shadow-lg"
            >
              <RefreshCw className="h-5 w-5" />
              {game.status === POKEMON_HANGMAN_STATUS.IN_PROGRESS ? "Nuevo Pokémon" : "Jugar de nuevo"}
            </Button>
            {isAuthenticated === false && (
              <p className="text-center text-xs text-muted-foreground">
                {
                  "Para guardar tus resultados y aparecer en el ranking, necesitas registrarte e iniciar sesión antes de jugar."
                }
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


import { test, expect } from '@playwright/test'
import { PokemonHangmanPage } from './pokemon-hangman-page'

test.describe('Pokemon Hangman', () => {
  test(
    'carga el juego y muestra la UI básica',
    { tag: ['@e2e', '@pokemon-hangman', '@POKE-E2E-001'] },
    async ({ page }) => {
      const hangman = new PokemonHangmanPage(page)

      await hangman.goto()

      await expect(hangman.heading).toBeVisible()
      await expect(hangman.attemptsText).toBeVisible()
      // Verificamos que al menos una letra del teclado (por ejemplo, "a") está visible.
      await expect(hangman.getLetterButton('a')).toBeVisible()
    },
  )

  test(
    'marcar una letra como usada al jugar',
    { tag: ['@e2e', '@pokemon-hangman', '@POKE-E2E-002'] },
    async ({ page }) => {
      const hangman = new PokemonHangmanPage(page)

      await hangman.goto()

      // Hacemos un único intento: pulsar una letra.
      const letter = 'a'
      const letterButton = hangman.getLetterButton(letter)
      await expect(letterButton).toBeVisible()
      await letterButton.click()

      // Tras pulsarla, el botón debería quedar deshabilitado (ya usada).
      await expect(letterButton).toBeDisabled()

      // Y el juego debería seguir en progreso: no debería aparecer aún mensaje de win/lose
      const winVisible = await hangman.statusWin.isVisible().catch(() => false)
      const loseVisible = await hangman.statusLose.isVisible().catch(() => false)
      expect(winVisible || loseVisible).toBeFalsy()
    },
  )

  test(
    'reiniciar la partida con el botón de jugar de nuevo',
    { tag: ['@e2e', '@pokemon-hangman', '@POKE-E2E-003'] },
    async ({ page }) => {
      const hangman = new PokemonHangmanPage(page)

      await hangman.goto()

      // Hacemos un intento para marcar una letra como usada.
      const letter = 'b'
      const letterButton = hangman.getLetterButton(letter)
      await expect(letterButton).toBeVisible()
      await letterButton.click()
      await expect(letterButton).toBeDisabled()

      // Verificamos que el botón de "Jugar de nuevo" está visible (si el juego sigue en progreso se muestra como "Nuevo Pokémon").
      await expect(hangman.playAgainButton).toBeVisible()

      // Pulsar el botón de "Nuevo Pokémon / Jugar de nuevo".
      await hangman.playAgainButton.click()

      // Tras reiniciar, la misma letra debería volver a estar habilitada (nuevo juego, letras reseteadas).
      await expect(hangman.getLetterButton(letter)).toBeEnabled()
    },
  )

  test(
    'jugar hasta ganar o perder la partida',
    { tag: ['@e2e', '@pokemon-hangman', '@POKE-E2E-004'] },
    async ({ page }) => {
      const hangman = new PokemonHangmanPage(page)

      await hangman.goto()

      // Jugar hasta que el juego termine
      await hangman.playUntilGameOver()

      // Verificar que el juego terminó (debe aparecer mensaje de victoria o derrota)
      const winVisible = await hangman.statusWin.isVisible().catch(() => false)
      const loseVisible = await hangman.statusLose.isVisible().catch(() => false)

      expect(
        winVisible || loseVisible,
        'Se esperaba que el juego terminara en victoria o derrota después de jugar todas las letras posibles',
      ).toBeTruthy()

      // Verificar que el botón de "Jugar de nuevo" está visible
      await expect(hangman.playAgainButton).toBeVisible()
    },
  )
})


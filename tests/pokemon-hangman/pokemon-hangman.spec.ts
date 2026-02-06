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
      await expect(hangman.keyboardButtons.first()).toBeVisible()
    },
  )

  test(
    'jugar hasta ganar o perder la partida',
    { tag: ['@e2e', '@pokemon-hangman', '@POKE-E2E-002'] },
    async ({ page }) => {
      const hangman = new PokemonHangmanPage(page)

      await hangman.goto()

      await hangman.playUntilGameOver()

      const winVisible = await hangman.statusWin.isVisible().catch(() => false)
      const loseVisible = await hangman.statusLose.isVisible().catch(() => false)

      expect(
        winVisible || loseVisible,
        'Se esperaba terminar la partida en victoria o derrota',
      ).toBeTruthy()
    },
  )

  test(
    'reiniciar la partida con el botón de jugar de nuevo',
    { tag: ['@e2e', '@pokemon-hangman', '@POKE-E2E-003'] },
    async ({ page }) => {
      const hangman = new PokemonHangmanPage(page)

      await hangman.goto()

      // Primero, jugar hasta terminar la partida.
      await hangman.playUntilGameOver()

      // Verificamos que el juego está en estado terminado.
      await expect(hangman.playAgainButton).toBeVisible()
      const firstLetterBeforeReset = hangman.keyboardButtons.first()
      await expect(firstLetterBeforeReset).toBeDisabled()

      // Pulsar el botón de "Nuevo Pokémon / Jugar de nuevo".
      await hangman.playAgainButton.click()

      // Esperar a que desaparezcan los mensajes de estado y se habiliten de nuevo las letras.
      await expect(hangman.statusWin).toBeHidden({ timeout: 15000 })
      await expect(hangman.statusLose).toBeHidden({ timeout: 15000 })
      await expect(hangman.keyboardButtons.first()).toBeEnabled({ timeout: 15000 })
    },
  )
})


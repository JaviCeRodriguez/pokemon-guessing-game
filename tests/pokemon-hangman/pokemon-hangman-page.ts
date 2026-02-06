import type { Locator, Page } from '@playwright/test'
import { BasePage } from '../base-page'

export class PokemonHangmanPage extends BasePage {
  readonly heading: Locator
  readonly attemptsText: Locator
  readonly statusWin: Locator
  readonly statusLose: Locator
  readonly playAgainButton: Locator

  constructor(page: Page) {
    super(page)
    this.heading = page.getByRole('heading', { name: '¿Quién es ese Pokémon?' })
    this.attemptsText = page.getByText('Intentos restantes:')
    this.statusWin = page.getByText('¡Felicitaciones! ¡Lo atrapaste!')
    this.statusLose = page.getByText(/¡Oh no! Era/i)
    this.playAgainButton = page.getByRole('button', { name: /Nuevo Pokémon|Jugar de nuevo/ })
  }

  async goto(): Promise<void> {
    await super.goto('/')
  }

  getLetterButton(letter: string): Locator {
    // Use data-testid for precise, maintainable selectors
    // This avoids matching other buttons on the page and doesn't depend on CSS classes
    return this.page.getByTestId(`letter-button-${letter.toLowerCase()}`)
  }

  /**
   * Plays the game by clicking letters sequentially until the game ends (win or lose).
   * Uses robust waiting strategies to handle async server requests.
   */
  async playUntilGameOver(): Promise<void> {
    const letters = 'abcdefghijklmnopqrstuvwxyz'.split('')

    for (const letter of letters) {
      // Check if game already ended
      const winVisible = await this.statusWin.isVisible().catch(() => false)
      const loseVisible = await this.statusLose.isVisible().catch(() => false)
      if (winVisible || loseVisible) {
        return
      }

      const letterButton = this.getLetterButton(letter)

      try {
        // Wait for button to be visible
        await letterButton.waitFor({ state: 'visible', timeout: 1000 })
        
        // Check if button is enabled
        const isEnabled = await letterButton.isEnabled({ timeout: 1000 }).catch(() => false)
        
        if (!isEnabled) {
          // Button is disabled, might be already guessed or game ended
          // Check if game ended
          const gameEnded = await this.statusWin.isVisible().catch(() => false) || 
                           await this.statusLose.isVisible().catch(() => false)
          if (gameEnded) {
            return
          }
          // Button was already guessed, continue to next letter
          continue
        }

        // Click the button - Playwright will wait for it to be enabled
        await letterButton.click({ timeout: 3000 })

        // Wait for either:
        // 1. Button becomes disabled (request completed)
        // 2. Game ends (win/lose message appears)
        await Promise.race([
          // Wait for button to become disabled (with timeout)
          letterButton.waitFor({ state: 'attached' }).then(async () => {
            // Give UI time to update the disabled state
            await this.page.waitForTimeout(500)
            // Check if button is now disabled
            const disabled = await letterButton.isDisabled().catch(() => false)
            if (disabled) {
              return Promise.resolve()
            }
            // If still enabled, wait a bit more
            await this.page.waitForTimeout(500)
          }),
          // Wait for game to end
          Promise.race([
            this.statusWin.waitFor({ state: 'visible', timeout: 5000 }).catch(() => null),
            this.statusLose.waitFor({ state: 'visible', timeout: 5000 }).catch(() => null),
          ]),
        ]).catch(() => {
          // Ignore errors, continue to next letter
        })

        // Small delay to allow UI to stabilize
        await this.page.waitForTimeout(300)
      } catch {
        // Button not found or not clickable, continue to next letter
        continue
      }
    }
  }
}


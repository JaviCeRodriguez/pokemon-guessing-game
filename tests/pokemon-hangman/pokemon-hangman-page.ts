import type { Locator, Page } from '@playwright/test'
import { BasePage } from '../base-page'

export class PokemonHangmanPage extends BasePage {
  readonly heading: Locator
  readonly attemptsText: Locator
  readonly keyboardButtons: Locator
  readonly statusWin: Locator
  readonly statusLose: Locator
  readonly playAgainButton: Locator

  constructor(page: Page) {
    super(page)
    this.heading = page.getByRole('heading', { name: '¿Quién es ese Pokémon?' })
    this.attemptsText = page.getByText('Intentos restantes:')
    this.keyboardButtons = page.getByRole('button', { name: /^[a-z]$/ })
    this.statusWin = page.getByText('¡Felicitaciones! ¡Lo atrapaste!')
    this.statusLose = page.getByText(/¡Oh no! Era/i)
    this.playAgainButton = page.getByRole('button', { name: /Nuevo Pokémon|Jugar de nuevo/ })
  }

  async goto(): Promise<void> {
    await super.goto('/')
  }

  /**
   * Clicks through the on-screen keyboard letters sequentially
   * until the game ends in either a win or a loss.
   */
  async playUntilGameOver(): Promise<void> {
    // Click visible letter buttons one by one until a terminal status appears.
    // There are at most 26 letters, so this loop is bounded.
    for (let i = 0; i < 26; i += 1) {
      // If game already finished, stop early.
      if (await this.isGameOver()) {
        return
      }

      const buttons = await this.keyboardButtons.all()
      const nextEnabled = await this.findFirstEnabledButton(buttons)
      if (!nextEnabled) {
        break
      }

      await nextEnabled.click()
    }
  }

  private async findFirstEnabledButton(buttons: Locator[]): Promise<Locator | null> {
    for (const button of buttons) {
      if (await button.isEnabled()) {
        return button
      }
    }
    return null
  }

  async isGameOver(): Promise<boolean> {
    if (await this.statusWin.isVisible().catch(() => false)) return true
    if (await this.statusLose.isVisible().catch(() => false)) return true
    return false
  }
}


### E2E Tests: Pokémon Hangman

**Suite ID:** `POKE-E2E`
**Feature:** Juego de adivinar el Pokémon tipo ahorcado

---

## Test Case: `POKE-E2E-001` - Carga inicial del juego

**Priority:** `high`

**Tags:**
- type → @e2e
- feature → @pokemon-hangman

**Description/Objective:** Verificar que la pantalla principal del juego carga correctamente y muestra los elementos básicos de la UI.

**Preconditions:**
- Servidor de Next.js corriendo en `http://localhost:3000`.

### Flow Steps:
1. Navegar a `/`.
2. Esperar a que el título principal se renderice.
3. Verificar que se muestra el texto de "Intentos restantes".
4. Verificar que al menos un botón de letra del teclado está visible.

### Expected Result:
- El encabezado del juego se muestra correctamente.
- El contador de intentos restantes es visible.
- El teclado de letras está renderizado.

### Key verification points:
- Selector de heading accesible.
- Botones de teclado accesibles por rol.

---

## Test Case: `POKE-E2E-002` - Marcar una letra como usada

**Priority:** `critical`

**Tags:**
- type → @e2e
- feature → @pokemon-hangman

**Description/Objective:** Verificar que al pulsar una letra del teclado esta queda marcada como usada (botón deshabilitado) y que el juego permanece en progreso (sin mensaje de victoria/derrota).

**Preconditions:**
- Servidor de Next.js corriendo en `http://localhost:3000`.

### Flow Steps:
1. Navegar a `/`.
2. Pulsar una letra del teclado (por ejemplo, \"a\").

### Expected Result:
- El botón de la letra pulsada queda deshabilitado (ya no se puede volver a usar).
- No aparece aún ningún mensaje de victoria o derrota.

### Key verification points:
- Las letras usadas se marcan correctamente como no reutilizables.
- El estado del juego no pasa prematuramente a ganado/perdido tras un único intento.

---

## Test Case: `POKE-E2E-003` - Resetear el juego con "Jugar de nuevo"

**Priority:** `high`

**Tags:**
- type → @e2e
- feature → @pokemon-hangman

**Description/Objective:** Verificar que al pulsar el botón de "Nuevo Pokémon / Jugar de nuevo" se resetean las letras usadas y el usuario puede volver a jugar.

**Preconditions:**
- Servidor de Next.js corriendo en `http://localhost:3000`.

### Flow Steps:
1. Navegar a `/`.
2. Pulsar una letra (por ejemplo, \"b\") y verificar que queda deshabilitada.
3. Pulsar el botón de "Nuevo Pokémon / Jugar de nuevo".

### Expected Result:
- La letra usada vuelve a estar habilitada tras el reset (nuevo juego).

### Key verification points:
- El botón de "Nuevo Pokémon / Jugar de nuevo" está visible y operativo en todo momento.
- Tras pulsarlo, el usuario puede volver a interactuar con las letras, incluyendo las que ya había usado.

---

## Test Case: `POKE-E2E-004` - Jugar hasta ganar o perder la partida

**Priority:** `critical`

**Tags:**
- type → @e2e
- feature → @pokemon-hangman

**Description/Objective:** Verificar que el usuario puede jugar la partida completa hasta que el juego termine en victoria o derrota, pulsando letras secuencialmente.

**Preconditions:**
- Servidor de Next.js corriendo en `http://localhost:3000`.

### Flow Steps:
1. Navegar a `/`.
2. Pulsar letras del teclado secuencialmente (a-z).
3. Continuar hasta que aparezca un mensaje de victoria o derrota.

### Expected Result:
- Aparece el mensaje de "¡Felicitaciones! ¡Lo atrapaste!" **o**
- Aparece el mensaje de "¡Oh no! Era {NOMBRE_DEL_POKÉMON}".
- El botón de "Jugar de nuevo" está visible.

### Key verification points:
- El juego siempre termina en un estado consistente (ganado o perdido) tras suficientes intentos.
- El mensaje de estado final es visible y legible.
- El método de juego maneja correctamente las requests asíncronas al servidor.


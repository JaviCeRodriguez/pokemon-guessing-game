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

## Test Case: `POKE-E2E-002` - Jugar hasta terminar la partida

**Priority:** `critical`

**Tags:**
- type → @e2e
- feature → @pokemon-hangman

**Description/Objective:** Verificar que el usuario puede jugar la partida hasta que el juego termine en victoria o derrota.

**Preconditions:**
- Servidor de Next.js corriendo en `http://localhost:3000`.

### Flow Steps:
1. Navegar a `/`.
2. Pulsar secuencialmente las letras del teclado en pantalla.
3. Continuar hasta que aparezca un mensaje de victoria o derrota.

### Expected Result:
- Aparece el mensaje de "¡Felicitaciones! ¡Lo atrapaste!" **o**
- Aparece el mensaje de "¡Oh no! Era {NOMBRE_DEL_POKÉMON}".

### Key verification points:
- El juego siempre termina en un estado consistente (ganado o perdido) tras suficientes intentos.
- El mensaje de estado final es visible y legible.

---

## Test Case: `POKE-E2E-003` - Resetear el juego con "Jugar de nuevo"

**Priority:** `high`

**Tags:**
- type → @e2e
- feature → @pokemon-hangman

**Description/Objective:** Verificar que al pulsar el botón de "Nuevo Pokémon / Jugar de nuevo" el estado del juego se resetea correctamente.

**Preconditions:**
- Servidor de Next.js corriendo en `http://localhost:3000`.

### Flow Steps:
1. Navegar a `/`.
2. Jugar pulsando letras hasta que el juego termine en victoria o derrota.
3. Verificar que los botones de letras están deshabilitados y que se muestra el mensaje de estado final.
4. Pulsar el botón de "Nuevo Pokémon / Jugar de nuevo".

### Expected Result:
- Desaparecen los mensajes de victoria/derrota.
- El teclado de letras vuelve a estar habilitado para iniciar una nueva partida.

### Key verification points:
- El botón de jugar de nuevo está visible tras terminar la partida.
- Tras pulsarlo, el usuario puede volver a interactuar con las letras.


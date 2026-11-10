import { createAction } from "@reduxjs/toolkit";

/**
 * Acciones de sesión. Viven en su propio archivo (sin imports) para que
 * src/services/api.ts pueda usarlas sin crear dependencias circulares.
 *
 * - sessionStarted(token): login exitoso
 * - sessionEnded(): logout, o el backend respondió 401 con un token guardado
 *   (el listener del store borra el token del almacenamiento y limpia el caché de la API)
 */
export const sessionStarted = createAction<string>("auth/sessionStarted");
export const sessionEnded = createAction("auth/sessionEnded");

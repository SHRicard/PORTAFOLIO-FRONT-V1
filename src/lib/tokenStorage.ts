/**
 * ÚNICO lugar que sabe dónde se guarda el token de sesión.
 * Hoy usa localStorage. Si algún día se cambia el mecanismo (por ejemplo, cookie httpOnly),
 * se cambia acá y en src/services/api.ts, y el resto de la app no se entera.
 *
 * Los try/catch cubren navegadores con el almacenamiento bloqueado (modo privado, etc.)
 * y entornos sin localStorage (tests en Node).
 */
const KEY = "token";

export const tokenStorage = {
  get(): string | null {
    try {
      return localStorage.getItem(KEY);
    } catch {
      return null;
    }
  },
  set(token: string): void {
    try {
      localStorage.setItem(KEY, token);
    } catch {
      /* sin almacenamiento: la sesión dura hasta recargar la página */
    }
  },
  remove(): void {
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* nada que borrar */
    }
  },
};

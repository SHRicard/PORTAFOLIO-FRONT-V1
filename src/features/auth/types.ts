/** Tipos del servicio de login. Fuente: docs/api/LOGIN.md */

export type Sexo = "masculino" | "femenino" | "otro" | "prefiero_no_decir";

export interface User {
  id: string;
  nombre: string;
  apellido: string;
  telefono: string;
  pais: string;
  correo: string;
  sexo: Sexo;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterInput {
  nombre: string;
  apellido: string;
  telefono: string;
  pais: string;
  correo: string;
  sexo: Sexo;
  password: string;
}

export interface LoginInput {
  correo: string;
  password: string;
}

export type UpdateProfileInput = Partial<Omit<RegisterInput, "password">>;

export interface AuthData {
  token: string;
  user: User;
}

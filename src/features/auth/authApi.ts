import { api } from "@/services/api";
import type { ApiSuccess } from "@/types/api";
import { sessionStarted } from "./authActions";
import type { AuthData, LoginInput, UpdateProfileInput, User } from "./types";

/**
 * Endpoints del servicio de login. Contrato: docs/api/LOGIN.md. No usa `POST /users/register`: la
 * app es de un solo dueño y no tiene registro
 */
export const authApi = api.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<AuthData, LoginInput>({
      query: (body) => ({ url: "/users/login", method: "POST", body }),
      transformResponse: (res: ApiSuccess<AuthData>) => res.data,
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(sessionStarted(data.token));
        } catch {
          /* el error lo muestra el formulario */
        }
      },
    }),

    getMe: build.query<User, void>({
      query: () => "/users/me",
      transformResponse: (res: ApiSuccess<{ user: User }>) => res.data.user,
      providesTags: ["User"],
    }),

    updateMe: build.mutation<User, UpdateProfileInput>({
      query: (body) => ({ url: "/users/me", method: "PUT", body }),
      transformResponse: (res: ApiSuccess<{ user: User }>) => res.data.user,
      invalidatesTags: ["User"], // vuelve a pedir el perfil y toda la app se actualiza
    }),
  }),
});

export const { useLoginMutation, useGetMeQuery, useUpdateMeMutation } = authApi;

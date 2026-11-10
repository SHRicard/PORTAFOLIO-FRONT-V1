import { RouterProvider } from "react-router/dom";
import { router } from "@/app/router";
import { ConfirmarProvider } from "@/components/ui/Confirmar";

/**
 * El tema lo aplica cada layout con el suyo (`useAplicarTema`): la web pública, el de su portafolio; el panel y el login, el del panel.
 * ConfirmarProvider monta el modal de confirmación (`useConfirmar`) una sola vez para toda la app
 */
export default function App() {
  return (
    <ConfirmarProvider>
      <RouterProvider router={router} />
    </ConfirmarProvider>
  );
}

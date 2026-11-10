import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { DialogoConfirmar, type OpcionesConfirmar } from "./DialogoConfirmar";

/** Abre el modal y responde true si se confirmó; false con Cancelar, la X, Esc o el fondo */
export type Confirmar = (opciones: OpcionesConfirmar) => Promise<boolean>;

const ConfirmarContexto = createContext<Confirmar | null>(null);

interface Pedido {
  id: number;
  opciones: OpcionesConfirmar;
  resolver: (confirmado: boolean) => void;
}

/** Monta el modal de confirmación una sola vez para toda la app. Va en App.tsx */
export function ConfirmarProvider({ children }: { children: ReactNode }) {
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const sinResponder = useRef<Pedido["resolver"] | null>(null);
  const contador = useRef(0);

  const confirmar = useCallback<Confirmar>(
    (opciones) =>
      new Promise<boolean>((resolver) => {
        sinResponder.current?.(false); // si quedaba otra pregunta abierta, se cancela
        sinResponder.current = resolver;
        contador.current += 1;
        setPedido({ id: contador.current, opciones, resolver });
      }),
    [],
  );

  return (
    <ConfirmarContexto.Provider value={confirmar}>
      {children}
      {pedido && (
        <DialogoConfirmar
          key={pedido.id}
          opciones={pedido.opciones}
          onResponder={(confirmado) => {
            if (sinResponder.current === pedido.resolver) sinResponder.current = null;
            pedido.resolver(confirmado);
          }}
          onCerrado={() => setPedido((actual) => (actual?.id === pedido.id ? null : actual))}
        />
      )}
    </ConfirmarContexto.Provider>
  );
}

/**
 * Pide confirmación con el modal de la app, en lugar de window.confirm:
 *   const confirmar = useConfirmar();
 *   if (!(await confirmar({ tipo, titulo, textoConfirmar, ... }))) return;
 */
export function useConfirmar(): Confirmar {
  const confirmar = useContext(ConfirmarContexto);
  if (!confirmar) throw new Error("useConfirmar necesita <ConfirmarProvider>, que está en App.tsx");
  return confirmar;
}

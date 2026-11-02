import { Link, Outlet } from "react-router";
import { useAppSelector } from "@/app/hooks";
import { buttonVariants } from "@/components/ui/Button";

export function PublicLayout() {
  const token = useAppSelector((state) => state.auth.token);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-borde">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <Link to="/" className="font-titulo text-lg font-bold text-texto">
            Mi Portfolio
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/blog" className="text-sm font-medium text-texto hover:text-primario">
              Blog
            </Link>
            <Link to={token ? "/admin" : "/login"} className={buttonVariants({ estilo: "contorno", tamano: "sm" })}>
              {token ? "Ir al panel" : "Ingresar"}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12">
        <Outlet />
      </main>

      <footer className="border-t border-borde py-6 text-center text-sm text-texto-suave">
        © {new Date().getFullYear()} Mi Portfolio
      </footer>
    </div>
  );
}

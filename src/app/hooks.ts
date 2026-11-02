import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "./store";
import type { RootState } from "./rootReducer";

/** Usar SIEMPRE estos hooks en vez de useDispatch / useSelector sueltos (ya vienen tipados) */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

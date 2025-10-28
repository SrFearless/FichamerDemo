// lib/auth.ts
import { decodeJwt } from "jose";

type Decoded = {
  id: number;
  [key: string]: any;
};

/**
 * Retorna o ID do usuário a partir do token JWT guardado em localStorage,
 * ou null se não houver token válido.
 */
export function getUserIdFromToken(): number | null {
  if (typeof window === 'undefined') return null; // Execução no servidor
  
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded = decodeJwt(token) as { id?: number };
    return decoded.id || null;
  } catch {
    return null;
  }
}

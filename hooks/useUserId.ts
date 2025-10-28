// hooks/useUser.ts
import { useState, useEffect } from 'react';
import { decodeJwt } from 'jose'

type DecodedToken = { id: number; tipo: string; exp: number };
export interface UserProfile {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  pontos: number;
  // adicione outros campos conforme necessário
}

/**
 * Extrai o ID do usuário a partir do token no localStorage.
 */
function getUserIdFromToken(): number | null {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    // usamos decodeJwt da jose ou jwt-decode
    const payload = JSON.parse(atob(token.split('.')[1])) as DecodedToken;
    return payload.id;
  } catch {
    return null;
  }
}

/**
 * Hook para buscar os dados completos do perfil do usuário logado.
 */
export function useUserProfile(): UserProfile | null | undefined {
  const [user, setProfile] = useState<UserProfile | null | undefined>(undefined)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setProfile(null)
      return
    }

    let decoded: DecodedToken
    try {
      decoded = decodeJwt(token) as DecodedToken
    } catch {
      setProfile(null)
      return
    }

    fetch(`http://localhost:3001/api/pessoas/${decoded.id}`, {
      credentials: 'include',
    })
      .then(res => {
        if (!res.ok) throw new Error('Erro ao buscar perfil')
        return res.json()
      })
      .then((data: UserProfile) => setProfile(data))
      .catch(() => setProfile(null))
  }, [])

  return user;
}

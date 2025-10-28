"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { decodeJwt } from "jose";
import { toast } from "sonner";
import { MedievalNavBarAv } from "@/components/medieval-navbar-aventureiro";

type DecodedToken = { id: number };
type Character = {
  id_personagem: number;
  nome: string;
  imagem_url: string;
  selecionado: boolean;
  classe: {
    nome: string;
    gif_url: string;
  };
};

function getUserIdFromToken(): string | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    return decodeJwt<DecodedToken>(token).id.toString();
  } catch {
    return null;
  }
}

export default function CharacterSelectionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userId = getUserIdFromToken();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const decoded = token ? decodeJwt<DecodedToken>(token) : null;

  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);

  const fetchCharacters = async () => {
    try {
      setError(null);
      const response = await fetch(`/personagem/selecionar?usuario_id=${userId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao carregar personagens");
      }
      
      const data = await response.json();
      setCharacters(data);
      setSelectedCharacter(data.find((c: Character) => c.selecionado) || null);
    } catch (error) {
      console.error("Erro:", error);
      setError(error instanceof Error ? error.message : "Erro desconhecido");
      toast.error("Erro ao carregar personagens");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) {
      router.push("/login");
      return;
    }
    fetchCharacters();
  }, [userId, router]);

  const handleCharacterSelect = async (characterId: number) => {
    try {
      const response = await fetch('/personagem/selecionar', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_personagem: characterId,
          id_usuario: userId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao selecionar personagem");
      }

      // Atualização otimista do estado local
      const updatedCharacters = characters.map(c => ({
        ...c,
        selecionado: c.id_personagem === characterId
      }));
      
      setCharacters(updatedCharacters);
      setSelectedCharacter(updatedCharacters.find(c => c.selecionado) || null);
      
      toast.success("Personagem selecionado com sucesso!");
      
    } catch (error) {
      console.error("Erro ao selecionar personagem:", error);
      // Recarregar dados do servidor para sincronizar
      fetchCharacters();
      toast.error("Erro ao selecionar personagem");
    }
  };

  if (!userId) {
    return (
      <div className="flex items-center justify-center h-screen bg-stone-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <>
      <MedievalNavBarAv />
      <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=1470&auto=format&fit=crop')] bg-cover bg-center p-4">
        {/* Efeito de névoa */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
        
        {/* Container principal */}
        <div className="relative z-10 max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
          {/* Coluna esquerda - Visualização do personagem */}
          <div className="w-full lg:w-1/2 bg-stone-800/80 border-2 border-amber-600 rounded-xl p-6 shadow-lg">
            <h1 className="text-3xl font-bold text-amber-400 mb-6 text-center font-serif">
              Salão dos Heróis
            </h1>
            
            {/* Personagem selecionado (topo) */}
            <div className="mb-8 flex flex-col items-center">
              <div className="w-64 h-64 rounded-lg border-4 border-amber-500 overflow-hidden mb-4">
                {selectedCharacter ? (
                  <img 
                    src={selectedCharacter.classe.gif_url} 
                    alt={selectedCharacter.nome}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-stone-700 flex items-center justify-center">
                    <span className="text-stone-400">Selecione um personagem</span>
                  </div>
                )}
              </div>
              <h2 className="text-2xl font-bold text-amber-300">
                {selectedCharacter?.nome || "Nenhum selecionado"}
              </h2>
              <p className="text-amber-200">
                {selectedCharacter?.classe.nome || ""}
              </p>
            </div>
            
            {/* Altar (embaixo) */}
            <div className="bg-stone-900/70 border border-amber-700 rounded-lg p-4 text-center">
              <div className="w-full h-48 rounded-md bg-[url('https://i.gifer.com/7XVH.gif')] bg-contain bg-center bg-no-repeat flex items-end justify-center">
                <div className="bg-stone-900/80 p-3 rounded-t-lg border-t border-x border-amber-600">
                  <h3 className="text-lg font-bold text-amber-300">Altar dos Campeões</h3>
                  <p className="text-sm text-stone-300">Local de seleção e homenagem</p>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna direita - Lista de personagens */}
          <div className="w-full lg:w-1/2 bg-stone-800/80 border-2 border-amber-600 rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-amber-400 mb-6 text-center font-serif">
              Escolha Seu Campeão
            </h2>
            
            {error ? (
              <div className="text-center py-8">
                <p className="text-red-400 mb-4">{error}</p>
                <Button 
                  onClick={fetchCharacters}
                  className="bg-amber-700 hover:bg-amber-600"
                >
                  Tentar Novamente
                </Button>
              </div>
            ) : loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
              </div>
            ) : characters.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-stone-300 mb-4">Nenhum personagem criado</p>
                <Button asChild className="bg-amber-700 hover:bg-amber-600">
                  <Link href={`/aventureirocriarpersonagem/${decoded?.id ?? ""}`}>
                    Criar Primeiro Personagem
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {characters.map((character) => (
                  <div 
                    key={character.id_personagem}
                    onClick={() => handleCharacterSelect(character.id_personagem)}
                    className={`cursor-pointer p-3 rounded-lg border-2 transition-all ${
                      character.selecionado 
                        ? 'border-amber-400 bg-amber-900/30' 
                        : 'border-stone-600 hover:border-amber-300 hover:bg-stone-700/50'
                    }`}
                  >
                    <div className="w-full h-32 rounded-md overflow-hidden mb-2">
                      <img 
                        src={character.classe.gif_url} 
                        alt={character.nome}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-center font-medium text-stone-200">
                      {character.nome}
                    </h3>
                    <p className="text-center text-xs text-amber-300">
                      {character.classe.nome}
                    </p>
                    {character.selecionado && (
                      <div className="text-center text-xs text-amber-400 mt-1">
                        Selecionado
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Botão de ação */}
            <div className="mt-8 flex justify-center">
              <Button 
                asChild
                disabled={!selectedCharacter}
                className="bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 py-6 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Link href={`/aventureiroficha/${decoded?.id ?? ""}/${selectedCharacter?.id_personagem ?? ""}`}>
                  Confirmar Seleção
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
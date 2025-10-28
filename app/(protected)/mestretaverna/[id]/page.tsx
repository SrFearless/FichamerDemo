"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { decodeJwt } from "jose";
import { MedievalNavBarMs } from "@/components/medieval-navbar-mestre";

type DecodedToken = { id: number };
type Character = {
  id: number;
  name: string;
  gifUrl: string;
  selected: boolean;
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
  const userId = getUserIdFromToken();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const decoded = token ? decodeJwt<DecodedToken>(token) : null;

  // Dados mockados de personagens - substituir por chamada API real
  const [characters, setCharacters] = useState<Character[]>([
    { id: 1, name: "Guerreiro", gifUrl: "https://i.gifer.com/7XVG.gif", selected: true },
    { id: 2, name: "Mago", gifUrl: "https://i.gifer.com/7XVF.gif", selected: false },
    { id: 3, name: "Arqueiro", gifUrl: "https://i.gifer.com/7XVE.gif", selected: false },
    { id: 4, name: "Ladino", gifUrl: "https://i.gifer.com/7XVD.gif", selected: false },
    { id: 5, name: "Clérigo", gifUrl: "https://i.gifer.com/7XVC.gif", selected: false },
  ]);

  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);

  useEffect(() => {
    if (!userId) {
      router.push("/login");
      return;
    }
    
    // Simulando carregamento de dados
    setTimeout(() => {
      setSelectedCharacter(characters.find(c => c.selected) || null);
      setLoading(false);
    }, 1000);
  }, [userId, router]);

  const handleCharacterSelect = (characterId: number) => {
    setCharacters(prev => prev.map(c => ({
      ...c,
      selected: c.id === characterId
    })));
    const selected = characters.find(c => c.id === characterId);
    setSelectedCharacter(selected || null);
    
    // Aqui você chamaria sua API para trocar os GIFs
    console.log("Personagem selecionado:", selected?.name);
  };

  return (
    <>
      <MedievalNavBarMs />
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
                  src={selectedCharacter.gifUrl} 
                  alt={selectedCharacter.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-stone-700 flex items-center justify-center">
                  <span className="text-stone-400">Selecione um personagem</span>
                </div>
              )}
            </div>
            <h2 className="text-2xl font-bold text-amber-300">
              {selectedCharacter?.name || "Nenhum selecionado"}
            </h2>
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
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {characters.map((character) => (
                <div 
                  key={character.id}
                  onClick={() => handleCharacterSelect(character.id)}
                  className={`cursor-pointer p-3 rounded-lg border-2 transition-all ${character.selected ? 'border-amber-400 bg-amber-900/30' : 'border-stone-600 hover:border-amber-300'}`}
                >
                  <div className="w-full h-32 rounded-md overflow-hidden mb-2">
                    <img 
                      src={character.gifUrl} 
                      alt={character.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-center font-medium text-stone-200">
                    {character.name}
                  </h3>
                  {character.selected && (
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
              className="bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 py-6 text-lg font-bold"
            >
              <Link href={`/mestreficha/${decoded?.id ?? ""}`}>
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
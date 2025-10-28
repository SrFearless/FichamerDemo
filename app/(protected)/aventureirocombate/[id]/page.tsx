"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MedievalNavBarAv } from "@/components/medieval-navbar-aventureiro";

// Dados dos ataques
const attacks = [
  {
    id: 1,
    name: "Espadada",
    description: "Golpe rápido com a espada",
    gif: "/attacks/sword-slash.gif",
    cost: "3 Energia"
  },
  {
    id: 2,
    name: "Flechada",
    description: "Disparo preciso de arco",
    gif: "/attacks/arrow-shot.gif",
    cost: "2 Energia"
  },
  {
    id: 3,
    name: "Magia de Fogo",
    description: "Conjura uma bola de fogo",
    gif: "/attacks/fire-spell.gif",
    cost: "5 Energia"
  },
  {
    id: 4,
    name: "Escudo",
    description: "Defesa contra ataques",
    gif: "/attacks/shield-block.gif",
    cost: "2 Energia"
  },
  {
    id: 5,
    name: "Cura",
    description: "Recupera pontos de vida",
    gif: "/attacks/heal-spell.gif",
    cost: "4 Energia"
  }
];

export default function AtaquesPage() {
  const [selectedAttack, setSelectedAttack] = useState(attacks[0]);
  const [isAttacking, setIsAttacking] = useState(false);

  const handleAttack = () => {
    setIsAttacking(true);
    // Simula o tempo da animação
    setTimeout(() => setIsAttacking(false), 1500);
  };

  return (
    <>
      <MedievalNavBarAv />
    <div className="min-h-screen bg-stone-900 p-4">
      {/* Banner superior estilo medieval */}
      <div className="mb-6 border-b-4 border-amber-800 pb-2 text-center">
        <h1 className="text-4xl font-bold text-amber-500 font-medieval">Livro de Ataques</h1>
        <p className="text-stone-300">Escolha seu movimento, guerreiro!</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Menu de ataques lateral */}
        <div className="w-full lg:w-1/4">
          <Card className="bg-stone-800 border-amber-700">
            <CardHeader>
              <CardTitle className="text-amber-400 text-xl">Ataques Disponíveis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {attacks.map((attack) => (
                <Button
                  key={attack.id}
                  variant={selectedAttack.id === attack.id ? "default" : "secondary"}
                  className={`w-full text-left justify-start ${selectedAttack.id === attack.id ? 'bg-amber-700' : 'bg-stone-700 hover:bg-stone-600'}`}
                  onClick={() => setSelectedAttack(attack)}
                >
                  <span className="font-bold">{attack.name}</span>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Área principal com visualização do ataque */}
        <div className="w-full lg:w-3/4">
          <Card className="bg-stone-800 border-amber-700">
            <CardHeader>
              <CardTitle className="text-amber-400 text-2xl">{selectedAttack.name}</CardTitle>
              <p className="text-stone-300">{selectedAttack.description}</p>
              <p className="text-amber-200">Custo: {selectedAttack.cost}</p>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              {/* Container da animação */}
              <div className="relative w-full h-64 md:h-96 bg-stone-900 rounded-lg border-2 border-amber-800 flex items-center justify-center overflow-hidden">
                {isAttacking ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <img 
                      src={selectedAttack.gif} 
                      alt={selectedAttack.name} 
                      className="pixel-art w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <>
                    <img 
                      src="/characters/warrior-idle.gif" 
                      alt="Guerreiro em posição" 
                      className="pixel-art h-full object-contain"
                    />
                    <div className="absolute bottom-4 left-4 bg-stone-900/80 p-2 rounded border border-amber-700">
                      <p className="text-stone-100">Pronto para atacar!</p>
                    </div>
                  </>
                )}
              </div>

              {/* Botão de ação */}
              <Button 
                onClick={handleAttack}
                disabled={isAttacking}
                className="mt-6 bg-amber-700 hover:bg-amber-600 text-stone-900 font-bold py-3 px-8 text-lg"
              >
                {isAttacking ? "Executando..." : `Usar ${selectedAttack.name}`}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Rodapé temático */}
      <div className="mt-8 text-center text-stone-500 text-sm">
        <p>Taverna do Esquadramer Dourado © {new Date().getFullYear()}</p>
      </div>
    </div>
    </>
  );
}
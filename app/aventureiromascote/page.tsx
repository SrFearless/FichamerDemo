"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { X, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Plus, Minus, Zap, User } from "lucide-react";
import { MedievalNavBarAv } from "@/components/medieval-navbar-aventureiro";

type CharacterData = {
  nome: string;
  raca: string;
  classeArmadura: number;
  deslocamento: number;
  iniciativa: number;
  vida: number;
  vidaMax: number;
  slotsMagia: {
    nivel1: { total: number; usados: number };
    nivel2: { total: number; usados: number };
    nivel3: { total: number; usados: number };
    nivel4: { total: number; usados: number };
  };
  atributos: {
    forca: number;
    destreza: number;
    constituicao: number;
    inteligencia: number;
    sabedoria: number;
    carisma: number;
  };
  testesResistencia: {
    forca: { valor: number; proficiente: boolean };
    destreza: { valor: number; proficiente: boolean };
    constituicao: { valor: number; proficiente: boolean };
    inteligencia: { valor: number; proficiente: boolean };
    sabedoria: { valor: number; proficiente: boolean };
    carisma: { valor: number; proficiente: boolean };
  };
  pericias: {
    nome: string;
    atributoBase: string;
    proficiente: boolean;
    periciaDobrada: boolean;
  }[];
  equipamentos: {
    torso: { nome: string; gif?: string; propriedades?: string };
    arma: { nome: string; gif?: string; propriedades?: string };
  };
  magias: {
    nome: string;
    nivel: number;
    escola: string;
    tempoConjuracao: string;
    alcance: string;
    componentes: string;
    duracao: string;
    descricao: string;
  }[];
};

// Sistema de dados aprimorado
type AttackData = {
  id: number;
  name: string;
  description: string;
  gif: string;
  cost: string;
  tipo: string;
  dados: string; // Formato: "2d10+3d6+1d8+15"
  danoAdicional?: string; // Dano fixo adicional
};

// Função para analisar uma string de dados complexa
const parseDiceString = (diceString: string): Array<{ tipo: string; quantidade: number; faces: number }> => {
  const parts = diceString.split('+').map(part => part.trim());
  const diceResults: Array<{ tipo: string; quantidade: number; faces: number }> = [];

  parts.forEach(part => {
    if (part.includes('d')) {
      const [quantidade, faces] = part.split('d').map(Number);
      diceResults.push({
        tipo: `${quantidade}d${faces}`,
        quantidade,
        faces
      });
    }
  });

  return diceResults;
};

// Função para calcular dano fixo adicional
const calcularDanoAdicional = (diceString: string): number => {
  const parts = diceString.split('+').map(part => part.trim());
  let danoFixo = 0;

  parts.forEach(part => {
    if (!part.includes('d') && !isNaN(Number(part))) {
      danoFixo += Number(part);
    }
  });

  return danoFixo;
};

// Dados dos ataques com sistema de dados complexo
const attacks: AttackData[] = [
  {
    id: 1,
    name: "Mordida",
    description: "Ataque Corpo-a-Corpo",
    gif: "/espadas/madeira.gif",
    cost: "1 Ação",
    tipo: "Perfurante",
    dados: "4d6+4",
    danoAdicional: "Acertar o Ataque (1D20 + 6) - Se o alvo for uma criatura, ela deve ser bem sucedida num teste de resistência de Força (CD 14) ou será derrubada no chão"
  },  {
    id: 2,
    name: "Sopro Congelante",
    description: "Expele um jato de vento congelante",
    gif: "/espadas/madeira.gif",
    cost: "1 Ação",
    tipo: "Distância (4,5m)",
    dados: "4d8",
    danoAdicional: "Cada criatura deve realizar um teste de resistência de Destreza (CD 12), sofrendo o dano todo ou metade desse dano se passar"
  }
];

const calcularModificador = (valor: number): number => {
  return Math.floor((valor - 10) / 2);
};

const calcularProficiencia = (nivel: number): number => {
  return Math.max(2, Math.floor(1 + nivel / 3));
};

// Função para rolar dados complexos
const rolarDadosComplexos = (dadosString: string): { 
  resultados: Array<{ tipo: string; valores: number[]; total: number }>; 
  total: number;
  danoFixo: number;
  detalhes: string;
} => {
  const partesDados = parseDiceString(dadosString);
  const danoFixo = calcularDanoAdicional(dadosString);
  
  const resultados: Array<{ tipo: string; valores: number[]; total: number }> = [];
  let totalDados = 0;

  partesDados.forEach(dado => {
    const valores: number[] = [];
    let totalTipo = 0;

    for (let i = 0; i < dado.quantidade; i++) {
      const resultado = Math.floor(Math.random() * dado.faces) + 1;
      valores.push(resultado);
      totalTipo += resultado;
    }

    resultados.push({
      tipo: dado.tipo,
      valores,
      total: totalTipo
    });

    totalDados += totalTipo;
  });

  const totalGeral = totalDados + danoFixo;
  
  // Criar string detalhada
  const detalhesDados = resultados.map(r => `${r.tipo}: [${r.valores.join(', ')}] = ${r.total}`).join(' + ');
  const detalhes = `${detalhesDados} ${danoFixo > 0 ? `+ ${danoFixo} (fixo)` : ''} = ${totalGeral}`;

  return {
    resultados,
    total: totalGeral,
    danoFixo,
    detalhes
  };
};

// Função para obter o ícone do dado baseado no número de faces
const getDiceIcon = (faces: number) => {
  switch (faces) {
    case 4: return <Dice4 className="w-4 h-4" />;
    case 6: return <Dice6 className="w-4 h-4" />;
    case 8: return <Dice2 className="w-4 h-4" />;
    case 10: return <Dice1 className="w-4 h-4" />;
    case 12: return <Dice3 className="w-4 h-4" />;
    case 20: return <Dice5 className="w-4 h-4" />;
    default: return <Dice6 className="w-4 h-4" />;
  }
};

export default function DashboardPage() {
  const [isClient, setIsClient] = useState(false);
  const [userId] = useState<number | null>(null);
  const [character, setCharacter] = useState<CharacterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCombatOpen, setIsCombatOpen] = useState(false);
  const [selectedAttack, setSelectedAttack] = useState(attacks[0]);
  const [isAttacking, setIsAttacking] = useState(false);
  const [energy, setEnergy] = useState(1);
  const [ultimaRolagem, setUltimaRolagem] = useState<{
    resultados: Array<{ tipo: string; valores: number[]; total: number }>;
    total: number;
    tipo: string;
    detalhes: string;
    danoFixo: number;
  } | null>(null);
  const [historicoRolagens, setHistoricoRolagens] = useState<{
    ataque: string;
    dados: string;
    resultados: Array<{ tipo: string; valores: number[]; total: number }>;
    total: number;
    detalhes: string;
    timestamp: Date;
  }[]>([]);
  const [danoPersonalizado] = useState("");

  const mockCharacter: CharacterData = {
    nome: "Ronan - Ruína dos Vivos",
    raca: "Lobo Invernal",
    classeArmadura: 15,
    deslocamento: 15.0,
    iniciativa: 5,
    vida: 75,
    vidaMax: 75,
    slotsMagia: {
      nivel1: { total: 4, usados: 1 },
      nivel2: { total: 3, usados: 0 },
      nivel3: { total: 2, usados: 2 },
      nivel4: { total: 1, usados: 0 }
    },
    atributos: {
      forca: 18,
      destreza: 13,
      constituicao: 12,
      inteligencia: 7,
      sabedoria: 12,
      carisma: 7
    },
    testesResistencia: {
      forca: { valor: calcularModificador(10) + (true ? calcularProficiencia(11) : 0), proficiente: true },
      destreza: { valor: calcularModificador(20) + (true ? calcularProficiencia(11) : 0), proficiente: true },
      constituicao: { valor: calcularModificador(13) + (false ? calcularProficiencia(11) : 0), proficiente: false },
      inteligencia: { valor: calcularModificador(8) + (false ? calcularProficiencia(11) : 0), proficiente: false },
      sabedoria: { valor: calcularModificador(15) + (true ? calcularProficiencia(11) : 0), proficiente: false },
      carisma: { valor: calcularModificador(10) + (false ? calcularProficiencia(11) : 0), proficiente: false }
    },
    pericias: [
      { nome: "Atletismo", atributoBase: "forca", proficiente: false, periciaDobrada: false },
      { nome: "Acrobacia", atributoBase: "destreza", proficiente: false, periciaDobrada: false },
      { nome: "Furtividade", atributoBase: "destreza", proficiente: false, periciaDobrada: false },
      { nome: "Prestidigitação", atributoBase: "destreza", proficiente: false, periciaDobrada: false },
      { nome: "Arcanismo", atributoBase: "inteligencia", proficiente: false, periciaDobrada: false },
      { nome: "História", atributoBase: "inteligencia", proficiente: false, periciaDobrada: false },
      { nome: "Investigação", atributoBase: "inteligencia", proficiente: false, periciaDobrada: false },
      { nome: "Natureza", atributoBase: "inteligencia", proficiente: false, periciaDobrada: false },
      { nome: "Religião", atributoBase: "inteligencia", proficiente: false, periciaDobrada: false },
      { nome: "Intuição", atributoBase: "sabedoria", proficiente: false, periciaDobrada: false },
      { nome: "Lidar com Animais", atributoBase: "sabedoria", proficiente: false, periciaDobrada: false },
      { nome: "Medicina", atributoBase: "sabedoria", proficiente: false, periciaDobrada: false },
      { nome: "Percepção", atributoBase: "sabedoria", proficiente: false, periciaDobrada: false },
      { nome: "Sobrevivência", atributoBase: "sabedoria", proficiente: false, periciaDobrada: false },
      { nome: "Atuação", atributoBase: "carisma", proficiente: false, periciaDobrada: false },
      { nome: "Blefar", atributoBase: "carisma", proficiente: false, periciaDobrada: false },
      { nome: "Intimidação", atributoBase: "carisma", proficiente: false, periciaDobrada: false },
      { nome: "Persuasão", atributoBase: "carisma", proficiente: false, periciaDobrada: false }
    ],
    equipamentos: {
      torso: { 
        nome: "Armadura de Ferro", 
        gif: "/espadas/madeira.gif",
        propriedades: "+2 CA"
      },
      arma: { 
        nome: "Dentadura de Ferro", 
        gif: "/espadas/madeira.gif",
        propriedades: "x2 de Dano"
      }
    },
    magias: [
      {
        nome: "Mãos Mágicas",
        nivel: 0,
        escola: "Conjuração",
        tempoConjuracao: "1 ação",
        alcance: "9 metros",
        componentes: "V, S",
        duracao: "1 minuto",
        descricao: "Cria uma mão flutuante que pode manipular objetos."
      },
      {
        nome: "Salto",
        nivel: 1,
        escola: "Transmutação",
        tempoConjuracao: "1 ação",
        alcance: "Toque",
        componentes: "V, S, M (uma perna de gafanhoto)",
        duracao: "1 minuto",
        descricao: "Triplica a distância que a criatura pode saltar."
      }
    ]
  };

  useEffect(() => {
    setIsClient(true);
    setTimeout(() => {
      setCharacter(mockCharacter);
      setLoading(false);
    }, 1);
  }, []);

  // Funções para modificar vida
  const aumentarVida = (quantidade: number = 1) => {
    if (character) {
      setCharacter({
        ...character,
        vida: Math.min(character.vidaMax, character.vida + quantidade)
      });
    }
  };

  const diminuirVida = (quantidade: number = 1) => {
    if (character) {
      setCharacter({
        ...character,
        vida: Math.max(0, character.vida - quantidade)
      });
    }
  };

  // Função para alternar proficiência da perícia
  const toggleProficienciaPericia = (index: number) => {
    if (character) {
      const periciasAtualizadas = [...character.pericias];
      periciasAtualizadas[index] = {
        ...periciasAtualizadas[index],
        proficiente: !periciasAtualizadas[index].proficiente
      };
      
      setCharacter({
        ...character,
        pericias: periciasAtualizadas
      });
    }
  };

  // Função para alternar perícia dobrada
  const togglePericiaDobrada = (index: number) => {
    if (character) {
      const periciasAtualizadas = [...character.pericias];
      periciasAtualizadas[index] = {
        ...periciasAtualizadas[index],
        periciaDobrada: !periciasAtualizadas[index].periciaDobrada
      };
      
      setCharacter({
        ...character,
        pericias: periciasAtualizadas
      });
    }
  };

  // Função para gerenciar slots de magia
  const toggleSlotMagia = (nivel: keyof CharacterData['slotsMagia'], index: number) => {
    if (character) {
      const slot = character.slotsMagia[nivel];
      const novosUsados = index < slot.usados ? slot.usados - 1 : slot.usados + 1;
      
      // Garante que não ultrapasse os limites
      const usadosAjustados = Math.max(0, Math.min(slot.total, novosUsados));
      
      setCharacter({
        ...character,
        slotsMagia: {
          ...character.slotsMagia,
          [nivel]: {
            ...slot,
            usados: usadosAjustados
          }
        }
      });
    }
  };

  const handleAttack = () => {
    if (!canUseAttack(selectedAttack)) return;

    setIsAttacking(true);
    
    const resultado = rolarDadosComplexos(selectedAttack.dados);
    setUltimaRolagem({
      resultados: resultado.resultados,
      total: resultado.total,
      tipo: selectedAttack.tipo,
      detalhes: resultado.detalhes,
      danoFixo: resultado.danoFixo
    });

    setHistoricoRolagens(prev => [{
      ataque: selectedAttack.name,
      dados: selectedAttack.dados,
      resultados: resultado.resultados,
      total: resultado.total,
      detalhes: resultado.detalhes,
      timestamp: new Date()
    }, ...prev.slice(0, 4)]);

    setEnergy(prev => prev - getEnergyCost(selectedAttack));

    setTimeout(() => {
      setIsAttacking(false);
      setEnergy(prev => Math.min(10, prev + 1));
    }, 2000);
  };

  // Função para rolar dano personalizado
  const handleDanoPersonalizado = () => {
    if (!danoPersonalizado.trim()) return;

    setIsAttacking(true);
    
    const resultado = rolarDadosComplexos(danoPersonalizado);
    setUltimaRolagem({
      resultados: resultado.resultados,
      total: resultado.total,
      tipo: "Personalizado",
      detalhes: resultado.detalhes,
      danoFixo: resultado.danoFixo
    });

    setHistoricoRolagens(prev => [{
      ataque: "Dano Personalizado",
      dados: danoPersonalizado,
      resultados: resultado.resultados,
      total: resultado.total,
      detalhes: resultado.detalhes,
      timestamp: new Date()
    }, ...prev.slice(0, 4)]);

    setTimeout(() => {
      setIsAttacking(false);
    }, 2000);
  };

  const getEnergyCost = (attack: AttackData) => {
    return parseInt(attack.cost);
  };

  const canUseAttack = (attack: AttackData) => {
    return energy >= getEnergyCost(attack);
  };

  // Função para renderizar resultados de dados complexos
  const renderDiceResultsComplexos = (resultados: Array<{ tipo: string; valores: number[]; total: number }>) => {
    return (
      <div className="space-y-2">
        {resultados.map((resultado, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className="text-sm text-amber-300 mb-1">{resultado.tipo}</div>
            <div className="flex flex-wrap gap-1 justify-center">
              {resultado.valores.map((valor, diceIndex) => (
                <div
                  key={diceIndex}
                  className={`w-6 h-6 rounded border-2 flex items-center justify-center text-xs font-bold ${
                    valor === parseInt(resultado.tipo.split('d')[1])
                      ? 'bg-green-500 border-green-600 text-white' 
                      : valor === 1 
                        ? 'bg-red-500 border-red-600 text-white'
                        : 'bg-amber-100 border-amber-300 text-stone-800'
                  }`}
                >
                  {valor}
                </div>
              ))}
            </div>
            <div className="text-xs text-stone-400 mt-1">
              Total: {resultado.total}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Função para calcular bônus total da perícia
  const calcularBonusPericia = (pericia: { atributoBase: string; proficiente: boolean; periciaDobrada: boolean }) => {
    if (!character) return 0;
    
    const modificadorBase = calcularModificador(
      character.atributos[pericia.atributoBase as keyof typeof character.atributos]
    );
    
    return modificadorBase;
  };

  if (!character) {
    return;
  }

  return (
    <>
      <MedievalNavBarAv />
      <div className="min-h-screen bg-stone-900 text-stone-200 p-4">
        <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
          {/* Coluna esquerda - Personagem */}
          <div className="w-full lg:w-1/3 bg-stone-800/80 border border-amber-600/30 rounded-xl p-6 shadow-lg">
            <div className="flex flex-col items-center">
              {/* GIF do personagem com botões de combate e características */}
              <div className="relative w-48 h-48 mb-4 rounded-full border-4 border-amber-500 overflow-hidden">
                <img 
                  src="/espadas/madeira.gif" 
                  alt="Personagem"
                  className="w-full h-full object-cover"
                />
                
                {/* Botão de Combate */}
                <Dialog open={isCombatOpen} onOpenChange={setIsCombatOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      className="absolute bottom-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-12 h-12 p-0 shadow-lg border-2 border-amber-400"
                      title="Abrir Modo Combate"
                    >
                      ⚔️
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-6xl h-[95vh] bg-stone-800 border-amber-700 text-stone-200">
                    <DialogHeader>
                      <DialogTitle className="text-2xl text-amber-400 text-center">
                        ⚔️ Modo Combate Avançado - {character.nome} ⚔️
                      </DialogTitle>
                    </DialogHeader>
                    
                    <div className="flex flex-col lg:flex-row gap-6 h-full overflow-y-auto">
                      {/* Menu de ataques lateral */}
                      <div className="w-full lg:w-1/4">
                        <Card className="bg-stone-800 border-amber-700">
                          <CardHeader>
                            <CardTitle className="text-amber-400 text-xl">Ataques Disponíveis</CardTitle>
                            <div className="flex items-center gap-2 text-sm">
                              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                              <span>Ação: {energy}/1</span>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            {attacks.map((attack) => (
                              <Button
                                key={attack.id}
                                variant={selectedAttack.id === attack.id ? "default" : "secondary"}
                                disabled={!canUseAttack(attack)}
                                className={`w-full text-left justify-start ${
                                  selectedAttack.id === attack.id 
                                    ? 'bg-amber-700' 
                                    : canUseAttack(attack)
                                      ? 'bg-stone-700 hover:bg-stone-600'
                                      : 'bg-stone-900 opacity-50 cursor-not-allowed'
                                }`}
                                onClick={() => setSelectedAttack(attack)}
                              >
                                <div className="flex flex-col items-start w-full">
                                  <span className="font-bold">{attack.name}</span>
                                  <div className="flex justify-between w-full text-xs opacity-75">
                                    <span>{attack.cost}</span>
                                    <span className="flex items-center gap-1">
                                      <Zap className="w-3 h-3" />
                                      {attack.dados}
                                    </span>
                                  </div>
                                </div>
                              </Button>
                            ))}
                          </CardContent>
                        </Card>

                        {/* Histórico de Rolagens */}
                        <Card className="bg-stone-800 border-amber-700 mt-4">
                          <CardHeader>
                            <CardTitle className="text-amber-400 text-lg">Últimas Rolagens</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2 max-h-40 overflow-y-auto">
                            {historicoRolagens.map((rolagem, index) => (
                              <div key={index} className="text-xs bg-stone-700/50 p-2 rounded">
                                <div className="font-bold">{rolagem.ataque}</div>
                                <div className="flex justify-between">
                                  <span>Total:</span>
                                  <span className="font-bold text-amber-300">{rolagem.total}</span>
                                </div>
                                <div className="text-stone-400 text-xs truncate" title={rolagem.detalhes}>
                                  {rolagem.dados}
                                </div>
                              </div>
                            ))}
                            {historicoRolagens.length === 0 && (
                              <div className="text-center text-stone-500 text-sm">
                                Nenhuma rolagem ainda
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>

                      {/* Área principal com visualização do ataque */}
                      <div className="w-full lg:w-3/4 flex flex-col">
                        <Card className="bg-stone-800 border-amber-700 flex-1">
                          <CardHeader>
                            <CardTitle className="text-amber-400 text-2xl">{selectedAttack.name}</CardTitle>
                            <div className="flex flex-wrap gap-4 text-sm">
                              <p className="text-stone-300">{selectedAttack.description}</p>
                              <p className="text-amber-200">Custo: {selectedAttack.cost}</p>
                              <p className="text-purple-300">Tipo: {selectedAttack.tipo}</p>
                              <p className="text-blue-300 flex items-center gap-1">
                                <Zap className="w-4 h-4" />
                                Dados: {selectedAttack.dados}
                              </p>
                              {selectedAttack.danoAdicional && (
                                <p className="text-green-300 flex items-center gap-1">
                                  <Plus className="w-4 h-4" />
                                  {selectedAttack.danoAdicional}
                                </p>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent className="flex flex-col items-center h-full">
                            {/* Resultado da última rolagem */}
                            {ultimaRolagem && !isAttacking && (
                              <Card className="bg-amber-900/30 border-amber-600 mb-4 w-full">
                                <CardContent className="p-4">
                                  <div className="text-center">
                                    <div className="text-lg font-bold text-amber-300 mb-2">
                                      Resultado Total: {ultimaRolagem.total}
                                    </div>
                                    <div className="text-sm text-stone-300 mb-2">
                                      {ultimaRolagem.detalhes}
                                    </div>
                                    {ultimaRolagem.danoFixo > 0 && (
                                      <div className="text-sm text-green-300 mb-2">
                                        Dano Fixo: +{ultimaRolagem.danoFixo}
                                      </div>
                                    )}
                                    {renderDiceResultsComplexos(ultimaRolagem.resultados)}
                                  </div>
                                </CardContent>
                              </Card>
                            )}

                            {/* Container da animação */}
                            <div className="relative w-full h-64 md:h-80 bg-stone-900 rounded-lg border-2 border-amber-800 flex items-center justify-center overflow-hidden mb-4">
                              {isAttacking ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                  <img 
                                    src={selectedAttack.gif} 
                                    alt={selectedAttack.name} 
                                    className="pixel-art w-full h-full object-contain"
                                  />
                                  <div className="absolute bottom-4 bg-stone-900/80 p-3 rounded-lg border border-amber-600">
                                    <div className="flex items-center gap-2 text-amber-300">
                                      <div className="animate-spin">
                                        <Dice6 className="w-6 h-6" />
                                      </div>
                                      <span>Rolando {selectedAttack.dados}...</span>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <img 
                                    src="/espadas/madeira.gif" 
                                    alt="Guerreiro em posição" 
                                    className="pixel-art h-full object-contain"
                                  />
                                  <div className="absolute bottom-4 left-4 bg-stone-900/80 p-2 rounded border border-amber-700">
                                    <p className="text-stone-100">Pronto para atacar!</p>
                                  </div>
                                </>
                              )}
                            </div>

                            <Button 
                              onClick={handleAttack}
                              disabled={isAttacking || !canUseAttack(selectedAttack)}
                              className="mt-4 bg-amber-700 hover:bg-amber-600 text-stone-900 font-bold py-3 px-8 text-lg disabled:bg-stone-600 disabled:cursor-not-allowed min-w-48"
                            >
                              {isAttacking ? (
                                <div className="flex items-center gap-2">
                                  <div className="animate-spin">
                                    <Dice6 className="w-5 h-5" />
                                  </div>
                                  Rolando...
                                </div>
                              ) : !canUseAttack(selectedAttack) ? (
                                "Ação Insuficiente"
                              ) : (
                                `Usar ${selectedAttack.name}`
                              )}
                            </Button>

                            {!isAttacking && (
                              <div className="mt-4 text-center text-sm text-stone-400">
                                <p>Este ataque usará {selectedAttack.dados} e custará {selectedAttack.cost}</p>
                                {selectedAttack.danoAdicional && (
                                  <p className="text-green-300">Inclui {selectedAttack.danoAdicional} de dano adicional</p>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              {/* Dados do personagem */}
              <div className="text-center space-y-2 w-full">
                <h1 className="text-3xl font-bold text-amber-400 font-serif">{character.nome}</h1>
                <div className="grid grid-cols-2 gap-4 mt-4">

                  <div>
                    <p className="text-sm text-stone-400">Raça</p>
                    <p className="text-xl font-bold">{character.raca}</p>
                  </div>
                  <div>
                    <p className="text-sm text-stone-400">CA</p>
                    <p className="text-xl font-bold">{character.classeArmadura}</p>
                  </div>
                  <div>
                    <p className="text-sm text-stone-400">Deslocamento</p>
                    <p className="text-xl font-bold">{character.deslocamento}m</p>
                  </div>
                  <div>
                    <p className="text-sm text-stone-400">Iniciativa</p>
                    <p className="text-xl font-bold">+{character.iniciativa}</p>
                  </div>
                </div>
                
                {/* Barra de vida com controles */}
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-stone-400">Vida</span>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => diminuirVida(1)}
                        size="sm"
                        variant="outline"
                        className="h-6 w-6 p-0 bg-red-600 hover:bg-red-700 border-red-700"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm font-medium">{character.vida}/{character.vidaMax}</span>
                      <Button
                        onClick={() => aumentarVida(1)}
                        size="sm"
                        variant="outline"
                        className="h-6 w-6 p-0 bg-green-600 hover:bg-green-700 border-green-700"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <Progress 
                    value={(character.vida / character.vidaMax) * 100} 
                    className="h-3 bg-stone-700"
                    style={{ backgroundColor: '#3a3a3a', ['--progress-primary' as any]: '#ef4444' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Coluna direita - Abas de informações */}
          <div className="w-full lg:w-2/3">
            <Tabs defaultValue="atributos" className="bg-stone-800/50 rounded-xl p-4 border border-amber-600/30">
              <TabsList className="grid w-full grid-cols-3 bg-stone-900">
                <TabsTrigger value="atributos" className="font-serif">Atributos</TabsTrigger>
                <TabsTrigger value="pericias" className="font-serif">Perícias</TabsTrigger>
                <TabsTrigger value="equipamentos" className="font-serif">Equipamentos</TabsTrigger>
              </TabsList>
              
              {/* Conteúdo das abas */}
              <TabsContent value="atributos" className="mt-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(character.atributos).map(([atributo, valor]) => {
                    const modificador = calcularModificador(valor);
                    const testeResistencia = character.testesResistencia[atributo as keyof typeof character.testesResistencia];
                    
                    return (
                      <Card key={atributo} className="bg-stone-800 border-amber-600/30">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg capitalize text-amber-400">
                            {atributo.replace(/([A-Z])/g, ' $1').trim()}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="text-3xl font-bold text-center text-purple-400">{valor}</div>
                          <div className="text-center text-sm text-amber-300">
                            {modificador >= 0 ? '+' : ''}{modificador}
                          </div>
                                              
                          <div className="flex justify-center mt-2">
                            <div className="w-12 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>
              
              <TabsContent value="pericias" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {character.pericias.map((pericia, index) => {
                    const bonusTotal = calcularBonusPericia(pericia);
                    
                    return (
                      <Card key={pericia.nome} className="bg-stone-800 border-amber-600/30">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {/* Checkbox de proficiência */}
                            <Checkbox 
                              checked={pericia.proficiente}
                              onCheckedChange={() => toggleProficienciaPericia(index)}
                              className="h-4 w-4 border-amber-400 data-[state=checked]:bg-amber-500 cursor-pointer"
                              title="Proficiente"
                            />
                            
                            {/* Checkbox de perícia dobrada */}
                            <Checkbox 
                              checked={pericia.periciaDobrada}
                              onCheckedChange={() => togglePericiaDobrada(index)}
                              className="h-4 w-4 border-purple-400 data-[state=checked]:bg-purple-500 cursor-pointer"
                              title="Perícia Dobrada (Expertise)"
                            />
                            
                            <span className="font-medium text-purple-400">{pericia.nome}</span>
                          </div>
                          <div className="text-amber-300 flex items-center gap-2">
                            <span>
                              {bonusTotal >= 0 ? '+' : ''}{bonusTotal}
                            </span>
                            <span className="text-xs text-stone-400">
                              ({pericia.atributoBase.substring(0, 3).toUpperCase()})
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>
              
              <TabsContent value="equipamentos" className="mt-6">
                <div className="space-y-4">
                  {Object.entries(character.equipamentos).map(([slot, item]) => (
                    <Card key={slot} className="bg-stone-800 border-amber-600/30">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg capitalize text-amber-400">
                          {slot === 'maos' ? 'Mãos' : 
                           slot === 'pernas' ? 'Pernas' : 'Arma'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex items-center gap-4">
                        {item.gif && (
                          <div className="w-16 h-16 rounded-md overflow-hidden border border-amber-600/50">
                            <img src={item.gif} alt={item.nome} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="text-lg font-medium text-purple-400">{item.nome}</div>
                          {item.propriedades && (
                            <div className="text-sm text-amber-300 mt-1">
                              <strong>Propriedades:</strong> {item.propriedades}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="magias" className="mt-6">

                {/* Lista de Magias */}
                <div className="space-y-4">
                  {character.magias.map((magia, index) => (
                    <Card key={index} className="bg-stone-800 border-purple-600/30">
                      <CardHeader>
                      </CardHeader>
                      <CardContent className="grid gap-2 text-sm">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="font-medium text-amber-300">Tempo de Conjuração</p>
                            <p className="text-stone-300">{magia.tempoConjuracao}</p>
                          </div>
                          <div>
                            <p className="font-medium text-amber-300">Alcance</p>
                            <p className="text-stone-300">{magia.alcance}</p>
                          </div>
                          <div>
                            <p className="font-medium text-amber-300">Componentes</p>
                            <p className="text-stone-300">{magia.componentes}</p>
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="font-medium text-purple-300">Descrição</p>
                          <p className="text-stone-300">{magia.descricao}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
            <Card className="mt-6 bg-stone-800/50 border-amber-600/30">
                          <CardHeader>
                            <CardTitle className="text-amber-400">Caracteristicas Unicas</CardTitle>
                            <CardDescription className="text-red-100">Imunidade a Dano de Frio.<br></br>
                            <br></br>
Audição e Faro Aguçados: O Lobo tem vantagem em Testes de Sabedoria (Percepção - 15 Passivo) relacionados à Audição e ao Olfato.<br></br>
<br></br>
Camuflagem de Neve: O Lobo tem vantagem em testes de Destreza (+3 - Furtividade) feitos em terreno de Neve.<br></br>
<br></br>
Tática de Matilha: O Lobo tem vantagem em jogadas de ataque contra uma criatura se, pelo menos, um dos aliados do lobo estiver a 1,5 metro da criatura e não estiver incapacitado.
</CardDescription>
                          </CardHeader>
                          <CardContent>
                          </CardContent>
                        </Card>
          </div>
        </div>
      </div>
    </>
  );
}
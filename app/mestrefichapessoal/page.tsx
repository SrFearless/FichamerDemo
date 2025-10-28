"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useParams, useRouter } from "next/navigation";
import { getUserIdFromToken } from "@/lib/auth";
import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { MedievalNavBarMs } from "@/components/medieval-navbar-mestre";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { X, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Plus, Minus, Shield, Swords, Heart, Zap, Settings } from "lucide-react";

type CharacterData = {
  nome: string;
  nivel: number;
  classe: string;
  raca: string;
  multiclasse: string;
  proficiencia: number;
  classeArmadura: number;
  deslocamento: number;
  iniciativa: number;
  vida: number;
  vidaMax: number;
  exp: number;
  expMax: number;
  inspiracao: boolean;
  slotsMagia: {
    nivel1: { total: number; usados: number };
    nivel2: { total: number; usados: number };
    nivel3: { total: number; usados: number };
    nivel4: { total: number; usados: number };
  };
  dinheiro: {
    cobre: number;
    prata: number;
    ouro: number;
    platina: number;
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
    cabeca: { nome: string; gif?: string; propriedades?: string };
    torso: { nome: string; gif?: string; propriedades?: string };
    maos: { nome: string; gif?: string; propriedades?: string };
    pernas: { nome: string; gif?: string; propriedades?: string };
    pes: { nome: string; gif?: string; propriedades?: string };
    arma: { nome: string; gif?: string; propriedades?: string };
    arma2: { nome: string; gif?: string; propriedades?: string };
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
  bag: Array<{ nome: string; quantidade: number; gif?: string }>;
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
    name: "Rajada de Disparo",
    description: "Disparo de 3 flechas",
    gif: "/attacks/arrow-shot.gif",
    cost: "1 Ação",
    tipo: "Distância",
    dados: "7d4+6d6+2d10+1d8+15",
    danoAdicional: "+4 (Inimigo Favorito)"
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

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export default function DashboardPage() {
  const [isClient, setIsClient] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
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
  const [danoPersonalizado, setDanoPersonalizado] = useState("");
  const router = useRouter();
  const params = useParams();

  // Dados mockados atualizados com propriedades dos equipamentos
  const mockCharacter: CharacterData = {
    nome: "Ryalar Fearless",
    nivel: 12,
    classe: "Patruleiro",
    raca: "Elfo da Floresta",
    multiclasse: "Ladino / Bruxo",
    proficiencia: calcularProficiencia(11),
    classeArmadura: 20,
    deslocamento: 10.5,
    iniciativa: 5,
    vida: 83,
    vidaMax: 83,
    exp: 115710,
    expMax: 120000,
    inspiracao: false,
    slotsMagia: {
      nivel1: { total: 4, usados: 1 },
      nivel2: { total: 3, usados: 0 },
      nivel3: { total: 2, usados: 2 },
      nivel4: { total: 1, usados: 0 }
    },
    dinheiro: {
      cobre: 0,
      prata: 0,
      ouro: 913,
      platina: 0
    },
    atributos: {
      forca: 10,
      destreza: 20,
      constituicao: 13,
      inteligencia: 8,
      sabedoria: 15,
      carisma: 10
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
      { nome: "Atletismo", atributoBase: "forca", proficiente: true, periciaDobrada: false },
      { nome: "Acrobacia", atributoBase: "destreza", proficiente: false, periciaDobrada: false },
      { nome: "Furtividade", atributoBase: "destreza", proficiente: true, periciaDobrada: true },
      { nome: "Prestidigitação", atributoBase: "destreza", proficiente: true, periciaDobrada: true },
      { nome: "Arcanismo", atributoBase: "inteligencia", proficiente: false, periciaDobrada: false },
      { nome: "História", atributoBase: "inteligencia", proficiente: false, periciaDobrada: false },
      { nome: "Investigação", atributoBase: "inteligencia", proficiente: true, periciaDobrada: false },
      { nome: "Natureza", atributoBase: "inteligencia", proficiente: false, periciaDobrada: false },
      { nome: "Religião", atributoBase: "inteligencia", proficiente: false, periciaDobrada: false },
      { nome: "Intuição", atributoBase: "sabedoria", proficiente: true, periciaDobrada: false },
      { nome: "Lidar com Animais", atributoBase: "sabedoria", proficiente: false, periciaDobrada: false },
      { nome: "Medicina", atributoBase: "sabedoria", proficiente: false, periciaDobrada: false },
      { nome: "Percepção", atributoBase: "sabedoria", proficiente: true, periciaDobrada: true },
      { nome: "Sobrevivência", atributoBase: "sabedoria", proficiente: false, periciaDobrada: false },
      { nome: "Atuação", atributoBase: "carisma", proficiente: false, periciaDobrada: false },
      { nome: "Blefar", atributoBase: "carisma", proficiente: false, periciaDobrada: false },
      { nome: "Intimidação", atributoBase: "carisma", proficiente: true, periciaDobrada: false },
      { nome: "Persuasão", atributoBase: "carisma", proficiente: false, periciaDobrada: false }
    ],
    equipamentos: {
      cabeca: { 
        nome: "Máscara Yagdrassil", 
        gif: "/espadas/capuz.gif",
        propriedades: "Vantagem em Furtividade"
      },
      torso: { 
        nome: "Carcaça Ent do Gelo", 
        gif: "/espadas/capuz.gif",
        propriedades: "CA (19), Furtividade na Neve, Bússulo dos Desejos, Invisibilidade em contato com a Água"
      },
      maos: { 
        nome: "Luvas de Arquearia", 
        gif: "/espadas/capuz.gif",
        propriedades: "+1 para Acertar o Ataque"
      },
      pernas: { 
        nome: "Carcaça Ent do Gelo", 
        gif: "/espadas/capuz.gif",
        propriedades: "-"
      },
      pes: { 
        nome: "Carcaça Ent do Gelo", 
        gif: "/espadas/capuz.gif",
        propriedades: "-"
      },
      arma: { 
        nome: "Alvorecer da Morte", 
        gif: "/espadas/madeira.gif",
        propriedades: "Distância: 4d4, 6d6, 2d10 de dano - Corpo-a-Corpo: 1d12 - Empurra 4,5m (CD 14 - Força) - Gera 6m quadrados de Terreno Escorregadio"
      },
      arma2: { 
        nome: "Adaga de Desmembramento", 
        gif: "/espadas/madeira.gif",
        propriedades: "Corpo-a-Corpo: 1d6 - Vantagem em Teste de Natureza"
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
    ],
    bag: [
      { nome: "Elixir de Precisão", quantidade: 5, gif: "/espadas/madeira.gif" },
      { nome: "Resina de Pinho", quantidade: 3, gif: "/espadas/madeira.gif" },
      { nome: "Caixa Explosiva", quantidade: 1, gif: "/espadas/madeira.gif" },
      { nome: "Mochila", quantidade: 1, gif: "/espadas/madeira.gif" },
      { nome: "Pergaminho Falar com os Mortos", quantidade: 1, gif: "/espadas/madeira.gif" },
      { nome: "Pergaminho (Centro de Treinamento)", quantidade: 1, gif: "/espadas/madeira.gif" },
      { nome: "Pergaminho (???)", quantidade: 1, gif: "/espadas/madeira.gif" },
      { nome: "Pergaminho em Branco", quantidade: 7, gif: "/espadas/madeira.gif" }
    ]
  };

  useEffect(() => {
    setIsClient(true);
    setTimeout(() => {
      setCharacter(mockCharacter);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const verifyAuth = () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const idFromToken = getUserIdFromToken();
        const idFromParams = params?.id ? Number(params.id) : null;

        if (idFromToken && idFromParams && idFromToken !== idFromParams) {
          router.push(`/dashboard/${idFromToken}`);
          return;
        }

        const validId = idFromToken || idFromParams;
        if (!validId || validId === 0) {
          router.push("/login");
          return;
        }

        setUserId(validId);
      } catch (error) {
        router.push("/login");
      }
    };

    verifyAuth();
  }, [isClient, params, router]);

  // Função para atualizar inspiração
  const toggleInspiracao = () => {
    if (character) {
      setCharacter({
        ...character,
        inspiracao: !character.inspiracao
      });
    }
  };

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

  // Funções para modificar dinheiro
  const modificarDinheiro = (tipo: keyof CharacterData['dinheiro'], quantidade: number) => {
    if (character) {
      setCharacter({
        ...character,
        dinheiro: {
          ...character.dinheiro,
          [tipo]: Math.max(0, character.dinheiro[tipo] + quantidade)
        }
      });
    }
  };

  // Funções para modificar quantidade de itens no inventário
  const aumentarQuantidadeItem = (index: number) => {
    if (character) {
      const bagAtualizada = [...character.bag];
      bagAtualizada[index] = {
        ...bagAtualizada[index],
        quantidade: bagAtualizada[index].quantidade + 1
      };
      
      setCharacter({
        ...character,
        bag: bagAtualizada
      });
    }
  };

  const diminuirQuantidadeItem = (index: number) => {
    if (character) {
      const bagAtualizada = [...character.bag];
      bagAtualizada[index] = {
        ...bagAtualizada[index],
        quantidade: Math.max(0, bagAtualizada[index].quantidade - 1)
      };
      
      setCharacter({
        ...character,
        bag: bagAtualizada
      });
    }
  };

  // Função para alternar proficiência nos testes de resistência
  const toggleProficienciaTesteResistencia = (atributo: keyof CharacterData['testesResistencia']) => {
    if (character) {
      const testeAtual = character.testesResistencia[atributo];
      const novoValor = calcularModificador(character.atributos[atributo]) + 
                       (!testeAtual.proficiente ? character.proficiencia : 0);
      
      setCharacter({
        ...character,
        testesResistencia: {
          ...character.testesResistencia,
          [atributo]: {
            valor: novoValor,
            proficiente: !testeAtual.proficiente
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
    
    let bonusProficiencia = 0;
    if (pericia.proficiente) {
      bonusProficiencia = character.proficiencia;
    }
    
    let bonusDobrado = 0;
    if (pericia.periciaDobrada) {
      bonusDobrado = character.proficiencia;
    }
    
    return modificadorBase + bonusProficiencia + bonusDobrado;
  };

  if (!isClient || loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-stone-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-500" />
      </div>
    );
  }

  if (!userId || !character) {
    return null;
  }

  return (
    <>
      <MedievalNavBarMs />
      <div className="min-h-screen bg-stone-900 text-stone-200 p-4">
        <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
          {/* Coluna esquerda - Personagem */}
          <div className="w-full lg:w-1/3 bg-stone-800/80 border border-amber-600/30 rounded-xl p-6 shadow-lg">
            <div className="flex flex-col items-center">
              {/* GIF do personagem com botão de combate */}
              <div className="relative w-48 h-48 mb-4 rounded-full border-4 border-amber-500 overflow-hidden">
                <img 
                  src="https://i.gifer.com/origin/3e/3e5b9a8a5e5b9a8a5e5b9a8a5e5b9a8a5.gif" 
                  alt="Personagem"
                  className="w-full h-full object-cover"
                />
                
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
                    <p className="text-sm text-stone-400">Nível</p>
                    <p className="text-xl font-bold">{character.nivel}</p>
                  </div>
                  <div>
                    <p className="text-sm text-stone-400">Classe</p>
                    <p className="text-xl font-bold">{character.classe}</p>
                  </div>
                  <div>
                    <p className="text-sm text-stone-400">Raça</p>
                    <p className="text-xl font-bold">{character.raca}</p>
                  </div>
                  <div>
                    <p className="text-sm text-stone-400">Multi-Classe</p>
                    <p className="text-xl font-bold">{character.multiclasse}</p>
                  </div>
                  <div>
                    <p className="text-sm text-stone-400">Proficiência</p>
                    <p className="text-xl font-bold">+{character.proficiencia}</p>
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
                
                {/* Barra de experiência */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Experiência</span>
                    <span>{character.exp}/{character.expMax}</span>
                  </div>
                  <Progress 
                    value={(character.exp / character.expMax) * 100} 
                    className="h-3 bg-stone-700"
                    style={{ backgroundColor: '#3a3a3a', ['--progress-primary' as any]: '#3b82f6' }}
                  />
                </div>

                {/* Inspiração com checkbox funcional */}
                <div className="mt-6 flex items-center gap-3 w-full bg-stone-700/50 p-3 rounded-lg border border-amber-500/30">
                  <div className="relative w-10 h-10">
                    <img 
                      src="https://i.gifer.com/7XVB.gif" 
                      alt="Inspiração" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Inspiração</p>
                    <p className="text-xs text-stone-400">Vantagem em testes</p>
                  </div>
                  <Checkbox 
                    checked={character.inspiracao}
                    onCheckedChange={toggleInspiracao}
                    className="h-5 w-5 border-amber-400 data-[state=checked]:bg-amber-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Coluna direita - Abas de informações */}
          <div className="w-full lg:w-2/3">
            <Tabs defaultValue="atributos" className="bg-stone-800/50 rounded-xl p-4 border border-amber-600/30">
              <TabsList className="grid w-full grid-cols-4 bg-stone-900">
                <TabsTrigger value="atributos" className="font-serif">Atributos</TabsTrigger>
                <TabsTrigger value="pericias" className="font-serif">Perícias</TabsTrigger>
                <TabsTrigger value="equipamentos" className="font-serif">Equipamentos</TabsTrigger>
                <TabsTrigger value="magias" className="font-serif">Magias</TabsTrigger>
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
                          
                          <div className="mt-4">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm text-purple-400">Teste Resist.</span>
                              <span className="text-sm font-medium text-purple-400">
                                {testeResistencia.valor >= 0 ? '+' : ''}{testeResistencia.valor}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-stone-400">Proficiente</span>
                              <Checkbox 
                                checked={testeResistencia.proficiente}
                                onCheckedChange={() => toggleProficienciaTesteResistencia(atributo as keyof CharacterData['testesResistencia'])}
                                className="h-4 w-4 border-amber-400 data-[state=checked]:bg-amber-500 cursor-pointer"
                                title="Proficiente em Teste de Resistência"
                              />
                            </div>
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
                           slot === 'pes' ? 'Pés' : 
                           slot === 'torso' ? 'Torso' : 
                           slot === 'cabeca' ? 'Cabeça' : 
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
                {/* Slots de Magia Interativos */}
                <div className="grid grid-cols-4 gap-2 mb-6">
                  {Object.entries(character.slotsMagia).map(([nivel, slot]) => (
                    <div key={nivel} className="bg-stone-800/70 border border-purple-600/30 rounded-lg p-2 text-center">
                      <div className="text-xs text-purple-300 mb-1">
                        {nivel.replace('nivel', '')}º Nível
                      </div>
                      <div className="flex justify-center items-center gap-1 mb-1">
                        {Array.from({ length: slot.total }).map((_, i) => (
                          <div 
                            key={i} 
                            className={`w-6 h-6 rounded-full border-2 cursor-pointer transition-all duration-200 ${
                              i < slot.usados 
                                ? 'bg-purple-500 border-purple-500 hover:bg-purple-400' 
                                : 'border-purple-400 hover:bg-purple-900/50'
                            }`}
                            onClick={() => toggleSlotMagia(nivel as keyof CharacterData['slotsMagia'], i)}
                            title={`Clique para ${i < slot.usados ? 'marcar como não usado' : 'marcar como usado'}`}
                          />
                        ))}
                      </div>
                      <div className="text-xs mt-1 text-stone-400">
                        {slot.usados}/{slot.total} usados
                      </div>
                    </div>
                  ))}
                </div>

                {/* Lista de Magias */}
                <div className="space-y-4">
                  {character.magias.map((magia, index) => (
                    <Card key={index} className="bg-stone-800 border-purple-600/30">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl text-purple-300">{magia.nome}</CardTitle>
                            <CardDescription>
                              {magia.nivel}º nível • {magia.escola}
                            </CardDescription>
                          </div>
                          <span className="bg-purple-900/50 text-purple-300 px-2 py-1 rounded text-sm">
                            Nível {magia.nivel}
                          </span>
                        </div>
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
                          <div>
                            <p className="font-medium text-amber-300">Duração</p>
                            <p className="text-stone-300">{magia.duracao}</p>
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

            {/* Inventário com controles de dinheiro e itens */}
            <Card className="mt-6 bg-stone-800/50 border-amber-600/30">
              <CardHeader>
                <CardTitle className="text-amber-400">Inventário</CardTitle>
                <CardDescription>Itens carregados pelo personagem</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Dinheiro com controles */}
                <div className="grid grid-cols-4 gap-2 mb-6">
                  {Object.entries(character.dinheiro).map(([tipo, valor]) => (
                    <div key={tipo} className="bg-stone-900/50 p-3 rounded-lg border border-amber-600/30">
                      <p className="text-xs text-stone-400 mb-2 capitalize">{tipo}</p>
                      <p className="font-medium text-lg mb-2 text-center">
                        {tipo === 'cobre' && <span className="text-orange-300">{valor} PC</span>}
                        {tipo === 'prata' && <span className="text-gray-100">{valor} PP</span>}
                        {tipo === 'ouro' && <span className="text-amber-400">{valor} PO</span>}
                        {tipo === 'platina' && <span className="text-blue-300">{valor} PL</span>}
                      </p>
                      <div className="flex gap-1 justify-center">
                        <Button
                          onClick={() => modificarDinheiro(tipo as keyof CharacterData['dinheiro'], 10)}
                          size="sm"
                          variant="outline"
                          className="h-6 px-2 text-xs bg-green-700 hover:bg-green-600 border-green-600"
                          title={`Adicionar 10 ${tipo}`}
                        >
                          +10
                        </Button>
                        <Button
                          onClick={() => modificarDinheiro(tipo as keyof CharacterData['dinheiro'], 100)}
                          size="sm"
                          variant="outline"
                          className="h-6 px-2 text-xs bg-green-800 hover:bg-green-700 border-green-700"
                          title={`Adicionar 100 ${tipo}`}
                        >
                          +100
                        </Button>
                        <Button
                          onClick={() => modificarDinheiro(tipo as keyof CharacterData['dinheiro'], -10)}
                          size="sm"
                          variant="outline"
                          className="h-6 px-2 text-xs bg-red-700 hover:bg-red-600 border-red-600"
                          title={`Remover 10 ${tipo}`}
                        >
                          -10
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Itens com controles de quantidade */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {character.bag.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-stone-900/50 rounded-lg border border-stone-700">
                      <div className="flex items-center gap-3 flex-1">
                        {item.gif && (
                          <div className="w-12 h-12 rounded-md overflow-hidden border border-amber-600/50">
                            <img src={item.gif} alt={item.nome} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="font-medium text-purple-400">{item.nome}</div>
                          <div className="text-sm text-stone-400">Quantidade: {item.quantidade}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => diminuirQuantidadeItem(index)}
                          size="sm"
                          variant="outline"
                          className="h-6 w-6 p-0 bg-red-600 hover:bg-red-700 border-red-700"
                          title="Remover 1"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Button
                          onClick={() => aumentarQuantidadeItem(index)}
                          size="sm"
                          variant="outline"
                          className="h-6 w-6 p-0 bg-green-600 hover:bg-green-700 border-green-700"
                          title="Adicionar 1"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6 bg-stone-800/50 border-amber-600/30">
              <CardHeader>
                <CardTitle className="text-amber-400">Anotações</CardTitle>
                <CardDescription>Registre informações importantes sobre sua campanha</CardDescription>
              </CardHeader>
              <CardContent>
                <textarea 
                  className="w-full h-32 bg-stone-900/50 border border-stone-700 rounded p-3 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  placeholder="
Possiveis Companheiros:

Derik (O Manco)

Volibear (Antigo membro da Guilda)

Sieghart (Companheiro de Vida, e Melhor amigo)

Xandão (Capitão da Guarda de Severen)

Twrion (Gigante de Gelo)

Storm (Companheiro Falecido)

Lee kume (Companheiro Atual)

Braum (Taverneiro com uma dívida Eterna)

Ronan (Companheiro Lobo)

Rodolfo (Companheiro Rato)

Sr. Dorian (Vendedor de Máscaras)

Gaitan (Amigo de Braum)

Urfar (Armeiro de Kaer Mohen)

Dama da Noite (Resposta para tudo)

Gepeto (Serviço Protótipo)

Edgar(Runas de Esgaroch)

Grinnar(Comandante de Esgaroch)

--------------------------------

Cidade de Kaer Mohen - Subúrbios entrada subterrâneo 

Cidade Isengard - Especialista em Arcos e Bestas (Iorvvet - Dono da Loja)

Cidade Funf Turme - Especialista em Arcos e Bestas (??? - Dono da Loja)

Trecho de Kaer Mohen - Caverna escondida na Montanha, Local de Experimento

Cidade de Severem: Mercado Clandestino - Pomada para Hemorroida para o Homem com cachimbo no Beco

Carta: Ex nobre que jurou Vingança pelo roubo que Ryalar e os The Union fizeram contra ele.

Cidade de Esgaroch: Contratando serviço dos 2 Braços Artificiais (Gepeto) e Runa para os Olhos de Yets (Edgar)

Braços: 2 Dias / 1000 Peças de Ouro / Recuperar Capacete Yagdrassil

Levar ao Edgar o Capacete Yagdrassil

Runa do Olho: 7 Dias / 1000 Peças de Ouro / 

--------------------------------

Missões:

Informativo da Localidade dos Gigantes de Gelo:
(Esgaroch: 1 Gigante de Gelo)
(Castelo Scygga: 5 Gigante de Gelo)
(Eins Turme: 2 Gigante de Gelo)

Recrutar os Gigantes de Gelo para seu Rei por meio da Cúpula de Comunicação:
(Kaer Mohen: 4 Gigantes de Gelo)

Desvendar os Pergaminhos, Livros e Medalhão dos Guerreiros de Dragões.

Levar em Segurança o Mercador para o Castelo de Stygga. (Fracasso)

--------------------------------

Daqui 30 dias terá o golpe vingativo, na troca de carroça

Dia 05/01 Inicio do Acordo - Dia 07/02 Colocar em Pratica

Dia 06/01 - Storm e a Ogra do Estabulo

Dia 07/01 - Dia (1) na Fortaleza, servindo ao Super Xandão

Dia 08/01 - Dia (2) na Fortaleza, Briga com o Javali/Crocodilo/Lince

Dia 09/01 - Dia (3) na Fortaleza, Entrando na Floresta

Dia 10/01 - Dia (4) na Fortaleza, Cavalo sumiu do Storm

Dia 11/01 - Dia (5) na Fortaleza, Trabalho concluido

Dia 12/01 - Dia (1) Viajando pela Floresta, Luta contras as Formigas/Vespas

Dia 13/01 - Dia (2) Viajando pela Floresta, Nada acontece

Dia 14/01 - Dia (3) Viajando pela Floresta, Subindo no Ninho de Vespa

Dia 15/01 - Dia (4) Viajando pela Floresta, Minha Sorte é: Buscar minha Vingança agora irá trazer minha morte.
Algo veê através dos meus olhos e está empolgado e com alta expectativa ao meu respeito.

Dia 16/01 - Dia (5) Viajando pela Floresta, Enfrentando os Goblins no Acampamento

Dia 17/01 - Dia (6) Viajando pela Floresta, Perdemos o Marcelo Hornes

Dia 18/01 - Dia (7) Viajando pela Floresta, Encontrei o Shao Linfox

Dia 19/01 - Dia (8) Viajando pela Floresta, Ruinas enfrentando o Grifo

Dia 20/01 - Dia (9) Viajando pela Floresta, Saindo da Floresta

Dia 21/01 - Enfrentando Hydra na Entrada

Dia 22/01 - Bebendo na Taverna, e se Preparando para entrar no Abismo

Dia 23/01 - Entrando no Abismo

Dia 24/01 - Emboscada das Aranhas

Dia 25/01 - Dormindo com a Medusa

Dia 26/01 - Batalha contra Minotauro e Lacaios

Dia 27/01 - Boss Fight (Recebo Carta)

Dia 28/01 - Dormindo na Taverna, Storm se Divertindo

Dia 29/01 - Voltando para Severem, Litorando

Dia 30/01 - Voltando para Severem, Fight contra as imperatrizes

Dia 31/01 - Voltando para Severem, Velha Lin (Mercadora)

Dia 01/02 - Voltando para Severem, Evento com os Lobos

Dia 02/02 - Voltando para Severem, Evento com os Lobos (Gibão do Rei dos Lobos)

Dia 03/02 - Voltando para Severem, Evento com os Sapos Ninjas

Dia 04/02 - Voltando para Severem, Evento com a Esmaga Crânios

Dia 05/02 - Voltando para Severem, Evento com a Carroça armada

Dia 06/02 - Voltando para Severem, Novo plano em ação: Matar Xandão ou Negociar e salvar os Humanos e Anões

Dia 07/02 - Cidade Citiada, Matando Xandão

Dia 08/02 - Fugindo da Cidade Citiada, Ruinas de um Escriba

Dia 09/02 - Fugindo da Cidade Citiada, Enfrentando Quimera (Leão)

Dia 10/02 - Fugindo da Cidade Citiada, Carcaças cheia de corvos Sobrevoando

Dia 11/02 - Fugindo da Cidade Citiada, Desastre com os sobreviventes nas Pedras 

Dia 12/02 - Fugindo da Cidade Citiada, Braum dando um Show de Massacre

Dia 13/02 - Fugindo da Cidade Citiada, Último dia Viajando dia e noite

Dia 14/02 - Isengard Destruída, procurando sobreviventes

Dia 15/02 - Isengard Destruída, Dormindo no esconderijo após achar Iorvvet

Dia 16/02 - Isengard Destruída, Caçador de Recompensa e Roupas Finas

Dia 17/02 - Navegando na Corveta, Enfrentando os Abissais

Dia 18/02 - Navegando na Corveta, Gigantes de Gelo

Dia 19/02 - Navegando na Corveta, Firmar o acordo e Celebração

Dia 20/02 - Navegando na Corveta, Curando a Ressaca

Dia 21/02 - Chegando em Funf Turme, Misterio na taverna de Braum

Dia 22/02 - Chegando em Funf Turme, Morte de Storm

Dia 23/02 - Chegando em Funf Turme, Descansando para se Recuperar

Dia 24/02 - Chegando em Funf Turme, Conhecendo Lee Kume e buscando virar Guarda-Costas

Dia 25/02 - Chegando em Funf Turme, Se Banhando e Aceitando o contrato de Guarda-Costas 

Dia 26/02 - Chegando em Funf Turme, Após lutar com Ursines e Yetis e descanso  na Taverna

Dia 27/02 - Funf Turme, se Recuperando e se Fortificando

Dia 28/02 - Funf Turme, Buscando Arco, Armadura e Luva

Dia 29/02 - Funf Turme, Assassinando o Armeiro e fugindo da Cidade

Dia 30/02 - Caminho até Kaer Mohen, Passando pela cidade Esgaroth

Dia 31/02 - Caminho até Kaer Mohen, Explorando caverna de Experimentos

Dia 01/03 - Caminho até Kaer Mohen, Lider dos Yetis aparece 

Dia 02/03 - Caminho até Kaer Mohen, Dona da Noite

Dia 03/03 - Caminho até Kaer Mohen, Jogos de apostas - Campeão: 22     Lee kume: 35

Dia 04/03 - Kaer Mohen, 3 Dias para fazer as melhorias: Capacete, Armadura p/ Lobo, Dentadura p/ Lobo.

Dia 05/03 - Kaer Mohen Subúrbios, Enfrentando um Treco Cabeçudo, Mímico e depois Descansando.

Dia 06/03 - Kaer Mohen, Enfrentando um Parede Rosa, resolvemos Puzzle e salvamento dos 4 Gigantes de Gelo.

Dia 07/03 - Kaer Mohen, Perca de Braço-Direito e buscando Armadura.

Dia 08/03 - Kaer Mohen, Descansando e se armando.

Dia 09/03 - Saindo de Kaer Mohen, Lutando com os 20 Carniçais.

Dia 10/03 - Saindo de Kaer Mohen, Carroça do Coveiro 

Dia 11/03 - Saindo de Kaer Mohen, Mercador de Frutas

Dia 12/03 - Saindo de Kaer Mohen, Família de Trolls e perdendo Braço-Esquerdo

Dia 13/03 - Saindo de Kaer Mohen, Ettercaps

Dia 14/03 - Saindo de Kaer Mohen, Comerciantes de Fertilizantes

Dia 15/03 - Chegando Esgaroch, Árvore Anciã

Dia 16/03 - Chegando Esgaroch, Dormindo na Taverna

Dia 17/03 - Chegando Esgaroch, Contratando serviço dos 2 Braços Artificiais (Gepeto) e Runa para os Olhos de Yets (Edgar)

Dia 18/03 - Esgaroch, Falando com Grinnar sobre a busca pelo culpado

Dia 19/03 - Esgaroch, Descobrindo meu animal interior

Dia 20/03 - Esgaroch, Conversamos com o criminoso na cela e Aceitando a missão de ir para Castelo de Stigga

Dia 21/03 - Esgaroch, indo na cidade subterrânea para descobrir sobre a (Noite da Yenas)

Dia 22/03 - Esgaroch, Entregando Árvore Anciã, Matando ferreiro da cidade e Apostando na Arena de Lutas

Dia 23/03 - Esgaroch, Voltando para superfície, reparando a mochila, pegando os Protótipos de braço e costurando Armadura

Dia 24/03 - Esgaroch, Pegando suprimentos e partindo para Castelo de Stigga

Dia 25/03 - Indo para Castelo de Stigga, 1 dia, Nevasca e Caverna

Dia 26/03 - Indo para Castelo de Stigga, 2 dia, Luta do Lee kume

Dia 27/03 - Indo para Castelo de Stigga, 3 dia, Luta contra as vinhas controladares

Dia 27/03 - Indo para Castelo de Stigga, 4 dia, Carta e Vila Estranha

Dia 27/03 - Indo para Castelo de Stigga, 5 dia, Luta contra as (Aranhas) 
"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
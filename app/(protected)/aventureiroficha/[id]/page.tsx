"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useParams, useRouter } from "next/navigation";
import { getUserIdFromToken } from "@/lib/auth";
import { decodeJwt } from "jose"
import { toast } from "sonner"
import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { MedievalNavBarAv } from "@/components/medieval-navbar-aventureiro";

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
  }[];
  equipamentos: {
    cabeca: { nome: string; gif?: string };
    torso: { nome: string; gif?: string };
    maos: { nome: string; gif?: string };
    pernas: { nome: string; gif?: string };
    pes: { nome: string; gif?: string };
    arma: { nome: string; gif?: string };
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

const calcularModificador = (valor: number): number => {
  return Math.floor((valor - 10) / 2);
};

const calcularProficiencia = (nivel: number): number => {
  return Math.max(2, Math.floor(1 + nivel / 4));
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export default function DashboardPage() {
  const [isClient, setIsClient] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [character, setCharacter] = useState<CharacterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasSelectedCharacter, setHasSelectedCharacter] = useState(false);
  const router = useRouter();
  const params = useParams();
      
  const handleTavernaClick = () => {
    try {
      const token = localStorage.getItem("token")
      
      if (!token) {
        toast.error("Você precisa estar logado para entrar na taverna")
        return
      }

      const decoded = decodeJwt(token) as { id: number }
      
      if (decoded.id && decoded.id > 0) {
        router.push(`/aventureirotaverna/${decoded.id}`)
      } else {
        throw new Error("ID de usuário inválido")
      }
    } catch (err) {
      toast.error("Falha ao acessar a taverna: " + (err instanceof Error ? err.message : "Erro desconhecido"))
    }
  }
  // Dados mockados seguindo D&D 5e
  const mockCharacter: CharacterData = {
    nome: "Ryalar Fearless",
    nivel: 11,
    classe: "Patruleiro",
    raca: "Elfo da Floresta",
    multiclasse: "Ladino / Bruxo",
    proficiencia: calcularProficiencia(11),
    classeArmadura: 18,
    deslocamento: 14.5,
    iniciativa: 5,
    vida: 78,
    vidaMax: 78,
    exp: 4500,
    expMax: 6000,
    inspiracao: true,
    slotsMagia: {
      nivel1: { total: 4, usados: 1 },
      nivel2: { total: 3, usados: 0 },
      nivel3: { total: 2, usados: 2 },
      nivel4: { total: 1, usados: 0 }
    },
    dinheiro: {
      cobre: 0,
      prata: 0,
      ouro: 10,
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
      forca: { valor: calcularModificador(10) + (true ? calcularProficiencia(11) : 0), proficiente: false },
      destreza: { valor: calcularModificador(20) + (true ? calcularProficiencia(11) : 0), proficiente: true },
      constituicao: { valor: calcularModificador(13) + (false ? calcularProficiencia(11) : 0), proficiente: false },
      inteligencia: { valor: calcularModificador(8) + (false ? calcularProficiencia(11) : 0), proficiente: false },
      sabedoria: { valor: calcularModificador(15) + (true ? calcularProficiencia(11) : 0), proficiente: true },
      carisma: { valor: calcularModificador(10) + (false ? calcularProficiencia(11) : 0), proficiente: false }
    },
    pericias: [
      { nome: "Atletismo", atributoBase: "forca", proficiente: false },
      { nome: "Acrobacia", atributoBase: "destreza", proficiente: true },
      { nome: "Furtividade", atributoBase: "destreza", proficiente: true },
      { nome: "Prestidigitação", atributoBase: "destreza", proficiente: false },
      { nome: "Arcanismo", atributoBase: "inteligencia", proficiente: true },
      { nome: "História", atributoBase: "inteligencia", proficiente: false },
      { nome: "Investigação", atributoBase: "inteligencia", proficiente: true },
      { nome: "Natureza", atributoBase: "inteligencia", proficiente: true },
      { nome: "Religião", atributoBase: "inteligencia", proficiente: false },
      { nome: "Intuição", atributoBase: "sabedoria", proficiente: true },
      { nome: "Lidar com Animais", atributoBase: "sabedoria", proficiente: true },
      { nome: "Medicina", atributoBase: "sabedoria", proficiente: true },
      { nome: "Percepção", atributoBase: "sabedoria", proficiente: true },
      { nome: "Sobrevivência", atributoBase: "sabedoria", proficiente: true },
      { nome: "Atuação", atributoBase: "carisma", proficiente: false },
      { nome: "Blefar", atributoBase: "carisma", proficiente: false },
      { nome: "Intimidação", atributoBase: "carisma", proficiente: false },
      { nome: "Persuasão", atributoBase: "carisma", proficiente: false }
    ],
    equipamentos: {
      cabeca: { nome: "Capuz do Ladino", gif: "/espadas/madeira.gif" },
      torso: { nome: "Armadura de Couro Reforçado", gif: "https://i.gifer.com/7XV9.gif" },
      maos: { nome: "Luvas de Furtividade", gif: "https://i.gifer.com/7XV8.gif" },
      pernas: { nome: "Calças de Viagem", gif: "https://i.gifer.com/7XV7.gif" },
      pes: { nome: "Botas Silenciosas", gif: "https://i.gifer.com/7XV6.gif" },
      arma: { nome: "Espada de Madeira", gif: "/espadas/madeira.gif"}
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
      { nome: "Poção de Cura", quantidade: 3, gif: "https://i.gifer.com/7XV5.gif" },
      { nome: "Kit de Ladrão", quantidade: 1, gif: "https://i.gifer.com/7XV4.gif" },
      { nome: "Mapa da Cidade", quantidade: 1, gif: "https://i.gifer.com/7XV3.gif" }
    ]
  };

  useEffect(() => {
    setIsClient(true);
    
    // Verifica se há um personagem selecionado (simulação)
    // Na implementação real, você verificaria no localStorage ou API
    const selectedCharacter = localStorage.getItem('selectedCharacter');
    
    if (selectedCharacter) {
      setHasSelectedCharacter(true);
      // Simulando carregamento de dados
      setTimeout(() => {
        setCharacter(mockCharacter);
        setLoading(false);
      }, 1000);
    } else {
      setHasSelectedCharacter(false);
      setLoading(false);
    }
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

  if (!isClient || loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-stone-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-500">
        </div>
      </div>
    );
  }

  if (!userId) {
    return null;
  }

  return (
    <>
      <MedievalNavBarAv />
      <div className="min-h-screen bg-stone-900 text-stone-200 p-4">
        {hasSelectedCharacter ? (
          /* Layout principal quando há personagem selecionado */
          <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
            {/* Coluna esquerda - Personagem (Desktop) ou topo (Mobile) */}
            <div className="w-full lg:w-1/3 bg-stone-800/80 border border-amber-600/30 rounded-xl p-6 shadow-lg">
              <div className="flex flex-col items-center">
                {/* GIF do personagem */}
                <div className="w-48 h-48 mb-4 rounded-full border-4 border-amber-500 overflow-hidden">
                  <img 
                    src="/mobsexemplo.gif" 
                    alt="Personagem"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Dados do personagem */}
                <div className="text-center space-y-2 w-full">
                  <h1 className="text-3xl font-bold text-amber-400 font-serif">{character?.nome}</h1>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-stone-400">Nível</p>
                      <p className="text-xl font-bold">{character?.nivel}</p>
                    </div>
                    <div>
                      <p className="text-sm text-stone-400">Classe</p>
                      <p className="text-xl font-bold">{character?.classe}</p>
                    </div>
                    <div>
                      <p className="text-sm text-stone-400">Raça</p>
                      <p className="text-xl font-bold">{character?.raca}</p>
                    </div>
                    <div>
                      <p className="text-sm text-stone-400">Multi-Classe</p>
                      <p className="text-xl font-bold">{character?.multiclasse}</p>
                    </div>
                    <div>
                      <p className="text-sm text-stone-400">Proficiência</p>
                      <p className="text-xl font-bold">+{character?.proficiencia}</p>
                    </div>
                    <div>
                      <p className="text-sm text-stone-400">CA</p>
                      <p className="text-xl font-bold">{character?.classeArmadura}</p>
                    </div>
                    <div>
                      <p className="text-sm text-stone-400">Deslocamento</p>
                      <p className="text-xl font-bold">{character?.deslocamento}m</p>
                    </div>
                    <div>
                      <p className="text-sm text-stone-400">Iniciativa</p>
                      <p className="text-xl font-bold">+{character?.iniciativa}</p>
                    </div>
                  </div>
                  
                  {/* Barra de vida */}
                  <div className="mt-6">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Vida</span>
                      <span>{character?.vida}/{character?.vidaMax}</span>
                    </div>
                    <Progress 
                      value={(character ? (character.vida / character.vidaMax) * 100 : 0)} 
                      className="h-3 bg-stone-700"
                      style={{ backgroundColor: '#3a3a3a', ['--progress-primary' as any]: '#ef4444' }}
                    />
                  </div>
                  
                  {/* Barra de experiência */}
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Experiência</span>
                      <span>{character?.exp}/{character?.expMax}</span>
                    </div>
                    <Progress 
                      value={(character ? (character.exp / character.expMax) * 100 : 0)} 
                      className="h-3 bg-stone-700"
                      style={{ backgroundColor: '#3a3a3a', ['--progress-primary' as any]: '#3b82f6' }}
                    />
                  </div>

                  {/* Inspiração */}
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
                      checked={character?.inspiracao || false}
                      className="h-5 w-5 border-amber-400 data-[state=checked]:bg-amber-500"
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
                    {character && Object.entries(character.atributos).map(([atributo, valor]) => {
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
                                <div className={`w-4 h-4 rounded-full border ${testeResistencia.proficiente ? 'bg-amber-400 border-amber-400' : 'border-amber-400'}`}></div>
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
                    {character?.pericias.map((pericia) => {
                      const modificadorBase = calcularModificador(character.atributos[pericia.atributoBase as keyof typeof character.atributos]);
                      const bonusProficiencia = pericia.proficiente ? character.proficiencia : 0;
                      const total = modificadorBase + bonusProficiencia;
                      
                      return (
                        <Card key={pericia.nome} className="bg-stone-800 border-amber-600/30">
                          <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center">
                              {pericia.proficiente ? (
                                <div className="w-3 h-3 bg-amber-400 rounded-full mr-2"></div>
                              ) : (
                                <div className="w-3 h-3 border border-amber-400 rounded-full mr-2"></div>
                              )}
                              <span className="font-medium text-purple-400">{pericia.nome}</span>
                            </div>
                            <div className="text-amber-300">
                              {total >= 0 ? '+' : ''}{total}
                              <span className="text-xs text-stone-400 ml-1">
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
                    {character && Object.entries(character.equipamentos).map(([slot, item]) => (
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
                          <div className="text-lg font-medium text-purple-400">{item.nome}</div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="magias" className="mt-6">
                  {/* Slots de Magia */}
                  <div className="grid grid-cols-4 gap-2 mb-6">
                    {character?.slotsMagia && Object.entries(character.slotsMagia).map(([nivel, slot]) => (
                      <div key={nivel} className="bg-stone-800/70 border border-purple-600/30 rounded-lg p-2 text-center">
                        <div className="text-xs text-purple-300 mb-1">
                          {nivel.replace('nivel', '')}º Nível
                        </div>
                        <div className="flex justify-center items-center gap-1">
                          {Array.from({ length: slot.total }).map((_, i) => (
                            <div 
                              key={i} 
                              className={`w-3 h-3 rounded-full border ${i < slot.usados ? 'bg-purple-500 border-purple-500' : 'border-purple-400'}`}
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
                    {character?.magias.map((magia, index) => (
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

              {/* Seção de Bag */}
              <Card className="mt-6 bg-stone-800/50 border-amber-600/30">
                <CardHeader>
                  <CardTitle className="text-amber-400">Inventário</CardTitle>
                  <CardDescription>Itens carregados pelo personagem</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Dinheiro */}
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    <div className="bg-stone-900/50 p-2 rounded text-center border border-amber-600/30">
                      <p className="text-xs text-stone-400">Cobre</p>
                      <p className="font-medium text-orange-300">{character?.dinheiro.cobre} PC</p>
                    </div>
                    <div className="bg-stone-900/50 p-2 rounded text-center border border-amber-600/30">
                      <p className="text-xs text-stone-400">Prata</p>
                      <p className="font-medium text-gray-100">{character?.dinheiro.prata} PP</p>
                    </div>
                    <div className="bg-stone-900/50 p-2 rounded text-center border border-amber-600/30">
                      <p className="text-xs text-stone-400">Ouro</p>
                      <p className="font-medium text-amber-400">{character?.dinheiro.ouro} PO</p>
                    </div>
                    <div className="bg-stone-900/50 p-2 rounded text-center border border-amber-600/30">
                      <p className="text-xs text-stone-400">Platina</p>
                      <p className="font-medium text-blue-300">{character?.dinheiro.platina} PL</p>
                    </div>
                  </div>
                  
                  {/* Itens */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {character?.bag.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-stone-900/50 rounded-lg border border-stone-700">
                        {item.gif && (
                          <div className="w-12 h-12 rounded-md overflow-hidden border border-amber-600/50">
                            <img src={item.gif} alt={item.nome} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-purple-400">{item.nome}</div>
                          <div className="text-sm text-stone-400">Quantidade: {item.quantidade}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Seção de ações */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button className="bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 py-6 text-lg font-bold">
                  Editar Personagem
                </Button>
                <Button className="bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-600 hover:to-purple-500 py-6 text-lg font-bold">
                  Exportar Ficha
                </Button>
              </div>

              {/* Notas do Mestre */}
              <Card className="mt-6 bg-stone-800/50 border-amber-600/30">
                <CardHeader>
                  <CardTitle className="text-amber-400">Anotações</CardTitle>
                  <CardDescription>Registre informações importantes sobre sua campanha</CardDescription>
                </CardHeader>
                <CardContent>
                  <textarea 
                    className="w-full h-32 bg-stone-900/50 border border-stone-700 rounded p-3 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    placeholder="Escreva suas anotações aqui..."
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* Mensagem quando não há personagem selecionado */
          <div className="fixed inset-0 flex items-center justify-center bg-stone-900/80 backdrop-blur-sm z-50">
            <div className="bg-stone-800/90 border border-amber-600/30 rounded-xl p-8 max-w-md text-center">
              <h2 className="text-2xl font-bold text-amber-400 mb-4">Nenhum personagem selecionado</h2>
              <p className="text-stone-300 mb-6">
                Por favor, selecione um personagem na taverna para visualizar esta ficha.
              </p>
              <Button 
                  onClick={handleTavernaClick}
                  className="bg-amber-700 hover:bg-amber-600 text-white px-4 py-2 rounded">
                Ir para a Taverna
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
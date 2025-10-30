"use client";

import { useState, useEffect } from "react";
import { Sword, ScrollText, Clock, Coins, PlusCircle, Map, X, ZoomIn } from "lucide-react";
import { toast } from "sonner";
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { MedievalNavBarAv } from "@/components/medieval-navbar-aventureiro";

type Missao = {
  id: number;
  titulo: string;
  descricao: string;
  recompensa: string;
  tempo: string;
  disponivel: boolean;
  personagem: string;
};

type Mapa = {
  id: number;
  nome: string;
  descricao: string;
  miniatura: string;
  imagemCompleta: string;
  tags: string[];
};

export default function MissoesPage() {
  const [missoes, setMissoes] = useState<Missao[]>([]);
  const [mapas, setMapas] = useState<Mapa[]>([]);
  const [loading, setLoading] = useState(false);
  const [missaoSelecionada, setMissaoSelecionada] = useState<Missao | null>(null);
  const [mapaSelecionado, setMapaSelecionado] = useState<Mapa | null>(null);
  const [mostrarDetalhesModal, setMostrarDetalhesModal] = useState(false);
  const [mostrarMapaModal, setMostrarMapaModal] = useState(false);
  const [novaMissao, setNovaMissao] = useState({
    titulo: "",
    descricao: "",
    recompensa: "",
    tempo: "",
    personagem: "",
  });
  const [personagens, setPersonagens] = useState<string[]>([]);
  const [abaAtiva, setAbaAtiva] = useState<"missoes" | "mapas">("missoes");

  // Simulação de dados iniciais
  useEffect(() => {
    setLoading(true);
    
    // Simula carregamento de dados
    setTimeout(() => {
      const missoesSimuladas: Missao[] = [
        {
          id: 1,
          titulo: "Transporte em Segurança",
          descricao: "Levar em Segurança o Mercador para o Castelo de Stygga.",
          recompensa: "3000 peças de ouro",
          tempo: "5-8 dias",
          disponivel: false,
          personagem: "Ryalar Fearless"
        },
        {
          id: 2,
          titulo: "Gigantes de Gelo",
          descricao: "Recrutar os Gigantes de Gelo para seu Rei por meio da Cúpula de Comunicação, Informativo da Localidade dos Gigantes de Gelo: (Esgaroch: 1 Gigante de Gelo) (Castelo Scygga: 5 Gigantes de Gelo) (Eins Turme: 2 Gigantes de Gelo) (Kaer Mohen: 4 Gigantes de Gelo)",
          recompensa: "Aliança com Rei dos Gigantes de Gelo",
          tempo: "indeterminados dias",
          disponivel: true,
          personagem: "Ryalar Fearless"
        },
        {
          id: 3,
          titulo: "Investigar Ruínas Antigas",
          descricao: "Desvendar os Pergaminhos, Livros e Medalhão dos Guerreiros de Dragões.",
          recompensa: "???",
          tempo: "indeterminados dias",
          disponivel: true,
          personagem: "Ryalar Fearless"
        }
      ];

      const mapasSimulados: Mapa[] = [
        {
          id: 1,
          nome: "Continente - Heissundkalt",
          descricao: "Mapa completo do continente mostrando todas as cidades e reinos",
          miniatura: "/2.jpg",
          imagemCompleta: "/2.jpg",
          tags: ["Continente", "Cidades", "Reinos"]
        },
        {
          id: 2,
          nome: "Continente - Freljord",
          descricao: "Mapa completo do continente mostrando todas as cidades e reinos",
          miniatura: "/1.jpg",
          imagemCompleta: "/1.jpg",
          tags: ["Castelo", "Fortaleza", "Stygga"]
        }
      ];

      setMissoes(missoesSimuladas);
      setMapas(mapasSimulados);
      setPersonagens(["Ryalar Fearless"]);
      setLoading(false);
    }, 1000);
  }, []);

  // Função para adicionar nova missão
  const handleAdicionarMissao = () => {
    if (!novaMissao.titulo || !novaMissao.descricao || !novaMissao.personagem) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const novaMissaoObj: Missao = {
      id: missoes.length + 1,
      titulo: novaMissao.titulo,
      descricao: novaMissao.descricao,
      recompensa: novaMissao.recompensa || "A definir",
      tempo: novaMissao.tempo || "A definir",
      disponivel: true,
      personagem: novaMissao.personagem
    };

    setMissoes([...missoes, novaMissaoObj]);
    
    // Reset form
    setNovaMissao({
      titulo: "",
      descricao: "",
      recompensa: "",
      tempo: "",
      personagem: "",
    });

    toast.success("Missão criada com sucesso!");
  };

  // Função para aceitar missão
  const handleAceitarMissao = (missaoId: number) => {
    setMissoes(missoes.map(missao => 
      missao.id === missaoId 
        ? { ...missao, disponivel: false }
        : missao
    ));
    setMissaoSelecionada(null);
    toast.success("Missão aceita! Boa sorte, aventureiro!");
  };

  // Função para recusar missão
  const handleRecusarMissao = () => {
    setMissaoSelecionada(null);
    toast.info("Missão recusada");
  };

  // Função para abrir mapa em tela cheia
  const handleAbrirMapa = (mapa: Mapa) => {
    setMapaSelecionado(mapa);
    setMostrarMapaModal(true);
  };

  // Agrupar missões por personagem
  const missoesPorPersonagem = missoes.reduce((acc: Record<string, Missao[]>, missao) => {
    if (!acc[missao.personagem]) acc[missao.personagem] = [];
    acc[missao.personagem].push(missao);
    return acc;
  }, {});

  return (
    <>
      <MedievalNavBarAv />
      <div className="container mx-auto px-4 py-6 bg-stone-900 min-h-screen relative">
        {/* Botão para abrir modal de nova missão */}
        <div className="absolute top-6 right-6">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-amber-700 hover:bg-amber-600 text-stone-100 flex gap-2">
                <PlusCircle className="w-5 h-5" /> Nova Missão
              </Button>
            </DialogTrigger>

            <DialogContent className="bg-stone-800 border-amber-600 text-stone-200">
              <DialogHeader>
                <DialogTitle className="text-amber-400 text-lg font-serif">
                  Criar Nova Missão
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <label className="block text-stone-300 mb-1">Personagem</label>
                  <Select
                    onValueChange={(v) => setNovaMissao({ ...novaMissao, personagem: v })}
                    value={novaMissao.personagem}
                  >
                    <SelectTrigger className="bg-stone-900 border-amber-600 text-stone-200">
                      <SelectValue placeholder="Selecione o personagem" />
                    </SelectTrigger>
                    <SelectContent className="bg-stone-900 border-amber-600 text-stone-200">
                      {personagens.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-stone-300 mb-1">Título *</label>
                  <Input
                    value={novaMissao.titulo}
                    onChange={(e) => setNovaMissao({ ...novaMissao, titulo: e.target.value })}
                    className="bg-stone-900 border-amber-600 text-stone-200"
                    placeholder="Nome da missão"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 mb-1">Descrição *</label>
                  <Textarea
                    value={novaMissao.descricao}
                    onChange={(e) => setNovaMissao({ ...novaMissao, descricao: e.target.value })}
                    className="bg-stone-900 border-amber-600 text-stone-200"
                    placeholder="Detalhes da missão..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-stone-300 mb-1">Recompensa</label>
                    <Input
                      value={novaMissao.recompensa}
                      onChange={(e) => setNovaMissao({ ...novaMissao, recompensa: e.target.value })}
                      className="bg-stone-900 border-amber-600 text-stone-200"
                      placeholder="Ex: 500 peças de ouro"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-300 mb-1">Tempo Estimado</label>
                    <Input
                      value={novaMissao.tempo}
                      onChange={(e) => setNovaMissao({ ...novaMissao, tempo: e.target.value })}
                      className="bg-stone-900 border-amber-600 text-stone-200"
                      placeholder="Ex: 2-3 dias"
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  onClick={handleAdicionarMissao}
                  className="bg-amber-700 hover:bg-amber-600 text-stone-100 w-full mt-3"
                >
                  <ScrollText className="w-4 h-4 mr-2" />
                  Registrar Missão
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Navegação entre abas */}
        <div className="flex gap-4 mb-6">
          <Button
            variant={abaAtiva === "missoes" ? "default" : "outline"}
            onClick={() => setAbaAtiva("missoes")}
            className={`${
              abaAtiva === "missoes" 
                ? "bg-amber-700 hover:bg-amber-600 text-stone-100" 
                : "bg-stone-800 border-amber-600 text-amber-400 hover:bg-stone-700"
            }`}
          >
            <Sword className="w-4 h-4 mr-2" />
            Missões
          </Button>
          <Button
            variant={abaAtiva === "mapas" ? "default" : "outline"}
            onClick={() => setAbaAtiva("mapas")}
            className={`${
              abaAtiva === "mapas" 
                ? "bg-amber-700 hover:bg-amber-600 text-stone-100" 
                : "bg-stone-800 border-amber-600 text-amber-400 hover:bg-stone-700"
            }`}
          >
            <Map className="w-4 h-4 mr-2" />
            Mapas
          </Button>
        </div>

        <h1 className="text-3xl font-bold text-amber-400 font-serif mb-6">
          {abaAtiva === "missoes" ? "Missões por Personagem" : "Mapas de Exploração"}
        </h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
          </div>
        ) : abaAtiva === "missoes" ? (
          Object.keys(missoesPorPersonagem).length === 0 ? (
            <p className="text-center text-stone-500 py-12">Nenhuma missão cadastrada.</p>
          ) : (
            <div className="space-y-10">
              {Object.entries(missoesPorPersonagem).map(([personagem, lista]) => (
                <div key={personagem}>
                  <h2 className="text-2xl font-semibold text-amber-300 border-b border-amber-700 mb-4 pb-2">
                    {personagem}
                  </h2>

                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {lista.map((missao) => (
                      <Card
                        key={missao.id}
                        className={`bg-stone-800 border-amber-600/50 hover:border-amber-500 transition-colors ${
                          missao.disponivel ? "" : "opacity-70"
                        }`}
                      >
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-amber-300">{missao.titulo}</CardTitle>
                              <CardDescription className="text-stone-400 mt-2">
                                {missao.descricao.substring(0, 60)}...
                              </CardDescription>
                            </div>
                            <Badge
                              variant={missao.disponivel ? "default" : "secondary"}
                              className={`${
                                missao.disponivel 
                                  ? "bg-green-600/50 hover:bg-green-600" 
                                  : "bg-red-600/50 hover:bg-red-600"
                              }`}
                            >
                              {missao.disponivel ? "Disponível" : "Concluída"}
                            </Badge>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-3">
                          <div className="flex items-center gap-2 text-stone-300">
                            <Coins className="w-4 h-4 text-amber-400" />
                            <span>
                              Recompensa:{" "}
                              <span className="text-amber-400">{missao.recompensa}</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-stone-300">
                            <Clock className="w-4 h-4 text-amber-400" />
                            <span>
                              Tempo: <span className="text-amber-400">{missao.tempo}</span>
                            </span>
                          </div>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full mt-3 flex gap-2 items-center bg-stone-700 hover:bg-stone-600 text-amber-400 border-amber-600"
                                disabled={!missao.disponivel}
                                onClick={() => setMissaoSelecionada(missao)}
                              >
                                <Sword className="w-4 h-4" /> 
                                {missao.disponivel ? "Detalhes" : "Fracassada"}
                              </Button>
                            </DialogTrigger>

                            {missaoSelecionada?.id === missao.id && (
                              <DialogContent className="bg-stone-800 border-amber-600 text-stone-200 max-w-md">
                                <DialogHeader>
                                  <DialogTitle className="text-amber-400 text-xl">
                                    {missao.titulo}
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 px-1 pb-4">
                                  <div>
                                    <h4 className="text-amber-300 font-semibold mb-2">Descrição:</h4>
                                    <p className="text-stone-300">{missao.descricao}</p>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2">
                                      <Coins className="w-4 h-4 text-amber-400" />
                                      <div>
                                        <p className="text-sm text-stone-400">Recompensa</p>
                                        <p className="text-amber-400">{missao.recompensa}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Clock className="w-4 h-4 text-amber-400" />
                                      <div>
                                        <p className="text-sm text-stone-400">Tempo</p>
                                        <p className="text-amber-400">{missao.tempo}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <DialogFooter className="gap-2">
                                  <Button
                                    variant="outline"
                                    onClick={handleRecusarMissao}
                                    className="border-amber-600 text-amber-400 hover:bg-stone-700"
                                  >
                                    Recusar
                                  </Button>
                                  <Button
                                    onClick={() => handleAceitarMissao(missao.id)}
                                    className="bg-amber-600 hover:bg-amber-500"
                                    disabled={!missao.disponivel}
                                  >
                                    Missão Fracassada
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            )}
                          </Dialog>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          // ABA DE MAPAS
          mapas.length === 0 ? (
            <p className="text-center text-stone-500 py-12">Nenhum mapa disponível.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {mapas.map((mapa) => (
                <Card
                  key={mapa.id}
                  className="bg-stone-800 border-amber-600/50 hover:border-amber-500 transition-all duration-300 hover:scale-105 cursor-pointer group"
                  onClick={() => handleAbrirMapa(mapa)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-amber-300 text-lg flex items-center justify-between">
                      {mapa.nome}
                      <ZoomIn className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </CardTitle>
                    <CardDescription className="text-stone-400">
                      {mapa.descricao}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Miniaturas dos mapas */}
                    <div className="relative aspect-video bg-stone-900 rounded-lg border border-amber-600/30 overflow-hidden">
                      <img
                        src={mapa.miniatura}
                        alt={mapa.nome}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-amber-900/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    
                    {/* Tags do mapa */}
                    <div className="flex flex-wrap gap-1">
                      {mapa.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs bg-amber-900/20 text-amber-300 border-amber-600/50"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <Button
                      variant="outline"
                      className="w-full bg-stone-700 hover:bg-stone-600 text-amber-400 border-amber-600 flex gap-2"
                    >
                      <ZoomIn className="w-4 h-4" />
                      Expandir Mapa
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        )}

        {/* Modal para mapa em tela cheia */}
        <Dialog open={mostrarMapaModal} onOpenChange={setMostrarMapaModal}>
          <DialogContent className="max-w-7xl w-[95vw] h-[95vh] bg-stone-900 border-amber-600 p-0 overflow-hidden">
            {mapaSelecionado && (
              <>
                <DialogHeader className="flex flex-row items-center justify-between p-4 border-b border-amber-600/50">
                  <DialogTitle className="text-amber-400 text-xl">
                    {mapaSelecionado.nome}
                  </DialogTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMostrarMapaModal(false)}
                    className="text-stone-400 hover:text-stone-200 hover:bg-stone-800"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </DialogHeader>
                
                <div className="flex-1 p-4 overflow-auto">
                  <div className="bg-stone-800 rounded-lg p-4 mb-4">
                    <p className="text-stone-300">{mapaSelecionado.descricao}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {mapaSelecionado.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="bg-amber-900/30 text-amber-300 border-amber-600/50"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="relative bg-stone-900 rounded-lg border-2 border-amber-600/50 overflow-hidden">
                    <img
                      src={mapaSelecionado.imagemCompleta}
                      alt={mapaSelecionado.nome}
                      className="w-full h-auto max-h-[70vh] object-contain"
                    />
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
"use client";

import { useState, useEffect } from "react";
import { Sword, ScrollText, Clock, Coins, PlusCircle } from "lucide-react";
import { decodeJwt } from "jose";
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

export default function MissoesPage() {
  const [userId, setUserId] = useState<number | null>(null);
  const [missoes, setMissoes] = useState<Missao[]>([]);
  const [loading, setLoading] = useState(true);
  const [missaoSelecionada, setMissaoSelecionada] = useState<Missao | null>(null);
  const [mostrarDetalhesModal, setMostrarDetalhesModal] = useState(false);
  const [novaMissao, setNovaMissao] = useState({
    titulo: "",
    descricao: "",
    recompensa: "",
    tempo: "",
    personagem: "",
  });
  const [personagens, setPersonagens] = useState<string[]>([]); // lista de personagens

  // 1) Decodifica o token e carrega userId
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const { id } = decodeJwt(token) as { id: number };
      setUserId(id);
    } catch {
      console.error("Token inválido");
    }
  }, []);

  // 2) Carrega lista de missões
  useEffect(() => {
    fetch("http://localhost:3001/missoes/ver")
      .then(r => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setMissoes)
      .catch(err => console.error("Erro ao buscar missões:", err))
      .finally(() => setLoading(false));
  }, []);

  // 3) Carrega personagens (mock ou endpoint real)
  useEffect(() => {
    // Se tiver endpoint: `fetch("http://localhost:3001/personagens")`
    setPersonagens(["Arthas", "Liriel", "Drogmar", "Eldrin"]);
  }, []);

  // 4) Função para aceitar missão
  async function handleAceitarMissao(missaoId: number) {
    if (userId === null) return;
    try {
      const res = await fetch(
        `http://localhost:3001/missoes/aceitar/${userId}/${missaoId}`,
        { method: "POST" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao aceitar missão");
      toast.success(data.message);
      setMostrarDetalhesModal(true);
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  // 5) Criar nova missão
  async function handleCriarMissao() {
    try {
      const res = await fetch("http://localhost:3001/missoes/criar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novaMissao),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao criar missão");

      toast.success("Missão criada com sucesso!");
      setMissoes([...missoes, data]);
      setNovaMissao({ titulo: "", descricao: "", recompensa: "", tempo: "", personagem: "" });
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  // 6) Agrupar missões por personagem
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
                  <label className="block text-stone-300 mb-1">Título</label>
                  <Input
                    value={novaMissao.titulo}
                    onChange={(e) => setNovaMissao({ ...novaMissao, titulo: e.target.value })}
                    className="bg-stone-900 border-amber-600 text-stone-200"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 mb-1">Descrição</label>
                  <Textarea
                    value={novaMissao.descricao}
                    onChange={(e) => setNovaMissao({ ...novaMissao, descricao: e.target.value })}
                    className="bg-stone-900 border-amber-600 text-stone-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-stone-300 mb-1">Recompensa</label>
                    <Input
                      value={novaMissao.recompensa}
                      onChange={(e) => setNovaMissao({ ...novaMissao, recompensa: e.target.value })}
                      className="bg-stone-900 border-amber-600 text-stone-200"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-300 mb-1">Tempo Estimado</label>
                    <Input
                      value={novaMissao.tempo}
                      onChange={(e) => setNovaMissao({ ...novaMissao, tempo: e.target.value })}
                      className="bg-stone-900 border-amber-600 text-stone-200"
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  onClick={handleCriarMissao}
                  className="bg-amber-700 hover:bg-amber-600 text-stone-100 w-full mt-3"
                >
                  <ScrollText className="w-4 h-4 mr-2" />
                  Registrar Missão
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <h1 className="text-3xl font-bold text-amber-400 font-serif mb-6">Missões por Personagem</h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
          </div>
        ) : Object.keys(missoesPorPersonagem).length === 0 ? (
          <p className="text-center text-stone-500 py-12">Nenhuma missão cadastrada.</p>
        ) : (
          <div className="space-y-10">
            {Object.entries(missoesPorPersonagem).map(([personagem, lista]) => (
              <div key={personagem}>
                <h2 className="text-2xl font-semibold text-amber-300 border-b border-amber-700 mb-4">
                  {personagem}
                </h2>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {lista.map((missao) => (
                    <Card
                      key={missao.id}
                      className={`bg-stone-800 border-amber-600/50 ${missao.disponivel ? "" : "opacity-70"}`}
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-amber-300">{missao.titulo}</CardTitle>
                            <CardDescription className="text-stone-400">
                              {missao.descricao.substring(0, 60)}...
                            </CardDescription>
                          </div>
                          <Badge
                            variant={missao.disponivel ? "default" : "secondary"}
                            className="bg-amber-600/50"
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
                              onClick={() => {
                                setMissaoSelecionada(missao);
                                setMostrarDetalhesModal(false);
                              }}
                            >
                              <Sword className="w-4 h-4" /> Detalhes
                            </Button>
                          </DialogTrigger>

                          {missaoSelecionada?.id === missao.id && !mostrarDetalhesModal && (
                            <DialogContent className="bg-stone-800 border-amber-600 text-stone-200">
                              <DialogHeader>
                                <DialogTitle className="text-amber-400">
                                  Missão: {missao.titulo}
                                </DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 px-6 pb-4">
                                <p>{missao.descricao}</p>
                              </div>
                              <DialogFooter className="gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() => setMissaoSelecionada(null)}
                                  className="border-amber-600 text-amber-400 hover:bg-stone-700"
                                >
                                  Recusar
                                </Button>
                                <Button
                                  onClick={() => handleAceitarMissao(missao.id)}
                                  className="bg-amber-600 hover:bg-amber-500"
                                >
                                  Aceitar
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
        )}
      </div>
    </>
  );
}

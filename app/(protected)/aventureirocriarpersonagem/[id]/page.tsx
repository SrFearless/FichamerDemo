"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { decodeJwt } from "jose";
import { MedievalNavBarAv } from "@/components/medieval-navbar-aventureiro";
import { toast } from "sonner";

type Classe = {
  id_classe: number;
  nome: string;
  gif_url: string;
  atributos_base: {
    vida: number;
    mana: number;
    forca: number;
    destreza: number;
    constituicao: number;
    inteligencia: number;
    sabedoria: number;
    carisma: number;
  };
};

export default function CriarPersonagemPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<Classe[]>([]);
  const [selectedClass, setSelectedClass] = useState<Classe | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Obter ID do usuário do token
  const getUserIdFromToken = () => {
    if (typeof window === "undefined") return null;
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      return decodeJwt(token).id.toString();
    } catch {
      return null;
    }
  };

  const userId = getUserIdFromToken();

  // Buscar classes disponíveis
  useEffect(() => {
    if (!userId) {
      router.push("/login");
      return;
    }

    const fetchClasses = async () => {
      try {
        const response = await fetch("http://localhost:3001/classes/listar");
        if (!response.ok) throw new Error("Erro ao carregar classes");
        const data = await response.json();
        setClasses(data);
      } catch (error) {
        console.error("Erro:", error);
        toast.error("Falha ao carregar classes de personagem");
      }
    };

    fetchClasses();
  }, [userId, router]);

  // Manipulador de envio do formulário
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const nome = formData.get("nome") as string;
    const classeId = formData.get("classe") as string;
    const historia = formData.get("historia") as string;
    const imagem = formData.get("imagem") as File;

    if (!nome || !classeId) {
      toast.error("Nome e classe são obrigatórios");
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("usuario_id", userId || "");
      formDataToSend.append("nome", nome);
      formDataToSend.append("classe_id", classeId);
      if (historia) formDataToSend.append("historia", historia);
      if (imagem.size > 0) formDataToSend.append("imagem", imagem);

      // Adicionar atributos base da classe selecionada
      const classe = classes.find(c => c.id_classe === parseInt(classeId));
      if (classe) {
        formDataToSend.append("vida", classe.atributos_base.vida.toString());
        formDataToSend.append("mana", classe.atributos_base.mana.toString());
        formDataToSend.append("forca", classe.atributos_base.forca.toString());
        formDataToSend.append("destreza", classe.atributos_base.destreza.toString());
        formDataToSend.append("constituicao", classe.atributos_base.constituicao.toString());
        formDataToSend.append("inteligencia", classe.atributos_base.inteligencia.toString());
        formDataToSend.append("sabedoria", classe.atributos_base.sabedoria.toString());
        formDataToSend.append("carisma", classe.atributos_base.carisma.toString());
      }

      const response = await fetch("http://localhost:3001/personagem/criar", {
        method: "POST",
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao criar personagem");
      }

      toast.success("Personagem criado com sucesso!");
      router.push("/selecao-personagem");
    } catch (error: any) {
      console.error("Erro:", error);
      toast.error(error.message || "Erro ao criar personagem");
    } finally {
      setLoading(false);
    }
  };

  // Preview da imagem selecionada
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  // Atualizar classe selecionada
  const handleClassChange = (value: string) => {
    const classe = classes.find(c => c.id_classe === parseInt(value));
    setSelectedClass(classe || null);
  };

  return (
    <>
      <MedievalNavBarAv />
      <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=1470&auto=format&fit=crop')] bg-cover bg-center p-4">
        {/* Efeito de névoa */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
        
        {/* Container principal */}
        <div className="relative z-10 max-w-4xl mx-auto bg-stone-800/80 border-2 border-amber-600 rounded-xl p-6 shadow-lg">
          <h1 className="text-3xl font-bold text-amber-400 mb-6 text-center font-medieval">
            Forja de Heróis
          </h1>
          <p className="text-stone-300 text-center mb-8">
            Dê vida a um novo aventureiro para suas jornadas épicas
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Coluna esquerda - Informações básicas */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nome" className="text-stone-300 block mb-2">
                    Nome do Personagem
                  </Label>
                  <Input
                    id="nome"
                    name="nome"
                    type="text"
                    placeholder="Ex: Aragon, Gandalf, Legolas"
                    className="bg-stone-700 border-amber-700 text-stone-100"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="classe" className="text-stone-300 block mb-2">
                    Classe
                  </Label>
                  <Select name="classe" required onValueChange={handleClassChange}>
                    <SelectTrigger className="bg-stone-700 border-amber-700 text-stone-100">
                      <SelectValue placeholder="Selecione uma classe" />
                    </SelectTrigger>
                    <SelectContent className="bg-stone-800 border-amber-700">
                      {classes.map((classe) => (
                        <SelectItem 
                          key={classe.id_classe} 
                          value={classe.id_classe.toString()}
                          className="hover:bg-amber-800/50"
                        >
                          {classe.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedClass && (
                  <div className="bg-stone-900/70 border border-amber-700 rounded-lg p-4">
                    <h3 className="text-amber-400 font-bold mb-2">Atributos da Classe:</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm text-stone-300">
                      <div>Vida: <span className="text-amber-300">{selectedClass.atributos_base.vida}</span></div>
                      <div>Mana: <span className="text-amber-300">{selectedClass.atributos_base.mana}</span></div>
                      <div>Força: <span className="text-amber-300">{selectedClass.atributos_base.forca}</span></div>
                      <div>Destreza: <span className="text-amber-300">{selectedClass.atributos_base.destreza}</span></div>
                      <div>Constituição: <span className="text-amber-300">{selectedClass.atributos_base.constituicao}</span></div>
                      <div>Inteligência: <span className="text-amber-300">{selectedClass.atributos_base.inteligencia}</span></div>
                      <div>Sabedoria: <span className="text-amber-300">{selectedClass.atributos_base.sabedoria}</span></div>
                      <div>Carisma: <span className="text-amber-300">{selectedClass.atributos_base.carisma}</span></div>
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="historia" className="text-stone-300 block mb-2">
                    História (Opcional)
                  </Label>
                  <Textarea
                    id="historia"
                    name="historia"
                    placeholder="Conte a história do seu personagem..."
                    className="bg-stone-700 border-amber-700 text-stone-100 min-h-32"
                  />
                </div>
              </div>

              {/* Coluna direita - Imagem e visualização */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="imagem" className="text-stone-300 block mb-2">
                    Imagem do Personagem (Opcional)
                  </Label>
                  <Input
                    id="imagem"
                    name="imagem"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="bg-stone-700 border-amber-700 text-stone-100 file:text-stone-100 file:bg-amber-700 file:border-none file:mr-4 file:py-2 file:px-4 file:rounded"
                  />
                </div>

                <div className="border-2 border-amber-700 rounded-lg p-4 flex flex-col items-center">
                  <h3 className="text-amber-400 font-bold mb-4">Visualização</h3>
                  
                  {imagePreview ? (
                    <div className="w-48 h-48 rounded-full border-4 border-amber-500 overflow-hidden mb-4">
                      <img 
                        src={imagePreview} 
                        alt="Preview do personagem" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : selectedClass ? (
                    <div className="w-48 h-48 rounded-full border-4 border-amber-500 overflow-hidden mb-4">
                      <img 
                        src={selectedClass.gif_url} 
                        alt={`Classe ${selectedClass.nome}`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-48 h-48 rounded-full border-4 border-amber-500 bg-stone-700 flex items-center justify-center mb-4">
                      <span className="text-stone-400 text-center px-2">Selecione uma classe</span>
                    </div>
                  )}

                  <div className="text-center">
                    <p className="text-amber-300 font-medium">
                      {selectedClass?.nome || "Nenhuma classe selecionada"}
                    </p>
                    {selectedClass && (
                      <p className="text-stone-400 text-sm mt-1">
                        {selectedClass.atributos_base.vida} HP • {selectedClass.atributos_base.mana} MP
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 py-6 px-12 text-lg font-bold"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Forjando...
                  </span>
                ) : (
                  "Forjar Personagem"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
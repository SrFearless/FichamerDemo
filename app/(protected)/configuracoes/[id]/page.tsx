"use client";
import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { decodeJwt } from "jose";
import { MedievalNavBarAv } from "@/components/medieval-navbar-aventureiro";
import { ScrollText, Upload } from "lucide-react";

type DecodedToken = { id: number };
interface UserProfile {
  nome: string;
  email: string;
  telefone: string;
  foto_url: string | null;
}

export default function MedievalConfigPage() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [fotoFile, setFotoFile] = useState<File | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

  function getUserIdFromToken(): number | null {
    const t = localStorage.getItem("token");
    if (!t) return null;
    try { return decodeJwt<DecodedToken>(t).id; }
    catch { return null; }
  }

  useEffect(() => { setIsClient(true); }, []);

  useEffect(() => {
    if (!isClient) return;
    const t = localStorage.getItem("token");
    if (!t) return router.replace("/login");
    const id = getUserIdFromToken();
    if (!id) return router.replace("/login");
    setUserId(id);
    setLoading(false);
  }, [isClient, router]);

  useEffect(() => {
    if (!userId) return;
  
    fetch(`${API_BASE}/api/pessoasconfig/${userId}`, { credentials: "include" })
      .then((r) =>
        r.ok
          ? r.json()
          : Promise.reject("Erro ao carregar perfil")
      )
      .then((d: UserProfile) => {
        setNome(d.nome);
        setEmail(d.email);
        setTelefone(d.telefone);
  
        if (d.foto_url) {
          setFotoUrl(`${API_BASE}${d.foto_url}`);
        }
      })
      .catch(console.error);
  }, [userId]);

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFotoFile(f);
      setFotoUrl(URL.createObjectURL(f));
    }
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setSaving(true);

    const formData = new FormData();
    formData.append("nome", nome);
    formData.append("email", email);
    formData.append("telefone", telefone);
    if (fotoFile) formData.append("foto", fotoFile);

    try {
      const res = await fetch(`http://localhost:3001/api/colocarFoto/${userId}`, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro desconhecido");
      alert(data.message);
      router.push(`/escolha/${userId}`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!isClient || loading) {
    return (
      <>
        <MedievalNavBarAv />
        <div className="container mx-auto py-20 text-center text-amber-200 bg-stone-800 min-h-screen">
          <div className="animate-pulse">Consultando os pergaminhos do reino...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <MedievalNavBarAv />
      <div className="max-w-2xl mx-auto p-6 bg-stone-800/90 border border-amber-800 rounded-lg shadow-lg mt-8 mb-12">
        <div className="flex items-center gap-3 mb-6 border-b border-amber-700 pb-4">
          <ScrollText className="text-amber-400 h-8 w-8" />
          <h1 className="text-2xl font-bold text-amber-400 font-medieval tracking-wider">
            Pergaminhos do Aventureiro
          </h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome */}
          <div className="space-y-2">
            <label className="block text-amber-300 font-medium">
              Nome do Aventureiro
            </label>
            <input
              value={nome}
              onChange={e => setNome(e.target.value)}
              className="w-full px-4 py-2 bg-stone-700 border border-amber-700 rounded text-amber-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="Seu nome no reino"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="block text-amber-300 font-medium">
              Mensageiro Elétrico
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-stone-700 border border-amber-700 rounded text-amber-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="Para receber mensagens do reino"
            />
          </div>

          {/* Foto */}
          <div className="space-y-4">
            <label className="block text-amber-300 font-medium">
              Retrato do Herói
            </label>
            <div className="flex items-center gap-6">
              {fotoUrl ? (
                <img
                  src={fotoUrl}
                  alt="Retrato do aventureiro"
                  className="w-24 h-24 rounded-full border-2 border-amber-600 object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full border-2 border-amber-600 bg-stone-700 flex items-center justify-center text-amber-400">
                  Sem retrato
                </div>
              )}
              
              <label className="cursor-pointer bg-amber-800 hover:bg-amber-700 text-amber-100 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                <Upload className="h-4 w-4" />
                Escolher retrato
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-amber-700 hover:bg-amber-600 text-amber-100 font-medium px-6 py-3 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Gravando nos pergaminhos...
                </>
              ) : (
                "Guardar Alterações"
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
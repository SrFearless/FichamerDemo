"use client"

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { MedievalNavBarAv } from "@/components/medieval-navbar-aventureiro";
import { handleUpdate } from "@/components/ComandoPessoas";
import { handleDelete } from "@/components/ComandoPessoas";
import {
  fetchItens,
  handleCreateItem,
  handleUpdateItem,
} from "@/components/ComandoItens";

interface Item {
  id: string;
  nome: string;
  tipo: string;
  descricao?: string;
  valor?: number;
  peso?: number;
  efeito?: string;
}

export default function AdminPage() {
  const [search, setSearch] = useState("");
  const [pessoas, setPessoas] = useState<any[]>([]);
  const [loadingPessoas, setLoadingPessoas] = useState(true);

  const [itens, setItens] = useState<Item[]>([]);
  const [loadingItens, setLoadingItens] = useState(true);
  const [itemSearch, setItemSearch] = useState("");

  const router = useRouter();

  // Fetch lista de plebeus (se ainda precisar)
  useEffect(() => {
    async function fetchClientes() {
      try {
        const res = await fetch("http://localhost:3001/api/clientes");
        if (!res.ok) throw new Error(`Erro ${res.status} ao buscar clientes`);
        const data = await res.json();
        setPessoas(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Erro ao buscar clientes:", err);
        setPessoas([]);
      } finally {
        setLoadingPessoas(false);
      }
    }
    fetchClientes();
  }, []);

  // Fetch lista de itens
  useEffect(() => {
    carregarItens();
  }, []);

  const carregarItens = async () => {
    setLoadingItens(true);
    try {
      const data = await fetchItens();
      // Se o backend retorna propriedades diferentes, ajuste aqui.
      setItens(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erro ao buscar itens:", err);
      setItens([]);
    } finally {
      setLoadingItens(false);
    }
  };

  // Filtros
  const filteredUsers = pessoas.filter(
    (pessoa) =>
      pessoa.nome.toLowerCase().includes(search.toLowerCase()) ||
      pessoa.email.toLowerCase().includes(search.toLowerCase())
  );
  const filteredItens = itens.filter((item) =>
    item.nome.toLowerCase().includes(itemSearch.toLowerCase())
  );

  // Estados para diálogo de criação/edição de item
  const [openCriarItem, setOpenCriarItem] = useState(false);
  const [editarItemId, setEditarItemId] = useState<string | null>(null);
  const [openEditarItem, setOpenEditarItem] = useState(false);

  // Função para abrir diálogo de edição preenchendo valores atuais via DOM após abertura
  const abrirDialogEditar = (item: Item) => {
    setEditarItemId(item.id);
    setOpenEditarItem(true);
    // Após abrir, podemos preencher valores nos inputs; mas como usamos defaultValue, basta abrir.
  };

  // Handler de submit para criar novo item
  const onSubmitCriarItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const nome = (document.getElementById("item-nome") as HTMLInputElement).value;
    const tipo = (document.getElementById("item-tipo") as HTMLInputElement).value;
    const descricao = (document.getElementById("item-descricao") as HTMLInputElement).value;
    const valorStr = (document.getElementById("item-valor") as HTMLInputElement).value;
    const pesoStr = (document.getElementById("item-peso") as HTMLInputElement).value;
    const efeito = (document.getElementById("item-efeito") as HTMLInputElement).value;

    const payload = {
      nome,
      tipo,
      descricao,
      valor: valorStr ? parseInt(valorStr, 10) : undefined,
      peso: pesoStr ? parseFloat(pesoStr) : undefined,
      efeito,
    };

    try {
      await handleCreateItem(payload);
      await carregarItens();
      setOpenCriarItem(false);
    } catch (err) {
      console.error("Erro ao criar item:", err);
    }
  };

  // Handler de submit para editar item
  const onSubmitEditarItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editarItemId) return;
    // Obter valores dos inputs via DOM (ids dinâmicos)
    const nome = (document.getElementById(`item-nome-${editarItemId}`) as HTMLInputElement).value;
    const tipo = (document.getElementById(`item-tipo-${editarItemId}`) as HTMLInputElement).value;
    const descricao = (document.getElementById(`item-descricao-${editarItemId}`) as HTMLInputElement).value;
    const valorStr = (document.getElementById(`item-valor-${editarItemId}`) as HTMLInputElement).value;
    const pesoStr = (document.getElementById(`item-peso-${editarItemId}`) as HTMLInputElement).value;
    const efeito = (document.getElementById(`item-efeito-${editarItemId}`) as HTMLInputElement).value;

    const payload = {
      nome,
      tipo,
      descricao,
      valor: valorStr ? parseInt(valorStr, 10) : undefined,
      peso: pesoStr ? parseFloat(pesoStr) : undefined,
      efeito,
    };

    try {
      await handleUpdateItem(editarItemId, payload);
      await carregarItens();
      setOpenEditarItem(false);
      setEditarItemId(null);
    } catch (err) {
      console.error("Erro ao atualizar item:", err);
    }
  };

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100">
      <MedievalNavBarAv />

      <div className="container mx-auto p-4 py-6">
        {/* Cabeçalho estilo medieval */}
        <div className="mb-8 border-b-4 border-amber-800 pb-4">
          <h1 className="text-4xl font-bold text-amber-500 font-medieval">Livro do Escudeiro</h1>
          <p className="text-stone-300">Registro dos plebeus e itens do reino</p>
        </div>

        <Tabs defaultValue="usuarios">
          <TabsList className="mb-6 bg-stone-800 border border-amber-700 grid grid-cols-2">
            <TabsTrigger
              value="usuarios"
              className="data-[state=active]:bg-amber-700 data-[state=active]:text-stone-900"
            >
              Plebeus
            </TabsTrigger>
            <TabsTrigger
              value="itens"
              className="data-[state=active]:bg-amber-700 data-[state=active]:text-stone-900"
            >
              Tesouro do Reino
            </TabsTrigger>
          </TabsList>

          {/* Aba de Usuários (Plebeus) */}
          <TabsContent value="usuarios">
            <Card className="bg-stone-800 border-amber-700">
              <CardHeader>
                <CardTitle className="text-2xl text-amber-400 font-medieval">Registro dos Plebeus</CardTitle>
                <CardDescription className="text-stone-300">
                  Gerencie os cidadãos comuns do reino
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="relative w-full md:w-72">
                    <Input
                      placeholder="Buscar plebeu..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-8 bg-stone-700 border-amber-700 text-stone-100"
                    />
                    <svg
                      className="absolute left-2.5 top-2.5 h-4 w-4 text-stone-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>

                  <Dialog open={openCriarItem /* reuse? aqui seria registrar plebeu; mas mantém seu código original */} onOpenChange={() => {}}>
                    <DialogTrigger asChild>
                      <Button
                        onClick={() => router.push("/registroCliente")}
                        className="bg-amber-700 hover:bg-amber-600 text-stone-900 font-bold w-full md:w-auto"
                      >
                        Registrar Novo Plebeu
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </div>

                <div className="rounded-md border border-amber-700 overflow-hidden">
                  {loadingPessoas ? (
                    <div className="text-center py-4 text-stone-300">
                      <p>Consultando os registros do castelo...</p>
                    </div>
                  ) : (
                    <Table className="border-collapse">
                      <TableHeader className="bg-stone-700">
                        <TableRow>
                          <TableHead className="text-amber-300 border-r border-amber-700">Nome</TableHead>
                          <TableHead className="text-amber-300 border-r border-amber-700">Sinal de Fogo</TableHead>
                          <TableHead className="text-amber-300 text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.length > 0 ? (
                          filteredUsers.map((user) => (
                            <TableRow key={user.id} className="border-b border-amber-700 hover:bg-stone-700/50">
                              <TableCell className="font-medium border-r border-amber-700 text-amber-300">{user.nome}</TableCell>
                              <TableCell className="border-r border-amber-700 text-amber-300">{user.email}</TableCell>
                              <TableCell className="text-right space-x-2 text-amber-300">
                                {/* Botões de editar/banir plebeu, preserve seu código existente */}
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-amber-100 hover:bg-amber-900/50"
                                    >
                                      Editar Pergaminho
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="bg-stone-800 border-amber-700 text-stone-100">
                                    <DialogHeader>
                                      <DialogTitle className="text-amber-400 font-medieval">Editar Plebeu</DialogTitle>
                                      <DialogDescription className="text-stone-300">
                                        Atualize os dados nos registros do reino
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor={`nome-${user.id}`} className="text-right text-stone-300">
                                          Nome
                                        </Label>
                                        <Input
                                          id={`nome-${user.id}`}
                                          defaultValue={user.nome}
                                          className="col-span-3 bg-stone-700 border-amber-700"
                                        />
                                      </div>
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor={`email-${user.id}`} className="text-right text-stone-300">
                                          Sinal de Fogo
                                        </Label>
                                        <Input
                                          id={`email-${user.id}`}
                                          defaultValue={user.email}
                                          className="col-span-3 bg-stone-700 border-amber-700"
                                        />
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <Button
                                        onClick={() =>
                                          handleUpdate(
                                            user.id,
                                            (document.getElementById(`nome-${user.id}`) as HTMLInputElement).value,
                                            (document.getElementById(`email-${user.id}`) as HTMLInputElement).value,
                                          )
                                        }
                                        className="bg-amber-700 hover:bg-amber-600 text-stone-900 font-bold"
                                      >
                                        Selar Alterações
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-400 hover:bg-red-900/50"
                                  onClick={() => handleDelete(user.id)}
                                >
                                  Banir do Reino
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-4 text-stone-300">
                              Nenhum plebeu encontrado nos registros.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba de Itens */}
          <TabsContent value="itens">
            <Card className="bg-stone-800 border-amber-700">
              <CardHeader>
                <CardTitle className="text-2xl text-amber-400 font-medieval">Tesouro do Reino</CardTitle>
                <CardDescription className="text-stone-300">
                  Gerencie os itens disponíveis no reino
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="relative w-full md:w-72">
                    <Input
                      placeholder="Buscar item..."
                      value={itemSearch}
                      onChange={(e) => setItemSearch(e.target.value)}
                      className="pl-8 bg-stone-700 border-amber-700 text-stone-100"
                    />
                    <svg
                      className="absolute left-2.5 top-2.5 h-4 w-4 text-stone-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>

                  {/* Dialog de Criação de Item */}
                  <Dialog open={openCriarItem} onOpenChange={setOpenCriarItem}>
                    <DialogTrigger asChild>
                      <Button onClick={() => handleCreateItem} className="bg-amber-800 hover:bg-amber-700 text-amber-100 font-bold w-full md:w-auto">
                        Adicionar Item
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-stone-800 border-amber-700 text-stone-100">
                      <DialogHeader>
                        <DialogTitle className="text-amber-400 font-medieval">Novo Item</DialogTitle>
                        <DialogDescription className="text-stone-300">
                          Adicione um novo item ao tesouro real
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={onSubmitCriarItem}>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="item-nome" className="text-right text-stone-300">
                              Nome
                            </Label>
                            <Input id="item-nome" className="col-span-3 bg-stone-700 border-amber-700" required/>
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="item-tipo" className="text-right text-stone-300">
                              Tipo
                            </Label>
                            <Input id="item-tipo" className="col-span-3 bg-stone-700 border-amber-700" required/>
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="item-descricao" className="text-right text-stone-300">
                              Descrição
                            </Label>
                            <Input id="item-descricao" className="col-span-3 bg-stone-700 border-amber-700" />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="item-valor" className="text-right text-stone-300">
                              Valor
                            </Label>
                            <Input id="item-valor" type="number" className="col-span-3 bg-stone-700 border-amber-700" />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="item-peso" className="text-right text-stone-300">
                              Peso
                            </Label>
                            <Input id="item-peso" type="number" step="0.01" className="col-span-3 bg-stone-700 border-amber-700" />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="item-efeito" className="text-right text-stone-300">
                              Efeito
                            </Label>
                            <Input id="item-efeito" className="col-span-3 bg-stone-700 border-amber-700" />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            type="submit"
                            className="bg-amber-700 hover:bg-amber-600 text-stone-900 font-bold"
                          >
                            Adicionar Item
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Tabela de Itens */}
                <div className="rounded-md border border-amber-700 overflow-hidden mt-4">
                  {loadingItens ? (
                    <div className="text-center py-4 text-stone-300">
                      Consultando o tesouro do reino...
                    </div>
                  ) : (
                    <Table>
                      <TableHeader className="bg-stone-700">
                        <TableRow>
                          <TableHead className="text-amber-300 border-r border-amber-700 ">Nome</TableHead>
                          <TableHead className="text-amber-300 border-r border-amber-700">Tipo</TableHead>
                          <TableHead className="text-amber-300 border-r border-amber-700">Descrição</TableHead>
                          <TableHead className="text-amber-300 border-r border-amber-700">Valor</TableHead>
                          <TableHead className="text-amber-300 border-r border-amber-700">Peso</TableHead>
                          <TableHead className="text-amber-300 border-r border-amber-700">Efeito</TableHead>
                          <TableHead className="text-amber-300 text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredItens.length > 0 ? (
                          filteredItens.map((item) => (
                            <TableRow key={item.id} className="border-b border-amber-700 hover:bg-stone-700/50">
                              <TableCell className="font-medium border-r border-amber-700 text-amber-300">{item.nome}</TableCell>
                              <TableCell className="border-r border-amber-700 text-purple-300">{item.tipo}</TableCell>
                              <TableCell className="border-r border-amber-700 text-amber-300">{item.descricao}</TableCell>
                              <TableCell className="border-r border-amber-700 text-amber-300">
                                {item.valor?.toLocaleString("pt-BR") ?? "-"}
                              </TableCell>
                              <TableCell className="border-r border-amber-700 text-amber-300">
                                {item.peso != null
                                  ? (() => {
                                      const pesoNum = typeof item.peso === 'number'
                                        ? item.peso
                                        : parseFloat(item.peso as any); // converte string para número
                                      return !isNaN(pesoNum)
                                        ? pesoNum.toFixed(2)
                                        : '-';
                                    })()
                                  : "-"}
                              </TableCell>
                              <TableCell className="border-r border-amber-700 text-amber-300">{item.efeito}</TableCell>
                              <TableCell className="text-right space-x-2">
                                {/* Botão de editar */}
                                <Dialog open={openEditarItem && editarItemId === item.id} onOpenChange={setOpenEditarItem}>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-amber-100 hover:bg-amber-900/50"
                                      onClick={() => abrirDialogEditar(item)}
                                    >
                                      Editar
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="bg-stone-800 border-amber-700 text-stone-100">
                                    <DialogHeader>
                                      <DialogTitle className="text-amber-400 font-medieval">Editar Item</DialogTitle>
                                      <DialogDescription className="text-stone-300">
                                        Atualize os dados do item
                                      </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={onSubmitEditarItem}>
                                      <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                          <Label htmlFor={`item-nome-${item.id}`} className="text-right text-stone-300">
                                            Nome
                                          </Label>
                                          <Input
                                            id={`item-nome-${item.id}`}
                                            defaultValue={item.nome}
                                            className="col-span-3 bg-stone-700 border-amber-700"
                                            required
                                          />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                          <Label htmlFor={`item-tipo-${item.id}`} className="text-right text-stone-300">
                                            Tipo
                                          </Label>
                                          <Input
                                            id={`item-tipo-${item.id}`}
                                            defaultValue={item.tipo}
                                            className="col-span-3 bg-stone-700 border-amber-700"
                                            required
                                          />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                          <Label htmlFor={`item-descricao-${item.id}`} className="text-right text-stone-300">
                                            Descrição
                                          </Label>
                                          <Input
                                            id={`item-descricao-${item.id}`}
                                            defaultValue={item.descricao || ""}
                                            className="col-span-3 bg-stone-700 border-amber-700"
                                          />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                          <Label htmlFor={`item-valor-${item.id}`} className="text-right text-stone-300">
                                            Valor
                                          </Label>
                                          <Input
                                            id={`item-valor-${item.id}`}
                                            defaultValue={item.valor?.toString() || ""}
                                            type="number"
                                            className="col-span-3 bg-stone-700 border-amber-700"
                                          />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                          <Label htmlFor={`item-peso-${item.id}`} className="text-right text-stone-300">
                                            Peso
                                          </Label>
                                          <Input
                                            id={`item-peso-${item.id}`}
                                            defaultValue={item.peso != null ? item.peso.toString() : ""}
                                            type="number"
                                            step="0.01"
                                            className="col-span-3 bg-stone-700 border-amber-700"
                                          />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                          <Label htmlFor={`item-efeito-${item.id}`} className="text-right text-stone-300">
                                            Efeito
                                          </Label>
                                          <Input
                                            id={`item-efeito-${item.id}`}
                                            defaultValue={item.efeito || ""}
                                            className="col-span-3 bg-stone-700 border-amber-700"
                                          />
                                        </div>
                                      </div>
                                      <DialogFooter>
                                        <Button
                                          type="submit"
                                          className="bg-amber-700 hover:bg-amber-600 text-stone-900 font-bold"
                                        >
                                          Atualizar Item
                                        </Button>
                                      </DialogFooter>
                                    </form>
                                  </DialogContent>
                                </Dialog>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-4 text-stone-300">
                              Nenhum item encontrado no tesouro.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

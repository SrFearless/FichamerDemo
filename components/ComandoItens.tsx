export async function fetchItens(): Promise<any[]> {
  const res = await fetch("http://localhost:3001/criaritem/ver");
  if (!res.ok) throw new Error(`Erro ${res.status} ao buscar itens`);
  return await res.json();
}

export async function handleCreateItem(payload: {
  nome: string;
  tipo: string;
  descricao?: string;
  valor?: number;
  peso?: number;
  efeito?: string;
}) {
  const res = await fetch("http://localhost:3001/criaritem/criar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Erro ${res.status} ao criar item`);
  return await res.json();
}

export async function handleUpdateItem(
  id: string | number,
  payload: {
    nome: string;
    tipo: string;
    descricao?: string;
    valor?: number;
    peso?: number;
    efeito?: string;
  }
) {
  const res = await fetch(`http://localhost:3001/criaritem/atualizar/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Erro ${res.status} ao atualizar item`);
  return await res.json();
}
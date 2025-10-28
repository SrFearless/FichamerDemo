"use client";

import axios from "axios";
import { toast } from "sonner";

  // Função para deletar uma pessoa
  export async function handleDelete(id: string) {
    console.log("ID para deletar:", id); // DEBUG
    if (!id) {
      toast.error("ID é obrigatório para deletar!");
      return;
    }
    try {
      const response = await axios.delete(`http://localhost:3001/api/pessoasdelete/${id}`);
      toast.success(response.data.message);
    } catch (error: any) {
      toast.error("Erro ao deletar pessoa: " + error.response?.data.error);
    }
  }
  // Função para atualizar uma pessoa
  export async function handleUpdate(id: string, nome: string, email: string) {
    console.log("ID para atualizar:", id); // DEBUG
    if (!id) {
      toast.error("ID é obrigatório para atualizar!");
      return;
    }
    try {
      const response = await axios.put(`http://localhost:3001/api/pessoasupdate/${id}`, {
        nome,
        email,
      });
      toast.success(response.data.message);
    } catch (error: any) {
      toast.error("Erro ao atualizar pessoa: " + error.response?.data.error);
    }
  }
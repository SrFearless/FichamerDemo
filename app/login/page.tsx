"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { makeRequest } from "@/axios"
import { decodeJwt } from "jose"
import Link from "next/link"

const loginSchema = z.object({
  email: z.string().email({ message: "Bardo, essa mensagem não chegará ao destinatário!" }),
  senha: z.string().min(6, { message: "Sua senha é mais fraca que um goblin doente!" }),
})

type LoginFormValues = z.infer<typeof loginSchema>
type Payload = { id: number; tipo: string; exp: number };

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", senha: "" },
  })

  async function onSubmit(values: LoginFormValues) {
    setIsLoading(true);
    try {
      const { data } = await makeRequest.post("login", values);
      const token: string = data.token;
      localStorage.setItem("token", token);
      
      const decoded = decodeJwt(token) as Payload;
      
      if (decoded.id && decoded.id > 0) {
        toast.success("Bem-vindo, aventureiro! O reino te aguarda!");
        router.push(`/escolha/${decoded.id}`);
      } else {
        throw new Error("O oráculo não reconhece seu selo de identificação");
      }
    } catch (err: any) {
      toast.error("O portal se recusa a abrir: " + (err.response?.data.erro ?? err.message));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1605106702734-205df224ecce?q=80&w=1470&auto=format&fit=crop')] bg-cover bg-center flex items-center justify-center p-4">
      {/* Efeito de névoa */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
      
      {/* Livro antigo que abre */}
      <div className="relative z-10 w-full max-w-4xl bg-amber-900/90 rounded-lg shadow-2xl border-8 border-amber-800 overflow-hidden">
        {/* Capa do livro com detalhes */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-b from-amber-700 to-amber-900"></div>
        <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-t from-amber-700 to-amber-900"></div>
        
        {/* Páginas internas */}
        <div className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Lado esquerdo - Ilustração */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-64 h-64 mb-6">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1633613286848-e6f43bbafb8d?q=80&w=1470&auto=format&fit=crop')] bg-cover bg-center rounded-full border-4 border-amber-600 shadow-lg"></div>
              <div className="absolute -inset-4 border-2 border-amber-400 rounded-full animate-pulse"></div>
            </div>
            
            <h2 className="text-3xl font-bold text-amber-100 mb-2 font-serif">Livro dos Heróis</h2>
            <p className="text-amber-200 text-center mb-6">"Somente os dignos podem passar por este portal"</p>
            
            <Link href="/registroCliente" passHref>
              <Button className="bg-amber-700 hover:bg-amber-600 text-amber-100 border-2 border-amber-900 px-8 py-4 text-lg font-bold tracking-wider transform hover:scale-105 transition-all">
                Registrar-se no Reino
              </Button>
            </Link>
          </div>
          
          {/* Lado direito - Formulário */}
          <div className="bg-amber-50/90 p-8 rounded-lg shadow-inner border-2 border-amber-200">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-amber-900 mb-2 font-serif">Portal de Entrada</h1>
              <p className="text-amber-800">Insira suas credenciais mágicas</p>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block text-amber-900 font-medium mb-1">Pergaminho do Mensageiro</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="escrito@em.runas"
                          className="bg-amber-100 border-2 border-amber-300 focus:border-amber-600 py-3 px-4 rounded-lg text-amber-900 placeholder-amber-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-700 font-medium" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="senha"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block text-amber-900 font-medium mb-1">Selo Secreto</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="bg-amber-100 border-2 border-amber-300 focus:border-amber-600 py-3 px-4 rounded-lg text-amber-900 placeholder-amber-500 tracking-widest"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-700 font-medium" />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-amber-100 py-4 px-6 rounded-lg text-lg font-bold tracking-wider border-2 border-amber-800 shadow-lg transform transition-all hover:scale-[1.02]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Abrindo o Portal...
                    </span>
                  ) : "Invocar Portal"}
                </Button>
              </form>
            </Form>
            
            <div className="mt-6 text-center ">
              <Link href="/" passHref>
                <Button className="bg-purple-900/50 border border-purple-500/30 text-amber-100 hover:text-amber-200 font-medium underline">
                  Voltar ao Mapa do Reino
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Detalhes decorativos */}
        <div className="absolute top-4 left-4 w-8 h-8 bg-amber-700 rounded-full"></div>
        <div className="absolute bottom-4 right-4 w-8 h-8 bg-amber-700 rounded-full"></div>
        <div className="absolute top-1/2 left-0 w-2 h-16 bg-amber-600 transform -translate-y-1/2"></div>
        <div className="absolute top-1/2 right-0 w-2 h-16 bg-amber-600 transform -translate-y-1/2"></div>
      </div>
    </div>
  )
}
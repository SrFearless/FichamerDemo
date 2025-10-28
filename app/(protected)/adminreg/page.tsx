"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { makeRequest } from "@/axios"
import Link from "next/link"
import { motion } from "framer-motion"
import { decodeJwt } from "jose";

type DecodedToken = {
  id: number;
};
const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
const decoded: DecodedToken | null = token ? decodeJwt(token) : null;

const registerSchema = z.object({
  nome: z.string().min(3, { message: "Teu nome deve ter pelo menos 3 caracteres" }),
  email: z.string().email({ message: "Precisamos de um pergaminho de mensagem válido" }),
  senha: z.string().min(6, { message: "Tua senha é mais fraca que um escudo de madeira podre" }),
  confirmsenha: z.string(),
}).refine(data => data.senha === data.confirmsenha, {
  message: "Os feitiços não coincidem!",
  path: ["confirmsenha"],
})

type RegisterFormValues = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { nome: "", email: "", senha: "", confirmsenha: "" },
  })

  async function onSubmit(values: RegisterFormValues) {
    setIsLoading(true)
    try {
      await makeRequest.post("registerAdmin", {
        nome: values.nome,
        email: values.email,
        senha: values.senha,
        confirmsenha: values.senha
      })
      toast.success("Registro completo! O reino te saúda, nobre aventureiro!")
      router.push(`/admin/${decoded ? decoded.id : ""}`)
    } catch (err: any) {
      toast.error("O feitiço falhou: " + (err.response?.data.erro ?? err.message))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1589998059171-988d887df646?q=80&w=1476&auto=format&fit=crop')] bg-cover bg-center flex items-center justify-center p-4 relative overflow-hidden">
      {/* Efeitos visuais */}
      <div className="absolute inset-0 bg-stone-900/70 backdrop-blur-sm"></div>
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-stone-900 to-transparent z-0"></div>
      
      {/* Tochas animadas */}
      <motion.div 
        className="absolute left-8 top-1/4 w-4 h-24 bg-gradient-to-b from-amber-500 to-transparent opacity-80"
        animate={{ opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="absolute -top-2 left-1 w-2 h-2 bg-amber-300 rounded-full blur-sm"></div>
      </motion.div>
      <motion.div 
        className="absolute right-8 top-1/3 w-4 h-24 bg-gradient-to-b from-amber-500 to-transparent opacity-80"
        animate={{ opacity: [0.7, 0.9, 0.7] }}
        transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
      >
        <div className="absolute -top-2 left-1 w-2 h-2 bg-amber-300 rounded-full blur-sm"></div>
      </motion.div>

      {/* Livro do Registro */}
      <motion.div 
        className="relative z-10 w-full max-w-2xl"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="bg-stone-800/90 border-2 border-amber-700 rounded-lg shadow-xl overflow-hidden">
          {/* Capa do livro */}
          <div className="bg-stone-900 border-b border-amber-800 p-6">
            <h1 className="text-3xl md:text-4xl font-bold text-center text-amber-200 font-serif tracking-wider">
              <span className="text-shadow shadow-amber-700/50">Tomo do Registro</span>
            </h1>
            <p className="text-center text-amber-400 mt-2">
              "Inscreva-te nos Papíros do reino"
            </p>
          </div>

          {/* Páginas internas */}
          <Card className="border-0 bg-stone-700/50 rounded-none shadow-none">
            <CardContent className="p-6 md:p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Campo Nome */}
                  <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="block text-amber-200 font-medium mb-1">
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                            Nome do Aventureiro
                          </div>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Geralt de Rívia"
                            className="bg-stone-800 border-2 border-stone-600 focus:border-amber-500 text-stone-200 placeholder-stone-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-amber-400 font-medium" />
                      </FormItem>
                    )}
                  />

                  {/* Campo Email */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="block text-amber-200 font-medium mb-1">
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                            </svg>
                            Pergaminho de Mensagens
                          </div>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="bruxo@kaermorhen.com"
                            className="bg-stone-800 border-2 border-stone-600 focus:border-amber-500 text-stone-200 placeholder-stone-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-amber-400 font-medium" />
                      </FormItem>
                    )}
                  />

                  {/* Campo Senha */}
                  <FormField
                    control={form.control}
                    name="senha"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="block text-amber-200 font-medium mb-1">
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                            Feitiço Secreto
                          </div>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            className="bg-stone-800 border-2 border-stone-600 focus:border-amber-500 text-stone-200 placeholder-stone-500 tracking-widest"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-amber-400 font-medium" />
                      </FormItem>
                    )}
                  />

                  {/* Campo Confirmar Senha */}
                  <FormField
                    control={form.control}
                    name="confirmsenha"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="block text-amber-200 font-medium mb-1">
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Confirmar Feitiço
                          </div>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            className="bg-stone-800 border-2 border-stone-600 focus:border-amber-500 text-stone-200 placeholder-stone-500 tracking-widest"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-amber-400 font-medium" />
                      </FormItem>
                    )}
                  />

                  {/* Botão de Registro */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-amber-100 py-6 text-lg font-bold tracking-wider border-2 border-amber-800 shadow-lg relative overflow-hidden"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Gravando no Tomo...
                        </span>
                      ) : (
                        <>
                          <span className="relative z-10">Assinar Pergaminho</span>
                          <span className="absolute inset-0 bg-amber-400/30 opacity-0 hover:opacity-100 transition-opacity duration-300"></span>
                        </>
                      )}
                    </Button>
                  </motion.div>
                </form>
              </Form>

              {/* Link para Login */}
              <div className="mt-6 text-center">
                <Link href="/login" passHref>
                  <Button variant="link" className="text-amber-400 hover:text-amber-300 font-medium">
                    Já possuis uma conta? Apresenta-te no Portal!
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Efeitos de partículas */}
      <div className="absolute inset-0 overflow-hidden z-0">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-amber-400/20"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              width: Math.random() * 8 + 2,
              height: Math.random() * 8 + 2,
              opacity: 0
            }}
            animate={{
              y: [0, -100],
              opacity: [0, 0.4, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
          />
        ))}
      </div>
    </div>
  )
}
"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export default function CharacterSelection() {
  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=1470&auto=format&fit=crop')] bg-cover bg-center flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Efeito de névoa e escuridão */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      
      {/* Título com animação de brilho */}
      <motion.h1 
        className="relative z-10 text-5xl md:text-7xl font-bold text-amber-300 mb-16 font-serif text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <span className="text-shadow-lg shadow-amber-800/80">Escolha Seu Destino</span>
        <motion.span 
          className="absolute -top-4 -right-8 text-4xl"
          animate={{ rotate: 20, scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 3 }}
        >
          ✧
        </motion.span>
      </motion.h1>

      {/* Container dos botões */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-6xl px-4">
        {/* Botão do Aventureiro */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <Link href={`/aventureirotaverna`}>
            <Button className="relative w-full h-64 md:h-80 bg-gradient-to-br from-blue-900/90 to-blue-700/90 border-4 border-blue-400 rounded-xl shadow-2xl overflow-hidden group transition-all duration-500 hover:border-blue-300 hover:shadow-blue-500/50">
              {/* Efeito de brilho */}
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?q=80&w=1630&auto=format&fit=crop')] bg-cover bg-center opacity-30 group-hover:opacity-40 transition-opacity duration-500"></div>
              
              {/* Conteúdo do botão */}
              <div className="relative z-10 flex flex-col items-center justify-center h-full p-6">
                <div className="mb-6 p-4 bg-blue-900/70 rounded-full border-2 border-blue-400 group-hover:scale-110 transition-transform duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-blue-200 mb-2 font-serif tracking-wider group-hover:text-blue-100 transition-colors duration-300">AVENTUREIRO</h2>
                <p className="text-blue-300 text-center text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  "O caminho da coragem e das descobertas"
                </p>
              </div>
              
              {/* Efeitos decorativos */}
              <div className="absolute bottom-0 left-0 right-0 h-2 bg-blue-400/50 group-hover:bg-blue-300/70 transition-colors duration-300"></div>
              <div className="absolute top-4 left-4 w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
              <div className="absolute bottom-4 right-4 w-3 h-3 bg-blue-400 rounded-full animate-pulse delay-300"></div>
            </Button>
          </Link>
        </motion.div>

        {/* Botão do Mestre */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <Link href={`/mestretaverna`}>
            <Button className="relative w-full h-64 md:h-80 bg-gradient-to-br from-purple-900/90 to-purple-700/90 border-4 border-purple-400 rounded-xl shadow-2xl overflow-hidden group transition-all duration-500 hover:border-purple-300 hover:shadow-purple-500/50">
              {/* Efeito de brilho */}
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518562180175-34a163b1a9a9?q=80&w=1470&auto=format&fit=crop')] bg-cover bg-center opacity-30 group-hover:opacity-40 transition-opacity duration-500"></div>
              
              {/* Conteúdo do botão */}
              <div className="relative z-10 flex flex-col items-center justify-center h-full p-6">
                <div className="mb-6 p-4 bg-purple-900/70 rounded-full border-2 border-purple-400 group-hover:scale-110 transition-transform duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-purple-200 mb-2 font-serif tracking-wider group-hover:text-purple-100 transition-colors duration-300">MESTRE</h2>
                <p className="text-purple-300 text-center text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  "O poder de moldar realidades e destinos"
                </p>
              </div>
              
              {/* Efeitos decorativos */}
              <div className="absolute bottom-0 left-0 right-0 h-2 bg-purple-400/50 group-hover:bg-purple-300/70 transition-colors duration-300"></div>
              <div className="absolute top-4 right-4 w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
              <div className="absolute bottom-4 left-4 w-3 h-3 bg-purple-400 rounded-full animate-pulse delay-500"></div>
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Rodapé decorativo */}
      <motion.div 
        className="relative z-10 mt-16 text-amber-200 text-lg font-medium opacity-80"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        transition={{ delay: 1.2, duration: 1 }}
      >
        "Grandes histórias começam com uma escolha"
      </motion.div>
      
      {/* Partículas decorativas */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-amber-400/30"
            initial={{
              x: Math.random() * 100,
              y: Math.random() * 100,
              width: Math.random() * 10 + 2,
              height: Math.random() * 10 + 2,
              opacity: 0
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: [0, 0.3, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: "reverse",
              delay: Math.random() * 5
            }}
          />
        ))}
      </div>
    </div>
  )
}
"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"

export default function Home() {
  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1605106702734-205df224ecce?q=80&w=1470&auto=format&fit=crop')] bg-cover bg-center flex items-center justify-center p-4 relative overflow-hidden">
      {/* Efeitos visuais */}
      <div className="absolute inset-0 bg-stone-900/70 backdrop-blur-sm"></div>
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-stone-900 via-stone-900/80 to-transparent z-0"></div>
      
      {/* Grimório central */}
      <div className="relative z-10 w-full max-w-6xl bg-stone-800/90 border-4 border-amber-700 rounded-xl shadow-2xl overflow-hidden">
        {/* Capa do grimório */}
        <div className="bg-gradient-to-r from-stone-900 to-stone-800 border-b border-amber-800 p-8 text-center">
          <motion.h1 
            className="text-4xl md:text-6xl font-bold text-amber-300 font-serif tracking-wider"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-shadow-lg shadow-amber-700/50">Tomo das Crônicas Épicas</span>
          </motion.h1>
          <motion.p 
            className="mt-4 text-xl text-amber-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            "Onde lendas são forjadas e histórias ganham vida"
          </motion.p>
        </div>

        {/* Páginas internas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-stone-700/30">
          {/* Coluna esquerda - Texto introdutório */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <div className="p-6 bg-stone-800/80 border-l-4 border-amber-600 rounded-r-lg">
              <h2 className="text-2xl font-bold text-amber-300 mb-4 font-serif">Para os Aventureiros</h2>
              <p className="text-lg text-stone-200 leading-relaxed">
                "Se és um <span className="text-amber-300 font-medium">Player</span> que deseja criar teu <span className="text-amber-300 font-medium">Personagem</span> com praticidade e imersão, onde poderás escolher <span className="text-amber-300">Classe</span>, <span className="text-amber-300">Raça</span>, <span className="text-amber-300">Idiomas</span>, <span className="text-amber-300">Valores</span> e muito mais, este grimório será teu fiel escudeiro."
              </p>
            </div>

            <div className="p-6 bg-stone-800/80 border-l-4 border-purple-600 rounded-r-lg">
              <h2 className="text-2xl font-bold text-purple-300 mb-4 font-serif">Para os Mestres</h2>
              <p className="text-lg text-stone-200 leading-relaxed">
                "Mas caso sejas um <span className="text-purple-300 font-medium">Mestre</span> que se pergunte <span className="italic">'Onde poderei guardar minhas informações, criar cenários, deixar pré-definidos Inimigos ou até mesmo Trilhas Sonoras?'</span> Aqui encontrarás teu reino, basta clicar no botão do <span className="text-purple-300 font-medium">Mestre</span> e desvendar todos os segredos."
              </p>
            </div>
          </motion.div>

          {/* Coluna direita - Cards de funcionalidades */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            {/* Card 1 - Criação */}
            <div className="p-6 bg-stone-800/80 border border-amber-500/30 rounded-lg shadow-lg hover:shadow-amber-500/20 transition-all duration-300 group">
              <div className="flex items-start">
                <div className="bg-amber-900/50 p-3 rounded-lg mr-4 group-hover:bg-amber-800/70 transition-colors duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-amber-300 mb-2 font-serif">Forja de Personagens</h3>
                  <p className="text-stone-300">Crie heróis detalhados com sistema intuitivo e guiado passo-a-passo</p>
                </div>
              </div>
            </div>

            {/* Card 2 - Organização */}
            <div className="p-6 bg-stone-800/80 border border-purple-500/30 rounded-lg shadow-lg hover:shadow-purple-500/20 transition-all duration-300 group">
              <div className="flex items-start">
                <div className="bg-purple-900/50 p-3 rounded-lg mr-4 group-hover:bg-purple-800/70 transition-colors duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-purple-300 mb-2 font-serif">Biblioteca do Mestre</h3>
                  <p className="text-stone-300">Organize campanhas, NPCs, encontros e recursos em pastas temáticas</p>
                </div>
              </div>
            </div>

            {/* Card 3 - Compartilhamento */}
            <div className="p-6 bg-stone-800/80 border border-amber-500/30 rounded-lg shadow-lg hover:shadow-amber-500/20 transition-all duration-300 group">
              <div className="flex items-start">
                <div className="bg-amber-900/50 p-3 rounded-lg mr-4 group-hover:bg-amber-800/70 transition-colors duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-amber-300 mb-2 font-serif">Taverna Virtual</h3>
                  <p className="text-stone-300">Compartilhe personagens e recursos com outros jogadores</p>
                </div>
              </div>
            </div>

            {/* Botões de ação */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link href="/escolha">
                  <Button className="w-full bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-amber-100 py-6 text-lg font-bold tracking-wider border-2 border-amber-800 shadow-lg">
                    Iniciar Jornada
                  </Button>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link href="/escolha">
                  <Button className="w-full bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-600 hover:to-purple-500 text-purple-100 py-6 text-lg font-bold tracking-wider border-2 border-purple-800 shadow-lg">
                    Governar o Reino
                  </Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Efeitos decorativos */}
      <div className="absolute top-8 left-8 w-16 h-16 bg-amber-600/20 rounded-full blur-md"></div>
      <div className="absolute bottom-16 right-12 w-24 h-24 bg-purple-600/20 rounded-full blur-md"></div>
      
      {/* Partículas mágicas */}
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-amber-400/20"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            width: Math.random() * 6 + 2,
            height: Math.random() * 6 + 2,
          }}
          animate={{
            y: [0, -100],
            opacity: [0.3, 0.8, 0],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            delay: Math.random() * 5
          }}
        />
      ))}
    </div>
  )
}
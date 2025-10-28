import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { cn } from '@/lib/utils'
// importe o novo client component:
import ClientUnloadCleanup from '@/components/ClientUnloadCleanup'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Fichamer',
  icons: {
    icon: "/FAVICON (BW).png",},
  description: 'Cansou de Imaginar tudo na sua Mesa? Venha dar vida a seu RPG !!',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={cn(inter.className, 'min-h-screen bg-gray-500')}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          {/* Esse componente roda no cliente e limpa o localStorage no unload */}
          <ClientUnloadCleanup />
          <div className="flex min-h-screen flex-col">
            <main className="flex-1">{children}</main>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}

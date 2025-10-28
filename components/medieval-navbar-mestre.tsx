"use client";

import React, { useState, useEffect } from "react";
import { Menu, ScrollText, Shield, Home, LogOut, HandHelping, Dog, BookOpenText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { decodeJwt } from "jose";

type Decoded = { id: number; tipo: string; exp: number };

interface UserProfile {
  foto_url: string | null;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export function MedievalNavBarMs() {
  const [isClient, setIsClient] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [session, setSession] = useState<Decoded | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const publicRoutes = ['/', '/feedsemid', '/registrotemp', '/registroCliente'];

    if (publicRoutes.includes(pathname)) {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("token");
    
    if (!token) {
      if (pathname !== "/login") {
        router.push("/login");
      }
      setLoading(false);
      return;
    }
    
    try {
      const decoded = decodeJwt(token) as Decoded;
      setSession(decoded);
      
      const pathId = pathname.split('/')[2];
      if (pathId && decoded.id !== Number(pathId)) {
        router.push(`/dashboard/${decoded.id}`);
      }

      // Fetch do perfil para pegar a foto
      fetch(`${API_BASE}/api/pessoasconfig/${decoded.id}`, {
        credentials: "include",
      })
        .then(r => r.json())
        .then((data: UserProfile) => {
          if (data.foto_url) {
            setPhotoUrl(`${API_BASE}${data.foto_url}`);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } catch (err) {
      console.error("Token inválido:", err);
      localStorage.removeItem("token");
      router.push("/login");
    }
  }, [isClient, pathname, router]);

  if (!isClient || loading) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-amber-800 bg-stone-900/90 backdrop-blur-sm">
        <div className="container flex h-16 items-center">
          <div className="w-full h-8 bg-stone-700 rounded animate-pulse"></div>
        </div>
      </header>
    );
  }

  if (session === null) {
    return null;
  }

  const { id: uid, tipo } = session;  

  const routes = [
    { href: `/escolha/${uid}`,      label: "Escolha", icon: <HandHelping className="h-5 w-5" />, roles: ["Cliente","Sub-Admin","Admin"] },
    { href: `/mestretaverna/${uid}`,label: "Taverna", icon: <Home className="h-5 w-5" />, roles: ["Cliente","Sub-Admin","Admin"] },
    { href: `/mestreficha/${uid}`,  label: "Ficha", icon: <ScrollText className="h-5 w-5" />, roles: ["Cliente","Sub-Admin","Admin"] },
    { href: `/aventureiromascote/${uid}`,   label: "Mascotes", icon: <Dog className="h-5 w-5" />, roles: ["Cliente","Sub-Admin","Admin"] },
    { href: `/aventureiromissoes/${uid}`,   label: "Missões", icon: <BookOpenText className="h-5 w-5" />, roles: ["Cliente","Sub-Admin","Admin"] },
    { href: `/adminsub/${uid}`,     label: "Conselho", icon: <Shield className="h-5 w-5" />, roles: ["Sub-Admin",] },
    { href: `/admin/${uid}`,        label: "Reino",   icon: <Shield className="h-5 w-5" />, roles: ["Admin"] },
    { href: `/mestrefichapessoal`,  label: "", icon: <ScrollText className="h-5 w-5" />, roles: ["Admin"] },
  ];

  const visibleRoutes = routes.filter(r => r.roles.includes(tipo));

  function handleLogout() {
    localStorage.removeItem("token");
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-amber-800 bg-stone-900/90 backdrop-blur-sm shadow-lg">
      <div className="container flex h-16 items-center">
        {/* Menu mobile */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden text-amber-400 hover:bg-amber-900/50">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Abrir menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="bg-stone-800 border-r border-amber-800">
            <nav className="grid gap-6 text-lg font-medium mt-6">
              <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-2 text-amber-400">
                <span className="font-bold text-xl font-serif">Fichamer</span>
              </Link>
              {visibleRoutes.map(({ href, label, icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2 rounded-lg",
                    pathname === href 
                      ? "bg-amber-900/50 text-amber-300 border border-amber-600" 
                      : "text-stone-300 hover:bg-stone-700/50 hover:text-amber-200"
                  )}
                >
                  {icon}
                  {label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link href="/" className="hidden md:flex items-center gap-2">
          <span className="font-bold text-xl text-amber-400 font-serif">Fichamer</span>
        </Link>

        {/* Menu desktop */}
        <nav className="mx-6 hidden items-center space-x-2 md:flex lg:space-x-4">
          {visibleRoutes.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                pathname === href
                  ? "bg-amber-900/30 text-amber-300 border border-amber-600/50"
                  : "text-stone-300 hover:bg-stone-700/50 hover:text-amber-200"
              )}
            >
              {icon}
              {label}
            </Link>
          ))}
        </nav>

        {/* Ícones à direita */}
        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-amber-900/50">
                <Avatar className="h-8 w-8 border border-amber-600">
                  <AvatarImage 
                    src={photoUrl ?? "/placeholder-user.jpg"}
                    alt="Avatar" 
                  />
                  <AvatarFallback className="bg-stone-700 text-amber-400">?</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="bg-stone-800 border border-amber-700 text-stone-200"
            >
              <DropdownMenuItem asChild className="hover:bg-stone-700 focus:bg-stone-700">
                <Link href={`/configuracoes/${uid}`} className="flex items-center gap-2">
                  <ScrollText className="h-4 w-4" />
                  Configurações
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-amber-700/50" />
              <DropdownMenuItem 
                onClick={handleLogout} 
                className="flex items-center gap-2 text-red-400 hover:bg-stone-700 focus:bg-stone-700"
              >
                <LogOut className="h-4 w-4" />
                Sair da Taverna
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
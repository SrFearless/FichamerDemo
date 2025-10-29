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

export function MedievalNavBarAv() {
  const [isClient, setIsClient] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    setLoading(false);
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

  // Rotas sem ID - ajuste conforme necessário
  const routes = [
    { href: `/`, label: "Escolha", icon: <HandHelping className="h-5 w-5" /> },
    { href: `/aventureirotaverna`, label: "Taverna", icon: <Home className="h-5 w-5" /> },
    { href: `/aventureiroficha`, label: "Ficha", icon: <ScrollText className="h-5 w-5" /> },
    { href: `/aventureiromascote`, label: "Mascotes", icon: <Dog className="h-5 w-5" /> },
    { href: `/aventureiromissoes`, label: "Missões", icon: <BookOpenText className="h-5 w-5" /> },
  ];

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
              {routes.map(({ href, label, icon }) => (
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
          {routes.map(({ href, label, icon }) => (
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
      </div>
    </header>
  );
}
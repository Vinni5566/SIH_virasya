"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Search, User, Store, Sparkles, Menu, X, Globe, ChevronDown, LogOut, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { doc } from 'firebase/firestore';
import { switchPageLanguage } from '@/lib/translate-page';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'mr', label: 'मराठी' },
  { code: 'gu', label: 'ગુજરાતી' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'മലയാളம்' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ' },
];

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [lang, setLang] = useState('en');
  
  const { user } = useUser();
  const db = useFirestore();
  const auth = useAuth();
  const router = useRouter();

  const profileRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'userProfiles', user.uid);
  }, [db, user]);

  const { data: profile } = useDoc(profileRef);

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push('/');
  };

  const switchLanguage = (langCode: string) => {
    setLang(langCode);
    switchPageLanguage(langCode);
  };

  const displayName = profile?.name || user?.displayName || user?.email?.split('@')[0] || 'User';
  const role = profile?.role;

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-headline font-bold text-primary tracking-tight">Virasya</span>
          </Link>

          <div className="hidden md:flex items-center flex-1 max-w-md px-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search crafts, regions, artisans..." 
                className="pl-10 h-9 bg-secondary/50 border-none rounded-full"
              />
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/marketplace" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
              <Store className="h-4 w-4" />
              Marketplace
            </Link>

            {role === 'artisan' && (
              <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
                <Sparkles className="h-4 w-4 text-primary" />
                Artisan Hub
              </Link>
            )}

            {role === 'buyer' && (
              <Link href="/purchases" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
                <Package className="h-4 w-4" />
                My Purchases
              </Link>
            )}
            
            <div className="h-6 w-[1px] bg-border mx-2" />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 rounded-full border border-primary/10">
                  <Globe className="h-4 w-4 text-primary" />
                  {LANGUAGES.find(l => l.code === lang)?.label}
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl border-none shadow-xl max-h-[70vh] overflow-y-auto">
                {LANGUAGES.map((l) => (
                  <DropdownMenuItem key={l.code} onClick={() => switchLanguage(l.code)} className="cursor-pointer">
                    {l.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 border border-primary/20">
                    <Avatar className="h-full w-full">
                      <AvatarImage src={user.photoURL || undefined} alt={displayName} />
                      <AvatarFallback className="bg-primary/5 text-primary">
                        {displayName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 rounded-2xl shadow-xl border-none p-2" align="end">
                  <div className="flex items-center justify-start gap-2 p-3">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-bold leading-none font-headline">{displayName}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator className="bg-secondary/50" />
                  
                  <DropdownMenuItem onClick={handleLogout} className="rounded-xl cursor-pointer py-2.5 text-destructive focus:text-destructive focus:bg-destructive/5">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth">
                <Button size="sm" className="rounded-full px-8 h-10 shadow-lg shadow-primary/20">Login</Button>
              </Link>
            )}
          </div>

          <div className="flex md:hidden items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(!isSearchOpen)}>
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        {isSearchOpen && (
          <div className="md:hidden pb-4 px-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search crafts..." 
                className="pl-10 h-10 bg-secondary/50 border-none rounded-full"
                autoFocus
              />
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-6 border-t mt-2 flex flex-col gap-4 py-4 animate-in slide-in-from-top-2">
            <Link href="/marketplace" className="px-2 py-2 text-lg font-medium" onClick={() => setIsMenuOpen(false)}>Marketplace</Link>
            
            {role === 'artisan' && (
              <Link href="/dashboard" className="px-2 py-2 text-lg font-medium text-primary flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                <Sparkles className="h-5 w-5" />
                Artisan Hub
              </Link>
            )}

            {role === 'buyer' && (
              <Link href="/purchases" className="px-2 py-2 text-lg font-medium" onClick={() => setIsMenuOpen(false)}>My Purchases</Link>
            )}

            {user && (
              <button onClick={handleLogout} className="px-2 py-2 text-lg font-medium text-destructive text-left">Logout</button>
            )}
            <div className="flex flex-col gap-2 pt-4 border-t px-2">
               <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Language</p>
               <div className="grid grid-cols-2 gap-2">
                 {LANGUAGES.map(l => (
                   <Button 
                    key={l.code} 
                    variant={lang === l.code ? "default" : "outline"} 
                    size="sm" 
                    onClick={() => switchLanguage(l.code)}
                    className="rounded-full h-8 text-xs"
                   >
                     {l.label}
                   </Button>
                 ))}
               </div>
               {!user && (
                <Link href="/auth" className="mt-4" onClick={() => setIsMenuOpen(false)}>
                  <Button size="lg" className="w-full rounded-full">Get Started</Button>
                </Link>
               )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

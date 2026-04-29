/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from "motion/react";
import { 
  Trophy, 
  Gamepad2, 
  Car, 
  Zap, 
  ChevronRight, 
  Search,
  Menu,
  X,
  Play,
  Monitor,
  Smartphone,
  Star,
  Home,
  Flame,
  LayoutGrid,
  Clock,
  ShieldCheck,
  Maximize2
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { DriftGame } from "./components/DriftGame";

// Types
interface Game {
  id: string;
  title: string;
  category: string;
  rating: number;
  players: string;
  thumbnail: string;
  tags: string[];
}

const GAMES: Game[] = [
  {
    id: "1",
    title: "Cyber Racer 2077",
    category: "Poyga",
    rating: 4.8,
    players: "1.2M",
    thumbnail: "https://images.unsplash.com/photo-1603584173870-7f3ca99a9184?auto=format&fit=crop&q=80&w=800",
    tags: ["Cyberpunk", "Drift", "Tezlik"]
  },
  {
    id: "2",
    title: "Off-Road Madness",
    category: "Simulyator",
    rating: 4.5,
    players: "800K",
    thumbnail: "https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?auto=format&fit=crop&q=80&w=800",
    tags: ["4x4", "Loyqa", "Sarguzasht"]
  },
  {
    id: "3",
    title: "Formula One Pro",
    category: "Poyga",
    rating: 4.9,
    players: "2.1M",
    thumbnail: "https://images.unsplash.com/photo-1541443131876-44b03de101c5?auto=format&fit=crop&q=80&w=800",
    tags: ["F1", "Tezlik", "Professional"]
  },
  {
    id: "4",
    title: "Street Drift Kings",
    category: "Drift",
    rating: 4.7,
    players: "1.5M",
    thumbnail: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=800",
    tags: ["Shahar", "Tun", "Drift"]
  },
  {
    id: "5",
    title: "Monster Truck Arena",
    category: "Aksiya",
    rating: 4.3,
    players: "500K",
    thumbnail: "https://images.unsplash.com/photo-1614242233215-6bb9fdf7d589?auto=format&fit=crop&q=80&w=800",
    tags: ["Vayronkorlik", "Arena", "Aksiya"]
  },
  {
    id: "6",
    title: "Classic Muscle Tour",
    category: "Retro",
    rating: 4.6,
    players: "900K",
    thumbnail: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800",
    tags: ["V8", "Klassik", "Retro"]
  }
];

const ALL_TAGS = Array.from(new Set(GAMES.flatMap(g => g.tags))).sort();

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState("Barchasi");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeGame, setActiveGame] = useState<Game | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Reset isPlaying when activeGame is closed
  useEffect(() => {
    if (!activeGame) setIsPlaying(false);
  }, [activeGame]);

  const filteredGames = useMemo(() => {
    return GAMES.filter(game => {
      const matchCategory = selectedCategory === "Barchasi" || game.category === selectedCategory;
      const matchTags = selectedTags.length === 0 || selectedTags.every(tag => game.tags.includes(tag));
      const matchSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchTags && matchSearch;
    });
  }, [selectedCategory, selectedTags, searchQuery]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="min-h-screen bg-sleek-black text-slate-200 flex overflow-hidden relative">
      {/* Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-sleek-red/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[120px]"></div>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 border-r border-sleek-border bg-sleek-dark flex flex-col transition-transform duration-300
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        lg:static lg:block
      `}>
        <div className="p-8">
          <div className="flex items-center gap-2">
            <Car className="w-8 h-8 text-sleek-red" />
            <h1 className="text-2xl font-black italic tracking-tighter text-white">
              MASHINA<span className="text-sleek-red">O'YINLAR</span>
            </h1>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <SidebarLink icon={<Home className="w-4 h-4" />} label="Bosh sahifa" active />
          <SidebarLink icon={<Flame className="w-4 h-4" />} label="Mashhur poygalar" />
          <SidebarLink icon={<LayoutGrid className="w-4 h-4" />} label="Kategoriyalar" />
          <SidebarLink icon={<Clock className="w-4 h-4" />} label="Yangi o'yinlar" />
        </nav>

        <div className="p-6 border-t border-sleek-border">
          <div className="mb-6">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-4 px-2">Filtrlar (Teglar)</h4>
            <div className="flex flex-wrap gap-2 px-2">
              {ALL_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border transition-all ${
                    selectedTags.includes(tag)
                    ? "bg-sleek-red border-sleek-red text-white"
                    : "border-sleek-border text-slate-500 hover:border-slate-400"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest">Sening darajang</span>
              <ShieldCheck className="w-3 h-3 text-sleek-red" />
            </div>
            <p className="text-lg font-black text-white italic">PRO RACER</p>
            <div className="w-full h-1 bg-slate-700 mt-2 rounded-full overflow-hidden">
              <div className="w-[75%] h-full bg-sleek-red"></div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col z-10 w-full overflow-y-auto">
        <header className="h-20 glass-header flex items-center justify-between px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4 flex-1">
            <button 
              className="lg:hidden p-2 text-slate-400"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="relative w-full max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-sleek-red transition-colors" />
              <input 
                type="text" 
                placeholder="O'yin qidirish..." 
                className="sleek-input w-full pl-12 pr-6 py-2"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4 pl-4">
            <button className="hidden sm:block p-2 text-slate-400 hover:text-white transition-colors">
              <Trophy className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sleek-red to-orange-500 flex items-center justify-center font-bold text-white shadow-inner cursor-pointer">
              F
            </div>
          </div>
        </header>

        <div className="p-8 space-y-12">
          {/* Featured Hero */}
          <section className="relative h-80 rounded-3xl overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-sleek-black via-transparent to-transparent z-10" />
            <img 
              src="https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=1200" 
              alt="Night Drift Pro 2"
              className="absolute inset-0 w-full h-full object-cover grayscale brightness-50 group-hover:scale-105 transition-transform duration-1000"
              referrerPolicy="no-referrer"
            />
            <div className="relative h-full flex flex-col justify-center px-12 space-y-6 z-20">
              <div className="bg-sleek-red text-white text-[10px] uppercase font-bold tracking-[0.2em] px-3 py-1 rounded w-fit italic">
                Hafta o'yini
              </div>
              <h2 className="text-5xl md:text-6xl font-black italic tracking-tighter text-white">NIGHT DRIFT PRO 2</h2>
              <p className="text-slate-300 max-w-md text-sm leading-relaxed font-medium">
                Tungi shahar ko'chalarida tezlikni his qiling. Eng yangi grafik va real fizikani sinab ko'ring.
              </p>
              <button 
                onClick={() => setActiveGame(GAMES[3])}
                className="bg-white text-black font-black px-8 py-3 rounded-full hover:scale-105 transition-transform w-fit uppercase tracking-widest text-xs"
              >
                HOZIR O'YNA
              </button>
            </div>
          </section>

          {/* Game List Area */}
          <section>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <h3 className="text-2xl font-black italic tracking-tight">O'yinlar Olami</h3>
              <div className="flex flex-wrap gap-2">
                {["Barchasi", "Poyga", "Simulyator", "Drift", "Aksiya"].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-all border ${
                      selectedCategory === cat
                      ? "bg-sleek-red border-sleek-red text-white"
                      : "bg-slate-900 border-sleek-border text-slate-500 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {selectedTags.length > 0 && (
              <div className="flex items-center gap-2 mb-6">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Filtrlangan:</span>
                {selectedTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className="flex items-center gap-1 bg-sleek-red/10 text-sleek-red px-2 py-1 rounded-md text-[10px] font-bold uppercase border border-sleek-red/20"
                  >
                    {tag} <X className="w-3 h-3" />
                  </button>
                ))}
                <button 
                  onClick={() => setSelectedTags([])}
                  className="text-[10px] font-bold uppercase text-slate-500 hover:text-white"
                >
                  Tozalash
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredGames.map((game, i) => (
                <motion.div
                  key={game.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="sleek-card group cursor-pointer"
                  onClick={() => setActiveGame(game)}
                >
                  <div className="aspect-[16/10] overflow-hidden relative">
                    <img 
                      src={game.thumbnail} 
                      alt={game.title} 
                      className="w-full h-full object-cover grayscale brightness-75 group-hover:scale-110 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-sleek-black/80 to-transparent p-4 flex flex-col justify-end">
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="text-xs font-bold">{game.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between gap-2 mb-2">
                       <h4 className="font-black text-sm uppercase tracking-tight text-white group-hover:text-sleek-red transition-colors">{game.title}</h4>
                       <span className="text-[10px] font-bold text-slate-500 uppercase">{game.category}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {game.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-[9px] font-bold text-slate-500 uppercase border border-sleek-border px-1.5 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                      {game.tags.length > 2 && (
                        <span className="text-[9px] font-bold text-slate-500 uppercase px-1.5 py-0.5">
                          +{game.tags.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredGames.length === 0 && (
              <div className="text-center py-32 bg-slate-900/20 rounded-3xl border border-dashed border-sleek-border">
                <Gamepad2 className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-sm">O'yinlar topilmadi</p>
                <button 
                  onClick={() => { setSelectedCategory("Barchasi"); setSelectedTags([]); setSearchQuery(""); }}
                  className="mt-4 text-sleek-red text-[10px] font-bold uppercase tracking-widest hover:underline"
                >
                  Barcha filtrlarni bekor qilish
                </button>
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <footer className="p-12 border-t border-sleek-border bg-sleek-dark/30 mt-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
              <p className="text-xs font-bold text-slate-600 uppercase tracking-[0.2em]">© 2026 MASHINA O'YINLAR PORTALI</p>
              <p className="text-[10px] text-slate-700 uppercase mt-2">Barcha huquqlar himoyalangan va poygalar tayyor.</p>
            </div>
            <div className="flex gap-8">
               <FooterLink label="Biz haqimizda" />
               <FooterLink label="Yordam" />
               <FooterLink label="Maxfiylik" />
            </div>
          </div>
        </footer>
      </main>

      {/* Play Modal (O'yin o'ynash) */}
      <AnimatePresence>
        {activeGame && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-sleek-black flex flex-col"
          >
            <div className="h-16 flex items-center justify-between px-6 bg-sleek-dark border-b border-sleek-border">
              <div className="flex items-center gap-4">
                <button onClick={() => setActiveGame(null)} className="p-2 text-slate-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
                <div className="flex flex-col">
                  <h3 className="text-sm font-black uppercase italic tracking-wider text-white">{activeGame.title}</h3>
                  <span className="text-[10px] text-sleek-red font-bold uppercase tracking-widest">O'ynalmoqda...</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1 bg-sleek-red/10 border border-sleek-red/20 rounded-full">
                  <Monitor className="w-3 h-3 text-sleek-red" />
                  <span className="text-[10px] font-bold text-sleek-red uppercase">Full Speed Mode</span>
                </div>
                <button className="p-2 text-slate-400 hover:text-white">
                  <Maximize2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 relative flex items-center justify-center bg-slate-900 overflow-hidden">
               {isPlaying ? (
                 <DriftGame onExit={() => setIsPlaying(false)} />
               ) : (
                 <>
                   {/* Simulating a Game View */}
                   <div className="absolute inset-0 opacity-20 overflow-hidden pointer-events-none">
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-sleek-red/30 rounded-full blur-[200px]" />
                   </div>
                   
                   <div className="relative z-10 text-center max-w-lg px-8">
                     <motion.div
                       animate={{ scale: [1, 1.05, 1], rotate: [0, 1, -1, 0] }}
                       transition={{ repeat: Infinity, duration: 4 }}
                       className="mb-8"
                     >
                       <Car className="w-32 h-32 text-sleek-red mx-auto drop-shadow-[0_0_30px_rgba(220,38,36,0.5)]" />
                     </motion.div>
                     <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-4">Tayyormisiz?</h2>
                     <p className="text-slate-400 text-sm mb-12 uppercase tracking-widest font-bold">START tugmasini bosing va poygani boshlang!</p>
                     <button 
                       onClick={() => setIsPlaying(true)}
                       className="btn-sleek px-16 py-6 text-xl tracking-[0.2em]"
                     >
                       START RACE
                     </button>
                     
                     <div className="mt-20 grid grid-cols-2 gap-8 pt-8 border-t border-white/5">
                       <div className="text-left">
                         <span className="block text-[10px] font-bold text-slate-600 uppercase mb-2">Boshqaruv</span>
                         <div className="flex gap-2">
                           <kbd className="bg-slate-800 px-2 py-1 rounded text-xs font-bold text-white">W</kbd>
                           <kbd className="bg-slate-800 px-2 py-1 rounded text-xs font-bold text-white">A</kbd>
                           <kbd className="bg-slate-800 px-2 py-1 rounded text-xs font-bold text-white">S</kbd>
                           <kbd className="bg-slate-800 px-2 py-1 rounded text-xs font-bold text-white">D</kbd>
                         </div>
                       </div>
                       <div className="text-right">
                         <span className="block text-[10px] font-bold text-slate-600 uppercase mb-2">Nitros</span>
                         <kbd className="bg-sleek-red px-4 py-1 rounded text-xs font-bold text-white">SPACE</kbd>
                       </div>
                     </div>
                   </div>
                 </>
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SidebarLink({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <a href="#" className={`
      flex items-center px-4 py-3 rounded-lg transition-all text-sm font-bold tracking-tight
      ${active 
        ? "bg-sleek-red text-white shadow-lg shadow-sleek-red/20" 
        : "text-slate-400 hover:bg-slate-800/50 hover:text-white"}
    `}>
      <span className="mr-3">{icon}</span>
      {label}
    </a>
  );
}

function FooterLink({ label }: { label: string }) {
  return (
    <a href="#" className="text-[10px] font-bold text-slate-600 uppercase tracking-widest hover:text-sleek-red transition-colors">
      {label}
    </a>
  );
}

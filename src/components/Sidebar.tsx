import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, MessageSquareText, Package, BarChart3, Menu, X, Home } from "lucide-react";

const navItems = [
  { to: "/", label: "Início", icon: Home },
  { to: "/dashboard", label: "Visão geral", icon: LayoutDashboard },
  { to: "/analytics", label: "IA Assistente", icon: MessageSquareText },
  { to: "/estoque", label: "Estoque", icon: Package },
  { to: "/bi", label: "Relatórios gerenciais", icon: BarChart3 },
];

const Sidebar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navContent = (
    <>
      <div className="p-4 border-b border-border">
        <Link to="/" className="flex items-center gap-2" onClick={() => setIsMobileOpen(false)}>
          <img src="/luminai-vertical-light-512.png" alt="Logo" className="h-8" />
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200
                ${active
                  ? "bg-construtop-blue text-white"
                  : "text-synergy-dark hover:bg-construtop-orange/10 hover:text-construtop-orange"
                }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-56 md:fixed md:inset-y-0 bg-white border-r border-border z-30">
        {navContent}
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white/80 backdrop-blur-md border-b border-border z-30 flex items-center px-4">
        <button onClick={() => setIsMobileOpen(true)} className="p-2 rounded-md hover:bg-muted transition">
          <Menu className="h-5 w-5 text-synergy-dark" />
        </button>
        <Link to="/" className="ml-2">
          <img src="/luminai-vertical-light-512.png" alt="Logo" className="h-7" />
        </Link>
      </div>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white flex flex-col animate-slide-in-right">
            <div className="flex justify-end p-2">
              <button onClick={() => setIsMobileOpen(false)} className="p-2 rounded-md hover:bg-muted transition">
                <X className="h-5 w-5 text-synergy-dark" />
              </button>
            </div>
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;
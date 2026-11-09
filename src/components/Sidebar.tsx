import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, MessageSquareText, Package, BarChart3, Menu, X, Home } from "lucide-react";

const navItems = [
  { to: "/", label: "Início", icon: Home },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/analytics", label: "Análises", icon: MessageSquareText },
  { to: "/estoque", label: "Estoque", icon: Package },
];

const Sidebar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navContent = (
    <>
      <div className="p-4 border-b border-border">
        <Link to="/" className="flex items-center gap-2" onClick={() => setIsMobileOpen(false)}>
          <span className="h-8 w-8 rounded-lg bg-gradient-to-br from-construtop-blue to-construtop-orange flex items-center justify-center shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 text-white"
            >
              <path d="M3 21h18" />
              <path d="M5 21V7l7-4 7 4v14" />
              <path d="M9 21v-6h6v6" />
              <path d="M10 9h4" />
              <path d="M10 13h4" />
            </svg>
          </span>
          <div className="flex items-baseline">
            <span className="font-bold text-lg text-construtop-blue">Constru</span>
            <span className="font-bold text-lg text-construtop-orange">TOP</span>
          </div>
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
        <Link to="/" className="flex items-center gap-2 ml-2">
          <div className="flex items-baseline">
            <span className="font-bold text-lg text-construtop-blue">Constru</span>
            <span className="font-bold text-lg text-construtop-orange">TOP</span>
          </div>
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

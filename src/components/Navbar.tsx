import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    return (
      <nav className="border-b bg-white/80 backdrop-blur-md w-full ">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-12 md:h-16 items-center">
            <div className="flex shrink-0">
              <Link to="/" className="flex items-center gap-2">
                <img src="/luminai-vertical-light-512.png" alt="Logo" className="h-8" />
              </Link>
            </div>
            <div className="hidden md:flex flex-1 justify-center items-center space-x-4">
              <Link
                to="/dashboard"
                className="px-3 py-2 rounded-md text-sm font-medium text-synergy-dark hover:bg-construtop-orange/10 hover:text-construtop-orange transition-colors duration-200"
              >
                Visão geral
              </Link>
              <Link
                to="/analytics"
                className="px-3 py-2 rounded-md text-sm font-medium text-synergy-dark hover:bg-construtop-orange/10 hover:text-construtop-orange transition-colors duration-200"
              >
                IA Assistente
              </Link>
              <Link
                to="/estoque"
                className="px-3 py-2 rounded-md text-sm font-medium text-synergy-dark hover:bg-construtop-orange/10 hover:text-construtop-orange transition-colors duration-200"
              >
                Estoque
              </Link>
              <Link
                to="/bi"
                className="px-3 py-2 rounded-md text-sm font-medium text-synergy-dark hover:bg-construtop-orange/10 hover:text-construtop-orange transition-colors duration-200"
              >
                Relatórios gerenciais
              </Link>

            </div>
            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-md hover:bg-muted transition">
                {isMobileMenuOpen ? <X className="h-6 w-6 text-synergy-dark" /> : <Menu className="h-6 w-6 text-synergy-dark" />}
              </button>
            </div>
          </div>
          {isMobileMenuOpen && (
            <div className="md:hidden flex flex-col space-y-2 mt-2 p-2">
              <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-2 text-synergy-dark hover:bg-construtop-orange/10">Dashboard</Link>
              <Link to="/analytics" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-2 text-synergy-dark hover:bg-construtop-orange/10">Análises</Link>
              <Link to="/estoque" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-2 text-synergy-dark hover:bg-construtop-orange/10">Estoque</Link>
              <Link to="/bi" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-2 text-synergy-dark hover:bg-construtop-orange/10">BI</Link>
            </div>
          )}

        </div>
      </nav>
    );
  };

export default Navbar;

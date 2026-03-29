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
                <span className="h-8 w-8 rounded-lg bg-gradient-to-br from-construtop-blue to-construtop-orange flex items-center justify-center">
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
            <div className="hidden md:flex flex-1 justify-center items-center space-x-4">
              <Link
                to="/dashboard"
                className="px-3 py-2 rounded-md text-sm font-medium text-synergy-dark hover:bg-construtop-orange/10 hover:text-construtop-orange transition-colors duration-200"
              >
                Dashboard
              </Link>
              <Link
                to="/analytics"
                className="px-3 py-2 rounded-md text-sm font-medium text-synergy-dark hover:bg-construtop-orange/10 hover:text-construtop-orange transition-colors duration-200"
              >
                Análises
              </Link>
              <Link
                to="/estoque"
                className="px-3 py-2 rounded-md text-sm font-medium text-synergy-dark hover:bg-construtop-orange/10 hover:text-construtop-orange transition-colors duration-200"
              >
                Estoque
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
            </div>
          )}

        </div>
      </nav>
    );
  };

export default Navbar;

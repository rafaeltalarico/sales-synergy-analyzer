
import { Search } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50 w-full">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <span className="h-8 w-8 rounded-full bg-gradient-to-br from-synergy-blue to-synergy-green flex items-center justify-center">
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
                  <path d="M3 3v18h18" />
                  <path d="M18 9l-1.2 1.2a6 6 0 0 1-7.6 0L8 9" />
                  <path d="M12 12v6" />
                  <path d="M8 7l.01 0" />
                  <path d="M12 7l.01 0" />
                  <path d="M16 7l.01 0" />
                </svg>
              </span>
              <span className="font-semibold text-lg text-synergy-dark">LuminAI</span>
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              to="/dashboard" 
              className="px-3 py-2 rounded-md text-sm font-medium text-synergy-dark hover:bg-muted transition-colors duration-200"
            >
              Dashboard
            </Link>
            <Link 
              to="/analytics" 
              className="px-3 py-2 rounded-md text-sm font-medium text-synergy-dark hover:bg-muted transition-colors duration-200"
            >
              Análises
            </Link>
            <Link 
              to="/estoque" 
              className="px-3 py-2 rounded-md text-sm font-medium text-synergy-dark hover:bg-muted transition-colors duration-200"
            >
              Estoque
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <button 
              className="p-2 rounded-full hover:bg-muted transition-colors duration-200"
              aria-label="Pesquisar"
            >
              <Search className="h-5 w-5 text-synergy-dark" />
            </button>
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-synergy-dark">
              <span className="text-sm font-medium">RT</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

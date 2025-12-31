
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import GlobalSearch from "@/components/GlobalSearch";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();



  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 shrink-0">
            <img src="/favicon.ico" alt="MatchStream" className="w-8 h-8 object-contain" />
            <span className="text-xl font-bold text-green-600">MatchStream</span>
          </Link>

          {/* Desktop Navigation - Centered */}
          <div className="hidden md:flex flex-1 justify-center">
            <nav className="flex items-center space-x-8">
              {[
                { name: "Vergleich", href: "/vergleich" },
                { name: "Vereine & Ligen", href: "/competition" },
                { name: "Anbieter", href: "/streaming-provider" },
                { name: "Deals & News", href: "/deals" },
              ].map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-sm font-medium transition-colors ${isActive(item.href)
                    ? "text-green-600 border-b-2 border-green-600 pb-4"
                    : "text-gray-700 hover:text-green-600"
                    }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center space-x-4 shrink-0">
            <GlobalSearch />
            <Button asChild className="bg-green-600 hover:bg-green-700 text-white shadow-md">
              <Link to="/wizard">
                Beste Kombination finden
              </Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="space-y-2">
              {[
                { name: "Beste Kombination finden", href: "/wizard" },
                { name: "Vergleich", href: "/vergleich" },
                { name: "Vereine & Ligen", href: "/competition" },
                { name: "Anbieter", href: "/streaming-provider" },
                { name: "Deals & News", href: "/deals" },
              ].map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-3 py-2 text-base font-medium transition-colors ${isActive(item.href)
                    ? "text-green-600 bg-green-50"
                    : "text-gray-700 hover:text-green-600 hover:bg-gray-50"
                    }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

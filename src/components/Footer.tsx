
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    produkt: [
      { name: "Empfehlungs-Wizard", href: "/wizard" },
      { name: "Anbieter-Vergleich", href: "/vergleich" },
      { name: "Aktuelle Deals", href: "/deals" },
      { name: "Spielplan & News", href: "/news" }
    ],
    vereine: [
      { name: "Bayern München", href: "/verein/bayern-muenchen" },
      { name: "Borussia Dortmund", href: "/verein/borussia-dortmund" },
      { name: "FC Barcelona", href: "/verein/fc-barcelona" },
      { name: "Real Madrid", href: "/verein/real-madrid" }
    ],
    ligen: [
      { name: "Bundesliga", href: "/liga/bundesliga" },
      { name: "2. Bundesliga", href: "/liga/2-bundesliga" },
      { name: "Champions League", href: "/liga/champions-league" },
      { name: "DFB-Pokal", href: "/liga/dfb-pokal" }
    ],
    anbieter: [
      { name: "Sky Deutschland", href: "/anbieter/sky" },
      { name: "DAZN", href: "/anbieter/dazn" },
      { name: "Amazon Prime", href: "/anbieter/amazon-prime" },
      { name: "MagentaTV", href: "/anbieter/magenta-tv" }
    ],
    rechtliches: [
      { name: "Impressum", href: "/impressum" },
      { name: "Datenschutz", href: "/datenschutz" },
      { name: "AGB", href: "/agb" },
      { name: "Cookie-Richtlinie", href: "/cookies" }
    ]
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Logo and Description */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">M</span>
              </div>
              <span className="text-xl font-bold">MatchKompass</span>
            </Link>
            <p className="text-gray-400 mb-4">
              Deutschlands führende Plattform für optimale Streaming-Kombinationen im Fußball. 
              Finde die beste Lösung für deine Lieblingsvereine.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Twitter
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Facebook
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Instagram
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">
              Produkt
            </h3>
            <ul className="space-y-2">
              {footerLinks.produkt.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-gray-400 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Clubs */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">
              Vereine
            </h3>
            <ul className="space-y-2">
              {footerLinks.vereine.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-gray-400 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Leagues */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">
              Ligen
            </h3>
            <ul className="space-y-2">
              {footerLinks.ligen.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-gray-400 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">
              Rechtliches
            </h3>
            <ul className="space-y-2">
              {footerLinks.rechtliches.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-gray-400 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} MatchKompass. Alle Rechte vorbehalten.
            </p>
            <p className="text-gray-400 text-sm mt-2 md:mt-0">
              * Affiliate-Links: Wir erhalten eine Provision bei Abschluss eines Abonnements
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

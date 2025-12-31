
import { Link } from "react-router-dom";
import { useMemo } from "react";
import { useStreamingEnhanced } from "@/hooks/useStreamingEnhanced";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { providers } = useStreamingEnhanced();

  // Get top 8 providers based on major league coverage (Bundesliga, Champions League, Premier League, etc.)
  const topProviders = useMemo(() => {
    if (!providers || providers.length === 0) return [];
    
    // Calculate a score based on major league coverage
    const scoredProviders = providers.map(provider => {
      const majorLeagues = [
        'bundesliga', 'premier_league', 'la_liga', 'serie_a', 'ligue_1',
        'champions_league', 'europa_league', 'dfb_pokal'
      ];
      const score = majorLeagues.reduce((sum, league) => {
        const leagueValue = provider[league as keyof typeof provider];
        return sum + (typeof leagueValue === 'number' ? leagueValue : 0);
      }, 0);
      
      return { ...provider, score };
    });
    
    // Sort by score (descending) and take top 8
    return scoredProviders
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(provider => ({
        name: provider.name || provider.provider_name || 'Unknown',
        href: `/streaming-provider/${provider.slug}`
      }));
  }, [providers]);

  const footerLinks = {
    produkt: [
      { name: "Empfehlungs-Wizard", href: "/wizard" },
      { name: "Anbieter-Vergleich", href: "/vergleich" },
      { name: "Deals & News", href: "/deals" },
    ],
    anbieter: topProviders,
    ligen: [
      { name: "Bundesliga", href: "/competition/bundesliga" },
      { name: "2. Bundesliga", href: "/competition/2-bundesliga" },
      { name: "Champions League", href: "/competition/champions-league" },
      { name: "DFB-Pokal", href: "/competition/dfb-pokal" }
    ],
    rechtliches: [
      { name: "Impressum", href: "/impressum" },
      { name: "Datenschutz", href: "/datenschutz" },
      { name: "AGB", href: "/agb" },
      { name: "Cookies", href: "/cookies" },
      { name: "Barrierefreiheit", href: "/barrierefreiheit" },
      { name: "Über uns", href: "/ueber-uns" },
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
                <img src="/favicon.ico" alt="MatchStream" className="w-6 h-6 object-contain" />
              </div>
              <span className="text-xl font-bold">MatchStream</span>
            </Link>
            <p className="text-gray-400 mb-4">
              Ihre Plattform für die optimale Streaming-Lösung. Finden Sie die perfekte
              Kombination für Ihre Lieblingsvereine.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
              <span className="text-red-500">❤️</span>
              <span>Made with love for football fans</span>
            </div>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                Twitter
              </a>
              <a href="https://www.instagram.com/matchstream?igsh=eHZvNXp0M3BmeDlx" className="text-gray-400 hover:text-green-400 transition-colors">
                Instagram
              </a>
              <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                Youtube
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

          {/* Popular Providers */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">
              Anbieter
            </h3>
            <ul className="space-y-2">
              {footerLinks.anbieter.length > 0 ? (
                footerLinks.anbieter.map((link) => (
                  <li key={link.href}>
                    <Link to={link.href} className="text-gray-400 hover:text-white transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))
              ) : (
                <li className="text-gray-400 text-sm">Lädt...</li>
              )}
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

          {/* Legal & Contact Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">
              Rechtliches
            </h3>
            <ul className="space-y-2">
              {footerLinks.rechtliches.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-gray-400 hover:text-green-400 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-1 text-gray-400 text-sm">
              <div>📧 info@matchstream.de</div>
              <div>📞 +49 (0) 123 456 789</div>
              <div>📍 Deutschland</div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} MatchStream. Alle Rechte vorbehalten.
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

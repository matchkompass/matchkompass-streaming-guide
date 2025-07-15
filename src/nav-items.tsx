import Index from "./pages/Index";
import Wizard from "./pages/Wizard";
import EnhancedVergleich from "./pages/EnhancedVergleich";
import DetailVergleich from "./pages/DetailVergleich";
import Leagues from "./pages/Leagues";
import Deals from "./pages/Deals";
import Impressum from "./pages/Impressum";
import Datenschutz from "./pages/Datenschutz";
import AGB from "./pages/AGB";
import CookieRichtlinie from "./pages/CookieRichtlinie";
import Barrierefreiheit from "./pages/Barrierefreiheit";

export const navItems = [
  {
    title: "Home",
    to: "/",
    page: <Index />,
  },
  {
    title: "Wizard", 
    to: "/wizard",
    page: <Wizard />,
  },
  {
    title: "Vergleich",
    to: "/vergleich", 
    page: <EnhancedVergleich />,
  },
  {
    title: "Ligen",
    to: "/ligen",
    page: <Leagues />,
  },
  {
    title: "News & Deals",
    to: "/deals",
    page: <Deals />,
  },
  // Legal pages for footer
  {
    title: "Impressum",
    to: "/impressum",
    page: <Impressum />,
  },
  {
    title: "Datenschutz",
    to: "/datenschutz",
    page: <Datenschutz />,
  },
  {
    title: "AGB",
    to: "/agb",
    page: <AGB />,
  },
  {
    title: "Cookie-Richtlinie",
    to: "/cookies",
    page: <CookieRichtlinie />,
  },
  {
    title: "Barrierefreiheit",
    to: "/barrierefreiheit",
    page: <Barrierefreiheit />,
  },
];
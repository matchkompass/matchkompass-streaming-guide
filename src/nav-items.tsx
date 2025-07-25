import Index from "./pages/Index";
import Wizard from "./pages/Wizard";
import EnhancedVergleich from "./pages/EnhancedVergleich";
import DetailVergleich from "./pages/DetailVergleich";
import Leagues from "./pages/Leagues";
import Deals from "./pages/Deals";
import Impressum from "./pages/Impressum";
import Datenschutz from "./pages/Datenschutz";
import AGB from "./pages/AGB";
import CookieDeclaration from "./pages/CookieDeclaration";
import Barrierefreiheit from "./pages/Barrierefreiheit";
import Widerrufsrecht from "./pages/Widerrufsrecht";
import Anbieter from "./pages/Anbieter";

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
    title: "Detailvergleich",
    to: "/detailvergleich",
    page: <DetailVergleich />,
  },
  {
    title: "Ligen",
    to: "/ligen",
    page: <Leagues />,
  },
  {
    title: "Deals & News",
    to: "/deals",
    page: <Deals />,
  },
  {
    title: "Alle Anbieter",
    to: "/anbieter",
    page: <Anbieter />,
  },
  // Legal pages for footer only
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
    title: "Cookie-Erklärung",
    to: "/cookies",
    page: <CookieDeclaration />,
  },
  {
    title: "Barrierefreiheit",
    to: "/barrierefreiheit",
    page: <Barrierefreiheit />,
  },
  {
    title: "Widerrufsrecht",
    to: "/widerrufsrecht",
    page: <Widerrufsrecht />,
  },
];
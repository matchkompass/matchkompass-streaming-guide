import Index from "./pages/Index";
import Wizard from "./pages/Wizard";
import EnhancedVergleich from "./pages/EnhancedVergleich";
import DetailVergleich from "./pages/DetailVergleich";
import Leagues from "./pages/Leagues";
import Deals from "./pages/Deals";

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
    title: "Detail-Vergleich",
    to: "/detailvergleich",
    page: <DetailVergleich />,
  },
  {
    title: "Ligen",
    to: "/ligen",
    page: <Leagues />,
  },
  {
    title: "Deals",
    to: "/deals",
    page: <Deals />,
  },
];
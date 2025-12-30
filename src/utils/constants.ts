export const LEAGUE_CLUSTERS = [
    {
        name: "🇩🇪 Deutschland",
        key: "deutschland",
        color: "bg-blue-50 border-blue-200",
        headerColor: "bg-blue-100 text-blue-800",
        expandedByDefault: true,
        leagues: [
            { slug: "bundesliga", name: "Bundesliga", flag: "🇩🇪" },
            { slug: "second_bundesliga", name: "2. Bundesliga", flag: "🇩🇪" },
            { slug: "third_bundesliga", name: "3. Bundesliga", flag: "🇩🇪" },
            { slug: "dfb_pokal", name: "DFB Pokal", flag: "🇩🇪" }
        ]
    },
    {
        name: "🌐 Internationale Wettbewerbe",
        key: "int_wettbewerbe",
        color: "bg-green-50 border-green-200",
        headerColor: "bg-green-100 text-green-800",
        expandedByDefault: true,
        leagues: [
            { slug: "champions_league", name: "Champions League", flag: "⭐" },
            { slug: "europa_league", name: "Europa League", flag: "🏅" },
            { slug: "conference_league", name: "Conference League", flag: "🏅" },
            { slug: "club_world_cup", name: "Klub-Weltmeisterschaft", flag: "🌍" }
        ]
    },
    {
        name: "🌍 Internationale Ligen",
        key: "int_ligen",
        color: "bg-yellow-50 border-yellow-200",
        headerColor: "bg-yellow-100 text-yellow-800",
        expandedByDefault: false,
        leagues: [
            { slug: "premier_league", name: "Premier League", flag: "🏴" },
            { slug: "la_liga", name: "La Liga", flag: "🇪🇸" },
            { slug: "serie_a", name: "Serie A", flag: "🇮🇹" },
            { slug: "ligue_1", name: "Ligue 1", flag: "🇫🇷" },
            { slug: "sueper_lig", name: "Süper Lig", flag: "🇹🇷" },
            { slug: "eredevise", name: "Eredivisie", flag: "🇳🇱" },
            { slug: "liga_portugal", name: "Liga Portugal", flag: "🇵🇹" },
            { slug: "saudi_pro_league", name: "Saudi Pro League", flag: "🇸🇦" },
            { slug: "mls", name: "Major Soccer League", flag: "🇺🇸" }
        ]
    },
    {
        name: "🏆 Nationale Pokale & Wettbewerbe",
        key: "pokale",
        color: "bg-orange-50 border-orange-200",
        headerColor: "bg-orange-100 text-orange-800",
        expandedByDefault: false,
        leagues: [
            { slug: "fa_cup", name: "FA Cup", flag: "🏴" },
            { slug: "efl_cup", name: "EFL Cup", flag: "🏴" },
            { slug: "copa_del_rey", name: "Copa del Rey", flag: "🇪🇸" },
            { slug: "coppa_italia", name: "Coppa Italia", flag: "🇮🇹" },
            { slug: "coupe_de_france", name: "Coupe de France", flag: "🇫🇷" }
        ]
    }
];

// Helper: slug to real name
export const LEAGUE_SLUG_TO_NAME = Object.fromEntries(
    LEAGUE_CLUSTERS.flatMap(cluster => cluster.leagues.map(l => [l.slug, l.name]))
);

// Helper: slug to flag
export const LEAGUE_SLUG_TO_FLAG = Object.fromEntries(
    LEAGUE_CLUSTERS.flatMap(cluster => cluster.leagues.map(l => [l.slug, l.flag]))
);

// Get all leagues that should be expanded by default
export const getDefaultExpandedLeagues = () => [
    'Bundesliga',
    'Champions League'
];

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Club {
  club_id: number;
  name: string;
  country: string;
  logo_url?: string;
  popularity?: number;
  bundesliga?: boolean;
  second_bundesliga?: boolean;
  third_bundesliga?: boolean;
  champions_league?: boolean;
  europa_league?: boolean;
  conference_league?: boolean;
  premier_league?: boolean;
  la_liga?: boolean;
  serie_a?: boolean;
  ligue_1?: boolean;
}

export function useClubSelection() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [selectedClubs, setSelectedClubs] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      const { data, error } = await supabase
        .from('clubs')
        .select('club_id, name, country, logo_url, popularity, bundesliga, second_bundesliga, third_bundesliga, champions_league, europa_league, conference_league, premier_league, la_liga, serie_a, ligue_1')
        .order('popularity', { ascending: false, nullsFirst: false });

      if (error) throw error;
      
      // Group clubs by league and sort by popularity within each league
      const clubsData = data || [];
      const sortedClubs = clubsData.sort((a, b) => {
        // First, determine primary league for each club
        const getLeaguePriority = (club: any) => {
          if (club.bundesliga) return 1;
          if (club.premier_league) return 2;
          if (club.la_liga) return 3;
          if (club.serie_a) return 4;
          if (club.ligue_1) return 5;
          if (club.champions_league) return 6;
          if (club.europa_league) return 7;
          if (club.second_bundesliga) return 8;
          return 9;
        };
        
        const leagueA = getLeaguePriority(a);
        const leagueB = getLeaguePriority(b);
        
        if (leagueA !== leagueB) {
          return leagueA - leagueB;
        }
        
        // Within same league, sort by popularity
        const popularityA = a.popularity || 0;
        const popularityB = b.popularity || 0;
        return popularityB - popularityA;
      });
      
      setClubs(sortedClubs);
    } catch (error) {
      console.error('Error fetching clubs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClubs = clubs.filter(club =>
    club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    club.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleClub = (clubId: number) => {
    setSelectedClubs(prev =>
      prev.includes(clubId)
        ? prev.filter(id => id !== clubId)
        : [...prev, clubId]
    );
  };

  const clearSelection = () => {
    setSelectedClubs([]);
  };

  const getSelectedClubNames = () => {
    return clubs
      .filter(club => selectedClubs.includes(club.club_id))
      .map(club => club.name);
  };

  return {
    clubs: filteredClubs,
    selectedClubs,
    loading,
    searchTerm,
    setSearchTerm,
    toggleClub,
    clearSelection,
    getSelectedClubNames
  };
}
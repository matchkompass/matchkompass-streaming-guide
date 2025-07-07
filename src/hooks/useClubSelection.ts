import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Club {
  club_id: number;
  name: string;
  country: string;
  logo_url?: string;
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
        .select('club_id, name, country, logo_url')
        .order('name');

      if (error) throw error;
      setClubs(data || []);
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
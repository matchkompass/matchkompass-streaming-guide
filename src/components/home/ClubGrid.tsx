
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const ClubGrid = () => {
    const { data: clubs = [], isLoading } = useQuery({
        queryKey: ['topClubs'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('clubs')
                .select('*')
                .order('popularity_score', { ascending: false, nullsFirst: false }) // Updated to use popularity_score from useClubs interface check
                .limit(8);

            if (error) throw error;
            return data || [];
        }
    });

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="h-24 animate-pulse bg-gray-100 border-0" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">Beliebte Vereine</h3>
                <Link to="/ligen" className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center">
                    Alle ansehen <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {clubs.map((club) => (
                    <Link key={club.club_id} to={`/club/${club.slug}`}>
                        <Card className="hover:shadow-md transition-all cursor-pointer border shadow-sm group bg-white">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center overflow-hidden bg-gray-50 border border-gray-100">
                                        {club.logo_url ? (
                                            <img
                                                src={club.logo_url}
                                                alt={club.name || ''}
                                                className="w-full h-full object-contain"
                                            />
                                        ) : (
                                            <div
                                                className="w-full h-full flex items-center justify-center text-white font-bold text-xs"
                                                style={{ backgroundColor: club.primary_color || '#666' }}
                                            >
                                                {club.name?.charAt(0) || '?'}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors truncate max-w-[120px] sm:max-w-[150px]">
                                            {club.name}
                                        </h4>
                                        <p className="text-xs text-gray-500">
                                            {club.country}
                                        </p>
                                    </div>
                                </div>
                                <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-green-500 transition-colors" />
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            <div className="text-center sm:hidden">
                <Button asChild variant="outline" className="w-full">
                    <Link to="/ligen">Alle Vereine anzeigen</Link>
                </Button>
            </div>
        </div>
    );
};

export default ClubGrid;

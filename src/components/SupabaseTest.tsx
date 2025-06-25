
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const SupabaseTest = () => {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'success' | 'error'>('testing');
  const [tableStats, setTableStats] = useState<{
    clubs: number;
    streaming: number;
    leagues: number;
  }>({ clubs: 0, streaming: 0, leagues: 0 });

  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log('Testing Supabase connection...');
        
        // Test each table
        const [clubsResult, streamingResult, leaguesResult] = await Promise.all([
          supabase.from('clubs').select('*', { count: 'exact', head: true }),
          supabase.from('streaming').select('*', { count: 'exact', head: true }),
          supabase.from('leagues').select('*', { count: 'exact', head: true })
        ]);

        if (clubsResult.error) throw new Error(`Clubs table error: ${clubsResult.error.message}`);
        if (streamingResult.error) throw new Error(`Streaming table error: ${streamingResult.error.message}`);
        if (leaguesResult.error) throw new Error(`Leagues table error: ${leaguesResult.error.message}`);

        setTableStats({
          clubs: clubsResult.count || 0,
          streaming: streamingResult.count || 0,
          leagues: leaguesResult.count || 0
        });

        setConnectionStatus('success');
        console.log('Supabase connection test successful!', {
          clubs: clubsResult.count,
          streaming: streamingResult.count,
          leagues: leaguesResult.count
        });
      } catch (error) {
        console.error('Supabase connection test failed:', error);
        setConnectionStatus('error');
      }
    };

    testConnection();
  }, []);

  if (connectionStatus === 'testing') {
    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <p className="text-sm text-gray-600">Testing Supabase connection...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          Database Connection
          <Badge variant={connectionStatus === 'success' ? 'default' : 'destructive'}>
            {connectionStatus === 'success' ? 'Connected' : 'Error'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {connectionStatus === 'success' ? (
          <div className="text-sm space-y-1">
            <p>✅ Clubs: {tableStats.clubs} records</p>
            <p>✅ Streaming: {tableStats.streaming} records</p>
            <p>✅ Leagues: {tableStats.leagues} records</p>
          </div>
        ) : (
          <p className="text-sm text-red-600">Connection failed. Check console for details.</p>
        )}
      </CardContent>
    </Card>
  );
};

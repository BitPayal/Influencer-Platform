import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const DebugSchema = () => {
  const [columns, setColumns] = useState<any[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchSchema = async () => {
      // We can't query information_schema directly via client usually due to permissions,
      // but we can try RPC if enabled, OR just try to fetch one row and inspect types roughly,
      // or try to infer from errors.
      // Better approach: Since we have RLS, we can only see our data.
      // But we can try to select specific columns and see if it fails.
      
      // Actually, let's try to fetch 1 row from key tables and print them.
      // The JS types might reveal if ID is number or string.
      
      try {
        const { data: vData, error: vError } = await supabase.from('video_submissions').select('*').limit(1);
        const { data: iData, error: iError } = await supabase.from('influencers').select('*').limit(1);
        const { data: tData, error: tError } = await supabase.from('task_assignments').select('*').limit(1);

        const result = {
          video_submissions: vError ? vError : (vData && vData[0]),
          influencers: iError ? iError : (iData && iData[0]),
          task_assignments: tError ? tError : (tData && tData[0]),
        };

        setColumns([result]);
      } catch (e: any) {
        setError(e.message);
      }
    };
    fetchSchema();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Schema Debug</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <pre className="bg-gray-100 p-4 rounded overflow-auto">
        {JSON.stringify(columns, null, 2)}
      </pre>
    </div>
  );
};

export default DebugSchema;

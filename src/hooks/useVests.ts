import { useCallback, useEffect, useState } from 'react';

import { VestExtended } from '@/types';

const useVests = (): VestExtended[] | null => {
  const [vests, setVests] = useState<VestExtended[] | null>(null);

  const fetchVests = useCallback(async () => {
    setVests(await window.adrena.client.loadAllVestAccounts());
  }, []);

  useEffect(() => {
    fetchVests();

    const interval = setInterval(() => {
      fetchVests();
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [fetchVests]);

  return vests;
};

export default useVests;

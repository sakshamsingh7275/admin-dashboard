import { useEffect, useState } from 'react';
import { api } from './api.js';

// Fetches `path` on mount, whenever path/deps change (deps usually include the refresh tick).
export function useFetch(path, deps = []) {
  const [state, setState] = useState({ data: null, error: null });
  useEffect(() => {
    let live = true;
    api.get(path)
      .then((data) => live && setState({ data, error: null }))
      .catch((e) => live && setState((s) => ({ ...s, error: e.message })));
    return () => { live = false; };
  }, [path, ...deps]);
  return state;
}

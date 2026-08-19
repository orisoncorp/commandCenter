import { useLayoutEffect } from 'react';
import { DataProvider } from './data/DataProvider';
import CommandCenter from './components/templates/CommandCenter/CommandCenter';
import { applyTheme } from './theme/applyTheme';
import config from './configs/orison-internal.json';

export default function App() {
  // Antes do primeiro paint, para que a marca do cliente não apareça depois
  // de um flash com o crimson da Orison.
  useLayoutEffect(() => {
    applyTheme(config.theme);
  }, []);

  return (
    <DataProvider config={config}>
      <CommandCenter config={config} />
    </DataProvider>
  );
}

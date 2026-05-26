import { DataProvider } from './data/DataProvider';
import CommandCenter from './components/templates/CommandCenter/CommandCenter';
import config from './configs/orison-internal.json';

export default function App() {
  return (
    <DataProvider config={config}>
      <CommandCenter config={config} />
    </DataProvider>
  );
}

import { micropodConfig } from '../../micropods.config';

export default micropodConfig({
  name: 'pod_invioces',
  port: 3004,
  outputAssetPrefix: 'http://localhost:8004',
  exposes: {
    './App': './src/App.tsx',
    './translations': './translations.json',
  },
  remotes: [
    { name: 'pod_ui' },
    { name: 'pod_server' },
    { name: 'pod_dashboard' },
  ],
});

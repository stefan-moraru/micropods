import { micropodConfig } from '../../micropods.config';

export default micropodConfig({
  name: 'pod_dashboard',
  port: 3002,
  outputAssetPrefix: 'http://localhost:8002',
  exposes: {
    './App': './src/App.tsx',
    './translations': './translations.json',
  },
  remotes: [{ name: 'pod_ui' }, { name: 'pod_server' }],
});

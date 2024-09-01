import { micropodConfig } from '../../micropods.config';

export default micropodConfig({
  name: 'pod_server',
  port: 3003,
  outputAssetPrefix: 'http://localhost:8003',
  exposes: {
    './providers/ServerProvider': './src/providers/ServerProvider.tsx',
    './hooks/useAuth': './src/hooks/useAuth/useAuth.ts',
    './hooks/useData': './src/hooks/useData/useData.ts',
  },
});

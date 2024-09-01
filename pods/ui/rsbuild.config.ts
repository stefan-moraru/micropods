import { micropodConfig } from '../../micropods.config';

export default micropodConfig({
  name: 'pod_ui',
  port: 3001,
  outputAssetPrefix: 'http://localhost:8001',
  exposes: {
    './config': './src/config.ts',
    './UIProvider': './src/providers/UIProvider.tsx',
    './Button': './src/components/button/Button.tsx',
    './Input': './src/components/input/Input.tsx',
    './Skeleton': './src/components/skeleton/Skeleton.tsx',
  },
  tools: {
    rspack: {
      module: {
        rules: [
          {
            test: /\.css$/i,
            use: ['postcss-loader'],
          },
        ],
      },
    },
  },
});

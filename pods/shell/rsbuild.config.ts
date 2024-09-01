import { micropodConfig } from '../../micropods.config';

export default micropodConfig({
  name: 'pod_shell',
  port: 3000,
  outputAssetPrefix: 'http://localhost:8000',
  remotes: [
    { name: 'pod_ui' },
    { name: 'pod_server' },
    { name: 'pod_dashboard' },
    { name: 'pod_invoices' },
  ],
});

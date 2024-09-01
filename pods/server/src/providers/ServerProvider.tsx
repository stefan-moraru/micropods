import { QueryClientProvider } from '@tanstack/react-query';
import queryClient from '../common/queryClient/queryClient';

type ServerProviderProps = {
  children: React.ReactNode;
};

const ServerProvider = ({ children }: ServerProviderProps) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

export default ServerProvider;

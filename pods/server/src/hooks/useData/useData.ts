import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const fetchData = () => {
  //return axios.get('https://pokeapi.co/api/v2/pokemon?limit=10&offset=0');
  return [{ a: 'a' }];
};

const useData = () => {
  const { data, isPending, isError } = useQuery({
    queryKey: ['SERVER_USE_DATA'],
    queryFn: () => fetchData(),
  });

  return {
    data,
    isPending,
    isError,
  };
};

export default useData;

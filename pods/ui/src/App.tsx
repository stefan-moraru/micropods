import { Button } from './components/button/Button';
import { Skeleton } from './components/skeleton/Skeleton';

const App = () => {
  return (
    <div className="container mx-auto">
      <div className="grid grid-cols-1 gap-4 pt-4">
        <h3 className="font-bold">pod_ui</h3>

        <h4>tailwind</h4>

        <div className="w-12 h-12 rounded-full bg-green-100 shadow-lg"></div>

        <h4>components</h4>

        <div className="flex flex-col gap-4">
          <Button>Hello from shacdn</Button>

          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;

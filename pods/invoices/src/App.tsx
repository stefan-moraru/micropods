import './App.css';

import { Button } from 'pod_ui/Button';

const App = () => {
  const sendEventToShell = () => {
    window.dispatchEvent(
      new CustomEvent('pod_shell/notification', {
        detail: {
          version: 1,
          timestamp: Date.now(),
          type: 'success',
          content: 'Event sent from from pod_invoices: 42 is the answer',
        },
      }),
    );
  };

  return (
    <div className="bg-violet-100 rounded-lg p-4">
      <section>
        <h1 className="text-2xl font-bold">This is the invoices module</h1>
      </section>

      <section className="mt-4">
        <h3 className="text-xl font-semibold">Integration with pod_ui</h3>

        <div className="bg-green-400 mt-4 p-4 flex flex-col gap-4 rounded-lg">
          <h6 className="text-sm font-semibold">pod_ui/Button</h6>
          <Button onClick={sendEventToShell}>Send an event to pod_shell</Button>
        </div>
      </section>
    </div>
  );
};

export default App;

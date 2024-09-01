A complete example of module federation with rspack and an UI library, translations, pub/sub and many more.

You can find the code here: [https://github.com/stefan-moraru/micropods](https://github.com/stefan-moraru/micropods).

## Motivation

I have tried finding a complete example with module federation, but could only find bits and pieces scattered among multiple projects. Since even setting up libraries like `tailwind` can be cumbersome, I have decided to create a complete example.

Things that I wanted to have in the project:

- An UI library (shacdn + tailwind)
- A reusable way of talking with an API (react-query)
- Translations (react-i18next)
- An easy way of creating new modules (CLI)
- A pub/sub system to enable cross-module communication (window events)

## Architecture overview

### Module list

The `orchestrator` module (it isn't actually a module, it is just a pnpm workspace that enables you to run all the projects at once).

The `shell` module contains the routing, the re-usable translations, some pub/sub listeners. It basically glues together all the modules.

The `ui` module exposes the shacdn components and also handles tailwind.

The `server` module exposes hooks that interact with an API.

The `dashboard` and `invoices` modules are just examples that use the UI, server, translations etc.

### Folder structure

```
micropods (root)
-- package.json
-- micropods.config.ts
-- pods
---- shell
---- ui
---- server
---- dashboard
---- invoices
```

### Module configuration

To achieve dynamic remotes all the modules had to import a file from the `orchestrator` module (the one which runs the projects). This meant that we can also create a wrapper on top of `defineConfig` to make things easier for us:

```ts
// invoices/rsbuild.config.ts

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
```

```ts
// micropods.config.ts

export const micropodConfig = ({
  ...
}) =>
  defineConfig({
    plugins: [pluginReact()],
    ...
    tools: {
      rspack: {
        ...tools?.rspack,
        resolve: {
          alias: {
            "@": "src",
          },
        },
        ...
        plugins: [
          new ModuleFederationPlugin({
            name,
            dts: false,
            remotes: remotes && computeRemotes(remotes),
            shared: computeShared(),
            exposes,
          }),
        ],
      },
    },
  });
```

### Interaction with an API

Since most of the modules would be talking to the same API, a `server` module was created, which uses `react-query` behind the scenes:

```ts
// server/src/hooks/useData/useData.ts

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
```

The `shell` module, which contains the routing also creates the query context for react-query, by wrapping everything with `ServerProvider`, which is exposed by the `server` module:

```ts
// server/src/providers/ServerProvider.tsx

const ServerProvider = ({ children }: ServerProviderProps) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

export default ServerProvider;
```

```ts
// shell/src/App.tsx

const App = () => (
  <ErrorBoundary fallback={<p>Something went wrong</p>}>
    <ServerProvider>
      <UIProvider>
        <RouterProvider router={router} />

        <Toaster />
      </UIProvider>
    </ServerProvider>
  </ErrorBoundary>
);
```

### Translations

To make it easier to use translations in modules, I have created additional properties on the window object, similar to the ones that exist already in i18n.

Since they re-use the same instance, all the labels will update when changing the language.

```ts
// shell/src/shared/translations.ts

const useTranslation = () => {
  const [, forceRerender] = useState<number>(0);

  const onLanguageChange = () => {
    forceRerender((r) => r + 1);
  };

  useEffect(() => {
    instance.on("languageChanged", onLanguageChange);

    return () => {
      instance.off("languageChanged", onLanguageChange);
    };
  }, []);

  return {
    t: instance.t,
  };
};

const changeLanguage = (language: string) => {
  instance.changeLanguage(language);
};

window.micropods = {
  ...window.micropods,
  translations: {
    useTranslation,
    changeLanguage,
  },
};
```

To use it in a module:

```tsx
const {
  translations: { useTranslation },
} = window.micropods;

const { t } = useTranslation();

...

<h3>{t('pod_dashboard:welcomeMessage')}</h3>
```

All the translations are 
Every module exports their translations in a `translations.json` file:

```ts
// dashboard/translations.json

{
  "en": {
    "pod_dashboard": {
      "welcomeMessage": "🇺🇸Hello! This is a translated message"
    }
  },
  "ro": {
    "pod_dashboard": {
      "welcomeMessage": "🇷🇴Buna! Acest mesaj este tradus"
    }
  }
}
```

Then, they are imported and added to the i18n resource bundles automatically.

### UI library / styling / tailwind

#### Tailwind

Integrating tailwind was a bit trickier since I wanted to keep all the UI-related logic inside the `ui` module.

To achieve this, the tailwind config was written as:

```ts
module.exports = {
  ...
  content: ['../*/src/**/*.{ts,tsx}'],
  ...
};
```

One drawback is that this relies on a specific folder structure (all the modules living next to the `ui` module). In my opinion, this is a small drawback since installing tailwind / configuring the theme in every module would have been way harder.

One benefit is that this generates a single CSS file, the theming is consistent and all the modules can use tailwind without installing it.

#### shacdn

Since shacdn lets you directly integrate the components, no magic was needed here. The `ui` module directly exports the components which can be imported in other modules.

### Pub/sub

To facilitate cross-communication between modules, we can use `CustomEvent`s & event listenrs [from JavaScript](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget) directly.

```ts
window.dispatchEvent(
  new CustomEvent('pod_shell/notification', {
    detail: {
      type: 'success',
      content: 'Event sent from pod_dashboard: Hello world 🎉',
    },
  }),
);
```

```ts
const onEvent = (event) => {
  if (event.detail.type === 'success') {
    toast.success(event.detail.content, {
      position: 'bottom-center',
    });
  }
};

window.addEventListener('pod_shell/notification', onEvent);
```

To further improve this, a custom wrapper can be developed on top of this, but for the scope of this example, this works perfectly.

### Routing

All the modules export their main App, which can be easily included in the `shell` module:

```ts
import DashboardPod from 'pod_dashboard/App';
```

```ts
{
  path: 'dashboard',
  element: (
    <Layout>
      <DashboardPod />
    </Layout>
  ),
},
```

## Problems that I've encountered

_Note: Some of the code for the fixes might have been later improved, but the code examples should be enough to help you continue_

### Defining dynamic remote URLs based on the environment

By far the hardest issue I've had to solve when creating this project. The articles I've read all had different solutions, some of which didn't work.

Basically, when using module federation you have to specify a list of remotes (think of them as packages from which you can import components):

```ts
new ModuleFederationPlugin({
 name: 'pod_shell',
 remotes: {
   pod_ui: '@pod_ui@http://localhost:3001/mf-manifest.json',
   pod_dashboard: '@pod_dashboard@http://localhost:3002/mf-manifest.json',
   pod_server: '@pod_server@http://localhost:3003/mf-manifest.json',
   pod_invoices: '@pod_invoices@http://localhost:3004/mf-manifest.json',
  },
  shared: ['react', 'react-dom', 'react-query'],
}),
```

The main issue here is that when trying to build/preview the project, you'll see that module federation is still trying to fetch the modules from localhost .

To overcome that, in the `shell` (host) project, I have created a `micropods.config.ts` file which contains the list of all the remotes, based on environments:

```ts
const config = {
  development: {
    remotes: {
      pod_ui: "pod_ui@http://localhost:3001/mf-manifest.json",
      pod_dashboard: "pod_dashboard@http://localhost:3002/mf-manifest.json",
      pod_server: "pod_server@http://localhost:3003/mf-manifest.json",
      pod_invoices: "pod_invoices@http://localhost:3004/mf-manifest.json",
    },
  },
  production: {
    remotes: {
      pod_ui: "pod_ui@http://localhost:8001/mf-manifest.json",
      pod_dashboard: "pod_dashboard@http://localhost:8002/mf-manifest.json",
      pod_server: "pod_server@http://localhost:8003/mf-manifest.json",
      pod_invoices: "pod_invoices@http://localhost:8004/mf-manifest.json",
    },
  },
};

export default config;
```

Then, when configuring module federation for other modules, that file is imported and the remotes are defined like this:

```ts
import mpc from '../../micropods.config';

...
new ModuleFederationPlugin({
  name: 'pod_shell',
  remotes: {
    pod_ui: mpc[process.env.NODE_ENV].remotes.pod_ui,
    pod_dashboard: mpc[process.env.NODE_ENV].remotes.pod_dashboard,
    pod_server: mpc[process.env.NODE_ENV].remotes.pod_server,
    pod_invoices: mpc[process.env.NODE_ENV].remotes.pod_invoices,
  },
  shared: ['react', 'react-dom', 'react-query'],
}),
...
```

The main drawback that this solution creates is the fact that you need the `shell` module in order to start the others. This can be fixed however by manually typing the remotes list (if you really want to do separate development on some modules without starting the host).

### Hot module replacement not working

After digging a lot in articles and github issues, couldn't find a direct solution to this, so I've created [a question on stackoverflow](https://stackoverflow.com/questions/78812488/hot-module-replacement-hmr-not-working-with-rspack-and-federated-modules?noredirect=1#comment138972002_78812488) and answered it myself in order to help others.

Basically, the only thing that worked for me was configuring the dev servers to use different ports for the web sockets that handle HMR.

```ts
// server/rsbuild.config.ts

dev: {
 assetPrefix: true,
 client: {
   port: 3003,
 },
},
```

```ts
// dashboard/rsbuild.config.ts

dev: {
  assetPrefix: true,
  client: {
    port: 3002,
  },
},
```

### react-query not finding the right context

Since the interaction with the API is done through the server module, and through hooks, we also had to export the QueryClientProvider and use it in the modules that depended on the server module.

```ts
// server/src/providers/ServerProvider.tsx

import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "../common/queryClient/queryClient";

type ServerProviderProps = {
  children: React.ReactNode;
};

const ServerProvider = ({ children }: ServerProviderProps) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

export default ServerProvider;
```

```ts
// dashboard/src/App.tsx

const ExportedApp = () => (
  <ServerProvider>
    <App />
  </ServerProvider>
);

export default ExportedApp;
```

### Previewing the build not working due to CORS errors

Had to include extra headers in the webpack dev servers.

```ts
// ui/rsbuild.config.ts

export default defineConfig({
  plugins: [pluginReact()],
  server: {
    port: 3003,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers':
        'X-Requested-With, content-type, Authorization',
    },
  },
...
```

### Tailwind styles not working

Since the UI library was built using shacdn (which uses tailwind), when importing a component in another module, the component was not styled (due to the tailwind context missing).

Currently, I've fixed this using a temporary fix which isn't optimal: importing ./App.css in every component that's exported.

```ts
// ui/src/components/skeleton/Skeleton.tsx

import { cn } from "../../utils/cn";

import "../../App.css";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export { Skeleton };
```

However, this didn't fix the fact that it wasn't possible to use tailwind in other modules (if, for example, added bg-green-200 on a div in the shell module, nothing would happen, because of the tree shaking that tailwind does. I've tried to fix this by exporting an UIProvider component from the ui module, but that also didn't work:

```ts
// ui/src/providers/UIProvider.tsx
// This doesn't work
import "../App.css";

const UIProvider = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);

export default UIProvider;
```

This was happening because the classes that weren't used were removed before they were used in shell .

Using tailwind separately in every module wouldn't be a good solution, since customizing the general theme would become a nightmare.

To fix this, I have updated the content part of the tailwind config to also point it to the other pods:

```ts
  content: [
    '../*/src/**/*.{ts,tsx}',
  ],
```

This becomes another point that tangles the modules together, but at least we know that `ui` is the only module that handles the styling part.

### Tailwind infinitely reloading the CSS styles

After fixing the issue above, the `content` part of the `tailwind.config.ts` file looked like this:

```ts
  content: [
    //'./pages/**/*.{ts,tsx}',
    //'./components/**/*.{ts,tsx}',
    //'./app/**/*.{ts,tsx}',
    //'./src/**/*.{ts,tsx}',
    '../*/src/**/*.{ts,tsx}',
  ],
```

### Infinite reloading when developing

Turns out it was somehow related to the module-federation chrome extension. Disabling the extension made it work.

### pnpm not starting all the servers

Turns out the default limit for running in parallel is 4. To overcome this, you need to include an extra param when starting/building the projects:

```ts
// package.json

"dev": "pnpm run --workspace-concurrency=Infinity -r dev",
"build": "pnpm run --workspace-concurrency=Infinity -r build",
```

### Version of shared singleton module react does not satisfy the requirement

Very interesting error, since both versions in the error were the same.

```
[ Federation Runtime ]: Version 18.3.1 from pod_ui of shared singleton module react does not satisfy the requirement of pod_invioces which needs 18.13.1)
```

Could not find a fix for this. All the modules were having the same `shared` property:

```ts
const SHARED = {
  react: {
    requiredVersion: "^18.13.1",
  },
  "react-dom": {
    requiredVersion: "^18.13.1",
  },
  "@tanstack/react-query": {
    requiredVersion: "^5.51.16",
  },
};
```

Also, all the modules had `^8.13.1` in their `package.json`:

```sh
❯ bat pods/*/package.json | grep \"react\"
"react": "^18.3.1",
"react": "^18.3.1",
"react": "^18.3.1",
"react": "^18.3.1",
"react": "^18.3.1",
```

And it was still throwing the error.

[Useful article about shared packages versioning](https://www.angulararchitects.io/en/blog/getting-out-of-version-mismatch-hell-with-module-federation/)

### Startup errors because of missing @mf-types.zip 

When trying to start some of the modules, I was getting:

```ts
Unable to compile federated types, Error: compile TS failed, the original command is 'npx tsc --project micropods/pods/ui/node_modules/.federation/tsconfig.abc.json'
Error: ENOENT: no such file or directory, open 'micropods/pods/ui/dist/@mf-types.zip'
```

I have tried re-installing, re-building the projects, but nothing worked.

The temporary solution from [this GitHub issue](https://github.com/nrwl/nx/issues/27198#issuecomment-2275486144) worked:

```ts
new ModuleFederationPlugin({
  name: 'pod_ui',
  dts: false,
  exposes: {
    './config': './src/config.ts',
    './UIProvider': './src/providers/UIProvider.tsx',
    './Button': './src/components/button/Button.tsx',
    './Input': './src/components/input/Input.tsx',
    './Skeleton': './src/components/skeleton/Skeleton.tsx',
  },
  shared: ['react', 'react-dom'],
}),
```

This might break declarations for TypeScript, I'll keep looking for a better solution.

### Translations not reloading

To keep things simple, I have decided to expose the i18n instance on window:

```ts
const instance = i18next.createInstance();

instance
  .use(initReactI18next)
  .init({
    resources,
  })
  .then(() => {
    console.log("i18 success");
  })
  .catch((error) => {
    console.error(error);
  });

(window as any).i18n = instance;
```

```tsx
// pod_dashboard/src/App.tsx

const { t } = window.i18n;
...
<h3>{t('pod_dashboard:welcomeMessage')}</h3>
```

But an issue arose - when changing the language (in the shell module), it wasn't getting refreshed in other modules. To fix this I have decided to export a global hook instead. The hook forces a re-render when the language is changed.

### Typescript not finding window definitions

Since `window` was being used to share some logic across modules, having typescript errors every time we've used something from `window` wasn't optimal. Hence, we can extend the `window` type:

```ts
import translations from "./translations";
import pubSub from "./pubSub";

const micropods = {
  translations,
  pubSub,
};

declare global {
  interface Window {
    micropods: typeof micropods;
  }
}

window.micropods = micropods;
```

### Useful articles

https://dev.to/ecyrbe/webpack-module-federation-for-production-environnement-4i55

https://dev.to/waldronmatt/module-federation-for-enterprise-part-2-men

https://github.com/waldronmatt/dynamic-host-module-federation

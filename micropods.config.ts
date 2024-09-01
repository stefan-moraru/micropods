import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { ModuleFederationPlugin } from "@module-federation/enhanced/rspack";

const REMOTES = {
  development: {
    remotes: {
      pod_ui: "pod_ui@http://localhost:3001/mf-manifest.json",
      pod_dashboard: "po_dashboard@http://localhost:3002/mf-manifest.json",
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

type Remote = {
  name: string;
};

export const computeRemotes = (remotes: Remote[]) => {
  const r: Record<string, string> = {};

  for (const remote of remotes) {
    r[remote.name] = REMOTES[process.env.NODE_ENV].remotes[remote.name];
  }

  return r;
};

export const computeShared = () => {
  const common = {
    singleton: true,
  };

  return Object.fromEntries(
    Object.entries(SHARED).map(([dependency, value]) => [
      dependency,
      { ...value, ...common },
    ]),
  );
};

export const micropodConfig = ({
  name,
  port,
  outputAssetPrefix,
  remotes,
  exposes,
  tools,
}: {
  name: string;
  port: number;
  outputAssetPrefix: string;
  remotes?: Remote[];
  exposes?: Record<string, string>;
  tools?: { rspack: { module: any } };
}) =>
  defineConfig({
    plugins: [pluginReact()],
    server: {
      port,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods":
          "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        "Access-Control-Allow-Headers":
          "X-Requested-With, content-type, Authorization",
      },
    },
    dev: {
      assetPrefix: true,
      client: {
        port,
      },
    },
    output: {
      assetPrefix: outputAssetPrefix,
    },
    tools: {
      rspack: {
        ...tools?.rspack,
        resolve: {
          alias: {
            "@": "src",
          },
        },
        output: {
          uniqueName: name,
          pathinfo: true,
        },
        experiments: {
          css: false,
        },
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

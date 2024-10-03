import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { configDefaults } from 'vitest/config';
import { lingui } from '@lingui/vite-plugin';
import tailwindcss from 'tailwindcss';
import { createHtmlPlugin } from 'vite-plugin-html';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
export default ({ mode }: { mode: string }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  const RPC_PROVIDER_MAINNET = process.env.VITE_RPC_PROVIDER_MAINNET || '';
  const RPC_PROVIDER_SEPOLIA = process.env.VITE_RPC_PROVIDER_SEPOLIA || '';
  const RPC_PROVIDER_TENDERLY = process.env.VITE_RPC_PROVIDER_TENDERLY || '';

  const PROD_STYLE_SRC_VALUES =
    "'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=' 'sha256-Y/huXlwoYkVyQlxwSVcCi1RCDGDCSVBzDt0hYP9qlTc=' 'sha256-As28pNoabqy5Dm8GUYYMZv9gCVxIw4mT8rz2JbdeZjU=' 'sha256-v7ZMAlFoy9yxllQHKlsbkCvWNO+X3Xz65Wu2wkwwVaY=' 'sha256-T+ow83qKS6RCXyWfA3I6D/4E+GwaV5INwNCKNfug+Tg=' 'sha256-jdWOF+oc0vV3BxDwETcLN1ufCz+m+CXvn2h7KTO/eio='";
  const VERCEL = process.env.VERCEL === '1';
  const VERCEL_PREVIEW_URL = VERCEL ? 'https://vercel.live/' : '';
  const VERCEL_CONNECT = VERCEL ? 'https://vercel.live wss://ws-us3.pusher.com' : '';
  const VERCEL_IMG = VERCEL ? 'https://vercel.live https://vercel.com' : '';
  const STYLE_SRC_VALUES = VERCEL ? 'https://vercel.live' : PROD_STYLE_SRC_VALUES;
  const VERCEL_FONT = VERCEL ? 'https://vercel.live https://assets.vercel.com' : '';

  // The missing 'script-src' sha256 you see in the logs when developing is most likely due to the react refresh script tag injected automatically for dev purposes.
  // Note that the 'style-src' sha256 are required
  const CONTENT_SECURITY_POLICY = `
    default-src 'self';
    script-src 'self' ${VERCEL_PREVIEW_URL}
     'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU='
      https://static.cloudflareinsights.com
      https://challenges.cloudflare.com;
    style-src 'self' ${STYLE_SRC_VALUES} ;
    img-src 'self' ${VERCEL_IMG} data: blob: https://explorer-api.walletconnect.com;
    font-src 'self' ${VERCEL_FONT};
    connect-src 'self'
      ${VERCEL_CONNECT}
      ${RPC_PROVIDER_MAINNET}
      ${RPC_PROVIDER_TENDERLY}
      ${RPC_PROVIDER_SEPOLIA}
      https://virtual.mainnet.rpc.tenderly.co
      https://rpc.sepolia.org
      https://query-subgraph-testnet.sky.money
      https://query-subgraph-staging.sky.money
      https://query-subgraph.sky.money
      https://api.thegraph.com
      https://staging-api.sky.money
      https://api.sky.money
      https://api.ipify.org
      https://info-sky.blockanalitica.com
      https://api.cow.fi/
      wss://relay.walletconnect.com
      wss://www.walletlink.org
      https://explorer-api.walletconnect.com/
      https://enhanced-provider.rainbow.me
      cloudflareinsights.com;
    frame-src 'self'
      ${VERCEL_PREVIEW_URL}
      https://verify.walletconnect.com
      https://verify.walletconnect.org
`;

  // Need to remove whitespaces otherwise the app won't build due to unsupported characters
  const parsedCSP = CONTENT_SECURITY_POLICY.replace(/\n/g, '');

  return defineConfig({
    server: {
      // vite default is 5173
      port: 3001
    },
    preview: {
      port: 3000
    },
    root: 'src',
    envDir: '../',
    build: {
      outDir: '../dist',
      emptyOutDir: true
    },
    test: {
      exclude: [...configDefaults.exclude],
      globals: true,
      environment: 'happy-dom'
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    plugins: [
      createHtmlPlugin({
        minify: true,
        inject: {
          data: {
            csp: parsedCSP
          }
        }
      }),
      nodePolyfills({
        include: ['buffer']
      }),
      react({
        plugins: [['@lingui/swc-plugin', {}]]
      }),
      lingui()
    ],
    css: {
      postcss: {
        plugins: [tailwindcss()]
      }
    }
  });
};

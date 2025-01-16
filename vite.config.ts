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
  const RPC_PROVIDER_BASE = process.env.VITE_RPC_PROVIDER_BASE || '';
  const RPC_PROVIDER_TENDERLY_BASE = process.env.VITE_RPC_PROVIDER_TENDERLY_BASE || '';

  const VERCEL = process.env.VERCEL === '1' && process.env.VERCEL_ENV === 'preview';
  const VERCEL_PREVIEW_URL = VERCEL ? 'https://vercel.live/' : '';
  const VERCEL_CONNECT = VERCEL ? 'https://vercel.live wss://ws-us3.pusher.com' : '';
  const VERCEL_IMG = VERCEL ? 'https://vercel.live https://vercel.com' : '';

  // Option 1: using vercel tooltip hashes
  // const STYLE_SRC_VALUES = VERCEL
  //   ? `https://vercel.live ${VERCEL_HASHES} ${PROD_STYLE_SRC_VALUES}`
  //   : PROD_STYLE_SRC_VALUES;

  // Option 2: using vercel recommended values but adding 'unsafe-inline'
  const STYLE_SRC_VALUES = VERCEL ? "https://vercel.live 'unsafe-inline'" : PROD_STYLE_SRC_VALUES;

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
      ${RPC_PROVIDER_BASE}
      ${RPC_PROVIDER_TENDERLY_BASE}
      https://virtual.mainnet.rpc.tenderly.co
      https://virtual.base.rpc.tenderly.co
      https://rpc.sepolia.org
      https://mainnet.base.org
      https://vote.makerdao.com
      https://query-subgraph-testnet.sky.money
      https://query-subgraph-staging.sky.money
      https://query-subgraph.sky.money
      https://api.thegraph.com
      https://staging-api.sky.money
      https://api.sky.money
      https://api.ipify.org
      https://info-sky.blockanalitica.com
      https://sky-tenderly.blockanalitica.com
      https://api.cow.fi/
      wss://relay.walletconnect.com
      wss://relay.walletconnect.org
      https://pulse.walletconnect.org
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
      port: 3000
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
    optimizeDeps: {
      // Optimize safe-apps-provider dependency to get rid of the Safe connector issue
      // and be able to connect Safe apps
      include: ['wagmi > @safe-global/safe-apps-provider']
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

const PROD_STYLE_SRC_VALUES =
  "'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=' 'sha256-Y/huXlwoYkVyQlxwSVcCi1RCDGDCSVBzDt0hYP9qlTc=' 'sha256-As28pNoabqy5Dm8GUYYMZv9gCVxIw4mT8rz2JbdeZjU=' 'sha256-v7ZMAlFoy9yxllQHKlsbkCvWNO+X3Xz65Wu2wkwwVaY=' 'sha256-T+ow83qKS6RCXyWfA3I6D/4E+GwaV5INwNCKNfug+Tg=' 'sha256-jdWOF+oc0vV3BxDwETcLN1ufCz+m+CXvn2h7KTO/eio='";

/*
const VERCEL_HASHES = `
'sha256-V2/A5EGJq4Ocup+QlPJyOBlZ8rWNajajv6ewISb/tZI=' 
'sha256-AbpHGcgLb+kRsJGnwFEktk7uzpZOCcBY74+YBdrKVGs=' 
'sha256-Ar+lEPF01psS5Dy2cL9NtNUEb8EyDkcUu0o2RwfcRx8=' 
'sha256-FC+syE0eSGMwdS3te+/6EPX43HAqBeHHs0uN73upiZA=' 
'sha256-y9mPGxxYLUl/fmEvPKHsvYzTohOwqG+fK7oR0NqeThM=' 
'sha256-hZkzWT8OlAvU57XAe62H/wy2tiXPDHyhpf8CUi69rkk=' 
'sha256-i6Zp/rAyLxOE1AQ4wjaheHjL3cwP9GbpBOzFnU5X/hI=' 
'sha256-y6VfFjKcYJvKTkBUxEjgO6WpFm9C56ev8thQ7CMBWCc=' 
'sha256-0r53SdAP6+pIU0Y7yelOes971hVcmpxiS5qt+Dng2DA=' 
'sha256-on9XoGvMGirrtEQ1j5rfzI4SZ2ttziKJHyHVevDvguQ=' 
'sha256-2Mz5HCWbCK7DgaZZcPZ0zhPP81bZwnRbgH0ArrVfg0s=' 
'sha256-Q4f/gKIZ33g7ho+ZZhOtM3ITh5vsE+6uuSWuT/bATZo=' 
'sha256-dsCP1LQFF6hBpEhux64ssKmq9xIKjrCSMc9m0Q4Mu4E=' 
'sha256-3+vODQSBhigT4i/QysHIzsNtvXnnQlw0t/8dJQbeuc4=' 
'sha256-k01S7ZdfJN2Cxr93UCKGr8F79l/eIlGgdzmLP1l/NGY=' 
'sha256-r9zVt0hwy/e1hE7Eggrtc6+FdaktpjXky8iukG9V/fI=' 
'sha256-KVcdwElSPoiY+hUs3WXYvQ1WKHi8VzVTAZ/lVaLGDec=' 
'sha256-bJ19OcniHRjVh9m5HvfbNZrR/Ea6pT63zu5oGvp184Y=' 
'sha256-x96pnWeGvdOjAYetodkqIqM7P+hQN80nTFZM6mmfOMs=' 
'sha256-78nqUSWKVaNQ86OnxFNzo+htiHmkCBTIPOXiEr+CAis=' 
'sha256-fywBB2DrPLh6qXB65VfOqYzhjPk/6xDnajJ3HZmQ0Ts=' 
'sha256-w3vQcYmk9rDeVGyTnkyzPws1q4tsjxopcrIcfS1m33Y=' 
'sha256-ZOVx28sWiJbjnOqSe28JFoosSxUKyLtA14WzivtzEE8=' 
'sha256-yxvTY6L4iJYQn3Hk0/YFpY/BLMDNeWtF2Kv2QPwFqrQ=' 
'sha256-G/6PHyu2V+QGyX1owoI09REisF5d1WlSzc6BGeMv3OQ=' 
'sha256-8+Ecy/ZCrJmgsUWHisgoVySpf4ViMKFl6YRBj+RiX9I=' 
'sha256-Hr7cUGClE8u/esDIAEFAB5kv4POr9gXPkeGXwpiu0h8=' 
'sha256-6iA/40+UTEsU8XHdf1RtbbXW35Dvd8sg4/ZAqrYieCw=' 
'sha256-oDVNdAoqv/OisUH4fpCwpydluHo25TxqNb72McB+gHo=' 
'sha256-wMzT1Gu2/U7KW4sasoAk0T06p4Oz9iRJrKx5n48DpVE=' 
'sha256-E03YodfNK0ierKG4YvC4xjwIbzDf1MeAGH1+aC6G9ws=' 
'sha256-TDijcvoIhcEG/5qIxCVFOxTSLd7u3c7j48t3aZAyYRg=' 
'sha256-BPLlE/U8gb6DyWg4pXACnGArTdO02hTlzB9A1/tN3o4=' 
'sha256-+7akDSVcTZ7K6PZgZu8NDMrU+smD5PNpofyyeq7FxxI=' 
'sha256-ysvKPfhx5UN0mgtX/vGHFz6o+AYZPkybxsB3BMOLTjA=' 
'sha256-0vEMaG1181yZ9Yay7fJhGPDcdJjKvuXMDI5plC4Vy04=' 
'sha256-93djdjgO/IIGyd+GzcyS4jYbuFphuVQapL6AfGt0Ws4=' 
'sha256-V7pZaPiLg8E/Op3mqXTrno5DGd9A33c0NfhvICvLOH0=' 
'sha256-A/mDYXsKXo9s73anN/lMvzTsg6gMjpXCsnfqFeCC1jE=' 
'sha256-GptF6o+TMZQumpH1JvqCS0GzeCDYzzmRTGny1YDAX9c=' 
'sha256-AS9aOtuLLBUTzG/BiOK9FFfSUnbmRdyCY8rk7p/wRKo=' 
'sha256-FCn8olQj1mZzYMX0xePZj9TvTLcrIjCPFTGUjEUkGAY=' 
'sha256-bZYPrK5N4QoAm5GBcOdWxbxS2sRjOrW2hCFuqr2h+gc=' 
'sha256-ZG4/k4JNV7d/Gcp61CLQUsuPKx77dKsa2QaQTUAybUo=' 
'sha256-kmImmmFbRNqGYcJHzUAB3hdURj7o40Q5KKIP95kMHK0=' 
'sha256-uRhnm4/q2aK4XuMxmmg3l1xTVS5VmD4ghlxIKqgiei8=' 
'sha256-adSfAI2+uT10qFbtasqkLV94/Snoyv6ZLQOJ2O5BwjA=' 
'sha256-GBlx9bN1Hni+sQ3QgC5NprNILAnXplcWcO0vW4aY+30=' 
'sha256-kMMlRFDnEsFNmAclm7hTg+6tswaoofJPcd0TQdy7Cw0=' 
'sha256-zjvR8NEPOcUltt25FGUDCq6DmE7QxnVcus48ghScsWI=' 
'sha256-EgfO2jgBFSe34Gszae+vyn1k3F+xY09hGdGsQ9cnKYM=' 
'sha256-+5iYU3s9gWXJ70VbjaDP9LwdRT+Ct0PYugLW8uU8osk=' 
'sha256-jr3Lqt1M36Bd/mTiL6MA98ynTz2cyjdCO7McMD5tmZk=' 
'sha256-0O6N/qM0FkPfQVyx4MNtjC7wPnkR2CyM/mKtr32w90A=' 
'sha256-NJxqnZ9dsCi1NvrtiNGsgA4Q4SeltcCN+SrrkCa0hLc=' 
'sha256-NhUOM8IaqK+IlCvKDQh1/X6s7h/D9GOXuObjph64Q1Y=' 
'sha256-JG+Xt1LZScvH7aFTQY3gUMY83E39oa+K6pznjxQKGgM=' 
'sha256-97RvZ8Uk204Ek5HYX2VK0BWgxKX9bbgqHjoKyf/p4cM=' 
'sha256-Y+F6/KfhbnoaogcBHjsZ9/z2qSIGjBsJ9rvmge0PM60=' 
'sha256-9nnGXJGQdZ9t1qHkwJJI4lm61K+XjyDyDtj5dBw6wsg=' 
'sha256-NHJ4lO7tFvueUKAr2wc1XD9j35OYpWrvQSuNJqScJsc=' 
'sha256-2T/8CoUdchi6FvsJeYv1fxi3NjqTS/sWFIKIvtFC70M=' 
'sha256-KFTJwt4dbVStlniL3/ghFci+2kdSccLXWTjoUq6T8BM=' 
'sha256-LpKq3JX5B5DR8SWNC/JpMvPSqRleb2ckyzb4Fhm7Ax4=' 
'sha256-nxhPRWCFVFU7xBg+bW9BHHF9Bif+0rjIT0HyA+1YMiM=' 
'sha256-+WqCiRdJj2nzSURqTqNcyyGXKTnwgmdf5V4SKhbVoAU=' 
'sha256-rI102kAKijKw6tTuirEJQP8mp44xqPG0rB934RDOqfE=' 
'sha256-rJPoq1HGd4keDo1C4Mij3BjTdzbkt6CKLlOQxj3KU8M=' 
'sha256-sxwMR7OxOKn7mYIT+96CPIEQwQrA1H5da+ZdixaEhhc=' 
'sha256-yqZERn7O9lTaZdNrd87zvf2N2+0JH8cqTZpDKWqV+6U=' 
'sha256-lPnxloNSw2hKhU7apsPrHiqg7LTeXMK+aEg0pT1KOCE=' 
'sha256-13Sy4tQDx1Oz6SJ0XsZYHGP7F6ucCyO7zQrLuhW8lbA=' 
'sha256-0mmPi5hky67T+S0DeNpTwLOQt/mS3WyEupADBv5ZQZI=' 
'sha256-C5/6wZdVkKYNZjsutWNtwHLIf8ZlWnM77X2JbfXJi1U=' 
'sha256-uKnwMvhUIMmwKpTzbKmf9xjJKgnwaOpsaAKkf269fz0=' 
'sha256-iQi1QBqRTWdxh4CsQRBjClCvp+BggZ/XAlaZpk8xVvU=' 
'sha256-Vqrs6QMrq5liuQo0HYdNTC4zRHM5P5HpMELejbJuJ6Q=' 
'sha256-DYTj/rT5qaTwOWPH77D7wquglCEQ/n33FQL/J8eRv2M=' 
'sha256-yZd2c1saWve4j+3cyixxSQiC+Kn9en01sKn718ntob0=' 
'sha256-f1/BcQjCNM9vFkDbDZOGzeWf1qb8KSsqNDaUh2B3ffY=' 
'sha256-42uO7MabSBdalA9yflPmk+u3R95nBGBjjBhFz4vfj9M=' 
'sha256-1yKrAAXn/Tt9Wh3w/AOu5fYMZ+WW+qUnNWLOkAvxi6s=' 
'sha256-odZGrF1nAMtrmJgwGInyX0Bdby65E8Gv/s4MGLLCzkk=' 
'sha256-KIja2PWv70SjwxjJbBnVsIfvRva6AFIfLHtgUuR+oik=' 
'sha256-5IqxVrnsOgtSCi6QfWsCmeo0vxE5ar/3MieeBkPf5pw=' 
'sha256-iRNtlXqqdUjCXQ6NgoXgM4DOcEWZ3iSt/O66hlkdmxw=' 
'sha256-VyoBSBmidfWJi1xnbEfclmjA1iyXqJ8TQFP92f/AVIw=' 
'sha256-mJj1uwF85hq65c/BV6BUlTOtw+aaHhFnt70/majznLU=' 
'sha256-7cGkfrfwk6HRJJ+aozc2/tOI4oP+YopU3BzsnklaMoA=' 
'sha256-xhzzZ73hkVrONk7ZkNhpffjntPfsStkU2WJcgA2mfSA=' 
'sha256-gEOwE4rttNgcWyY9ofepbw+m+bYylr3DsZTEKUkY5f8=' 
'sha256-C8cnfkmsQLDNeiqiXEo7kkG0oSmtVquKSA8MBTWgh/M=' 
'sha256-Y6QCD9uYiHy4xWjHMrWdfEyhuQD3VT0Oq6qGsvjCME4=' 
'sha256-nqf6AEioHm4afZeIuhUpdscYulGGWwr0Wo/xAE5/+P8=' 
'sha256-K9AmkorH0dGpJN6zoVEUssbeVL8jQk1W0VHcrCqwypU=' 
'sha256-tGeMIta7DqhfsGeigkjRotxokUvyeCdln/SoyTLjH6U=' 
'sha256-1WG6bsIIhiGGo7Dkj4P1zLoDL4WmuA2k7jT6FJuHc7c=' 
'sha256-YNhUMO14leQCuxW8o/2oUVcrCcf5XRfAYCHYBwIZ7Q0=' 
'sha256-QJ3lTnmCaPvDkX8q3etuUhkg3lf9lX9T8qP6rm7jOxk=' 
'sha256-dL9LdvXctZM+ALyC8OKCkhoHKK3NE0JATEYbAaAfO88=' 
'sha256-Q4oCAAKWEskB5ckRvKZ+FvhqjRUhrYoNd+wK5nlzFWY=' 
'sha256-8rOb2UMVHRpubW8LiiSE5o/eZq0vCs7+xu2y2NbWuQ8=' 
'sha256-Bv1f3TGaDfqVIsc6QeoraknDndF1HNJ2lKfstuYsrcg=' 
'sha256-H2a5XI+YQTja3By2bvwdqItgvp2q+IiPxqXYH3/m1QI=' 
'sha256-KEdfhpM89HUbwnyixIwWKkXYwNARQH1y6kF37cla1+8=' 
'sha256-817LDF4CkGQji9VAfsCKcM8rbUiJIB3jGRlAgpC02rs=' 
'sha256-zOQ34sdWEHG0nbyo2ALpdb7jqq6MTO07Zsep9Bnxl0o=' 
'sha256-Kwz9xwD5pEHWfAyXgd6bP2EHWg+jp3tjDFcMNFjHcWc=' 
'sha256-REI2WBETvg8kovxbg0Jan/Xgn8XojUuqNSiXgzCzKIY=' 
'sha256-Sg/Wj8dCzgvW8vboR4HRBCmLZFzlZTJcssluJ/UHMQY=' 
'sha256-gGIwa9ahVmXw4Apk14wrl1X9t0PteAg1IxhJV5hbgGs=' 
'sha256-1JfhWHUE5+b0XsLm5m/v1H9jGbA63QUGoZtwp4XZn3Q=' 
'sha256-C6WMmecUyn8f5PEkpKNTX+5E+fBWXYGoGdDsszEAxsU=' 
'sha256-CZQqZX5HdwvIRhSbdwjBaqEaszVQmAkArZdGena2S6M=' 
'sha256-vLfnqukLUybfls+SFzTLu5HPdNPENvfblOsoRw7gfNI=' 
'sha256-v+/BoT6PAiGvzTl3qfHRn53URC4qU6/WsYYHyRqGBV4=' 
'sha256-UB1c0fPPuRCbJ77h1yB1iOAAMtm748uiIYfR1hzSlVw=' 
'sha256-rZwb5Eznubs1EUU9Hn5wDuVSzjmGnqLEKHQMPE6uWq4=' 
'sha256-zOQ34sdWEHG0nbyo2ALpdb7jqq6MTO07Zsep9Bnxl0o=' 
'sha256-b8CBTmcrWi5uIIVMkahkOslV9+KL0jJzmprhfSdMVxY=' 
'sha256-7/eC6amVWISVU8NHWVYEpKE253gfSQY2SAl4eAwdvHk=' 
'sha256-q0B90THFNvDKhqRDRAaQH/PCRJsv61X43qsvfxKl1lg=' 
'sha256-ZEHTxLNHwSuAyB8Jrfa71ZWzUkXZjSNuc95grfzix38=' 
'sha256-a5RUTNAffthwMxKRmiPh0GUmmORioZ1FrhkZGmILBk0=' 
'sha256-oiyYL4jFFJQVRJQp7zQycSfwwmdoeuOLFmgua/ziyVg=' 
'sha256-/rVXMwUizhF/yILVRfELre0HYBLQqZVz9HX+24teGC0=' 
'sha256-qYVId5HnrFhVKS61ZNMoMrNQLOAYlCo2aw+1OEmrqLg=' 
'sha256-nI8xVgYZi945TAYtW4BJLZjTujhvEAa+q86S8Diks0M=' 
'sha256-HxAQPYraUMUTt/pgPV0u4OxAq05H0fvezfNA3g99XnA=' 
'sha256-B8fylxxMf76rhM1bKY0FRFUb0IW4AWvnw16eEsfgNX8=' 
'sha256-NhcRvLgHZE/5v76oAhoPR6wXDVcAvUIOsuon6TrbaSg=' 
'sha256-at1hSWkcf/QQbFGdO752OInZ9PXnnK5XWPKxrFptrk8=' 
'sha256-8K14Jpisc+ixNjabBkB6NMzxipWGR8+QvhMMFW1fHec=' 
'sha256-811cMt8RJGPzahsqiayv9WULzG9tAGNiANXoUE0P+ns=' 
'sha256-1GJsOK0YqTCMuMe05Cv5bVWjNNS4X+qp5e1leNbr6QQ=' 
'sha256-HjvPt7RSpnyHYyHKAf7ornn0JR9VrElZUgNk92/tUXY=' 
'sha256-AfV8CBR0nPZwzlIgvI/6nPyRjnYgq5pwktRnyjhP7j8=' 
'sha256-mKknwSST+zqiLEr6zP+uKMdydyyKXooNk2vylOajoH4=' 
'sha256-rtVLPYyVW7gYfO5W+367+yejiw5fgEEBXHeuOV4mMTU=' 
'sha256-/URhmnnaDp8yoNFBUmRInbHD61dzvaW3jiwbNvax9E4=' 
'sha256-TwvncUuG9a5KMBjAazAsQIQGBgLKl08Rd5zfGz5832E=' 
'sha256-CkrRTiEtOTQaFcp7YQwxaAPS7dw31DrNWyzqDB83YP0=' 
'sha256-THMMjUC+Hntd/1fMQVMAqSFarW1ihfFfknHFGU+nVUQ=' 
'sha256-ak0VOw7ebIlWEtuwD/tkBed31QdrnzkMNorRdCsaBas=' 
'sha256-qDDV5zjNBvBuMCIUv2n6KDQ5OXy83ITwA75UHIbIl2s=' 
'sha256-N3rCyj8A6Noio9WKW7CvuvhbOOrKBiVpd3ST5ok2LK4=' 
'sha256-/iF0k6dLIJ9LRdSg6ajLthaRblAJ27qiGqWpz/t/aBg=' 
'sha256-YxanEhUVc7NsWEca9evmHXingD4+yy4e/pellEWsuAI=' 
'sha256-+tEpTVfatwsSHBlQCxaniMLCnI4455jxyIM2F1ouK7U=' 
'sha256-/iF0k6dLIJ9LRdSg6ajLthaRblAJ27qiGqWpz/t/aBg=' 
`;
*/

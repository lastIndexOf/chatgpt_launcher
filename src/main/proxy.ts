import { session } from 'electron';

const proxyRules = [
  {
    key: 'https_proxy',
    protocol: 'http://',
    url: 'https://google.com',
  },
  {
    key: 'http_proxy',
    protocol: 'http://',
    url: 'https://google.com',
  },
  {
    key: 'all_proxy',
    protocol: 'socks5://',
    url: 'socks5://google.com',
  },
];

export const applySystemProxy = async () => {
  const rules: string[] = await Promise.all(
    proxyRules.map(({ url }) => session.defaultSession.resolveProxy(url))
  );

  proxyRules.forEach(({ key, protocol }, index) => {
    const proxy = rules[index]?.split(' ')?.[1]?.trim();
    if (proxy) {
      process.env[key] = protocol + proxy;
      console.info(`${key} = ${protocol}${proxy}`);
    }
  });
  console.info('proxy rules applied');
};

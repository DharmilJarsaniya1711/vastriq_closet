const REGEX_DOMAIN = /^(https?:\/\/)?([^/]+)\/?/;

const remotePatterns = (process.env.NEXT_PUBLIC_DOMAINS ?? '')
  .split(',')
  .filter((domain) => REGEX_DOMAIN.test(domain))
  .map((domain) => {
    const [protocol, hostname] = domain.split('://');
    return {
      protocol,
      hostname,
    };
  });

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns,
  },
};

module.exports = nextConfig;

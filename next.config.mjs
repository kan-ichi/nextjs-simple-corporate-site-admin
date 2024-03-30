/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  experimental: {
    typedRoutes: true,
  },
  trailingSlash: true,
};
export default nextConfig;

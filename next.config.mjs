/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: process.env.BASEPATH,
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: false,
        basePath: false
      }
    ]
  }
}

export default nextConfig

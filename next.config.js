/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Configuracoes para suportar o ambiente auto-hospedado
  images: {
    unoptimized: true
  }
}

export default nextConfig

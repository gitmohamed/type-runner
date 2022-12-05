/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  async headers() {
    return [
      {
        source: '/sentences',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/plain',
          }
        ],
        source: '/paragraphs',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/plain',
          }
        ],
      },
    ]
  },
}

module.exports = nextConfig

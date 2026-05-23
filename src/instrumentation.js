export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const dns = require('node:dns');
    
    // Set global DNS result order to IPv4 first
    dns.setDefaultResultOrder('ipv4first');
    
    try {
      // Set Node.js c-ares DNS servers to Google and Cloudflare public DNS.
      // This bypasses local DNS resolvers that refuse SRV records (ECONNREFUSED) with c-ares on Windows.
      dns.setServers(['8.8.8.8', '1.1.1.1']);
      console.log('--- DNS Resolution order successfully configured to ipv4first and set public resolvers [8.8.8.8, 1.1.1.1] ---');
    } catch (e) {
      console.warn('--- Failed to set public DNS servers, keeping defaults:', e.message);
    }
  }
}

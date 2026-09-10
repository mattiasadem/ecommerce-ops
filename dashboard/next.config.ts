import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Limit Next.js worker concurrency on this VPS (cgroup pids.max=512).
  // The default pool spawns too many workers, hitting EAGAIN on spawn.
  experimental: {
    cpus: 1,
    workerThreads: false,
  },
  // Single-threaded static generation to stay under the cgroup PID budget.
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;

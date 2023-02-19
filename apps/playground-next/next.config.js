import { EvmTsPlugin } from "@evmts/plugin-webpack";

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	typescript: {
		ignoreBuildErrors: true,
	},
	webpack: (
		config,
		{ buildId, dev, isServer, defaultLoaders, nextRuntime, webpack },
	) => {
		config.plugins.push(new EvmTsPlugin({}));
		return config;
	},
};

export default nextConfig;

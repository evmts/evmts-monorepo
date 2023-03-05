import { z } from "zod";
import * as webpack from "webpack";
import {
	Artifacts,
	buildContracts,
	createModuleCjs,
	getArtifacts,
	getContractName,
	getFoundryConfig,
} from "@evmts/plugins";
// @ts-ignore - TODO figure out why these types don't work
import { pathExists } from "fs-extra/esm";
import * as acorn from "acorn";

export const forgeOptionsValidator = z.object({
	forgeExecutable: z
		.string()
		.optional()
		.default("forge")
		.describe("path to forge executable"),
	projectRoot: z
		.string()
		.optional()
		.default(process.cwd())
		.describe("path to project root"),
	deployments: z.record(z.string()).optional().default({}),
});

export type EvmTsOptions = Partial<z.infer<typeof forgeOptionsValidator>>;

export class EvmTsPlugin {
	private options: z.infer<typeof forgeOptionsValidator>;
	constructor(options: EvmTsOptions) {
		this.options = forgeOptionsValidator.parse(options);
	}

	apply(compiler: webpack.Compiler) {
		let artifacts: Artifacts;
		const foundryConfig = getFoundryConfig(this.options);

		const preProcess = async () => {
			await buildContracts(this.options);
			if (!(await pathExists(foundryConfig.out))) {
				throw new Error(
					`@evmts/plugin-webpack: foundry output directory does not exist: ${foundryConfig.out}`,
				);
			}
			artifacts = await getArtifacts(this.options);
		};

		compiler.hooks.beforeRun.tapPromise(EvmTsPlugin.name, preProcess);

		compiler.hooks.watchRun.tapPromise(EvmTsPlugin.name, preProcess);

		compiler.hooks.normalModuleFactory.tap(
			EvmTsPlugin.name,
			(normalModuleFactory) => {
				normalModuleFactory.hooks.resolve.tapAsync(
					EvmTsPlugin.name,
					async (data, cb) => {
						if (!data.request.endsWith(".sol")) {
							return cb(null);
						}

						artifacts = artifacts || (await getArtifacts(this.options));

						if (!artifacts) {
							throw new Error("@evmts/plugin-webpack: artifacts not ");
						}

						const contract = artifacts[getContractName(data.request)];

						if (!contract) {
							throw new Error(
								`@evmts/plugin-webpack: contract not found: ${data.request}`,
							);
						}

						const moduleContent = createModuleCjs(contract);
						console.log(moduleContent);

						// Create a new module with the ES module content
						const out = {
							resource: data.request,
							type: "javascript/esm",
							source: moduleContent,
							parser: {
								parse(source: any) {
									return acorn.parse(source, {
										ecmaVersion: 2022,
										sourceType: "module",
									});
								},
							},
						};
           console.log(data)
						// Pass the new module to the callback
						cb(null, { ...data, source: moduleContent });
					},
				);
			},
		);
	}
}

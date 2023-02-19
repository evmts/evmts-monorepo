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
				normalModuleFactory.hooks.resolve.tapPromise(
					EvmTsPlugin.name,
					async (data) => {
						if (!data.request.endsWith(".sol")) {
							return;
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

						// @ts-ignore - TODO figure out why these types don't work
						const module = new webpack.default.Module("javascript/dynamic");

						(module as any).sourceStr = moduleContent;
						(module as any).identifierStr = moduleContent;
						(module as any).readableIdentifierStr = moduleContent;
						(module as any).runtimeRequirements = null;

						data.request = moduleContent;
					},
				);
			},
		);
	}
}

import {
	Artifacts,
	buildContracts,
	createModule,
	forgeOptionsValidator,
	FoundryOptions,
	getArtifacts,
	getContractName,
	getFoundryConfig,
} from "@evmts/plugins";
// @ts-ignore - TODO figure out why these types don't work
import fs from "fs-extra/esm";
import type { Plugin } from "rollup";
import { z } from "zod";

/**
 * Expected shape of the forge artifacts
 */
export const forgeArtifactsValidator = z.object({
	abi: z.array(
		z.object({
			inputs: z.array(
				z.object({
					internalType: z.string(),
					name: z.string(),
					type: z.string(),
				}),
			),
			name: z.string(),
			outputs: z
				.array(
					z.object({
						internalType: z.string(),
						name: z.string(),
						type: z.string(),
					}),
				)
				.optional(),
			stateMutability: z.string().optional(),
			type: z.string(),
		}),
	),
	bytecode: z.object({
		object: z.string(),
		sourceMap: z.string(),
	}),
});

export const evmtsPlugin = (options: FoundryOptions = {}): Plugin => {
	const foundryOptions = forgeOptionsValidator.parse(options);
	const foundryConfig = getFoundryConfig(foundryOptions);

	let artifacts: Artifacts;

	return {
		name: "@evmts/plugin-rollup",
		version: "0.0.0",
		buildStart: async () => {
			await buildContracts(foundryOptions);
			if (!(await fs.pathExists(foundryConfig.out))) {
				throw new Error("artifacts directory does not exist");
			}
			artifacts = await getArtifacts(foundryOptions);
		},
		load(id) {
			if (!id.endsWith(".sol")) {
				return;
			}
			const contract = artifacts[getContractName(id)];
			if (!contract) {
				console.log(artifacts, getContractName(id));
				throw new Error(`contract ${id} not found`);
			}
			return createModule(contract);
		},
	};
};

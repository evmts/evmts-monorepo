import { execa } from "execa";
import { FoundryOptions } from "./getFoundryConfig";

export const buildContracts = async ({
	forgeExecutable = "forge",
	projectRoot = process.cwd(),
}: FoundryOptions) => {
	return execa(forgeExecutable, ["build", "--root", projectRoot]);
};

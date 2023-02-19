export const createModule = (contract: Record<string, any>) => {
	const out = Object.entries(contract).map(([key, value]) => {
		return `export const ${key} = ${JSON.stringify(value)}`;
	});

	out.push(`export default ${JSON.stringify(contract)}`);

	return out.join("\n");
};

export const createModuleCjs = (contract: Record<string, any>) => {
	const out = Object.entries(contract).map(([key, value]) => {
		return `module.exports.${key} = ${JSON.stringify(value)}`;
	});

	out.push(`module.exports.default = ${JSON.stringify(contract)}`);

	return out.join("\n");
};

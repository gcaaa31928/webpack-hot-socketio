module.exports = {
	getModuleMap(modules) {
		let map = {};
		for (let module of modules){
			map[module.id] = module.name;
		}
		return map;
	},
	extractBundles(stats) {
		if (stats.modules) {
			return [stats];
		}
		if (stats.children && stats.children.length) {
			return stats.children;
		}
		return [stats];
	}
};

import { parsePackagePath } from "packager-shared";

import { createPlugin } from "../plugin-creator";
import { fetchNpmDependency } from "../utils";

const cleanupExternalDependency = (code: string): string =>
    code.replace(/process.env.NODE_ENV/g, "'development'");

const baseLoaderPlugin = createPlugin({
    name: "base-loader",
    async loader(moduleId: string) {
        const file = this.files.find(f => f.path === moduleId);

        if (moduleId && !file) {
            const moduleMeta = parsePackagePath(moduleId);
            const moduleName = moduleMeta.name?.split("__")[0];
            if (!moduleName)
                throw new Error(
                    "There was an issue with loading deps for " + moduleId
                );

            const version =
                moduleMeta.version ||
                this.bundleOptions.dependencies[moduleName] ||
                "latest";

            const cachedNpmDependency = this.cache.dependencies.get(moduleId);

            if (!cachedNpmDependency) {
                const npmDependency =
                    (await fetchNpmDependency(
                        moduleName,
                        version,
                        moduleMeta.path || ""
                    )) || "";

                if (npmDependency) {
                    const cleanUpCode = cleanupExternalDependency(
                        npmDependency.code
                    );

                    this.cache.dependencies.set(moduleId, {
                        ...npmDependency,
                        code: cleanUpCode,
                        name: moduleId
                    });

                    return {
                        code: cleanUpCode
                    };
                }

                return null;
            }

            return {
                code: ""
            };
        } else if (moduleId && file) {
            return {
                code: file.code
            };
        }

        return null;
    }
});

export default baseLoaderPlugin;

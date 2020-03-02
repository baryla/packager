import { TRANSPILE_STATUS } from "packager";

declare var CoffeeScript: any;

self.importScripts(
    "https://unpkg.com/coffeescript/lib/coffeescript-browser-compiler-legacy/coffeescript.js"
);

console.log("initiated worker");

self.addEventListener("message", async ({ data }: any) => {
    const { file, type, context } = data;
    if (type === TRANSPILE_STATUS.PREPARE_FILES) {
        console.log("inside worker");
        try {
            const transpiledFile = await transpileFile(file);

            // @ts-ignore
            self.postMessage({
                type: TRANSPILE_STATUS.TRANSPILE_COMPLETE,
                file: transpiledFile
            });
        } catch (error) {
            // @ts-ignore wrong scope
            self.postMessage({
                type: TRANSPILE_STATUS.ERROR_COMPILE,
                error
            });
        }
    }
});

const transpileFile = (file: any) => {
    return new Promise((resolve, reject) => {
        try {
            const transpiled = CoffeeScript.compile(file.code, {
                filename: file.path,
                sourceMap: true
            });

            resolve({
                ...file,
                code: transpiled.js,
                map: JSON.parse(transpiled.v3SourceMap || "{}")
            });
        } catch (e) {
            reject(e);
        }
    });
};

import { TRANSPILE_STATUS } from "../transpiler";

// declare var ts: any;
declare var sucrase: any;

// self.importScripts(
//     "https://cdn.jsdelivr.net/npm/typescript@latest/lib/typescript.js"
// );

self.importScripts("https://unpkg.com/@bloxy/iife-libs/libs/sucrase.js");

self.addEventListener("message", async ({ data }: any) => {
    const { file, type, context } = data;
    if (type === TRANSPILE_STATUS.PREPARE_FILES) {
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
                type: TRANSPILE_STATUS.ERROR_PREPARING_AND_COMPILING,
                error
            });
        }
    }
});

const transpileFile = (file: any) =>
    new Promise((resolve, reject) => {
        const transpiled = sucrase.transform(file.code, {
            transforms: ["typescript", "jsx"]
        });
        // const transpiled = ts.transpileModule(file.code, {
        //     fileName: file.name,
        //     compilerOptions: {
        //         allowSyntheticDefaultImports: true,
        //         target: ts.ScriptTarget.ES5,
        //         module: ts.ModuleKind.ESNext,
        //         importHelpers: true,
        //         noEmitHelpers: false,
        //         moduleResolution: ts.ModuleResolutionKind.NodeJs,
        //         jsx: ts.JsxEmit.React,
        //         sourceMap: true
        //     }
        // });

        if (transpiled.code) {
            resolve({
                ...file,
                code: transpiled.code,
                map: JSON.parse(transpiled.map || "{}")
            });
        } else {
            reject(`Failed to transpile ${file.path}`);
        }
    });
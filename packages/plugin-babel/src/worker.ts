import { File, WebWorkerEvent, WORKER_ORIGIN } from "packager";
import { TRANSPILE_STATUS } from "packager-pluginutils";
import { TransformOptions, BabelFileResult } from "@babel/core";

import commonjsPlugin from "./plugins/commonjs-to-es6";

interface WebWorker extends Worker {
  Babel: {
    transform: (
      code: string,
      options?: TransformOptions
    ) => BabelFileResult | null;
    availablePlugins: Record<string, any>;
  };
  importScripts: (...urls: Array<string>) => void;
}
declare const self: WebWorker;

const loadBabel = () => {
  if (!self.Babel) {
    self.importScripts(
      "https://unpkg.com/@babel/standalone@7.10.2/babel.min.js"
    );
  }
};

loadBabel();

self.addEventListener("message", async (event: WebWorkerEvent) => {
  const { context, type } = event.data;

  if (type === TRANSPILE_STATUS.START) {
    try {
      const transpiled = self.Babel.transform(context.code, {
        filename: context.moduleId,
        plugins: [commonjsPlugin],
      });

      const transpiledFile =
        transpiled.code === context.code ? null : { code: transpiled.code };

      self.postMessage({
        type: TRANSPILE_STATUS.END,
        context: transpiledFile,
      });
    } catch (error) {
      self.postMessage({
        type: TRANSPILE_STATUS.ERROR,
        error,
      });
    }
  }
});

import {
  createPlugin,
  styleHelpers,
  verifyExtensions,
} from "packager-pluginutils";
// @ts-ignore
import Worker from "web-worker:./worker";

const isValid = verifyExtensions([".styl"]);

const stylusPlugin = createPlugin({
  name: "stylus",
  transpiler: {
    gateway(moduleId: string) {
      return isValid(moduleId);
    },
    worker: Worker,
    beforeBundle(moduleId: string, code: string) {
      return styleHelpers.generateExport({ path: moduleId, code });
    },
  },
});

export default stylusPlugin;

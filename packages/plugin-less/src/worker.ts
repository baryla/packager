import { TRANSPILE_STATUS, PackagerContext } from "packager";
import { path } from "packager-shared";

declare global {
  interface Window {
    less: any;
  }
}

// @ts-ignore
self.window = self;
// @ts-ignore
self.window.document = {
  currentScript: { async: true },
  createElement: () => ({ appendChild: () => {} }),
  createTextNode: () => ({}),
  getElementsByTagName: () => [],
  head: { appendChild: () => {}, removeChild: () => {} }
};

const loadLess = () => {
  if (!self.less) {
    self.importScripts("https://cdn.jsdelivr.net/npm/less");
  }
};

loadLess();

self.addEventListener("message", async ({ data }: any) => {
  loadLess();

  const { file, type, context } = data;
  if (type === TRANSPILE_STATUS.PREPARE_FILES) {
    try {
      const options = {
        plugins: [manager(context, file.path)],
        relativeUrls: true,
        filename: file.path
      };

      const transpiledFile = await transpileFile(file, options);

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

const transpileFile = (file: any, options: any) =>
  new Promise((resolve, reject) => {
    self.less.render(file.code, options, (err: any, data: any) => {
      if (err) {
        reject(err);
      } else {
        resolve({
          ...file,
          code: data.css
        });
      }
    });
  });

const manager = (context: PackagerContext, parentPath: string) => {
  const lessManager = new self.less.FileManager();

  lessManager.loadFile = (filename: string, currentDirectory: string) => {
    return new Promise((resolve, reject) => {
      try {
        const relativePath = path.resolve(currentDirectory, filename);

        const foundFile = context.files.find(
          file => file.path === relativePath
        );

        if (foundFile) {
          resolve({ contents: foundFile.code, filename });
        } else {
          const retriedFile = retryFiles(relativePath, context);

          if (retriedFile) {
            resolve({ contents: retriedFile.code, filename });
          } else {
            throw new Error(`Could not load ${filename} from ${parentPath}`);
          }
        }
      } catch (e) {
        reject(e);
      }
    });
  };

  return {
    install(instance: any, pluginManager: any) {
      pluginManager.addFileManager(lessManager);
    }
  };
};

const retryFiles = (path: string, context: PackagerContext) =>
  context.files.find(
    file =>
      file.path === path ||
      file.path === `${path}.less` ||
      file.path === `${path}.css`
  );

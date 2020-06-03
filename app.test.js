const runCommand = require("./utils");
const fsExtra = require("fs-extra");
const dirTree = require("directory-tree");

const APP_PATH = require.resolve("./app");

describe("app", () => {
    beforeEach(async () => {
        try {
            await fsExtra.mkdirs("source/dir1/dir2");
            await fsExtra.mkdirs("source/dir3/dir4");
            await fsExtra.mkdirs("source/dir3/dir5");
            await fsExtra.mkdirs("source/dir6");
            for (let i = 97; i < 110; i++) {
                await fsExtra.ensureFile(
                    `source/dir1/${String.fromCharCode(i)}df.jpg`
                );
                await fsExtra.ensureFile(
                    `source/dir1/${String.fromCharCode(i)}sd.flac`
                );
                await fsExtra.ensureFile(
                    `source/dir1/${String.fromCharCode(i)}fl.mp3`
                );
            }
            for (let i = 110; i < 123; i++) {
                await fsExtra.ensureFile(
                    `source/dir2/${String.fromCharCode(i)}fs.mp3`
                );
                await fsExtra.ensureFile(
                    `source/dir2/${String.fromCharCode(i)}eff.aac`
                );
                await fsExtra.ensureFile(
                    `source/dir3/dir4/${String.fromCharCode(i)}fdsa.aac`
                );
                await fsExtra.ensureFile(
                    `source/dir2/${String.fromCharCode(i)}fds.wave`
                );
            }
        } catch (err) {
            console.error(err);
        }
    });

    afterEach(async () => {
        try {
            await fsExtra.remove("source");
            await fsExtra.remove("result");
        } catch (err) {
            console.error(err);
        }
    });

    it("outputs success message when executed correctly", async () => {
        const stdout = await runCommand(
            `node ${APP_PATH} source result --delSrc`
        );
        expect(stdout.trim()).toEqual("App is done.");
    });

    it("outputs error message when no specified source directory", async () => {
        try {
            await runCommand(`node ${APP_PATH}`);
        } catch (error) {
            expect(error.trim()).toEqual("No path to the source directory(");
        }
    });

    it("outputs error message when no specified result directory", async () => {
        try {
            await runCommand(`node ${APP_PATH} source`);
        } catch (error) {
            expect(error.trim()).toEqual("No path to the result directory(");
        }
    });

    it("outputs error message when specified wrong path to the source directory", async () => {
        try {
            await runCommand(`node ${APP_PATH} ms res`);
        } catch (error) {
            expect(error.trim()).toEqual(
                "Source is missing at the specified address("
            );
        }
    });

    it("saves source directory if there is no flag --delSrc", async () => {
        await runCommand(`node ${APP_PATH} source result`);
        expect(await fsExtra.pathExists("./source")).toBeTruthy();
    });

    it("deletes source directory if there is a flag --delSrc", async () => {
        await runCommand(`node ${APP_PATH} source result --delSrc`);
        expect(await fsExtra.pathExists("./source")).toBeFalsy();
    });

    it("moves files to result directory in the same folders", async () => {
      const trueDir = (dirs) => {
        dirs.forEach(dir => {
          dir.children.forEach(child => {
            if(child.name.slice(0, 1) !== dir.name.toUpperCase()) return false
          })
        })
        return true
      }
      await runCommand(`node ${APP_PATH} source result --delSrc`);

      expect(await fsExtra.pathExists("./result/music")).toBeTruthy();

      const tree = dirTree("./result/music/");
      expect(trueDir(tree.children)).toBeTruthy()
    });
});

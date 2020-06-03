const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const copyFile = promisify(fs.link);

const [, , src, dist, delSrc] = process.argv;
const source = path.join(__dirname, src || "");
const res = path.join(__dirname, dist || "");
const music = {
    formats: [".mp3", ".aac", ".flac", ".wav", ".aiff", ".alac"],
    directory: "music",
};

const getFiles = (base, dirEnd) =>
    new Promise((resolve) => {
        const files = fs.readdirSync(base);
        let filesCount = files.length;

        const handleIfCleanDir = () => {
            if (filesCount === 0) {
                if (delSrc) fs.rmdirSync(base);
                if (dirEnd) {
                    dirEnd();
                } else {
                    resolve();
                }
            }
        };
        handleIfCleanDir();
        files.forEach(async (item) => {
            let localBase = path.join(base, item);
            let stat = fs.statSync(localBase);
            if (stat.isDirectory()) {
                await getFiles(localBase, () => {
                    filesCount--;
                    handleIfCleanDir();
                });
            } else {
                const outPath = path.join(
                    res,
                    path.join(
                        music.formats.includes(path.parse(item).ext)
                            ? music.directory
                            : "other"
                    ),
                    item.slice(0, 1).toUpperCase()
                );

                if (!fs.existsSync(outPath)) {
                    fs.mkdirSync(outPath);
                }

                await copyFile(localBase, path.join(outPath, item));

                filesCount--;
                if (delSrc === "--delSrc") fs.unlinkSync(localBase);
                handleIfCleanDir();
            }
        });
    });

try {
    if (!src) throw new Error("No path to the source directory(");
    if (!dist) throw new Error("No path to the result directory(");
    if (!fs.existsSync(source))
        throw new Error("Source is missing at the specified address(");
    if (!fs.existsSync(res)) {
        fs.mkdirSync(res);
    }
    if (!fs.existsSync(path.join(res, music.directory))) {
        fs.mkdirSync(path.join(res, music.directory));
    }
    if (!fs.existsSync(path.join(res, "other"))) {
        fs.mkdirSync(path.join(res, "other"));
    }
    (async () => {
        try {
            await getFiles(source);
            console.log("App is done.");
        } catch (error) {
            console.log(error.message);
        }
    })();
} catch (e) {
    console.error(e.message);
}

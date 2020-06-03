const fs = require("fs");
const path = require("path");

const [, , src, dist, delSrc] = process.argv;
const source = path.join(__dirname, src || "");
const res = path.join(__dirname, dist || "");
const music = {
    formats: [".mp3", ".aac", ".flac", ".wav", ".aiff", ".alac"],
    directory: "music",
};

const getFiles = (base, dirEnd) => {
    const files = fs.readdirSync(base);
    let filesCount = files.length;

    const handleIfCleanDir = () => {
        if (filesCount === 0) {
            if(delSrc) fs.rmdirSync(base);
            if (dirEnd) {
                dirEnd();
            } else {
                console.log("App is done.");
            }
        }
    };
    handleIfCleanDir();
    files.forEach((item) => {
        let localBase = path.join(base, item);
        let stat = fs.statSync(localBase);
        if (stat.isDirectory()) {
            getFiles(localBase, () => {
                filesCount--;
                handleIfCleanDir()
            });
        } else {
            const outPath = path.join(
                res,
                music.formats.includes(path.parse(item).ext)
                    ? path.join(
                          music.directory,
                          item.slice(0, 1).toUpperCase()
                      )
                    : "other"
            );

            if (!fs.existsSync(outPath)) {
                fs.mkdirSync(outPath);
            }

            fs.link(localBase, path.join(outPath, item), (err) => {
                if (err) throw new Error(err);
                filesCount--;
                if (delSrc === "--delSrc") fs.unlinkSync(localBase);
                handleIfCleanDir();
            });
        }
    });
};

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

    getFiles(source);
} catch (e) {
    console.error(e.message);
}

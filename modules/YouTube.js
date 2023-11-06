const
    dargs = require('dargs'),
    execa = require('execa'),
    ffmpeg = require("fluent-ffmpeg"),
    fs = require("fs"),
    path = require("path")

class Base {
    constructor() { }
    createFolderIfNotExists = () => (!fs.existsSync(`${process.cwd()}/temp`)) ? fs.mkdirSync(`${process.cwd()}/temp`) : (void {});
    /**@param {string} url @returns {execa.ExecaChildProcess}*/
    youtubedl = (url) =>
        execa(`${process.cwd()}/bin/yt-dlp${process.platform == 'win32' ? '.exe' : ''}`, new Array().concat(url, dargs({ dumpSingleJson: true, noCheckCertificates: true, noWarnings: true, preferFreeFormats: true, addHeader: ["referer:youtube.com", "user-agent:googlebot"] }, { useEquals: false })).filter(Boolean), undefined)
            .then(d => d.stdout ? (d.stdout.startsWith('{') ? JSON.parse(d.stdout) : d.stdout) : Object.assign(new Error(stderr), { stderr: d.stderr, stdout: d.stdout }, d.details))
            .catch(d => d.stdout ? (d.stdout.startsWith('{') ? JSON.parse(d.stdout) : d.stdout) : Object.assign(new Error(stderr), { stderr: d.stderr, stdout: d.stdout }, d.details))
}

class AudioOnly extends Base {
    constructor(d) {
        super()
        new Promise(async (res, rej) => {
            try {
                const { reqAudio, videoTitle } = await this.fetchDetails({ url: d.url, quality: d.quality });
                if (reqAudio) await this.downloadFile(d.url, d.filename || `[${d.quality}]${videoTitle}`);
                else throw new Error("No audio details found.");
                res();
            } catch (err) { rej(err) }
        });
    }
    async fetchDetails(url) {
        try {
            const result = await this.youtubedl(url)
            return { reqAudio: AudioOnly.findReqFormat(result.formats), videoTitle: result.title };
        } catch (err) { throw err }
    }
    async downloadFile(ffmpegUrl, filename) {
        return new Promise((res, rej) => {
            ffmpeg()
                .input(ffmpegUrl)
                .audioBitrate(320)
                .toFormat("ipod")
                .on("end", res)
                .on("error", rej)
                .saveToFile(path.join('temp', `${filename}.mp3`))
                .run();
        });
    }
    static findReqFormat(formats, quality) {
        let reqAudio;
        switch (quality) {
            case 'best':
                let highestBitrate = 0;
                for (const format of formats) {
                    if (format.acodec === "none" || format.vcodec !== "none") continue;
                    const bitrate = format.tbr || format.abr;
                    if (bitrate && bitrate > highestBitrate) {
                        highestBitrate = bitrate;
                        reqAudio = format;
                    }
                }
                return reqAudio;
            case 'lowest':
                let lowBitrate = Infinity;
                for (const format of formats) {
                    if (format.acodec === "none" || format.vcodec !== "none") continue;
                    const bitrate = format.tbr || format.abr;
                    if (bitrate && bitrate < lowBitrate) {
                        lowBitrate = bitrate;
                        reqAudio = format;
                    }
                }
                return reqAudio;
            default:
                throw new Error("Error: Audio Quality supported: best,lowest");
        }
    }
}

class VideoOnly extends Base {
    constructor(d) {
        super()
        new Promise(async (res, rej) => {
            try {
                const { reqVideo, videoTitle } = await this.fetchDetails({ url: d.url, requestedResolution: d.resolution });
                if (reqVideo) await this.downloadFile(reqVideo.url, d.filename || `[${reqVideo.height}]${videoTitle}]`);
                else throw new Error("⚠️ No video details found.");
                res();
            } catch (err) { rej(err); }
        });
    }
    async fetchDetails({ url, requestedResolution }) {
        try {
            const result = await this.youtubedl(url)
            return { reqVideo: VideoOnly.findReqFormat(result.formats, requestedResolution), videoTitle: result.title };
        } catch (err) {
            throw new Error(`Error fetching video details: ${err.message}`);
        }
    };
    async downloadFile(videoUrl, filename) {
        return new Promise((res, rej) => {
            ffmpeg()
                .input(videoUrl)
                .videoCodec("copy")
                .on("end", res)
                .on("error", rej)
                .save(`temp/${filename}.mp4`)
                .run();
        });
    }
    static findReqFormat = (formats, requestedResolution) => formats.filter((format) => format.ext === "mp4" && format.format_note !== "none").sort((a, b) => a.height - b.height).find((format) => format.height >= requestedResolution);
}
class VideoAndAudio extends Base {
    constructor(d) {
        super()
        new Promise(async (res, rej) => {
            try {
                const { reqVideo, reqAudio, videoTitle } = await this.fetchDetails({ url: d.url, requestedResolution: d.resolution });
                if (reqVideo && reqAudio) await this.downloadFile(reqVideo.url, reqAudio.url, d.filename || `[${reqVideo.height}]${videoTitle}`);
                else throw new Error("No video and audio details found.");
                res();
            } catch (err) { rej(err); }
        });
    }
    async fetchDetails({ url, requestedResolution }) {
        try {
            const result = await this.youtubedl(url)
            return { reqVideo: VideoOnly.findReqFormat(result.formats, requestedResolution), reqAudio: AudioOnly.findReqFormat(result.formats), videoTitle: result.title };
        } catch (err) { throw new Error(`Error fetching video and audio details: ${err.message}`); }
    };
    async downloadFile(videoUrl, audioUrl, filename) {
        return new Promise((res, rej) => {
            ffmpeg()
                .input(videoUrl)
                .input(audioUrl)
                .videoCodec("copy")
                .audioCodec("copy")
                .on("end", res)
                .on("error", rej)
                .save(`temp/${filename}.mp4`)
                .run();
        });
    }
}

module.exports.Audio = AudioOnly
module.exports.Video = VideoOnly
module.exports.VideoAndAudio = VideoAndAudio

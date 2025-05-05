import { Readable } from "stream";

export default function ignoreStream(stream: Readable) {
    // Prevent an unhandled error from crashing the process.
    stream.on("error", () => { });

    // Waste the stream.
    stream.resume();
}
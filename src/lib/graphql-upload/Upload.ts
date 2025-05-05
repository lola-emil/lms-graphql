import GraphQLUpload from "./GraphQLUpload";
import processRequest, { FileUpload } from "./processRequest";



export default class Upload {
    promise: Promise<any>;
    resolve!: (file: any) => any;
    file: any;
    reject!: (reason: any) => any;
    constructor() {
        /**
         * Promise that resolves file upload details. This should only be utilized
         * by {@linkcode GraphQLUpload}.
         * @type {Promise<FileUpload>}
         */
        this.promise = new Promise((resolve, reject) => {
            /**
             * Resolves the upload promise with the file upload details. This should
             * only be utilized by {@linkcode processRequest}.
             * @param {FileUpload} file File upload details.
             */
            this.resolve = (file) => {
                /**
                 * The file upload details, available when the
                 * {@linkcode Upload.promise} resolves. This should only be utilized by
                 * {@linkcode processRequest}.
                 * @type {FileUpload | undefined}
                 */
                this.file = file;

                resolve(file);
            };

            /**
             * Rejects the upload promise with an error. This should only be
             * utilized by {@linkcode processRequest}.
             * @param {Error} error Error instance.
             */
            this.reject = reject;
        });

        // Prevent errors crashing Node.js, see:
        // https://github.com/nodejs/node/issues/20392
        this.promise.catch(() => { });
    }
}
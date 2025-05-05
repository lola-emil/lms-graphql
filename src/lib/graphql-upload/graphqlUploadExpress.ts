import { NextFunction, Request, Response } from "express";
import defaultProcessRequest from "./processRequest";

export default function graphqlUploadExpress({
  processRequest = defaultProcessRequest,
  ...processRequestOptions
} = {}) {

  function graphqlUploadExpressMiddleware(request: Request, response: Response, next: NextFunction) {
    if (request.is("multipart/form-data")) {
      const requestEnd = new Promise((resolve) => request.on("end", resolve));
      const { send } = response;

      // @ts-ignore Todo: Find a less hacky way to prevent sending a response
      // before the request has ended.
      response.send = (...args) => {
        requestEnd.then(() => {
          response.send = send;
          response.send(...args);
        });
      };

      processRequest(request, response, processRequestOptions)
        .then((body) => {
          request.body = body;
          next();
        })
        .catch((error) => {
          if (error.status && error.expose) response.status(error.status);
          next(error);
        });
    } else next();
  }

  return graphqlUploadExpressMiddleware;
}

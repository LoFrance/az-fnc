import {
  IResponseErrorInternal,
  IResponseErrorNotFound,
  IResponseSuccessJson,
  ResponseErrorInternal
} from "@pagopa/ts-commons/lib/responses";
import {
  withRequestMiddlewares,
  wrapRequestHandler
} from "@pagopa/ts-commons/lib/request_middleware";
import * as express from "express";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { ContextMiddleware } from "@pagopa/io-functions-commons/dist/src/utils/middlewares/context_middleware";
import { RequiredParamMiddleware } from "@pagopa/io-functions-commons/dist/src/utils/middlewares/required_param";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { Context } from "@azure/functions";

interface IResultSuccessRepose {
  readonly data: string;
}

type Handler = (
  ctx: Context,
  someParam: NonEmptyString
) => Promise<
  | IResponseSuccessJson<IResultSuccessRepose>
  | IResponseErrorInternal
  | IResponseErrorNotFound
>;

// TO DO: This is the Handler and it's to be implemented!
const createHandler = (): Handler => (
  _ctx,
  someParam: NonEmptyString
): ReturnType<Handler> => {
  // eslint-disable-next-line no-console
  console.log(someParam);
  return pipe(
    TE.throwError<string, IResponseSuccessJson<IResultSuccessRepose>>(
      "To be Implementend"
    ),
    TE.mapLeft(ResponseErrorInternal),
    TE.toUnion
  )();
};

export const HttpCtrl = (): express.RequestHandler => {
  const handler = createHandler();

  const middlewaresWrap = withRequestMiddlewares(
    ContextMiddleware(),
    RequiredParamMiddleware("someParam", NonEmptyString)
  );

  return wrapRequestHandler(middlewaresWrap(handler));
};

export default HttpCtrl;

import { Context, HttpRequest } from "@azure/functions";
import createAzureFunctionHandler from "@pagopa/express-azure-functions/dist/src/createAzureFunctionsHandler";
import {
  ContextMiddleware,
  setAppContext
} from "@pagopa/io-functions-commons/dist/src/utils/middlewares/context_middleware";
import {
  withRequestMiddlewares,
  wrapRequestHandler
} from "@pagopa/ts-commons/lib/request_middleware";
import * as express from "express";
import {
  IResponseErrorInternal,
  IResponseSuccessJson,
  // ResponseErrorInternal,
  ResponseSuccessJson
} from "@pagopa/ts-commons/lib/responses";
import { RequiredParamMiddleware } from "@pagopa/io-functions-commons/dist/src/utils/middlewares/required_param";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";

/*
In caso di risposta di successo mi definisco il tipo tramite una interfaccia.
Posso definirmi questo tipo anche tramite io-ts per sfruttare la codifica/decodifica a runtime
*/
interface IMessage {
  readonly message: string;
}

/*
Mi definisco il tipo dell'Handler che mi gestisce la HTTP Request e a cui passo un Context
*/
type GetStatusHandler = (
  ctx: Context,
  name: NonEmptyString
) => Promise<IResponseSuccessJson<IMessage> | IResponseErrorInternal>;

const GetStatusHandler = () => async (
  ctx: Context,
  name: NonEmptyString
): Promise<IResponseSuccessJson<IMessage> | IResponseErrorInternal> => {
  ctx.log(`Starting Status ${name}`);
  return Promise.resolve(
    ResponseSuccessJson({ message: `${name} la funzione è UP!` })
  );
};

const Handler = (): express.RequestHandler => {
  const handler = GetStatusHandler();
  const middlewaresWrap = withRequestMiddlewares(
    ContextMiddleware(),
    RequiredParamMiddleware("name", NonEmptyString)
  );
  return wrapRequestHandler(middlewaresWrap(handler));
};

const setupExpress = (): express.Express => {
  const app = express();
  app.get("/api/v1/hello/:name", Handler());
  return app;
};

const appExpress = setupExpress();
const azureFunctionHandler = createAzureFunctionHandler(appExpress);

const httpStart = (context: Context, request: HttpRequest): void => {
  context.log("HTTP START", request.url);
  setAppContext(appExpress, context);
  azureFunctionHandler(context);
};

export default httpStart;

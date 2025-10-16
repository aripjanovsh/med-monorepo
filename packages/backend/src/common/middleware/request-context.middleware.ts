import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { AsyncLocalStorage } from "async_hooks";

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  private static asyncLocalStorage = new AsyncLocalStorage<Request>();

  use(req: Request, res: Response, next: NextFunction) {
    RequestContextMiddleware.asyncLocalStorage.run(req, () => {
      next();
    });
  }

  static getRequestContext(): Request | undefined {
    return this.asyncLocalStorage.getStore();
  }
}

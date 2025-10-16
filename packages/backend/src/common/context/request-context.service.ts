import { Injectable } from "@nestjs/common";
import { AsyncLocalStorage } from "async_hooks";

interface RequestContext {
  request: any;
  user?: any;
}

@Injectable()
export class RequestContextService {
  private static als = new AsyncLocalStorage<RequestContext>();

  static getRequestContext(): RequestContext | undefined {
    return this.als.getStore();
  }

  static run<T>(context: RequestContext, fn: () => T): T {
    return this.als.run(context, fn);
  }

  static getRequest() {
    const context = this.getRequestContext();
    return context?.request;
  }

  static getUser() {
    const context = this.getRequestContext();
    return context?.user || context?.request?.user;
  }
}

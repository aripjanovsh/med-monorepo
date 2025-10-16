import {
  combineReducers,
  configureStore,
  isRejectedWithValue,
  Middleware,
} from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { rootApi } from "./api/root.api";
import { authReducer } from "@/features/auth/auth.slice";
import { includes, get } from "lodash";

export const rootReducer = combineReducers({
  [rootApi.reducerPath]: rootApi.reducer,
  auth: authReducer,
});

export const rtkQueryErrorLogger: Middleware = () => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    const status = get(action, "payload.status");

    if (
      includes(
        [
          //400, 404
          401, 402, 403, 405, 406, 500, 501, 502, 503, 504,
        ],
        status
      )
    ) {
      // dispatch(securitySlice.actions.setStatus(status));
    }
  }

  return next(action);
};

const setupStore = () =>
  configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }).concat([
        rtkQueryErrorLogger,
        rootApi.middleware,
      ]),
  });

export const store = setupStore();

// Setup listeners for refetchOnFocus/refetchOnReconnect behaviors
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

import { createStore, compose, AnyAction } from "redux";
import { persistStore, persistReducer, PersistConfig } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { encryptTransform } from "redux-persist-transform-encrypt";
import rootReducer from "./reducers";
import type { RootState } from "./reducers"; // Import RootState directly

// Extend the Window interface to include Redux DevTools
declare global {
    interface Window {
        __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose;
    }
}

// Persist config with encryption
const persistConfig: PersistConfig<RootState> = {
    key: "khalsa",
    storage,
    transforms: [
        encryptTransform({
            secretKey: import.meta.env.VITE_APP_STORAGE_SECRET_KEY!,
            onError: (error: Error) => {
                console.error("Encryption Error:", error);
            },
        }),
    ],
};

// Create persisted reducer
const persistedReducer = persistReducer<RootState, AnyAction>(persistConfig, rootReducer);

// Compose enhancers
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

// Create Redux store
const store = createStore(persistedReducer, composeEnhancers());

// Create persistor
const persistor = persistStore(store);

export { store, persistor };
// auth.ts
import { AnyAction } from "redux";

// Define your auth state type
export interface User {
    id: string
    email: string
    role: string
}

export interface AuthState {
    // your auth state properties
    user: User; // replace 'any' with your actual user type
    token: string | null;
    authenticated: boolean;
}

// Define your auth action types
export enum AuthActionTypes {
    AUTH_SUCCESS = "AUTH_SUCCESS",
    AUTH_FAILURE = "AUTH_FAILURE",
    AUTH_LOGOUT = "AUTH_LOGOUT",
}

// Define your action interfaces

interface AuthSuccessAction {
    type: AuthActionTypes.AUTH_SUCCESS;
    payload: {
        user: User; // replace with your actual user type
        token: string;
        role: string;
    };
}

interface AuthFailureAction {
    type: AuthActionTypes.AUTH_FAILURE;
    payload: string; // error message
}

interface AuthLogoutAction {
    type: AuthActionTypes.AUTH_LOGOUT;
}

// Union type for all auth actions
export type AuthAction =
    | AuthSuccessAction
    | AuthFailureAction
    | AuthLogoutAction;

// Initial state
const initialState: AuthState = {
    user: {
        id: '',
        email: '',
        role: '',
    },
    token: null,
    authenticated: false,
};

// Auth reducer
const authReducer = (state: AuthState = initialState, action: AnyAction): AuthState => {

    switch (action.type) {
        case AuthActionTypes.AUTH_SUCCESS:
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                authenticated: true,
            };
        case AuthActionTypes.AUTH_FAILURE:
            return {
                ...state,
                authenticated: false,
                token: "",
                user: {
                    id: '',
                    email: '',
                    role: '',
                }
            };
        case AuthActionTypes.AUTH_LOGOUT:
            return initialState;
        default:
            return state;
    }
};

export default authReducer;
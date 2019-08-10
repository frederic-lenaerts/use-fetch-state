import { useReducer, useState } from 'react';

export interface ApiState {
    error?: Error;
    isCanceled: boolean;
    isLoading: boolean;
}

export interface InvokeCancel {
    cancel: () => void;
}

export interface InvokeFetch {
    doFetch: (url: string, options?: RequestInit | null, onSuccess?: ResponseHandler | null) => Promise<void>;
}

export type ResponseHandler = (resp: Response) => void | Promise<void>;
export type UseFetchHook = InvokeFetch & InvokeCancel & ApiState;

export function useFetch(): UseFetchHook {
    const [abortController, setAbortController] = useState(new AbortController());
    const [state, dispatch] = useReducer(reducer, initialState);

    const doFetch = async (
        url: string,
        options?: RequestInit | null,
        onSuccess?: ResponseHandler | null
    ): Promise<void> => {
        dispatch({ type: 'loading' });
        try {
            const resp = await fetch(encodeURI(url), {
                ...options,
                signal: abortController.signal,
            });
            if (!resp.ok) {
                throw new Error(resp.statusText);
            }
            dispatch({ type: 'init' });
            if (onSuccess) {
                await onSuccess(resp);
            }
        } catch (e) {
            if (!e.ABORT_ERR) {
                dispatch({ type: 'error', payload: e });
            }
        }
    };

    const cancel = () => {
        dispatch({ type: 'cancel' });
        abortController.abort();
        setAbortController(new AbortController());
    };

    return { cancel, doFetch, ...state };
}

const initialState: ApiState = { isLoading: false, isCanceled: false };

interface ApiActions {
    type: 'init' | 'loading' | 'cancel' | 'error';
    payload?: Error;
}

function reducer(state: ApiState, action: ApiActions): ApiState {
    switch (action.type) {
        case 'init':
            return initialState;
        case 'loading':
            return { isLoading: true, isCanceled: false };
        case 'cancel':
            return { isLoading: false, isCanceled: true };
        case 'error':
            return { ...initialState, error: action.payload };
        default:
            return state;
    }
}

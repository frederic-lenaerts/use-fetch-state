import 'react-app-polyfill/ie11';
import 'abort-controller/polyfill';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { useFetch } from '../.';

interface Placeholder {
  userId: string;
  id: number;
  title: string;
  completed: boolean;
}

const App = () => {
  const [data, setData] = React.useState<Placeholder>();
  const { doFetch, isLoading, isCanceled, error, cancel } = useFetch();

  React.useEffect(() => {
    return cancel;
  }, []);

  const fetchPlaceholder = () => {
    doFetch(
      'https://jsonplaceholder.typicode.com/todos/1',
      { mode: 'cors', cache: 'no-cache', headers: { Accept: 'application/json', Pragma: 'no-cache' } },
      onSuccess(setData)
    );
  };

  return (
    <div>
      {isLoading && <div>loading...</div>}
      {isCanceled && <div>canceled</div>}
      {error && <div>{error.message} :(</div>}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
      <button onClick={fetchPlaceholder}>fetch</button>
      <button onClick={cancel}>cancel</button>
    </div>
  );
};

function onSuccess<T>(handler: React.Dispatch<React.SetStateAction<T>>) {
  return (res: Response) => {
    (res.json() as Promise<T>).then(handler);
  };
}

ReactDOM.render(<App />, document.getElementById('root'));

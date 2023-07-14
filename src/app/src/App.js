import 'antd/dist/reset.css';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import './App.css';
import Login from './Login/Login';
import List from './List/List';
import req from './utils/req';
import Config from './config';
const listLoader = async () => {
  const res = await req({
    url: `${Config.baseUrl}/api/group/list`,
    method: 'get',
  });
  const list = res || [];
  const data = [];
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    const obj = {
      type: 'group',
      title: item.group_name,
      key: i,
      children: null,
      data: item,
    }
    data.push(obj);
  }
  return data
}
const router = createBrowserRouter([
  {
    path: "/",
    element: <List />,
    loader: listLoader
  },
  {
    path: "/index.html",
    element: <List />,
    loader: listLoader
  },
  {
    path: "login",
    element: <Login />,
  },
]);
function App() {
  const isLogin = true // Mock
  const content = isLogin ? <List /> : <Login />
  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;

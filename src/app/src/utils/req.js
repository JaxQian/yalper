import axios from 'axios';
import Hedwig from './Hedwig';
import { message } from 'antd';
import { redirect } from 'react-router-dom';
const isInVscodeExtension = !!window.acquireVsCodeApi
export default async function (config) {
  console.log('++++config', config);
  let func = axios
  let params = config
  let msg = message.error
  if (isInVscodeExtension) {
    func = Hedwig.fetch
    params = {
      command: 'fetch',
      data: config,
    }
  }
  const res = await func(params)
  console.log('++++req', res)
  if (res.data.errcode !== 40011) {
    redirect('/login')
  }
  if (!res?.data?.data || res?.data?.errcode !== 0) {
    msg(res?.data?.errmsg || '请求失败');
    return;
  }
  return res.data.data
}
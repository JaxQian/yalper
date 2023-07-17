import axios from 'axios';
import Hedwig from './Hedwig';
import { message } from 'ant-design-vue';
import Router from '@/router';

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
  if (!res?.data?.data || res?.data?.errcode !== 0) {
    msg(res?.data?.errmsg || '请求失败');
    if (res.data.errcode === 40011) {
      Router.replace('/login')
    }
    return;
  }
  return res.data.data
}
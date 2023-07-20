import vscodeApi from './vscodeApi';
interface HW {
  fetch: Function;
  openEditor: Function;
}
const fetch = function ({command, data}: { command: string, data: any }) {
  const msgId = Date.now()
  vscodeApi.postMessage({
    command,
    data,
    msgId,
  })
  return new Promise((resolve) => {
    const resFunc = (e: MessageEvent) => {
      if (e.data.command === 'fetchRes' && e.data.msgId === msgId) {
        window.removeEventListener('message', resFunc)
        resolve(e.data.data)
      }
    }
    window.addEventListener('message', resFunc)
  });
}
const openEditor = function (data: any) {
  vscodeApi.postMessage({
    command: 'openEditor',
    data,
  })
}
let Hedwig: HW = {
  fetch,
  openEditor,
}
export default Hedwig
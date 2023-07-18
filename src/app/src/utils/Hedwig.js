import vscodeApi from './vscodeApi';
let Hedwig = null
const fetch = function ({command, data}) {
  const msgId = Date.now()
  vscodeApi.postMessage({
    command,
    data,
    msgId,
  })
  return new Promise((resolve, reject) => {
    const resFunc = e => {
      if (e.data.command === 'fetchRes' && e.data.msgId === msgId) {
        window.removeEventListener('message', resFunc)
        resolve(e.data.data)
      }
    }
    window.addEventListener('message', resFunc)
  });
}
const openEditor = function (data) {
  vscodeApi.postMessage({
    command: 'openEditor',
    data,
  })
}
Hedwig = {
  fetch,
  openEditor,
}
export default Hedwig
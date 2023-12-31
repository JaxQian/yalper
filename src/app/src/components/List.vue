<template>
  <div class="btn-box">
    <a-button
      size="small"
      ghost
      type="primary"
      @click="refresh">刷新</a-button>
    <a-button
      class="logout-btn"
      size="small"
      @click="logout">登出</a-button>
  </div>
  <!-- <a-input
    v-model:value="searchKeywords"
    placeholder="请输入目录或接口名称"
    style="width: 200px"
  /> -->
  <a-space align="start">
    <a-tree
      v-if="treeData.length"
      class="nav-box"
      :load-data="loadNodes"
      :tree-data="treeData"
      @select="onSelect"
      >
    </a-tree>
    <div v-if="!isInVscodeExtension" class="code-box">{{ code }}</div>
  </a-space>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import {
  Tree as ATree,
  Space as ASpace,
  Button as AButton,
  // Input as AInput
} from 'ant-design-vue';
import Config from '@/config';
import req from '@/utils/req';
import vscodeApi from '@/utils/vscodeApi';
import Hedwig from '@/utils/Hedwig';
import ReqConfig from '@/utils/reqInterface';
import Router from '@/router';
import { wait, objToStr } from '@/utils/index';
import { EventDataNode } from 'ant-design-vue/es/tree';
const treeData:any = ref([]);
const code = ref('');
// const searchKeywords = ref('');
const isInVscodeExtension = !!vscodeApi;
const getGroupList = async () => {
  const res = await req({
    url: `${Config.baseUrl}/api/group/list`,
    method: 'get',
  } as ReqConfig);
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
  treeData.value = data;
};
interface NodeConfig {
  type: string,
  title: string,
  key: string,
  children: NodeConfig[],
  data: any
}
const loadNodes = async (config: NodeConfig | EventDataNode) => {
  if (config.children) {
    return;
  }
  const fetchMap:any = {
    group: getProjectList,
    project: getProjectCategory,
    projCat: getInterfaces,
  }
  const subTree = await fetchMap[config.type](config)

  treeData.value = updateTree(treeData.value, config.key, subTree);
}
//  const onSearch = async (value: string) => {
//   // searchKeywords.value = value;
//  }
// const filterTreeNode = async (node: EventDataNode): boolean => {
//   console.log('******', node);
  
//   return false
// }
const updateTree = (origin: NodeConfig[], key: string | number, subTree: NodeConfig[]) => {
  if (!origin) {
    return
  }
  return origin.map(item => {
    if (item.key === key) {
      item.children = subTree;
    } else {
      updateTree(item.children, key, subTree)
    }
    return item
  })
}
const getProjectList = async (config: NodeConfig) => {
  const res = await req({
    url: `${Config.baseUrl}/api/project/list`,
    method: 'get',
    params: {
      group_id: config.data._id,
      page: 1,
      limit: 999,
    }
  });
  const list = res?.list || [];
  const subTree = []
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    const obj = {
      type: 'project',
      title: item.name,
      key: `${config.key}-${i}`,
      children: null,
      data: item,
    }
    subTree.push(obj);
  }
  return subTree;
}
const getProjectCategory = async (config: NodeConfig) => {
  const res = await req({
    url: `${Config.baseUrl}/api/project/get`,
    method: 'get',
    params: {
      id: config.data._id,
    }
  });
  const list = res?.cat || [];
  const subTree = []
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    const obj = {
      type: 'projCat',
      title: item.name,
      key: `${config.key}-${i}`,
      children: null,
      data: item,
    }
    subTree.push(obj);
  }
  return subTree;
}
const getInterfaces = async (config: NodeConfig) => {
  const res = await req({
    url: `${Config.baseUrl}/api/interface/list_cat`,
    method: 'get',
    params: {
      page: 1,
      limit: 999,
      catid: config.data._id
    }
  });
  const list = res?.list || [];
  const subTree = []
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    const obj = {
      type: 'interface',
      title: item.path,
      key: `${config.key}-${i}`,
      children: null,
      data: item,
      isLeaf: true,
    }
    subTree.push(obj);
  }
  return subTree;
}
interface NodeDetail {
  event: string;
  selected: boolean;
  node: NodeConfig;
  selectedNodes: NodeConfig[];
  nativeEvent: MouseEvent;
}
const loadDetail = async (config: NodeDetail) => {
  const res = await req({
    url: `${Config.baseUrl}/api/interface/get`,
    method: 'get',
    params: {
      id: config.node.data._id
    }
  } as ReqConfig);
  const detail = res;
  const comments = [detail.title];
  let docUrl = `https://kapi.sre.gotokeep.com/project/${detail.project_id}/interface/api/${detail._id}`;
  comments.push(`@doc ${docUrl}`);

  const paramsArr = detail.req_params || []
  for (let i = 0; i < paramsArr.length; i++) {
    const p = paramsArr[i];
    comments.push(`@路径参数 {String} ${p.name} ${p.desc} 必须`)
  }
  const queryArr = detail.req_query || []
  for (let i = 0; i < queryArr.length; i++) {
    const q = queryArr[i];
    comments.push(`@query {String} ${q.name} ${q.desc} ${q.required ? '必须' : '可选'}`)
  }
  let commentsStr = `/**\n* ${comments.join('\n* ')} \n*/`;
  interface ReqConfig {
    url: string;
    method: string;
    headers?: any;
    params?: any;
    data?: any;
  }
  let reqConfig: ReqConfig = {
    url: detail.query_path.path,
    method: detail.method,
  }
  if (/\/{/.test(reqConfig.url)) {
    reqConfig.url = reqConfig.url.replace(/\/{/g, '/${')
  }
  if (detail.req_headers?.length) {
    let headers: any = {};
    for (let i = 0; i < detail.req_headers.length; i++) {
      const h = detail.req_headers[i];
      headers[h.name] = h.value
    }
    reqConfig.headers = headers;
  }
  if (detail.req_query?.length) {
    let params:any = {};
    for (let i = 0; i < detail.req_query.length; i++) {
      const h = detail.req_query[i];
      params[h.name] = h.example || ''
    }
    reqConfig.params = params;
  }
  if (detail.req_body_form?.length) {
    let data:any = {};
    for (let i = 0; i < detail.req_body_form.length; i++) {
      const h = detail.req_body_form[i];
      data[h.name] = h.example || ''
    }
    reqConfig.data = data;
  }
  // let codeStr = `export function nameMePlease () {\n    return request(${JSON.stringify(reqConfig, null, 4)})\n}`
  const reqConfigStr = objToStr(reqConfig);
  let codeStr = `export function nameMePlease () {\n  return request(${reqConfigStr})\n}`
  code.value = `${commentsStr}\n${codeStr}`;
  if (isInVscodeExtension) {
    Hedwig.openEditor(code.value);
  }
}
const onSelect = (_selectedKeys: any, info: any) => {
  if (info?.node?.type !== 'interface') return;
  loadDetail(info);
}
const refresh = async () => {
  treeData.value = [];
  code.value = '';
  getGroupList();
}
const logout = async () => {
  await req({
    url: '/api/user/logout',
    method: 'get',
  } as ReqConfig)
  await wait(1000);
  Router.replace('/login');
}
onMounted(() => {
  getGroupList();
})
</script>

<style scoped>
.nav-box {
  width: 200px;
  height: 100vh;
  overflow: scroll;
  white-space: nowrap;
}
.code-box {
  width: calc(100% - 200px);
  white-space: pre;
  text-align: left;
}
.btn-box {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}
.logout-btn {
  margin-left: 12px;
}
</style>
import { Tree, message } from 'antd';
import { useState, useEffect } from 'react';
import { useLoaderData } from 'react-router-dom';
import './List.css';
import req from '../utils/req';
import Config from '../config';
const isProduction = process.env.NODE_ENV === 'production'

const List = () => {
  const [ treeData, setTreeData ] = useState([])
  const [ code, setCode ] = useState('')
  const getGroupList = async () => {
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
    setTreeData(data)
  }
  const updateTree = (origin, key, subTree) => {
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
  const getProjectList = async (config) => {
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
  const getProjectCategory = async (config) => {
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
  const getInterfaces = async (config) => {
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
  const loadDetail = async config => {
    const res = await req({
      url: `${Config.baseUrl}/api/interface/get`,
      method: 'get',
      params: {
        id: config.node.data._id
      }
    });
    const detail = res;
    const comments = [detail.title];
    let docUrl = `https://kapi.sre.gotokeep.com/project/${detail.project_id}/interface/api/${detail._id}`;
    comments.push(`@doc ${docUrl}`);
    const params = [];
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
    let reqConfig = {
      url: detail.query_path.path,
      method: detail.method,
    }
    if (detail.req_headers?.length) {
      let headers = {};
      for (let i = 0; i < detail.req_headers.length; i++) {
        const h = detail.req_headers[i];
        headers[h.name] = h.value
      }
      reqConfig.headers = headers;
    }
    if (detail.req_query?.length) {
      let params = {};
      for (let i = 0; i < detail.req_query.length; i++) {
        const h = detail.req_query[i];
        params[h.name] = h.example || ''
      }
      reqConfig.params = params;
    }
    if (detail.req_body_form?.length) {
      let data = {};
      for (let i = 0; i < detail.req_body_form.length; i++) {
        const h = detail.req_body_form[i];
        data[h.name] = h.example || ''
      }
      reqConfig.data = data;
    }
    let codeStr = `export function functionName () {\n    return request(${JSON.stringify(reqConfig, '  ', 4)})\n}`
    setCode(`${commentsStr}\n${codeStr}`);
  }
  const loadNodes = async config => {
    if (config.children) {
      return;
    }
    const fetchMap = {
      group: getProjectList,
      project: getProjectCategory,
      projCat: getInterfaces,
    }
    const subTree = await fetchMap[config.type](config)
    setTreeData(origin => {
      const newData = updateTree(origin, config.key, subTree);
      return newData;
    })
  }
  const checkData = () => {
    console.log('CCC', treeData);
  }
  const onSelect = (selectedKeys, info) => {
    if (info?.node?.type !== 'interface') return;
    loadDetail(info);
  }
  const listData = useLoaderData()
  useEffect(() => {
    setTreeData(listData);
  }, [])

  return (
    <div className='wrapper'>
      <div className='nav-box'>
        <button onClick={checkData}>CHECK</button>
        <Tree
          showLine
          loadData={loadNodes}
          treeData={treeData}
          onSelect={onSelect}
        />
      </div>
      { isProduction ? '' : <div className='code-box'>{code}</div>}
    </div>
  );
}

export default List;

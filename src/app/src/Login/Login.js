import { Button, Input, Form } from 'antd';
import { useState } from 'react';
import req from '../utils/req';
function Login() {
  const [ email, setEmail ] = useState('')
  const [ password, setPassword ] = useState('')
  const loginFunc = async e => {
    console.log(email, password)
    const res = await req({
      url: '/api/user/login_by_ldap',
      method: 'post',
      data: {
        email,
        password,
      }
    })
    console.log('++++login', res);

    // Todo：存储 Token
    // Todo：跳转列表
  }
  const inputEmail = e => {
    setEmail(e.target.value)
  }
  const inputPassword = e => {
    setPassword(e.target.value)
  }
  return (
    <Form>
      <Form.Item
        label="邮箱："
        rules={[{
          required: true,
          message: '请输入 Keep 邮箱'
        }]}
      >
        <Input onInput={inputEmail}></Input>
      </Form.Item>
      <Form.Item
        label="密码："
        rules={[{
          required: true,
          message: '请输入 LDAP 密码'
        }]}
      >
        <Input.Password onInput={inputPassword}></Input.Password>
      </Form.Item>
      <Button onClick={loginFunc}>登录</Button>
    </Form>
  );
}

export default Login;

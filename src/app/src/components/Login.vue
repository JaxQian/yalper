<template>
  <a-form
    :model="formData">
    <a-form-item
      label="邮箱："
      name="email">
      <a-input v-model:value="formData.email"></a-input>
    </a-form-item>
    <a-form-item
      label="密码："
      name="password">
      <a-input v-model:value="formData.password"></a-input>
    </a-form-item>
    <a-button
      type="primary"
      :disabled="!formData.email || !formData.password"
      @click="login">登录</a-button>
  </a-form>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import {
  Form as AForm,
  FormItem as AFormItem,
  Input as AInput,
  Button as AButton
} from 'ant-design-vue';
import req from '@/utils/req';
import Router from '@/router';
import { wait } from '@/utils/index';

const formData = ref({
  email: '',
  password: '',
})

const login = async () => {
  const res = await req({
    url: '/api/user/login_by_ldap',
    method: 'post',
    data: {
      ...formData.value
    },
  })
  console.log('++++login', res);
  await wait(1000);
  Router.replace('/');
}
</script>

<style>

</style>
import * as VueRouter from 'vue-router'
import Login from '@/components/Login.vue';
import List from '@/components/List.vue';

const router = VueRouter.createRouter({
  history: VueRouter.createWebHistory(),
  routes: [
    {
      name: 'List',
      path: '/',
      component: List,
    },
    {
      name: 'Login',
      path: '/login',
      component: Login,
    },
  ]
})
export default router
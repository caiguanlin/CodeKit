import { createRouter, createWebHashHistory } from 'vue-router'
import { TOOLS } from '@/registry'

const routes = [
  {
    path: '/',
    redirect: '/tools/json'
  },
  ...TOOLS.map((tool) => ({
    path: tool.route,
    name: tool.id,
    component: tool.component
  })),
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/Settings.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/tools/json'
  }
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes
})

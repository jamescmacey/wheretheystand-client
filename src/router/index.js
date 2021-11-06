import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  },
  {
    path: '/hansard',
    name: 'Hansard',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import('../views/Hansard.vue')
  },
  {
    path: '/people/',
    name: 'People',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import('../views/People.vue')
  },
  {
    path: '/people/:id',
    name: 'Person',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import('../views/Person.vue'),
    children: [
      {
        path: '',
        component: () => import('../views/Person/PersonHome.vue')
      },
      {
        path: 'overview',
        component: () => import('../views/Person/PersonHome.vue')
      },
      {
        path: 'details',
        component: () => import('../views/Person/PersonDetails.vue')
      },
      {
        path: 'expenses',
        component: () => import('../views/Person/PersonExpenses.vue')
      },
      {
        path: 'interests',
        component: () => import('../views/Person/PersonInterests.vue')
      }
    ]
  },
  {
    path: '/bills/:id',
    name: 'Bill',
    component: () => import('../views/Bill.vue')
  },
  {
    path: '/electorates/:id',
    name: 'Electorate',
    component: () => import('../views/Electorate.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router

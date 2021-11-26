import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import Home from '../views/Home.vue'
import Test from '../views/Test'
import Camera from '../views/camera'
import OrthCamera from '../views/orthCamera'
import Problem from '../views/problem'
import CubeAndCompass from '../views/CubeAndCompass'
import Matrix from '../views/matrix'
import Matrix2 from '../views/matrix2'
import Svg from '../views/Svg'

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
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
    path: '/test',
    name: 'test',
    component: Test
  },
  {
    path: '/camera',
    name: 'camera',
    component: Camera
  },
  {
    path: '/problem',
    name: 'problem',
    component: Problem
  },
  {
    path: '/svg',
    name: 'svg',
    component: Svg
  },
  {
    path: '/cubeAndCompass',
    name: 'cubeAndCompass',
    component: CubeAndCompass
  },
  {
    path: '/matrix',
    name: 'matrix',
    component: Matrix
  },
  {
    path: '/matrix2',
    name: 'matrix2',
    component: Matrix2
  },
  {
    path: '/orthCamera',
    name: 'orthCamera',
    component: OrthCamera
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router

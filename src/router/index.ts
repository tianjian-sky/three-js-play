import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import Home from '../views/Home.vue'
import Test from '../views/Test'
import Camera from '../views/camera'
import CameraRotate from '../views/cameraRotate'
import OrthCamera from '../views/orthCamera'
import Problem from '../views/problem'
import CubeAndCompass from '../views/CubeAndCompass'
import Matrix from '../views/matrix'
import Matrix2 from '../views/matrix2'
import Svg from '../views/Svg'
import Quarternion from '../views/quaternion'
import RenderTarget from '../views/RenderTarget'
import SphericalDemo from '../views/spherical'

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
    path: '/cameraRotate',
    name: 'cameraRotate',
    component: CameraRotate
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
    path: '/renderTarget',
    name: 'renderTarget',
    component: RenderTarget
  },
  {
    path: '/orthCamera',
    name: 'orthCamera',
    component: OrthCamera
  },
  {
      path: '/quarternion',
      name: 'quarternion',
      component: Quarternion
  },
  {
    path: '/sphericalDemo',
    name: 'SphericalDemo',
    component: SphericalDemo
  }
]

const router = new VueRouter({
  mode: 'history',
  routes
})

export default router

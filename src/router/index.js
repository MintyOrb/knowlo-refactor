import Vue from 'vue'
import Router from 'vue-router'
import explore from '@/views/explore'
import getInvolved from '@/views/getInvolved'
import landing from '@/views/landing'
import legal from '@/views/legal'
import member from '@/views/member'
import principals from '@/views/principals'
import resource from '@/views/resource'
import status from '@/views/status'
import token from '@/views/token'
import newResource from '@/components/newResource'

Vue.use(Router)

export default new Router({
  routes: [
    // { path: '/m/:uid', component: member, name: 'member' },
    // { path: '/r/:uid', component: resource, name: 'resource' },
    { path: '/', component: explore,  name: "explore",
        children: [
          { path: '/m/:uid', component: member, name: 'member' },
          { path: '/r/:uid', component: resource, name: 'resource' },
          { path: '/t/:name/:uid?', component: token, name: 'token' },
          { path: '/addResource', component: addResource, name: 'addResource' }
        ]
    },
    {  path: "/status", component: status },
    {  path: "/about", component: landing },
    {  path: "/principals", component: principals },
    {  path: "/involved", component: involved },
    {  path: "/legal", component: legal },
    { path: '*', redirect: '/' }
  ]
})

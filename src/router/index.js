import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
// need to import other comps

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'HelloWorld',
      component: HelloWorld
    },
    {  name: "explore", path: '/', component: explore,
        children: [
          { path: '/m/:uid', component: memberPage, name: 'memberPage' },
          { path: '/r/:uid', component: resourceComp, name: 'resourceSub' },
          { path: '/t/:name/:uid?', component: termComp, name: 'setSub' },
          { path: '/addResource', component: addResource, name: 'addResource' },
          { path: '/addTerm/:translation/:termID?', component: addTerm, name: 'addTerm' },
        ]
    },
    {  path: "/trending", component: trending },
    {  path: "/status", component: status },
    {  path: "/about", component: landing },
    {  path: "/principals", component: principals },
    {  path: "/involved", component: involved },
    {  path: "/legal", component: legal },
    { path: '*', redirect: '/' }
  ]
})

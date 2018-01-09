<template>
<div id="app">

  <!-- TODO: make component - top nav -->
  <div id="nav-slide" class="navbar-fixed">
    <nav class='blue'>
      <div class="nav-wrapper">
        <router-link to="/" class="brand-logo center thin">knowlo</router-link>
        <ul class="left ">
          <li><a data-activates="slide-out" class="navbar-collapse show-on-large"><i class="material-icons">menu</i></a></li>
        </ul>
        <ul class="right ">
          <li v-if="!member.uid" style="margin-right:13px">
            <a @click="loginModal" class="hide-on-med-and-down">Login | Sign Up</a>
            <a @click="loginModal" class="hide-on-med-and-up"><i class="material-icons fa fa-lg fa-sign-in"></i></a>
          </li>
          <li v-else v-cloak style="margin-right:13px">
            <!-- member icon here? -->
            <router-link :to="'/m/'+member.uid">{{member.first}}</router-link>
          </li>
          <!-- <li><a data-activates="query-slide" class="termQuery-collapse show-on-large "><i class="material-icons">menu</i></a></li> -->
        </ul>
      </div>
    </nav>
  </div>


  <sidebar :member="member"></sidebar>


  <!-- TODO: make component  firebase login-->
  <div id="login-modal" class="modal">
    <div class="modal-content">
      <h4 class='login-head'>Login | Sign Up</h4>
      <div id="firebaseui-auth-container"></div>
    </div>
    <div class="modal-footer">
      <a class="modal-action modal-close waves-effect waves-blue btn-flat">Close</a>
    </div>
  </div>

  <!-- main view -->
  <transition name="fade" mode="out-in" appear>
    <router-view :term-query="termQuery" :member="member" style="padding-top:90px" />
  </transition>

  <!-- TODO: make component: footer -->
  <footer class="page-footer blue">
    <div class="container">
      <div class="row">
      </div>
    </div>
    <div class="footer-copyright">
      <div class="container center">knowlo</div>
      <a style="margin-left:20px; margin-top:5px; position:absolute;" href="https://github.com/bornytm/knowlo"><img style="width:25px" src="/github.png"></a>
    </div>
  </footer>

</div>
</template>

<script>
import Vue from 'vue'
import Materialize from 'materialize-css'
import $ from 'jquery'
import Headroom from 'headroom.js'
import Cookies from 'js-cookie'
import firebase from 'firebaseui'

export default {
  name: 'app',
  data () {
    return {
      member: {
        uid: null
      }, // id and info for member if logged in, uid null if not
      termQuery: [] // array of term objects to be queried
    }
  },
  methods: {
    close () {
      $('.termQuery-collapse').sideNav('hide')
    },
    loginModal () {
      $('#login-modal').modal('open')
    },
    touchMember () {
      // ensure member is in DB (add if first time signing in)
      this.$http.post('/api/member', {
        term: this.term,
        translation: this.translation
      }).then(response => {
        if (!response.body) {
          Materialize.toast('Something went wrong...', 4000)
        }
      }, response => {
        Materialize.toast('Something went wrong...are you online?', 4000)
      })
    }
  },
  mounted () {
    // needed to recover from occasional mystery DOM exception on resource/term suggestion change
    // Vue.config.errorHandler =  (err) => { //TODO figure out what is causing this...vueisotope?
    //   Materialize.toast('whoops...hit a snag. Reload the page if things seem off...',3000)
    //   console.log(err)
    //   // window.setTimeout( ()=> {
    //   //   this.$router.go(this.$route)
    //   // }, 2000)
    // };
    // get term query
    if (Cookies.get('termQuery')) {
      this.termQuery = Cookies.getJSON('termQuery')
    }

    // TODO: use this...
    // var lang = window.navigator.userLanguage || window.navigator.language
    // lang = lang.substr(0, 2) // get two letter language code

    $('#login-modal').modal() // init login modal

    // init headroom (hide/show navbar on scroll down/up)
    var elem = document.querySelector('#nav-slide')
    new Headroom(elem, {
      'offset': 50,
      'tolerance': {
        down: 0,
        up: 10
      }
    }).init()

    firebase.auth().onAuthStateChanged((member) => {
      if (member) {
        this.member = member
        this.member.first = member.displayName.substr(0, member.displayName.indexOf(' ')) // get first name -  if there is no space at all, then the first line will return an empty string and the second line will return the entire string
        member.getIdToken().then((accessToken) => {
          Vue.http.headers.common['Authorization'] = 'Bearer ' + accessToken
          this.touchMember()
          // bus.$emit('login', member)
        })
      } else {
        this.member = {
          uid: null
        }
        Vue.http.headers.common['Authorization'] = ''
      }
    }, (error) => {
      console.log(error)
      Materialize.toast('Something went wrong...are you online?', 4000)
    })
  }
}
</script>

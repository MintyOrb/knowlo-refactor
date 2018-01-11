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


  <sidemenu :member="member"></sidemenu>


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
import $ from 'jquery'
import Materialize from 'materialize-css'
import Headroom from 'headroom.js'
import Cookies from 'js-cookie'
import firebase from 'firebase'
import firebaseui from 'firebaseui'
import sidemenu from '@/components/sideMenu'

// init firebase app
firebase.initializeApp({
  apiKey: 'AIzaSyBEB96pSPjTN0F3CKaQUNoaSJiQHLc5pEM',
  authDomain: 'knowlo-952cc.firebaseapp.com',
  databaseURL: 'https://knowlo-952cc.firebaseio.com',
  storageBucket: 'knowlo-952cc.appspot.com',
  messagingSenderId: '361390483938',
  projectId: 'knowlo-952cc'
})

var uiConfig = {
  callbacks: {
    signInSuccess: function (currentUser, credential, redirectUrl) {
      // close login modal if open...
      $('#login-modal').modal('close')
      return true
    }
  },
  signInSuccessUrl: '/#/',
  signInOptions: [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    firebase.auth.FacebookAuthProvider.PROVIDER_ID,
    firebase.auth.GithubAuthProvider.PROVIDER_ID,
    firebase.auth.EmailAuthProvider.PROVIDER_ID
  ],
  tosUrl: 'knowlo.io/#/legal',   // Terms of service url.
  signInFlow: 'popup'
}

// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth())
// The start method will wait until the DOM is loaded.
ui.start('#firebaseui-auth-container', uiConfig)

export default {
  name: 'app',
  components: { sidemenu },
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
        member.getIdToken().then((accesstag) => {
          Vue.http.headers.common['Authorization'] = 'Bearer ' + accesstag
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
<style src="materialize-css/dist/css/materialize.css"></style>
<style src="flickity/dist/flickity.min.css"></style>
<style src="leaflet/dist/leaflet.css"></style>
<style src="materialize-css/extras/noUiSlider/nouislider.css"></style>
<style>
<style>
.modal .modal-content {
  padding: 0px;
}
.margin20 {
	margin:20px;
}
/* .modal {
  top: 0!important;
  max-height: 100%!important;
  width: 100%!important;
  height: 100%!important;
} */
.modal-overlay {
  height: 100vh;
  position: sticky;
}
.fullPage{
  z-index: 1001;
  top: 0!important;
  width: 100vw;
  height: 100%;
  max-height: none;
  display: block;
  overflow: scroll;
}
.exit {
  border-bottom-left-radius: 6px;
  position: absolute;
  top: 0;
  right: 0;
  z-index: 10;
  padding-right: 8px;
  padding-top: 2px;
  color: black;
  background-color: white;
  padding-left: 7px;
  padding-bottom: 4px;
}
.exit:hover{
  cursor: pointer;
}
.memberTitle div {
  font-weight: 200;
  color:black;
  font-size: 30px;
  padding-top:20px;
}
.metaNav {
  position: sticky;
  top: 0;
  z-index: 1000;
  background-color: white;
  box-shadow: 0 5px 5px 0 rgba(0,0,0,0.2), 0 7px 11px 0 rgba(0,0,0,0.19);
}
.message {
  font-size: 30px;
  font-weight: 300;
  text-align: center;
  margin: 100px;
  background-color: #ececec;
  border-radius: 10px;
  padding: 45px;
}
/* in member and nav */
.resourceSections{
  height: 100%;
}
.resourceStep {
  width: 25vw;
	height: 100%;
  overflow: scroll;
  padding-top: 10px;
}
.viewBtn {
  transition: color .3s;
}
.viewBtn:hover {
  cursor: pointer;
  color: gray;
}
.disabled {
  background-color: #eee!important;
  color: gray!important;
}
.disabled:hover {
  cursor: not-allowed!important;
  background-color: #eee!important;
}
/* dots are lines */
.flickity-page-dots .dot {
  height: 4px;
  width: 40px;
  margin: 0px;
  border-radius: 0;
}

.flickContainer{
	position: relative;
	border-right: 1px solid darkgray;
	border-left: 1px solid darkgray;
	width: 100%;
	margin:15px;
}
.flickItem{
	margin-left: 15px;
	margin-right: 15px;
	margin-top: 10px;
}
.flickity-page-dots {
  display: flex;
  align-content: center;
  justify-content: center;
  bottom: 0px;
}
.input-field{
  margin-top: 0;
  /*width: 80vw;*/
  max-width: 100%;
}
input:not([type]), input[type=text]:not(.browser-default), input[type=password]:not(.browser-default), input[type=email]:not(.browser-default), input[type=url]:not(.browser-default), input[type=time]:not(.browser-default), input[type=date]:not(.browser-default), input[type=datetime]:not(.browser-default), input[type=datetime-local]:not(.browser-default), input[type=tel]:not(.browser-default), input[type=number]:not(.browser-default), input[type=search]:not(.browser-default), textarea.materialize-textarea {
  margin-bottom:0;
}
_:-moz-tree-row(hover), .card {
    width: calc(20% - 15px);
}
 @media only screen
and (min-width : 768px)
and (max-width : 1024px) { _:-moz-tree-row(hover),
  .card{
    width: calc(25% - 15px);
  }
}
.login-head {
    text-align: center;
    margin: 20px!important;
    font-weight: 300;
}
.fade {
  color:#a8a8a8;
}
.noUi-target.noUi-horizontal .noUi-tooltip {
  background-color: #2196F3;
}
.noUi-connect{
  background-color: #2196F3;
}
.hidden{
  visibility: hidden;
}
/*hide scroll bars*/
::-webkit-scrollbar {
    display: none;
}
html {
  -ms-overflow-style: none;
}
.bold {
	font-weight: 700;
}
.dropdown-content li>a {
	color: #2196F3
}
.dropdown-content li>span {
  color: #2196F3;
}
.dropdown-content {
  z-index: 2000;
}
/* .modal {
  display: flex!important;
} */
[v-cloak] { display: none }
.headroom {
    will-change: transform;
    transition: transform 200ms linear;
}
.headroom--pinned {
    transform: translateY(0%);
    box-shadow: 0 5px 5px 0 rgba(0,0,0,0.2), 0 7px 11px 0 rgba(0,0,0,0.19);
}
.headroom--unpinned {
    transform: translateY(-100%);
}

#nav-slide{
  position: fixed;
  width: 100vw;
}
#nav-slide ul {
  margin-left: 13px;
}
#navName {
  color:#2196F3;
  font-size: 38px;
  font-weight: 200;
  text-align: center;
  margin:20px;
}
@media only screen
and (max-width : 375px) {
  .card{
    width: calc(100% - 10px);
  }
}
/* Smartphones (landscape) ----------- */
@media only screen
and (min-width : 376px)
and (max-width : 767px) {
  .card{
    width: calc(50% - 10px);
  }
}
/* Smartphones (portrait and landscape) ----------- */
@media only screen
and (min-device-width : 320px)
and (max-device-width : 480px) { /* portrait tablets, portrait iPad, landscape e-readers, landscape 800x480 or 854x480 phones */

    .definition{
      width:100vw!important;
    }
    .discussion{
      width:100vw!important;
    }
    .stepContainer{  width: 100vw;}
    .addContainer{
      padding-top: 200px;
      padding-bottom: 100px;
      padding-left: 50px;
      padding-right: 50px;
    }
    .resourceStep{ width:100vw!important;}
}
/* iPads (portrait and landscape) ----------- */
@media only screen
and (min-width : 768px)
and (max-width : 1024px) {
  /* .card{
    width: calc(25% - 10px);
  } */
  .rchart {
    margin: auto;
    width: 90%;
  }
}
</style>

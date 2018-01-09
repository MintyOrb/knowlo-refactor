<template>
  <div class='containerr'
  		:class="{
  			'tokenlist list hoverable': display==='list'
  		}"
  	>

  		<div v-if="display==='thumb' ">
  			<span @mouseleave="leave()">
  				<div class="termWidth">
  					<div class="menu" @mouseenter="delayHover()"  v-bind:class="{'active': hovering}">
  						<div class="">

  							<div @click="main" class="mbtn trigger" v-bind:class="{'scaleIcon': hovering}">
  								<span v-if="!term.term.iconURL" class="flexCenter border">{{term.translation.name[0]}}</span>
  								<div v-else class="thumb card-image border">
  									<img :src="term.term.iconURL">
  								</div>
  							</div>

  							<!-- need a better way to determine when in sidebar... -->
  							<div id="hoverPad" v-if="inSidebar">
  							</div>

  							<div class="icons">
  								<div class="rotater">
  									<div @click="pin" class="mbtn mbtn-icon flexCenter" :class="{showPin: status.pinnedIcon, pinNav: hovering&& inSidebar, hide: hide.indexOf('pin')>-1 }">
  										<i class="fa fa-thumb-tack" style="transform:rotate(-45deg)"></i>
  									</div>
  								</div>
  								<!-- <div  v-if="true" class="rotater">
  									<div class="mbtn mbtn-icon flexCenter" :class="{'nope':!term.group, expandNav: hovering&& inSidebar}">
  										<i class="fa fa-expand"></i>
  									</div>
  								</div> -->
  								<div  class="rotater">
  									<div @click="lens" class="mbtn mbtn-icon flexCenter" :class="{'showLens': status.lensIcon, expandNav: hovering&& inSidebar, hide: hide.indexOf('lens')>-1 }">
  										<i class="material-icons" style="margin-top:15px">more_horiz</i>
  									</div>
  								</div>
  								<!-- <div  v-if="false" class="rotater">
  									<div class="mbtn mbtn-icon flexCenter" :class="{showCompress: true, expandNav: hovering&& inSidebar}">
  										<i class="fa fa-compress"></i>
  									</div>
  								</div> -->
  								<div class="rotater">
  									<router-link :to="{ name: 'setSub', params: { uid: term.setID, name: term.translation.name }}">
  										<div class="mbtn mbtn-icon flexCenter":class="{showInfo: status.infoIcon, infoNav: hovering && inSidebar, hide: hide.indexOf('info')>-1 }">
  											<i class="fa fa-info" style="padding-right:10px;"></i>
  										</div>
  									</router-link>
  								</div>
  								<div class="rotater">
  									<div @click="remove" class="mbtn mbtn-icon flexCenter" :class="{'showRemove': status.removeIcon, removeNav: hovering && inSidebar, hide: hide.indexOf('remove')>-1 }">
  										<i class="fa fa-times"></i>
  									</div>
  								</div>
  								<!-- <div class="rotater">
  									<div @click="exclude" class="mbtn mbtn-icon flexCenter" :class="{showMinus: status.excludeIcon, excludeNav: hovering&& inSidebar, hide: hide.indexOf('exclude')>-1 }">
  										<i class="fa fa-minus"></i>
  									</div>
  								</div> -->
  								<div class="rotater">
  									<div @click="include" class="mbtn mbtn-icon flexCenter" :class="{showPlus: status.includeIcon, includeNav: hovering&& inSidebar, hide: hide.indexOf('include')>-1 }">
  										<i class="fa fa-plus"></i>
  									</div>
  								</div>
  								<div class="rotater">
  									<div @click="focus" class="mbtn mbtn-icon flexCenter"  :class="{showFocus: status.focusIcon, focusNav: hovering&& inSidebar, hide: hide.indexOf('focus')>-1 }">
  										<i class="fa fa-crosshairs"></i>
  									</div>
  								</div>

  							</div>
  						</div>
  					</div>
  					<div class="connections badge"v-if="term.connections">
  						{{term.connections}}
  					</div>
  					<div class="nameholder">
  						<div class="name">
  							{{term.translation.name}}
  						</div>
  					</div>
  				</div>

  			</span>
  		</div>

  		<div @click="main" v-if="display==='list' || display==='card'" class='cont'>
  				<span class='tokenlist-title'>
  					<span class='tokenlist-title-left'>
  						<!-- <span class='score'>8</span>
  						<span class='vote'>
  							<i class="fa fa-caret-up"></i>
  							<i class="fa fa-caret-down"></i>
  						</span> -->

  						<span v-if="!term.term.iconURL" class="flexCenter border tokenHW">{{term.translation.name[0]}}</span>
  						<span v-else class=" listimg">
  							<img class='circle tokenHW' :src="term.term.iconURL">
  						</span>
  						<span style='margin-left:10px;'>{{term.translation.name}}</span>
  					</span>
  					<span>
  						<i @click.stop.prevent="" class="material-icons  more" :class="'dd'+term.setID" :data-activates='term.setID' >more_horiz</i>
  						<!-- <i @click.prevent="" class="material-icons  more" :class="'dd'+term.setID" :data-activates='term.setID' >keyboard_arrow_down</i> -->
  					</span>
  					<ul :id='term.setID' class='dropdown-content token-dropdown '>
  						<li @click="focus"><a><i class="fa fa-crosshairs"></i>Focus</a></li>
  						<li @click="include"><a><i class="fa fa-plus"></i>Add</a></li>
  						<li @click="pin"><a><i class="fa fa-thumb-tack"></i>Pin</a></li>
  						<!-- <li @click="lens"><a><i class="fa fa-crosshairs"></i>Cross Section</a></li> -->
  						<li @click="remove"><a><i class="fa fa-times"></i>Remove</a></li>
  						<li @click=""><router-link :to="{ name: 'setSub', params: { uid: term.setID, name: term.translation.name }}"><i class="fa fa-info"></i>Token Page</router-link></li>
  					</ul>


  				</span>

  				<!-- <div class='token-definition'>
  					definition here
  				</div> -->

  		</div>

  		<div class='hoverable' v-if="display==='godMode'">
  			<span>{{term.term.uid}}</span>
  			<!-- <span>{{term.setID}}</span> -->
  			<input type="text" v-model='term.translation.name' v-on:blur="name(term.translation.uid,term.translation.name)" />
  			<!-- <span> ({{term.translation.languageCode}})</span> -->

  			<input type='text' v-model='term.order' v-on:blur="order(term.term.uid,term.order)" />
  			<i  @click="exclude" class="fa fa-minus"></i>
  		</div>

  	</div>
</template>
<script>
import Materialize from 'materialize-css'
import $ from 'jquery'

export default {
  name: 'token',
  props: {
    term: Object,
    display: String,
    hide: {
      type: String,
      default: ''
    },
    persistAction: {
      type: Boolean,
      default: true
    }
  },
  data: () => {
    return {
      inSidebar: false,
      hovering: false,
      status: {
        pinnedIcon: false,
        includeIcon: false,
        excludeIcon: false,
        removeIcon: false,
        focusIcon: false,
        infoIcon: false,
        lensIcon: false
      }
    }
  },
  methods: {
    name (uid, val) {
      this.$http.put('/god/name/' + uid + '/' + val).then(response => {
        if (response.body) {
          Materialize.toast('changed name', 4000)
        } else {
          Materialize.toast('Something went wrong...', 4000)
        }
      }, response => {
        Materialize.toast('Something went wrong...are you online?', 4000)
      })
    },
    order (termID, order) {
      console.log(termID, order)
      this.$http.put('/god/order/' + termID + '/' + order + '/' + this.$route.params.uid).then(response => {
        if (response.body) {
          Materialize.toast('changed order', 4000)
        } else {
          Materialize.toast('Something went wrong...', 4000)
        }
      }, response => {
        Materialize.toast('Something went wrong...are you online?', 4000)
      })
    },
    termAction (action) {

    },
    main () {
      if (this.persistAction) {
        this.status.includeIcon = !this.status.includeIcon
      }
      this.term.status = this.status
      this.$emit('main', this.term)
    },
    remove () {
      if (this.persistAction) {
        this.status.removeIcon = !this.status.removeIcon
      }
      this.term.status = this.status
      this.$emit('remove', this.term)
    },
    include () {
      // if (this.persistAction) {
      this.status.includeIcon = !this.status.includeIcon
      // }
      this.term.status = this.status
      this.$emit('include', this.term)
    },
    exclude () {
      if (this.persistAction) {
        this.status.excludeIcon = !this.status.excludeIcon
      }
      this.term.status = this.status
      this.$emit('exclude', this.term)
    },
    focus () {
      // if (this.persistAction) {
      this.status.focusIcon = !this.status.focusIcon
      // }
      this.term.status = this.status
      this.status.includeIcon = true
      this.$emit('focus', this.term)
    },
    pin () {
      // if (this.persistAction) {
      this.status.pinnedIcon = !this.status.pinnedIcon
      // }
      this.status.includeIcon = true
      this.term.status = this.status
      this.$emit('pin', this.term)
    },
    lens () {
      if (this.persistAction) {
        this.status.lensIcon = !this.status.lensIcon
      }
      this.term.status = this.status
      this.$emit('lens', this.term)
    },
    delayHover () {
      this.left = false
      window.setTimeout(() => {
        if (!this.left) {
          this.hovering = true
        }
      }, 150)
    },
    leave () {
      this.left = true
      this.hovering = false
    }
  },
  mounted () {
    this.$emit('created')
    if (this.term.status) {
      this.status = this.term.status
    }
    if (this.$parent.$el && this.$parent.$el._prevClass === 'termQuery') { // stupid way to change css. cake component param/option instead
      this.inSidebar = true // defaults to false
    }

    // setup info dropdown
    $('.dd' + this.term.setID).dropdown({
      alignment: 'right',
      hover: true
    })
  }
}
</script>

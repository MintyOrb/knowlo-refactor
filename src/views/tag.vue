<template>
<div id='tagModal' class="modal fullPage tag-modal">

  <!-- modal for adding to discussion -->
  <add-resource v-if='addResource === true' :type='addResourceType' v-on:close="addResource=false" v-on:added="newMeta">
  </add-resource>

  <div class="tagTitle">
    <span v-if="tag.tag.iconURL && tag.tag.iconURL.length > 0" class=''>
					<img class='circle'style='height:60pxwidth:60px' :src="tag.tag.iconURL">
			</span>
    <span>
				<span>{{tag.translation.name}}</span>
    </span>

    <!-- setdelete -->
    <!-- <span v-if='true' class='btn' v-on:click="deleteSet(tag.setID)">delete set</span> -->

    <span class="right modal-close"><i class="fa fa-2x fa-times"></i></span>
  </div>
  <!-- flick navigation for isotope containers -->
  <div class="tagMeta">
    <div class="metaNav">
      <div v-for="step in tagSection" class="navItems">
        <p>
          {{step}}
        </p>
      </div>
    </div>
    <!-- isotope contianers -->
    <div class="tagSections">

      <div class="stepContainer">

        <div>
          <a @click="addResourceType='icon'; addResource = true;" class="hoverable btn-floating btn-large waves-effect waves-light red"><i class="material-icons">add</i></a>
        </div>

        <div v-for="icon in icons" :key="icon['resource']['uid']">
          <resource :re="icon" :display="'list'" v-on:vote-cast='evalTopTag'>
          </resource>
        </div>
      </div>

      <div class="stepContainer definition">
        <div>
          <a @click="addResourceType='definition'; addResource = true;" class="hoverable btn-floating btn-large waves-effect waves-light red"><i class="material-icons">add</i></a>
        </div>

        <div v-for="def in definitions" :key="def['resource']['uid']">
          <resource :re="def" :display="'list'">
          </resource>

        </div>

      </div>

      <div class="stepContainer">
        <isotope ref='syno' :list="synonyms" :options='{}'>
          <tag v-for="tag in synonyms" :key="tag.setID" :tag="tag" :display="tagDisplay" v-on:include="addToQuery(tag)" v-on:exclude="removeSynonym(tag.tag.uid)" v-on:focus="addToQuery(tag)" v-on:pin="addToQuery(tag)" hide="remove">
          </tag>
        </isotope>
        <search :exclude="$route.params.uid" input-id="syn" v-on:select="addSynonym"></search>
      </div>
      <div class="stepContainer">
        <isotope ref='withn' :list="within" :options='{}'>
          <tag :tag="tag" v-for="tag in within" :key="tag.translation.name" :display="tagDisplay" v-on:include="addToQuery(tag)" v-on:exclude="removeWithin(tag.tag.uid)" v-on:focus="addToQuery(tag)" v-on:pin="addToQuery(tag)" hide="remove">
          </tag>
          <!-- v-on:exclude="removeSynonym(tag.tag.uid)" -->
        </isotope>
        <search exclude="" input-id="within" v-on:select="addWithin"></search>
      </div>
      <div class="stepContainer">
        <isotope ref='contains' :list="contains" :options='{}'>
          <tag :tag="tag" v-for="tag in contains" :display="tagDisplay" :key="tag.setID" v-on:include="addToQuery(tag)" v-on:exclude="removeContains(tag.tag.uid)" v-on:focus="addToQuery(tag)" v-on:pin="addToQuery(tag)" hide="remove">
          </tag>
          <!-- v-on:exclude="removeSynonym(tag.tag.uid)" -->
        </isotope>
        <search exclude="" input-id="contains" v-on:select="addContains"></search>
      </div>
      <div class="stepContainer">
        <isotope ref='trans' :list="translations" :options='{}'>
          <tag :tag="tag" v-for="tag in translations" :key="tag.setID" :display="tagDisplay" v-on:include="addToQuery(tag)" v-on:exclude="addToQuery(tag)" v-on:focus="addToQuery(tag)" v-on:pin="addToQuery(tag)" hide="remove">
          </tag>
        </isotope>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import $ from 'jquery'
import Materialize from 'materialize-css'
import Router from 'vue-router'
export default {
  name: 'tag',
  props: ['tagQuery', 'member'],
  data: function () {
    return {
      tag: {
        name: 'default',
        translation: {
          name: ''
        },
        tag: {
          iconURL: ''
        }
      },
      tagDisplay: 'list',
      modalOpen: false,
      addResource: false,
      addResourceType: '',
      definitions: [],
      translations: [],
      synonyms: [],
      groups: [],
      within: [],
      contains: [],
      icons: [],
      tagSection: ['Icon', 'Definition', 'Synonyms', 'Within', 'Contains', 'Translations'] // stats? vote? member's relation? definition?
    }
  },
  methods: {
    init: function () {
      this.$http.get('/set/' + this.$route.params.uid, {
        params: {
          languageCode: 'en'
        }
      }).then(response => {
        if (response.body.tag) {
          response.body.tag.name = response.body.translation.name
          response.body.tag.status = {}
          this.tag = response.body
          // this.$route.params.name
          this.tag.setID = this.$route.params.uid
          this.fetchSynonyms()
          this.fetchWithin()
          this.fetchContains()
          this.fetchTranslations()
          this.fetchMeta('definition')
          this.fetchMeta('icon')
        } else {
          Materialize.toast('Resource not found.', 4000)
        }
        if (!this.modalOpen) {
          this.openModal()
        }
      }, response => {
        if (!this.modalOpen) {
          this.openModal()
        }
        Materialize.toast('Something went wrong...are you online?', 4000)
      })
    },
    openModal: function () {
      this.modalOpen = true
      this.$nextTick(function () {
        $('#tagModal').modal({
          dismissible: true, // Modal can be dismissed by clicking outside of the modal
          opacity: 0.5, // Opacity of modal background
          inDuration: 300, // Transition in duration
          outDuration: 200, // Transition out duration
          startingTop: '4%', // Starting top style attribute
          endingTop: '10%', // Ending top style attribute
          ready: function (modal, trigger) { // Callback for Modal open. Modal and trigger parameters available.
            $('body').css('overflow', 'hidden')
          },
          complete: () => {
            if ($('.metaNav').flickity()) {
              $('.metaNav').flickity('destroy')
              $('.tagSections').flickity('destroy')
            }
            $('body').css('overflow', 'auto')
            Router.push('/')
          }
        }).modal('open')
      })
    },
    evalTopTag: function () {
      const top = this.icons.reduce(function (prev, current) {
        return (prev.globalVote.quality > current.globalVote.quality) ? prev : current
      })
      if (top.resource.mThumb !== this.tag.tag.iconURL && top.globalVote.quality !== null) {
        // triggering new top icon from the front end is probably stupid.
        this.tag.tag.iconURL = top.resource.mThumb
        this.$http.put('/api/set/' + this.tag.setID + '/' + top.resource.uid + '/newTopIcon').then(response => {
          Materialize.toast('New top icon!', 4000)
        }, response => {
          Materialize.toast('Something went wrong...are you online?', 4000)
        })
      }
    },
    newMeta: function (a, b) {
      if (this.addResourceType === 'definition') {
        this.definitions.push(a)
      } else if (this.addResourceType === 'icon') {
        this.icons.push(a)
      }
    },
    fetchMeta: function (type) {
      if (this.member.uid !== null) {
        this.$http.get('/api/set/' + this.$route.params.uid + '/meta/', {
          params: {
            languageCode: 'en',
            type: type
          }
        }).then(response => {
          if (type === 'definition') {
            this.definitions = response.body
          } else if (type === 'icon') {
            this.icons = response.body
          }
        }, response => {
          Materialize.toast('Something went wrong...are you online?', 4000)
        })
      } else {
        this.$http.get('/set/' + this.$route.params.uid + '/meta/', {
          params: {
            languageCode: 'en',
            type: type
          }
        }).then(response => {
          if (type === 'definition') {
            this.definitions = response.body
          } else if (type === 'icon') {
            this.icons = response.body
          }
        }, response => {
          Materialize.toast('Something went wrong...are you online?', 4000)
        })
      }
    },
    fetchTranslations: function () {
      this.$http.get('/set/' + this.$route.params.uid + '/translation/', {
        params: {
          languageCode: 'en'
        }
      }).then(response => {
        if (response.body.length > 0) {
          this.translations = response.body
        } else {
          Materialize.toast('Translations not found.', 4000)
          this.translations = []
        }
      }, response => {
        Materialize.toast('Something went wrong...are you online?', 4000)
      })
    },
    fetchSynonyms: function () {
      this.$http.get('/set/' + this.$route.params.uid + '/synonym/', {
        params: {
          languageCode: 'en'
        }
      }).then(response => {
        if (response.body.length > 0) {
          this.synonyms = response.body
        } else {
          Materialize.toast('Synonyms not found.', 4000)
          this.synonyms = []
        }
      }, response => {
        Materialize.toast('Something went wrong...are you online?', 4000)
      })
    },
    addSynonym: function (synonym) { // TODO: this merges sets...need a separate method for adding tag to set
      this.$http.put('/api/set/' + this.tag.setID + '/synonym/' + synonym.setID).then(response => {
        if (response.body) {
          Materialize.toast('Added!', 4000)
          this.synonyms.push(synonym)
        } else {
          Materialize.toast('Something went wrong...', 4000)
        }
      }, response => {
        Materialize.toast('Something went wrong...are you online?', 4000)
      })
    },
    removeSynonym: function (synUID) {
      this.$http.delete('/api/set/' + this.tag.setID + '/synonym/' + synUID).then(response => {
        if (response.body) {
          Materialize.toast('Removed!', 4000)
          this.synonyms.splice(this.synonyms.findIndex((tag) => tag.tag.uid === synUID), 1)
        } else {
          Materialize.toast('Something went wrong...', 4000)
        }
      }, response => {
        Materialize.toast('Something went wrong...are you online?', 4000)
      })
    },
    fetchWithin: function () {
      this.$http.get('/set/' + this.tag.setID + '/within/', {
        params: {
          languageCode: 'en'
        }
      }).then(response => {
        if (response.body.length > 0) {
          this.within = response.body
        } else {
          this.within = []
        }
      }, response => {
        Materialize.toast('Something went wrong...are you online?', 4000)
      })
    },
    addWithin: function (within) {
      this.$http.put('/api/set/' + this.tag.setID + '/within/' + within.tag.uid).then(response => {
        if (response.body) {
          Materialize.toast('Added!', 4000)
          this.within.push(within)
        } else {
          Materialize.toast('Something went wrong...', 4000)
        }
      }, response => {
        Materialize.toast('Something went wrong...are you online?', 4000)
      })
    },
    removeWithin: function (uid) {
      this.$http.delete('/api/set/' + this.tag.setID + '/within/' + uid).then(response => {
        if (response.body) {
          Materialize.toast('Removed!', 4000)
          this.within.splice(this.within.findIndex((tag) => tag.tag.uid === uid), 1)
        } else {
          Materialize.toast('Something went wrong...', 4000)
        }
      }, response => {
        Materialize.toast('Something went wrong...are you online?', 4000)
      })
    },
    fetchContains: function () {
      this.$http.get('/set/' + this.tag.setID + '/contains/', {
        params: {
          languageCode: 'en'
        }
      }).then(response => {
        if (response.body.length > 0) {
          this.contains = response.body
        } else {
          Materialize.toast('Contains no tags.', 4000)
          this.contains = []
        }
      }, response => {
        Materialize.toast('Something went wrong...are you online?', 4000)
      })
    },
    addContains: function (contains) {
      this.$http.put('/api/set/' + this.tag.setID + '/contains/' + contains.tag.uid).then(response => {
        if (response.body) {
          Materialize.toast('Added!', 4000)
          this.contains.push(contains)
        } else {
          Materialize.toast('Something went wrong...', 4000)
        }
      }, response => {
        Materialize.toast('Something went wrong...are you online?', 4000)
      })
    },
    removeContains: function (uid) {
      this.$http.delete('/api/set/' + this.tag.setID + '/contains/' + uid).then(response => {
        if (response.body) {
          Materialize.toast('Removed!', 4000)
          this.contains.splice(this.contains.findIndex((tag) => tag.tag.uid === uid), 1)
        } else {
          Materialize.toast('Something went wrong...', 4000)
        }
      }, response => {
        Materialize.toast('Something went wrong...are you online?', 4000)
      })
    },
    deleteSet (uid) {
      this.$http.delete('/api/set/' + uid).then(response => {
        if (response.body) {
          Materialize.toast('Set deleted.', 4000)
        } else {
          Materialize.toast('Something went wrong...', 4000)
        }
      }, response => {
        Materialize.toast('Something went wrong...are you online?', 4000)
      })
    },
    addToQuery: function (item) {
      this.$emit('add', item)
      $('#tagModal').modal('close')
    }
  },
  mounted: function () {
    this.init()
    $('.metaNav').flickity({
      asNavFor: '.tagSections',
      pageDots: false,
      prevNextButtons: false,
      accessibility: false // to prevent jumping when focused
    })

    $('.tagSections').flickity({
      wrapAround: true,
      pageDots: false,
      prevNextButtons: true,
      accessibility: false, // to prevent jumping when focused
      dragThreshold: 20 // play around with this more?
    })

    // TODO: set flickity tab in URL
    $('.tagSections').flickity('selectCell', 1, true, true) //  value, isWrapped, isInstant
  },
  beforeRouteLeave: function (to, from, next) {
    $('body').css('overflow', 'auto')
    if ($('.modal-overlay')) {
      $('.modal-overlay').remove()
    }
    window.setTimeout(() => {
      next()
    }, 375)
  },
  watch: {
    '$route.params.uid': function (id) {
      this.init()
    },
    member: function () { // re-fetch on member login/logout
      this.$nextTick(x => {
        this.fetchMeta('definition')
        this.fetchMeta('icon')
      })
    }
  }
}
</script>

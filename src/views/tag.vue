<template>
<div id='termModal' class="modal fullPage term-modal">

  <!-- modal for adding to discussion -->
  <add-resource v-if='addResource === true' :type='addResourceType' v-on:close="addResource=false" v-on:added="newMeta">
  </add-resource>

  <div class="termTitle">
    <span v-if="term.term.iconURL && term.term.iconURL.length > 0" class=''>
					<img class='circle'style='height:60pxwidth:60px' :src="term.term.iconURL">
			</span>
    <span>
				<span>{{term.translation.name}}</span>
    </span>

    <!-- setdelete -->
    <!-- <span v-if='true' class='btn' v-on:click="deleteSet(term.setID)">delete set</span> -->

    <span class="right modal-close"><i class="fa fa-2x fa-times"></i></span>
  </div>
  <!-- flick navigation for isotope containers -->
  <div class="termMeta">
    <div class="metaNav">
      <div v-for="step in termSection" class="navItems">
        <p>
          {{step}}
        </p>
      </div>
    </div>
    <!-- isotope contianers -->
    <div class="termSections">

      <div class="stepContainer">

        <div>
          <a @click="addResourceType='icon'; addResource = true;" class="hoverable btn-floating btn-large waves-effect waves-light red"><i class="material-icons">add</i></a>
        </div>

        <div v-for="icon in icons" :key="icon['resource']['uid']">
          <resource :re="icon" :display="'list'" v-on:vote-cast='evalTopTerm'>
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
          <term v-for="term in synonyms" :key="term.setID" :term="term" :display="termDisplay" v-on:include="addToQuery(term)" v-on:exclude="removeSynonym(term.term.uid)" v-on:focus="addToQuery(term)" v-on:pin="addToQuery(term)" hide="remove">
          </term>
        </isotope>
        <search :exclude="$route.params.uid" input-id="syn" v-on:select="addSynonym"></search>
      </div>
      <div class="stepContainer">
        <isotope ref='withn' :list="within" :options='{}'>
          <term :term="term" v-for="term in within" :key="term.translation.name" :display="termDisplay" v-on:include="addToQuery(term)" v-on:exclude="removeWithin(term.term.uid)" v-on:focus="addToQuery(term)" v-on:pin="addToQuery(term)" hide="remove">
          </term>
          <!-- v-on:exclude="removeSynonym(term.term.uid)" -->
        </isotope>
        <search exclude="" input-id="within" v-on:select="addWithin"></search>
      </div>
      <div class="stepContainer">
        <isotope ref='contains' :list="contains" :options='{}'>
          <term :term="term" v-for="term in contains" :display="termDisplay" :key="term.setID" v-on:include="addToQuery(term)" v-on:exclude="removeContains(term.term.uid)" v-on:focus="addToQuery(term)" v-on:pin="addToQuery(term)" hide="remove">
          </term>
          <!-- v-on:exclude="removeSynonym(term.term.uid)" -->
        </isotope>
        <search exclude="" input-id="contains" v-on:select="addContains"></search>
      </div>
      <div class="stepContainer">
        <isotope ref='trans' :list="translations" :options='{}'>
          <term :term="term" v-for="term in translations" :key="term.setID" :display="termDisplay" v-on:include="addToQuery(term)" v-on:exclude="addToQuery(term)" v-on:focus="addToQuery(term)" v-on:pin="addToQuery(term)" hide="remove">
          </term>
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
  props: ['termQuery', 'member'],
  data: function () {
    return {
      term: {
        name: 'default',
        translation: {
          name: ''
        },
        term: {
          iconURL: ''
        }
      },
      termDisplay: 'list',
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
      termSection: ['Icon', 'Definition', 'Synonyms', 'Within', 'Contains', 'Translations'] // stats? vote? member's relation? definition?
    }
  },
  methods: {
    init: function () {
      this.$http.get('/set/' + this.$route.params.uid, {
        params: {
          languageCode: 'en'
        }
      }).then(response => {
        if (response.body.term) {
          response.body.term.name = response.body.translation.name
          response.body.term.status = {}
          this.term = response.body
          // this.$route.params.name
          this.term.setID = this.$route.params.uid
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
        $('#termModal').modal({
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
              $('.termSections').flickity('destroy')
            }
            $('body').css('overflow', 'auto')
            Router.push('/')
          }
        }).modal('open')
      })
    },
    evalTopTerm: function () {
      const top = this.icons.reduce(function (prev, current) {
        return (prev.globalVote.quality > current.globalVote.quality) ? prev : current
      })
      if (top.resource.mThumb !== this.term.term.iconURL && top.globalVote.quality !== null) {
        // triggering new top icon from the front end is probably stupid.
        this.term.term.iconURL = top.resource.mThumb
        this.$http.put('/api/set/' + this.term.setID + '/' + top.resource.uid + '/newTopIcon').then(response => {
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
    addSynonym: function (synonym) { // TODO: this merges sets...need a separate method for adding term to set
      this.$http.put('/api/set/' + this.term.setID + '/synonym/' + synonym.setID).then(response => {
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
      this.$http.delete('/api/set/' + this.term.setID + '/synonym/' + synUID).then(response => {
        if (response.body) {
          Materialize.toast('Removed!', 4000)
          this.synonyms.splice(this.synonyms.findIndex((term) => term.term.uid === synUID), 1)
        } else {
          Materialize.toast('Something went wrong...', 4000)
        }
      }, response => {
        Materialize.toast('Something went wrong...are you online?', 4000)
      })
    },
    fetchWithin: function () {
      this.$http.get('/set/' + this.term.setID + '/within/', {
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
      this.$http.put('/api/set/' + this.term.setID + '/within/' + within.term.uid).then(response => {
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
      this.$http.delete('/api/set/' + this.term.setID + '/within/' + uid).then(response => {
        if (response.body) {
          Materialize.toast('Removed!', 4000)
          this.within.splice(this.within.findIndex((term) => term.term.uid === uid), 1)
        } else {
          Materialize.toast('Something went wrong...', 4000)
        }
      }, response => {
        Materialize.toast('Something went wrong...are you online?', 4000)
      })
    },
    fetchContains: function () {
      this.$http.get('/set/' + this.term.setID + '/contains/', {
        params: {
          languageCode: 'en'
        }
      }).then(response => {
        if (response.body.length > 0) {
          this.contains = response.body
        } else {
          Materialize.toast('Contains no terms.', 4000)
          this.contains = []
        }
      }, response => {
        Materialize.toast('Something went wrong...are you online?', 4000)
      })
    },
    addContains: function (contains) {
      this.$http.put('/api/set/' + this.term.setID + '/contains/' + contains.term.uid).then(response => {
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
      this.$http.delete('/api/set/' + this.term.setID + '/contains/' + uid).then(response => {
        if (response.body) {
          Materialize.toast('Removed!', 4000)
          this.contains.splice(this.contains.findIndex((term) => term.term.uid === uid), 1)
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
      $('#termModal').modal('close')
    }
  },
  mounted: function () {
    this.init()
    $('.metaNav').flickity({
      asNavFor: '.termSections',
      pageDots: false,
      prevNextButtons: false,
      accessibility: false // to prevent jumping when focused
    })

    $('.termSections').flickity({
      wrapAround: true,
      pageDots: false,
      prevNextButtons: true,
      accessibility: false, // to prevent jumping when focused
      dragThreshold: 20 // play around with this more?
    })

    // TODO: set flickity tab in URL
    $('.termSections').flickity('selectCell', 1, true, true) //  value, isWrapped, isInstant
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

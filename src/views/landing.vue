<template>
<main>
  <div>
    <div class="container">
      <br>
      <br>
      <h1 class=" center blue-text thin">knowlo</h1>
      <div class="row center">

        <h4 style="margin-bottom:40px" class="header col s12 light">What's worth discussing?</h4>

        <h5 style="line-height:1.3em;" class="header light">Knowlo is a <router-link to="/principals"><span >principled</span></router-link>, <a target="_blank" href="http://github.com/bornytm/knowlo"><span >open source</span></a>, experiment in collaborative knowledge sharing</h5>
      </div>
      <div style='margin-top: 80px;' class="row center">
        <router-link to="/" class="btn-large waves-effect waves-light blue margin20"><i class="fa fa-compass fa-2x "></i> explore</router-link> <span style="font-weight:200">  </span> <span @click="random" class='margin20 btn-large waves-effect waves-light blue'><i class="fa fa-random fa-2x "></i> shuffle</span>
      </div>
      <br>
      <br>
    </div>
  </div>
  <div class="container deets">
    <div class='deet'>
      <img src="https://firebasestorage.googleapis.com/v0/b/knowlo-952cc.appspot.com/o/about%2Fadd-min.PNG?alt=media&tag=eb6bc12e-b52e-46dc-8436-ebc049837877" />
      <h4>Add</h4>
      <p>
        Members add and organize videos, images, insights, questions, and other media to the knowlo library.
      </p>
    </div>

    <div class='deet'>
      <img src="https://firebasestorage.googleapis.com/v0/b/knowlo-952cc.appspot.com/o/about%2Fvote-min.PNG?alt=media&tag=6a3b44bd-fa24-4b75-9338-fddaa9b12a32" />
      <h4>Vote</h4>
      <p>
        Resources are ranked based on their quality and complexity.
      </p>
    </div>
    <div class='deet'>
      <img src="https://firebasestorage.googleapis.com/v0/b/knowlo-952cc.appspot.com/o/about%2Fdis-min.PNG?alt=media&tag=da6dc5e3-a9e3-4dbf-98ab-ef8787db9678" />
      <h4>Discuss</h4>
      <p>
        For each resource, members can discuss, ciritize, ask questions, and distill insights.
      </p>
    </div>
    <div class='deet'>
      <img src="https://firebasestorage.googleapis.com/v0/b/knowlo-952cc.appspot.com/o/about%2Ftag-min.PNG?alt=media&tag=27c56cd2-9356-4055-b5e5-e5ce7ba86680" />
      <h4>Tag</h4>
      <p>
        Resources are tagged with tags in order to easily identify and search for them.
      </p>
    </div>
    <div class='deet'>
      <img src="https://firebasestorage.googleapis.com/v0/b/knowlo-952cc.appspot.com/o/about%2Fhis-min.PNG?alt=media&tag=882af20e-3983-431a-948b-dfcc3b674439" />
      <h4>Organize</h4>
      <p>
        tags are organized into a hierarchy, making it easy to see relationships between concepts.
      </p>
    </div>
    <div class='deet'>
      <img src="https://firebasestorage.googleapis.com/v0/b/knowlo-952cc.appspot.com/o/about%2Fsearch-min.PNG?alt=media&tag=f88fc955-2c6a-4b18-8794-15657bc1c48f" />
      <h4>Search</h4>
      <p>
        Explore the library by combining tags. More tags are suggested to further refine the results.
      </p>
    </div>
  </div>
  <div class="row center">
    <router-link to="/" class="btn-large waves-effect waves-light blue margin20"><i class="fa fa-compass fa-2x "></i> explore</router-link> <span style="font-weight:200">  </span> <span @click="random" class='margin20 btn-large waves-effect waves-light blue'><i class="fa fa-random fa-2x "></i> shuffle</span>
  </div>
</main>
</template>

<script>
export default {
  methods: {
    random () {
      this.$http.get('/api/resource/random').then(response => {
        this.$router.push({
          name: 'resource',
          params: {
            uid: response.body.uid
          }
        })
      })
    }
  }
}
</script>

<style>
.deets {
    display: flex;
    align-items: flex-end;
    justify-content: space-around;
    flex-flow: row wrap;
}
.deet {
  max-width: 300px;
  display: flex;
  align-items: center;
  flex-flow: column ;
  font-weight: 300;
}
.deet p {
  font-size: 18px;
  height:100px;
}
.deet h4 {
  font-weight: 300;
}
.deet img {
  max-width: 100%;
}
</style>

<template>
  <div class="container app" v-if="renderComponent">
    <router-view :key="$route.path"></router-view>
  </div>
</template>

<script>

export default {
  name: "App",
  data() {
    return {
      renderComponent: true,
    };
  },
  computed: {

  },
  components: {
  },
  mounted() {
    window.onresize = () => {
      this.renderComponent = false;
      setTimeout(() => {
        this.renderComponent = true;
      }, 500);
    };
  },
};
</script>

<style>
*::-webkit-scrollbar {
  fill: #ae8e71;
  color: #ae8e71;
  width: 0.3em;
}

*::-webkit-scrollbar-track {
  -webkit-box-shadow: inset 0 0 0.6vh rgba(0, 0, 0, 0.3);
}

*::-webkit-scrollbar-thumb {
  background-color: #ae8e71;
  outline: 0.1vh solid #ae8e71;
}

html,
body {
  height: 100%;
  width: 100%;
}

* {
  margin: 0;
  overflow: hidden;
  user-select: none;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100%;
  width: 100%;
}

.backgrounded {
  background-image: url("./assets/background.png");
  background-attachment: fixed;
  background-repeat: no-repeat;
  background-size: cover;
  -o-background-size: cover;
  -moz-background-size: cover;
  -webkit-background-size: cover;
  -o-background-repeat: no-repeat;
  -moz-background-repeat: no-repeat;
  -webkit-background-repeat: no-repeat;
}
</style>

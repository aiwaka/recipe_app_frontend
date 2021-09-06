<template>
  <div class="home">
    <template v-if="!loggedIn">
      <input v-model="username" placeholder="name" />
      <input type="password" v-model="password" placeholder="password" />
      <button v-on:click.prevent="login">Login</button>
    </template>
    <button v-if="loggedIn" v-on:click.prevent="logout">Logout</button>
    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
  </div>
</template>

<script>
// @ is an alias to /src
// import HelloWorld from "@/components/HelloWorld.vue";

export default {
  name: "Home",
  components: {},
  created() {
    this.$store.dispatch("loadLoginStatus");
  },
  data() {
    return {
      username: "",
      password: "",
    };
  },
  computed: {
    loggedIn() {
      return !!localStorage.getItem("recipe_app_access_token");
    },
    errorMessage() {
      return this.$store.state.errorMessage;
    },
  },
  methods: {
    login() {
      const name = this.username;
      const password = this.password;
      this.$store.dispatch("login", { name, password });
    },
    logout() {
      if (confirm("ログアウトします")) {
        this.$store.dispatch("logout");
      }
    },
  },
};
</script>

<style>
.error-message {
  border: 1px solid red;
  color: red;
}
</style>

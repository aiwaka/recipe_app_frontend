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
import { server_url, authorizedHeader } from "../mixins/utils";
import axios from "axios";

export default {
  name: "Home",
  components: {},
  created() {
    this.loadLoginStatus();
  },
  data() {
    return {
      username: "",
      password: "",
      errorMessage: "",
    };
  },
  computed: {
    loggedIn() {
      return !!localStorage.getItem("recipe_app_access_token");
    },
    // errorMessage() {
    //   return this.$store.state.errorMessage;
    // },
  },
  methods: {
    loadLoginStatus() {
      console.log("load login");
      if (localStorage.getItem("recipe_app_access_token")) {
        console.log("login loaded");
      }
    },
    // login() {
    //   const name = this.username;
    //   const password = this.password;
    //   this.$store.dispatch("login", { name, password });
    // },
    async login() {
      const name = this.username;
      const password = this.password;
      console.log("login start");
      const result = await axios
        .post(
          server_url + "/login",
          { name, password },
          { headers: { "Content-Type": "application/json" } }
        )
        .then((response) => response)
        .catch((err) => err.response);
      if (result.status === 200) {
        if ("access_token" in result.data) {
          localStorage.setItem(
            "recipe_app_access_token",
            result.data.access_token
          );
          this.$router.go({ path: "/", force: true });
        } else {
          console.log(result);
        }
      } else {
        if ("message" in result.data) {
          this.errorMessage = result.data.message;
          console.log(result.data.message);
        } else {
          console.log(result);
        }
      }
    },
    async logout() {
      if (confirm("ログアウトします")) {
        const headers = authorizedHeader();
        const result = await axios
          .delete(server_url + "/login", { headers })
          .then((response) => response)
          .catch((err) => err.response);
        if (result.status === 200) {
          localStorage.removeItem("recipe_app_access_token");
          console.log(result.data.message);
        } else {
          localStorage.removeItem("recipe_app_access_token");
          console.log(result);
        }
        this.$router.go({ path: "/", force: true });
      }
    },
  },
};
</script>

<style>
.error-message {
  border: 1px solid red;
  color: red;
  width: 30rem;
  margin: 0.4rem auto;
}
</style>

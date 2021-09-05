import Vue from "vue";
import Vuex from "vuex";
import router from "../router";
import axios from "axios";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    // なぜかここでserver_urlを設定しないとCORSエラーが出る.
    server_url: process.env.VUE_APP_EXTERNAL_SERVER_URL,
    errorMessage: "",
  },
  mutations: {},
  actions: {
    loadLogin() {
      console.log("load login");
      if (localStorage.getItem("access_token")) {
        console.log("login loaded");
      }
    },
    async login({ state }, { name, password }) {
      console.log("login start");
      const result = await axios
        .post(state.server_url + "/login", {
          name,
          password,
        })
        .then((response) => response)
        .catch((err) => err.response);
      if (result.status === 200) {
        if ("access_token" in result.data) {
          localStorage.setItem("access_token", result.data.access_token);
          router.go({ path: "/", force: true });
        } else {
          console.log(result);
        }
      } else {
        if ("message" in result.data) {
          state.errorMessage = result.data.message;
          console.log(result.data.message);
        } else {
          console.log(result);
        }
      }
    },
    async logout({ state }) {
      const result = await axios
        .post(state.server_url + "/logout", {
          access_token: localStorage.getItem("access_token"),
        })
        .then((response) => response)
        .catch((err) => err.response);
      if (result.status === 200) {
        if ("message" in result.data) {
          localStorage.removeItem("access_token");
          console.log(result.data.message);
        } else {
          console.log(result);
        }
      } else {
        if ("message" in result.data) {
          state.errorMessage = result.data.message;
          console.log(result.data.message);
        } else {
          console.log(result);
        }
      }

      // router.go({ path: "/", force: true });
    },
    async loadRecipeList() {},
  },
  modules: {},
});

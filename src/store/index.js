import Vue from "vue";
import Vuex from "vuex";
import router from "../router";
import axios from "axios";

Vue.use(Vuex);

function authorizedHeader(props_obj = {}) {
  // アクセストークンを含めたヘッダーオブジェクトを返す. ないならないでOK.
  return Object.assign(
    {
      "Content-Type": "application/json",
      Authorization: `bearer ${localStorage.getItem(
        "recipe_app_access_token"
      )}`,
    },
    props_obj
  );
}

export default new Vuex.Store({
  state: {
    // なぜかここでserver_urlを設定しないとCORSエラーが出る.
    server_url: process.env.VUE_APP_EXTERNAL_SERVER_URL,
    errorMessage: "",
    recipeDataList: [],
  },
  mutations: {
    pushToLoginPage(state, { message }) {
      alert(
        "ログインに失敗しました。\nエラーメッセージ：" +
          message +
          "\nログイン画面に戻ります。"
      );
      localStorage.removeItem("recipe_app_access_token");
      router.push({ path: "/" });
      state.errorMessage = message;
    },
  },
  actions: {
    loadLoginStatus() {
      console.log("load login");
      if (localStorage.getItem("recipe_app_access_token")) {
        console.log("login loaded");
      }
    },
    async login({ state }, { name, password }) {
      console.log("login start");
      const result = await axios
        .post(
          state.server_url + "/login",
          {
            name,
            password,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
        .then((response) => response)
        .catch((err) => err.response);
      if (result.status === 200) {
        if ("access_token" in result.data) {
          localStorage.setItem(
            "recipe_app_access_token",
            result.data.access_token
          );
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
    async logout({ state, commit }) {
      const headers = authorizedHeader();
      const result = await axios
        .post(state.server_url + "/logout", {}, { headers })
        .then((response) => response)
        .catch((err) => err.response);
      if (result.status === 200) {
        localStorage.removeItem("recipe_app_access_token");
        console.log(result.data.message);
      } else {
        if ("message" in result.data) {
          commit("pushToLoginPage", { message: result.data.message });
        } else {
          console.log(result);
        }
      }
      router.go({ path: "/", force: true });
    },
    async getRecipeList({ state, commit }) {
      const headers = authorizedHeader();
      const result = await axios
        .get(state.server_url + "/recipes", {
          headers,
          data: {},
        })
        .then((response) => response)
        .catch((err) => err.response);
      if (result.status === 200) {
        state.recipeDataList = result.data.dataList;
      } else {
        if ("message" in result.data) {
          commit("pushToLoginPage", { message: result.data.message });
        } else {
          console.log(result);
        }
      }
    },
    async addNewRecipe({ state, commit, dispatch }, { name, url }) {
      console.log("add recipe");
      const headers = authorizedHeader();
      const result = await axios
        .post(
          state.server_url + "/recipes",
          {
            recipe_name: name,
            original_url: url,
          },
          { headers }
        )
        .then((response) => response)
        .catch((err) => err.response);
      if (result.status === 200) {
        // 成功したならデータベース情報を取得して更新する.
        dispatch("getRecipeList");
      } else {
        if ("message" in result.data) {
          commit("pushToLoginPage", { message: result.data.message });
        } else {
          console.log(result);
        }
      }
    },
  },
  modules: {},
});

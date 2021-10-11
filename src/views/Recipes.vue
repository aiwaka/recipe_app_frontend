<template>
  <div class="recipes">
    <div class="recipe__add-box">
      <input placeholder="recipe name" v-model="newRecipeName" />
      URLから作成する
      <input placeholder="URL" v-model="originalUrl" />
      <button v-on:click.prevent="addNewRecipe">作成</button>
    </div>
    <div class="recipe__search-box">
      <input placeholder="search query" v-model="searchQuery" />
      <button v-on:click.prevent="searchRecipe">検索</button>
    </div>
    <div v-if="recipeDataList.length" class="recipe__box-container">
      <div
        v-for="rec in recipeDataList"
        :key="rec.id"
        class="recipe__each-box"
        v-on:click="pushToContentsPage(rec.id)"
      >
        <p>{{ rec.name }}</p>
        <button v-on:click="editRecipe(rec.id)">編集</button>
        <button v-on:click="deleteRecipe(rec.id)">削除</button>
      </div>
    </div>
    <div v-else class="recipe__box-container">No data.</div>
  </div>
</template>

<script>
import axios from "axios";
import { server_url, authorizedHeader, pushToLoginPage } from "../mixins/utils";
export default {
  name: "Recipes",
  components: {},
  data() {
    return {
      newRecipeName: "",
      originalUrl: "",
      searchQuery: "",
      recipeDataList: [],
    };
  },
  created() {
    this.getRecipeList();
  },
  computed: {},
  methods: {
    async getRecipeList() {
      const headers = authorizedHeader();
      const result = await axios
        .get(server_url + "/recipes", {
          headers,
          data: {},
        })
        .then((response) => response)
        .catch((err) => err.response);
      if (result.status === 200) {
        this.recipeDataList = result.data.dataList;
      } else {
        if ("message" in result.data) {
          pushToLoginPage(result.data.message);
        } else {
          console.log(result);
        }
      }
    },
    async addNewRecipe() {
      const name = this.newRecipeName;
      if (name === "") {
        alert("名前は必須です。");
        return;
      }
      const url = this.originalUrl;
      console.log("add recipe");
      const headers = authorizedHeader();
      const result = await axios
        .post(
          server_url + "/recipes",
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
        this.getRecipeList();
      } else {
        if ("message" in result.data) {
          pushToLoginPage(result.data.message);
        } else {
          console.log(result);
        }
      }
      this.newRecipeName = "";
      this.originalUrl = "";
    },
    searchRecipe() {
      //todo
    },
    pushToContentsPage(recipeId) {
      this.$router.push({ name: "Contents", params: { recipeId: recipeId } });
    },
    editRecipe(recId) {
      console.log(recId);
    },
    deleteRecipe(recId) {
      console.log(recId);
    },
  },
};
</script>

<style>
.recipe__box-container {
  width: 20rem;
  margin: auto auto;
}
.recipe__each-box {
  background-color: rgba(255, 255, 255, 0);
  border: 1px solid #aaa;
  font-size: 2.6rem;
  /* height: 4rem; */
  padding: 0.2rem 0.8rem;
  margin: auto auto;
}
.recipe__each-box:hover {
  background-color: #ccc;
  cursor: pointer;
}
.recipe__each-box > p {
  margin: 0;
}
</style>

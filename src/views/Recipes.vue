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
      <recipe-block
        v-for="rec in recipeDataList"
        :key="rec.id"
        class="recipe__each-box"
        :recipeName="rec.name"
        :recipeId="rec.id"
        v-on:update-recipe-list="getRecipeList"
      />
    </div>
    <div v-else class="recipe__box-container">No data.</div>
  </div>
</template>

<script>
import axios from "axios";
import {
  server_url,
  authorizedHeader,
  // pushToLoginPage,
  standardAccessToAPI,
} from "../mixins/utils";
import RecipeBlock from "../components/RecipeBlock.vue";
export default {
  name: "Recipes",
  components: { RecipeBlock },
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
      await standardAccessToAPI(
        axios.get(server_url + "/recipes", { headers }),
        (result) => {
          this.recipeDataList = result.data.dataList;
          for (const recipe of this.recipeDataList) {
            recipe.editNewRecipeName = "";
          }
        }
      );
    },
    async addNewRecipe() {
      const name = this.newRecipeName;
      if (name === "") {
        alert("名前は必須です。");
        return;
      } else if (name.length > 150) {
        alert("名前が長すぎます。150文字以内にする必要があります。");
        return;
      }
      const url = this.originalUrl;
      console.log("add recipe");
      const headers = authorizedHeader();
      await standardAccessToAPI(
        axios.post(
          server_url + "/recipes",
          {
            recipe_name: name,
            original_url: url,
          },
          { headers }
        ),
        () => {
          this.getRecipeList();
        }
      );
      this.newRecipeName = "";
      this.originalUrl = "";
    },
    searchRecipe() {
      //todo
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

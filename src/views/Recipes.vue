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
    <div v-if="recipes.length">
      <div
        v-for="rec in recipes"
        :key="rec.id"
        class="recipe__each-box"
        v-on:click="pushToContentsPage(rec.id)"
      >
        {{ rec.name }}
      </div>
    </div>
    <div v-else>No data.</div>
  </div>
</template>

<script>
export default {
  name: "Recipes",
  components: {},
  data() {
    return {
      newRecipeName: "",
      originalUrl: "",
      searchQuery: "",
    };
  },
  created() {
    this.$store.dispatch("getRecipeList");
  },
  computed: {
    recipes() {
      return this.$store.state.recipeDataList;
    },
  },
  methods: {
    addNewRecipe() {
      const name = this.newRecipeName;
      if (name === "") {
        alert("名前は必須です。");
        return;
      }
      const url = this.originalUrl;
      this.$store.dispatch("addNewRecipe", { name, url });
      this.newRecipeName = "";
      this.originalUrl = "";
    },
    searchRecipe() {
      //todo
    },
    pushToContentsPage(recipeId) {
      this.$router.push({ name: "Contents", params: { recipeId: recipeId } });
    },
  },
};
</script>

<style>
.recipe__each-box {
  background-color: rgba(255, 255, 255, 0);
  border: 1px solid #aaa;
  width: fit-content;
  padding: 0.2rem 0.8rem;
  margin: auto auto;
}
.recipe__each-box:hover {
  background-color: #ccc;
  cursor: pointer;
}
</style>

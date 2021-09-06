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
      <div v-for="rec in recipes" :key="rec.id">
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
  },
};
</script>

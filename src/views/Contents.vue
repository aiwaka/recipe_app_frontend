<template>
  <div id="contents">
    <div class="contents__add-box">
      <input placeholder="contents title" v-model="newItemName" />
      <input placeholder="text" type="textarea" v-model="newItemText" />
      <button v-on:click.prevent="addNewItem">作成</button>
    </div>
    <template v-if="itemList.length">
      <div v-for="item in itemList" :key="item.id" class="contents__item-box">
        {{ item.id }}
      </div>
    </template>
    <template v-else><div>No Data</div></template>
  </div>
</template>

<script>
export default {
  name: "Contents",
  components: {},
  beforeCreate() {
    this.$store.dispatch("checkLogin");
  },
  beforeRouteUpdate(to, from, next) {
    this.$store.dispatch("getRecipeContents", {
      recipeId: to.params.recipeId,
    });
    next();
  },
  mounted() {
    this.$store.dispatch("getRecipeContents", {
      recipeId: this.$route.params.recipeId,
    });
  },
  data() {
    return {
      newItemName: "",
      newItemText: "",
    };
  },
  computed: {
    itemList() {
      return this.$store.state.recipeContents;
    },
  },
  methods: {
    addNewItem() {
      const title = this.newItemName;
      if (title === "") {
        alert("コンテンツアイテムのタイトルは必須です。");
        return;
      }
      const originalText = this.newItemText;
      this.$store.dispatch("addNewItem", {
        title,
        recipeId: this.$route.params.recipeId,
        originalText,
      });
      this.newItemName = "";
      this.newItemText = "";
    },
  },
};
</script>

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
import axios from "axios";
import { server_url, authorizedHeader, pushToLoginPage } from "../mixins/utils";
export default {
  name: "Contents",
  components: {},
  beforeRouteUpdate(to, from, next) {
    console.log("update to " + String(to.params.recipeId));
    this.getRecipeContents(to.params.recipeId);
    next();
  },
  created() {
    console.log("created");
    this.getRecipeContents(this.$route.params.recipeId);
  },
  data() {
    return {
      newItemName: "",
      newItemText: "",
      itemList: [],
    };
  },
  computed: {},
  methods: {
    async getRecipeContents(recipeId) {
      // this.itemList = [];
      console.log("get recipe contents at " + String(recipeId));
      const headers = authorizedHeader();
      const result = await axios
        .get(server_url + "/recipes/" + String(recipeId), { headers })
        .then((response) => response)
        .catch((err) => err.response);
      if (result.status === 200) {
        console.log(result);
        // 成功したらstateに保存
        this.itemList = result.data.data;
      } else {
        if ("message" in result.data) {
          pushToLoginPage(result.data.message);
        } else {
          console.log(result);
        }
      }
    },
    async addNewItem() {
      const title = this.newItemName;
      if (title === "") {
        alert("コンテンツアイテムのタイトルは必須です。");
        return;
      }
      const recipeId = this.$route.params.recipeId;
      const originalText = this.newItemText;
      console.log("add item to recipe" + String(recipeId));
      const headers = authorizedHeader();
      const result = await axios
        .post(
          server_url + "/items",
          {
            item_order: 1, // todo: 現状定数にしているがちゃんと変化するようにする.
            title,
            recipe_id: recipeId,
            original_text: originalText,
          },
          { headers }
        )
        .then((response) => response)
        .catch((err) => err.response);
      if (result.status === 200) {
        // 成功したならデータベース情報を取得して更新する.
        console.log("success to add item to " + String(recipeId));
        this.getRecipeContents(recipeId);
      } else {
        if ("message" in result.data) {
          pushToLoginPage(result.data.message);
        } else {
          console.log(result);
        }
      }
      this.newItemName = "";
      this.newItemText = "";
    },
  },
};
</script>

<template>
  <div id="contents">
    <h2>{{ recipeName }}</h2>
    <div class="contents__add-box">
      <input placeholder="contents title" v-model="newItemTitle" />
      <textarea placeholder="text" v-model="newItemText" />
      <button v-on:click.prevent="addNewItem">作成</button>
    </div>
    <template v-if="itemList.length">
      <!-- <div v-for="item in itemList" :key="item.id" class="contents__item-box"> -->
      <!-- <h3 class="contents__item-box--title">{{ item.title }}</h3> -->
      <block-with-changer
        v-for="item in itemList"
        :key="item.id"
        class="contents__item-box"
        :title="item.title"
        :text="item.modified_text"
        :updateFunc="updateItem(item.id)"
        :deleteFunc="deleteItem(item.id)"
      />
      <!-- <div> {{ item.modified_text }} </div> -->
      <!-- </div> -->
    </template>
    <template v-else><div>No Data</div></template>
  </div>
</template>

<script>
import axios from "axios";
import { server_url, authorizedHeader, pushToLoginPage } from "../mixins/utils";
import BlockWithChanger from "../components/TextBlock.vue";
export default {
  name: "Contents",
  components: { BlockWithChanger },
  beforeRouteUpdate(to, from, next) {
    console.log("update to " + String(to.params.recipeId));
    this.getRecipeContents(to.params.recipeId);
    next();
  },
  created() {
    this.getRecipeContents(this.recipeId);
  },
  data() {
    return {
      recipeName: "",
      newItemTitle: "",
      newItemText: "",
      updateTitle: "",
      updateText: "",
      itemList: [],
    };
  },
  computed: {
    recipeId() {
      return this.$route.params.recipeId;
    },
  },
  methods: {
    async getRecipeContents(recipeId) {
      // todo: item一覧だけでなくレシピの情報も取得
      console.log("get recipe contents at " + String(recipeId));
      const headers = authorizedHeader();
      const result = await axios
        .get(server_url + `/recipes/${recipeId}`, { headers })
        .then((response) => response)
        .catch((err) => err.response);
      if (result.status === 200) {
        // 成功したらstateに保存
        this.itemList = result.data.itemList;
        this.recipeName = result.data.recipeName;
      } else {
        if ("message" in result.data) {
          pushToLoginPage(result.data.message);
        } else {
          console.log(result);
        }
      }
    },
    async addNewItem() {
      const title = this.newItemTitle;
      if (title === "") {
        alert("コンテンツアイテムのタイトルは必須です。");
        return;
      }
      const originalText = this.newItemText;
      console.log(`add item to recipe ${this.recipeId}`);
      const headers = authorizedHeader();
      const result = await axios
        .post(
          server_url + "/items",
          {
            item_order: this.itemList.length + 1, // todo: 現状定数にしているがちゃんと変化するようにする.
            title,
            recipe_id: this.recipeId,
            original_text: originalText,
          },
          { headers }
        )
        .then((response) => response)
        .catch((err) => err.response);
      if (result.status === 200) {
        // 成功したならデータベース情報を取得して更新する.
        console.log(`success to add item to ${this.recipeId}`);
        this.getRecipeContents(this.recipeId);
      } else {
        if ("message" in result.data) {
          pushToLoginPage(result.data.message);
        } else {
          console.log(result);
        }
      }
      this.newItemTitle = "";
      this.newItemText = "";
    },
    updateItem(itemId) {
      // itemIdを変更可能テキストボックスにわたすためにこのような形にしている.
      // 返す関数はアロー関数を使わないとthisがバインドされずgetRecipeContentsが呼べない.
      return async (modMap) => {
        console.log("update");
        // modMapはentryとnewDataを含むオブジェクトの配列.
        console.log("add item to recipe" + String(itemId));
        const headers = authorizedHeader();
        const result = await axios
          .put(server_url + "/items/" + String(itemId), modMap, { headers })
          .then((response) => response)
          .catch((err) => err.response);
        if (result.status === 200) {
          // 成功したならデータベース情報を取得して更新する.
          console.log(
            `success to update item ${itemId} of recipe ${this.recipeId}`
          );
          this.getRecipeContents(this.recipeId);
        } else {
          if ("message" in result.data) {
            pushToLoginPage(result.data.message);
          } else {
            console.log(result);
          }
        }
      };
    },
    deleteItem(itemId) {
      return async () => {
        const headers = authorizedHeader();
        const result = await axios
          .delete(server_url + "/items/" + String(itemId), { headers })
          .then((response) => response)
          .catch((err) => err.response);
        if (result.status === 200) {
          // 成功したならデータベース情報を取得して更新する.
          console.log(
            `success to delete item ${itemId} of recipe ${this.recipeId}`
          );
          this.getRecipeContents(this.recipeId);
        } else {
          if ("message" in result.data) {
            pushToLoginPage(result.data.message);
          } else {
            console.log(result);
          }
        }
      };
    },
  },
};
</script>

<style>
.contents__item-box {
  background-color: rgba(255, 255, 255, 0);
  border: 1px solid #aaa;
  width: 30rem;
  padding: 0.2rem 0.8rem;
  margin: auto auto;
}
/* .contents__item-box--title {
  margin: 0.2rem auto;
} */
</style>

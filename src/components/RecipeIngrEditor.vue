<template>
  <!-- レシピに紐づく材料やグループを管理する場所. -->
  <div class="ingr-editor">
    <recipe-ingr-list-block
      :editting="editting"
      :recipeId="recipeId"
      :allIngrList="allIngrList"
      v-on:edit-move-ingr="dropIngrToIngrList"
      ref="ingrListBlock"
    />
    <recipe-ingr-group-block
      :recipeId="recipeId"
      :editting="editting"
      :allIngrList="allIngrList"
      ref="ingrGroupBlock"
    />
    <div class="ingr-editor__button-container">
      <template v-if="editting === 0">
        <button v-on:click="editIngrList">材料リスト編集</button>
        <button v-on:click="editGroupList">材料グループ編集</button>
      </template>
      <template v-else-if="editting === 1">
        <button v-on:click="saveIngrEdit">保存</button>
        <button v-on:click="discardIngrEdit">キャンセル</button>
      </template>
      <template v-else-if="editting === 2">
        <button v-on:click="saveGroupEdit">保存</button>
        <button v-on:click="discardGroupEdit">キャンセル</button>
      </template>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import {
  server_url,
  authorizedHeader,
  standardAccessToAPI,
} from "../mixins/utils";
import RecipeIngrGroupBlock from "./RecipeIngrGroupBlock.vue";
import RecipeIngrListBlock from "./RecipeIngrListBlock.vue";
export default {
  name: "RecipeIngrEditor",
  components: { RecipeIngrGroupBlock, RecipeIngrListBlock },
  created() {
    this.getIngrList();
    // this.getGroupList();
  },
  data() {
    return {
      editting: 0, // 0：編集していない, 1：リスト編集, 2：グループ編集
      allIngrList: [], // 全材料のリストはグループ管理でも使うし変更しないので一番上で保持しておく
    };
  },
  props: {
    recipeId: {
      type: Number,
      required: true,
    },
  },
  methods: {
    async getIngrList() {
      // Ingredients.vueのをコピペした. 材料一覧を取得.
      const headers = authorizedHeader();
      await standardAccessToAPI(
        axios.get(server_url + "/ingredients", { headers }),
        (result) => {
          this.allIngrList = result.data.dataList;
        }
      );
    },
    dropIngrToIngrList(payload) {
      // 材料リストに材料をdropしたときに呼び出される.
      this.$refs.ingrGroupBlock.moveIngrBetweenGroups(payload);
    },
    editIngrList() {
      this.editting = 1;
    },
    editGroupList() {
      this.editting = 2;
    },
    async saveIngrEdit() {
      await this.$refs.ingrListBlock.saveIngrEdit();
      this.editting = 0;
    },
    discardIngrEdit() {
      if (confirm("破棄すると変更は保存されません。よろしいですか？")) {
        this.editting = 0;
      }
    },
    async saveGroupEdit() {
      await this.$refs.ingrGroupBlock.saveGroupEdit();
      this.editting = 0;
    },
    discardGroupEdit() {
      if (confirm("破棄すると変更は保存されません。よろしいですか？")) {
        this.editting = 0;
      }
    },
  },
};
</script>

<style>
.ingr-editor {
  border: 1px solid #aaa;
  width: 40rem;
  margin: 2rem auto;
}
.ingr-editor__group-container {
  border: 2px solid #ddd;
  margin: 0.2rem auto;
}
.ingr-editor__group-container[disabled] {
  background-color: #aaa;
}
.ingr-editor__groups {
  display: flex;
  flex-wrap: wrap;
}
.ingr-editor__button-container {
  border: 2px solid #ddd;
  margin: 0.2rem auto;
  display: flex;
  justify-content: center;
}
.ingr-editor__ingr-delete-button {
  border: 1px solid #aaa;
  cursor: pointer;
}
</style>

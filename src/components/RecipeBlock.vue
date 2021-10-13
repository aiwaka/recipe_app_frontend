<template>
  <div class="recipe-block">
    <template v-if="!editting">
      <p v-on:click.prevent="pushToContentsPage">{{ recipeName }}</p>
      <button v-on:click="changeData">編集</button>
      <button v-on:click="deleteBlock">削除</button>
    </template>
    <template v-else>
      <input placeholder="new name" v-model="newName" />
      <button v-on:click="saveData">保存</button>
      <button v-on:click="cancelEdit">キャンセル</button>
    </template>
  </div>
</template>

<script>
import axios from "axios";
import {
  server_url,
  authorizedHeader,
  standardAccessToAPI,
} from "../mixins/utils";
export default {
  name: "RecipeBlock",
  data() {
    return {
      editting: false,
      newName: "",
    };
  },
  props: {
    recipeName: {
      type: String,
      required: true,
    },
    recipeId: {
      type: Number,
      required: true,
    },
  },
  methods: {
    pushToContentsPage() {
      this.$router.push({
        name: "Contents",
        params: { recipeId: this.recipeId },
      });
    },
    changeData() {
      this.newName = this.recipeName;
      this.editting = true;
    },
    async deleteBlock() {
      if (confirm("このレシピを消去しますか？もとに戻せません。")) {
        console.log("delete");
        const headers = authorizedHeader();
        await standardAccessToAPI(
          axios.delete(server_url + `/recipes/${this.recipeId}`, { headers }),
          () => {
            this.$emit("update-recipe-list");
          }
        );
      }
    },
    async saveData() {
      if (this.newName === "") {
        alert("名前は必須です。");
        return;
      }
      if (this.newName.length > 150) {
        alert("名前が長すぎます。150文字以内にする必要があります。");
        return;
      }
      const modMap = [];
      if (this.recipeName !== this.newName) {
        modMap.push({ entry: "name", new_data: this.newName });
      }
      if (modMap.length) {
        const headers = authorizedHeader();
        await standardAccessToAPI(
          axios.put(server_url + `/recipes/${this.recipeId}`, modMap, {
            headers,
          }),
          () => {
            this.$emit("update-recipe-list");
          }
        );
      }
      this.editting = false;
    },
    cancelEdit() {
      this.editting = false;
    },
  },
};
</script>

<style>
.recipe-block {
  background-color: rgba(255, 255, 255, 0);
  border: 1px solid #aaa;
  font-size: 2rem;
  min-height: 6rem;
  padding: 0.2rem 0.8rem;
  margin: auto auto;
}
.recipe-block:hover {
  background-color: #ccc;
  cursor: pointer;
}
.recipe-block p {
  margin: 0;
}
.recipe-block > input {
  margin: 1rem auto;
  display: block;
}
</style>

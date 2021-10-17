<template>
  <!-- レシピコンテンツの材料リストのブロック -->
  <div
    class="ingr-editor__list-container"
    :class="{ dragover: isDragOver && editting === 2 }"
    v-on:dragover.prevent="onDrag('over')"
    v-on:dragleave="onDrag('leave')"
    v-on:drop.stop="dropItem($event)"
  >
    <div>材料リスト</div>
    <template v-if="editting !== 1">
      <!-- 編集中でないとき -->
      <div v-if="ingrList.length" class="ingr-editor__lists">
        <recipe-ingr-item
          v-for="ingr of ingrList"
          :editting="editting"
          :key="ingr.id"
          :ingrData="ingr"
          :groupId="-1"
        />
      </div>
      <div v-else>材料がありません。</div>
    </template>
    <template v-else>
      <!-- 編集中 -->
      <div v-if="ingrListEdit.length" class="ingr-editor__lists">
        <div
          v-for="ingr in ingrListEdit"
          :key="ingr.id"
          class="ingr-editor__list-item"
        >
          {{ ingr.name }}：<input v-model="ingr.amount" />
          <div
            v-on:click="editRemoveIngr(ingr.id)"
            class="ingr-editor__ingr-delete-button"
          >
            x
          </div>
        </div>
      </div>
      <div v-else class="ingr-editor__list-item">材料がありません。</div>
      <div class="ingr-editor__all-ingr-container">
        <p>全材料一覧</p>
        <div class="ingr-editor__all-ingr-list">
          <div
            v-for="ingr in allIngrList"
            :key="ingr.id"
            class="ingr-editor__all-ingr-item"
          >
            {{ ingr.name }}
            <div
              v-on:click="editAddIngr(ingr.id)"
              class="ingr-editor__ingr-add-button"
            >
              +
            </div>
          </div>
        </div>
      </div>
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
import RecipeIngrItem from "./RecipeIngrItem.vue";
export default {
  name: "IngrEditor",
  components: { RecipeIngrItem },
  created() {
    this.getIngrListOfRecipe();
  },
  watch: {
    editting: function (newVal) {
      if (newVal === 1) {
        this.editIngrList();
      }
    },
  },
  props: {
    editting: { type: Number },
    recipeId: { type: Number },
    allIngrList: { type: Array },
  },
  data() {
    return {
      isDragOver: false, // グループ編集時の素材をここにドロップするときのためにある変数
      ingrList: [],
      ingrListEdit: [],
    };
  },
  methods: {
    onDrag(eventType) {
      // "over"が渡されたときはtrue, それ以外のときはfalseになるようにする.
      this.isDragOver = eventType === "over";
    },
    dropItem(event) {
      // グループ編集時に材料を材料リストで離すとグループから削除できる機能
      this.isDragOver = false;
      const data = JSON.parse(event.dataTransfer.getData("text/plain"));
      const { ingrId, fromGroupId } = data;
      if (fromGroupId !== -1) {
        this.$emit("edit-move-ingr", { fromGroupId, toGroupId: -1, ingrId });
      }
    },
    async getIngrListOfRecipe() {
      // todo: レシピの材料一覧を取得する. ついでに総価格とかも算出できたら
      const headers = authorizedHeader();
      await standardAccessToAPI(
        axios.get(server_url + `/recipes/${this.recipeId}/ingredients`, {
          headers,
        }),
        (result) => {
          this.ingrList = result.data.ingrList;
        }
      );
    },
    editIngrList() {
      this.ingrListEdit = JSON.parse(JSON.stringify(this.ingrList)); // 配列をコピー(deepcopy)
    },
    editAddIngr(ingrId) {
      // ingrIdを持つオブジェクトをeditListに追加する.
      const obj = this.allIngrList.find((elem) => elem.id === ingrId);
      if (!this.ingrListEdit.some((elem) => elem.id === obj.id)) {
        // 存在しないときのみ追加
        obj.amount = "";
        this.ingrListEdit.push(obj);
      }
    },
    editRemoveIngr(ingrId) {
      const idx = this.ingrListEdit.findIndex((elem) => elem.id === ingrId);
      this.ingrListEdit.splice(idx, 1);
    },
    async addIngrToRecipe(addList) {
      // レシピに材料を追加. データはaddListをそのまま使う.
      const headers = authorizedHeader();
      await standardAccessToAPI(
        axios.post(
          server_url + `/recipes/${this.recipeId}/ingredients`,
          addList,
          { headers }
        ),
        () => {
          this.getIngrListOfRecipe(this.recipeId);
        }
      );
    },
    async removeIngrFromRecipe(deleteList) {
      // レシピから材料を削除. データはdeleteListをそのまま使う.
      const headers = authorizedHeader();
      await standardAccessToAPI(
        axios.delete(server_url + `/recipes/${this.recipeId}/ingredients`, {
          headers,
          data: deleteList,
        }),
        () => {
          this.getIngrListOfRecipe(this.recipeId);
        }
      );
    },
    async changeAmount(changeList) {
      // レシピの材料の情報を変更. データはchangeListをそのまま使う.
      const headers = authorizedHeader();
      await standardAccessToAPI(
        axios.patch(
          server_url + `/recipes/${this.recipeId}/ingredients`,
          changeList,
          { headers }
        ),
        () => {
          this.getIngrListOfRecipe(this.recipeId);
        }
      );
    },
    saveIngrEdit() {
      // add, remove, changeを一括して行い変更を保存する.
      const addList = [];
      const changeList = [];
      const deleteList = [];
      for (const editData of this.ingrListEdit) {
        if (!this.ingrList.some((elem) => elem.id === editData.id)) {
          // もともとなかったが今はあるならaddリストに追加
          addList.push({ ingr_id: editData.id, amount: editData.amount });
        } else {
          // 最初も今もあるなら変更があるかを検出し、あるならchangeリストに追加
          const originalData = this.ingrList.find(
            (elem) => elem.id === editData.id
          );
          if (originalData.amount !== editData.amount) {
            changeList.push({
              id: editData.id,
              modMap: [{ entry: "amount", new_data: editData.amount }],
            });
          }
        }
      }
      for (const originalData of this.ingrList) {
        // もともとあるのに今はないものをdeleteリストに追加
        if (!this.ingrListEdit.some((elem) => elem.id === originalData.id)) {
          deleteList.push(originalData.id);
        }
      }
      if (addList.length) this.addIngrToRecipe(addList);
      if (changeList.length) this.changeAmount(changeList);
      if (deleteList.length) this.removeIngrFromRecipe(deleteList);
      this.ingrListEdit = [];
    },
    discardIngrEdit() {
      this.editting = 0;
      this.ingrListEdit = [];
    },
  },
};
</script>

<style>
.ingr-editor__list-container {
  border: 2px solid #ddd;
  margin: 0.2rem auto;
}
.ingr-editor__list-container.dragover {
  box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.33);
}
.ingr-editor__lists {
  display: flex;
  flex-wrap: wrap;
}
.ingr-editor__list-item {
  display: flex;
  border: 1px solid #ccc;
  margin: 0.2rem 0.4rem;
}
.ingr-editor__all-ingr-list {
  display: flex;
  flex-wrap: wrap;
}
.ingr-editor__all-ingr-container {
  border: 1px dotted #aaa;
}
.ingr-editor__all-ingr-item {
  display: flex;
  border: 1px solid #888;
  margin: 0.1rem 0.3rem;
}
.ingr-editor__ingr-add-button {
  border: 1px solid #aaa;
  cursor: pointer;
}
</style>

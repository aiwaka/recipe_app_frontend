<template>
  <div id="contents">
    <h2>{{ recipeName }}</h2>
    <p class="original-url" v-if="originalUrl">
      {{ originalUrl }}から取得しました。
    </p>
    <div class="contents__add-box">
      <input placeholder="contents title" v-model="newItemTitle" />
      <textarea placeholder="text" v-model="newItemText" />
      <button v-on:click.prevent="addNewItem">作成</button>
    </div>
    <ingr-editor :recipeId="recipeId" />

    <template v-if="itemList.length">
      <item-block
        v-for="item in itemList"
        :key="item.id"
        class="contents__item-box"
        :itemId="item.id"
        :title="item.title"
        :text="item.modified_text"
        v-on:update-item-list="getRecipeContents(recipeId)"
      />
    </template>
    <template v-else><div>No Data</div></template>
  </div>
</template>

<script>
import axios from "axios";
import {
  server_url,
  authorizedHeader,
  standardAccessToAPI,
} from "../mixins/utils";
import ItemBlock from "../components/ItemBlock.vue";
import IngrEditor from "../components/RecipeIngrEditor.vue";
export default {
  name: "Contents",
  components: { ItemBlock, IngrEditor },
  beforeRouteUpdate(to, from, next) {
    console.log("update to " + String(to.params.recipeId));
    this.getRecipeContents(to.params.recipeId);
    // this.getIngrListOfRecipe(to.params.recipeId);
    next();
  },
  created() {
    this.getRecipeContents(this.recipeId);
    // this.getIngrListOfRecipe(this.recipeId);
    // this.getIngrList();
  },
  data() {
    return {
      recipeName: "",
      originalUrl: "",
      newItemTitle: "",
      newItemText: "",
      updateTitle: "",
      updateText: "",
      itemList: [],
      // allIngrList: [],
      // recIngrDataList: [],
      // recIngrDataListEdit: [], // 編集中の素材リスト
      // ingrEditting: false, // 素材リストを編集中かのフラグ
    };
  },
  computed: {
    recipeId() {
      return Number(this.$route.params.recipeId);
    },
  },
  methods: {
    async getRecipeContents(recipeId) {
      // todo: item一覧だけでなくレシピの情報も取得
      console.log("get recipe contents at " + String(recipeId));
      const headers = authorizedHeader();
      await standardAccessToAPI(
        axios.get(server_url + `/recipes/${recipeId}`, { headers }),
        (result) => {
          this.itemList = result.data.itemList;
          this.recipeName = result.data.recipeName;
          this.originalUrl = result.data.originalUrl;
        }
      );
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
      await standardAccessToAPI(
        axios.post(
          server_url + "/items",
          {
            item_order: this.itemList.length + 1, // todo: 現状定数にしているがちゃんと変化するようにする.
            title,
            recipe_id: this.recipeId,
            original_text: originalText,
          },
          { headers }
        ),
        () => {
          this.getRecipeContents(this.recipeId);
        }
      );
      this.newItemTitle = "";
      this.newItemText = "";
    },
    //   async getIngrList() {
    //     // Ingredients.vueのをコピペした. 材料一覧を取得.
    //     const headers = authorizedHeader();
    //     await standardAccessToAPI(
    //       axios.get(server_url + "/ingredients", { headers }),
    //       (result) => {
    //         this.allIngrList = result.data.dataList;
    //       }
    //     );
    //   },
    //   async getIngrListOfRecipe(recipeId) {
    //     // todo: レシピの材料一覧を取得する. ついでに総価格とかも算出できたら
    //     const headers = authorizedHeader();
    //     await standardAccessToAPI(
    //       axios.get(server_url + `/recipes/${recipeId}/ingredients`, { headers }),
    //       (result) => {
    //         this.recIngrDataList = result.data.ingrList;
    //       }
    //     );
    //   },
    //   editIngrList() {
    //     this.recIngrDataListEdit = JSON.parse(
    //       JSON.stringify(this.recIngrDataList)
    //     ); // 配列をコピー(deepcopy)
    //     this.ingrEditting = true;
    //   },
    //   editAddIngr(ingrId) {
    //     // ingrIdを持つオブジェクトをeditListに追加する.
    //     const obj = this.allIngrList.find((elem) => elem.id === ingrId);
    //     if (!this.recIngrDataListEdit.some((elem) => elem.id === obj.id)) {
    //       // 存在しないときのみ追加
    //       obj.amount = "";
    //       this.recIngrDataListEdit.push(obj);
    //     }
    //   },
    //   editRemoveIngr(ingrId) {
    //     const idx = this.recIngrDataListEdit.findIndex(
    //       (elem) => elem.id === ingrId
    //     );
    //     this.recIngrDataListEdit.splice(idx, 1);
    //   },
    //   async addIngrToRecipe(addList) {
    //     // レシピに材料を追加. データはaddListをそのまま使う.
    //     const headers = authorizedHeader();
    //     await standardAccessToAPI(
    //       axios.post(
    //         server_url + `/recipes/${this.recipeId}/ingredients`,
    //         addList,
    //         { headers }
    //       ),
    //       () => {
    //         this.getIngrListOfRecipe(this.recipeId);
    //       }
    //     );
    //   },
    //   async removeIngrFromRecipe(deleteList) {
    //     // レシピから材料を削除. データはdeleteListをそのまま使う.
    //     const headers = authorizedHeader();
    //     await standardAccessToAPI(
    //       axios.delete(server_url + `/recipes/${this.recipeId}/ingredients`, {
    //         headers,
    //         data: deleteList,
    //       }),
    //       () => {
    //         this.getIngrListOfRecipe(this.recipeId);
    //       }
    //     );
    //   },
    //   async changeAmount(changeList) {
    //     // レシピの材料の情報を変更. データはchangeListをそのまま使う.
    //     const headers = authorizedHeader();
    //     await standardAccessToAPI(
    //       axios.put(
    //         server_url + `/recipes/${this.recipeId}/ingredients`,
    //         changeList,
    //         { headers }
    //       ),
    //       () => {
    //         this.getIngrListOfRecipe(this.recipeId);
    //       }
    //     );
    //   },
    //   saveIngrEdit() {
    //     // add, remove, changeを一括して行い変更を保存する.
    //     const addList = [];
    //     const changeList = [];
    //     const deleteList = [];
    //     for (const editData of this.recIngrDataListEdit) {
    //       if (!this.recIngrDataList.some((elem) => elem.id === editData.id)) {
    //         // もともとなかったが今はあるならaddリストに追加
    //         addList.push({ ingr_id: editData.id, amount: editData.amount });
    //       } else {
    //         // 最初も今もあるなら変更があるかを検出し、あるならchangeリストに追加
    //         const originalData = this.recIngrDataList.find(
    //           (elem) => elem.id === editData.id
    //         );
    //         if (originalData.amount !== editData.amount) {
    //           changeList.push({
    //             ingr_id: editData.id,
    //             new_data: editData.amount,
    //           });
    //         }
    //       }
    //     }
    //     for (const originalData of this.recIngrDataList) {
    //       // もともとあるのに今はないものをdeleteリストに追加
    //       if (
    //         !this.recIngrDataListEdit.some((elem) => elem.id === originalData.id)
    //       ) {
    //         deleteList.push(originalData.id);
    //       }
    //     }
    //     if (addList.length) this.addIngrToRecipe(addList);
    //     if (changeList.length) this.changeAmount(changeList);
    //     if (deleteList.length) this.removeIngrFromRecipe(deleteList);
    //     this.recIngrDataListEdit = [];
    //     this.ingrEditting = false;
    //   },
    //   discardIngrEdit() {
    //     this.ingrEditting = false;
    //     this.recIngrDataListEdit = [];
    //   },
  },
};
</script>

<style></style>

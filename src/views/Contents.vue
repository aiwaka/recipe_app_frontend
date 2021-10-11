<template>
  <div id="contents">
    <h2>{{ recipeName }}</h2>
    <div class="contents__add-box">
      <input placeholder="contents title" v-model="newItemTitle" />
      <textarea placeholder="text" v-model="newItemText" />
      <button v-on:click.prevent="addNewItem">作成</button>
    </div>
    <!-- 素材リスト（編集項目含む） -->
    <div class="recipe__ingr-container" :class="{ editting: ingrEditting }">
      <div v-if="!ingrEditting" class="ingr-list-container">
        <!-- 編集中でないとき -->
        <div v-if="recIngrDataList.length" class="ingr-list">
          <div
            v-for="ingr in recIngrDataList"
            :key="ingr.id"
            class="recipe__ingr"
          >
            {{ ingr.name }}：{{ ingr.amount }}
          </div>
        </div>
        <div v-else>材料がありません。</div>
        <button v-on:click="editIngrList">編集</button>
      </div>
      <div v-else class="ingr-list-container">
        <!-- 編集中 -->
        <div v-if="recIngrDataListEdit.length" class="ingr-list">
          <div
            v-for="ingr in recIngrDataListEdit"
            :key="ingr.id"
            class="recipe__ingr"
          >
            {{ ingr.name }}：<input v-model="ingr.amount" />
            <div
              v-on:click="editRemoveIngr(ingr.id)"
              class="recipe__ingr-delete-button"
            >
              x
            </div>
          </div>
        </div>
        <div v-else class="ingr-list">材料がありません。</div>

        <div class="edit-all-ingr-container">
          <p>材料一覧</p>
          <div class="edit-all-ingr-list">
            <div
              v-for="ingr in allIngrList"
              :key="ingr.id"
              class="edit-ingr-elem"
            >
              {{ ingr.name }}
              <div v-on:click="editAddIngr(ingr.id)" class="edit-add-button">
                +
              </div>
            </div>
          </div>
        </div>
        <button v-on:click="saveIngrEdit">保存</button>
        <button v-on:click="discardIngrEdit">キャンセル</button>
      </div>
    </div>
    <!-- ここからitemリスト -->
    <template v-if="itemList.length">
      <block-with-changer
        v-for="item in itemList"
        :key="item.id"
        class="contents__item-box"
        :title="item.title"
        :text="item.modified_text"
        :updateFunc="updateItem(item.id)"
        :deleteFunc="deleteItem(item.id)"
      />
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
    this.getIngrListOfRecipe(to.params.recipeId);
    next();
  },
  created() {
    this.getRecipeContents(this.recipeId);
    this.getIngrListOfRecipe(this.recipeId);
    this.getIngrList();
  },
  data() {
    return {
      recipeName: "",
      newItemTitle: "",
      newItemText: "",
      updateTitle: "",
      updateText: "",
      itemList: [],
      allIngrList: [],
      recIngrDataList: [],
      recIngrDataListEdit: [], // 編集中の素材リスト
      ingrEditting: false, // 素材リストを編集中かのフラグ
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
    async getIngrList() {
      // Ingredients.vueのをコピペした. 材料一覧を取得.
      const headers = authorizedHeader();
      const result = await axios
        .get(server_url + "/ingredients", { headers })
        .then((response) => response)
        .catch((err) => err.response);
      if (result.status === 200) {
        this.allIngrList = result.data.dataList;
      } else {
        if ("message" in result.data) {
          pushToLoginPage(result.data.message);
        } else {
          console.log(result);
        }
      }
    },
    async getIngrListOfRecipe(recipeId) {
      // todo: レシピの材料一覧を取得する. ついでに総価格とかも算出できたら
      const headers = authorizedHeader();
      const result = await axios
        .get(server_url + `/recipes/${recipeId}/ingredients`, { headers })
        .then((response) => response)
        .catch((err) => err.response);
      if (result.status === 200) {
        // 成功したらstateに保存
        this.recIngrDataList = result.data.ingrList;
      } else {
        if ("message" in result.data) {
          pushToLoginPage(result.data.message);
        } else {
          console.log(result);
        }
      }
    },
    editIngrList() {
      this.recIngrDataListEdit = JSON.parse(
        JSON.stringify(this.recIngrDataList)
      ); // 配列をコピー(deepcopy)
      this.ingrEditting = true;
    },
    editAddIngr(ingrId) {
      // ingrIdを持つオブジェクトをeditListに追加する.
      const obj = this.allIngrList.find((elem) => elem.id === ingrId);
      if (!this.recIngrDataListEdit.some((elem) => elem.id === obj.id)) {
        // 存在しないときのみ追加
        obj.amount = "";
        this.recIngrDataListEdit.push(obj);
      }
    },
    editRemoveIngr(ingrId) {
      const idx = this.recIngrDataListEdit.findIndex(
        (elem) => elem.id === ingrId
      );
      this.recIngrDataListEdit.splice(idx, 1);
    },
    async addIngrToRecipe(addList) {
      // レシピに材料を追加. データはaddListをそのまま使う.
      const headers = authorizedHeader();
      const result = await axios
        .post(server_url + `/recipes/${this.recipeId}/ingredients`, addList, {
          headers,
        })
        .then((response) => response)
        .catch((err) => err.response);
      if (result.status === 200) {
        // 成功したならデータベース情報を取得して更新する.
        this.getIngrListOfRecipe(this.recipeId);
      } else {
        if ("message" in result.data) {
          pushToLoginPage(result.data.message);
        } else {
          console.log(result);
        }
      }
    },
    async removeIngrFromRecipe(deleteList) {
      // レシピから材料を削除. データはdeleteListをそのまま使う.
      const headers = authorizedHeader();
      const result = await axios
        .delete(server_url + `/recipes/${this.recipeId}/ingredients`, {
          headers,
          data: deleteList,
        })
        .then((response) => response)
        .catch((err) => err.response);
      if (result.status === 200) {
        // 成功したならデータベース情報を取得して更新する.
        this.getIngrListOfRecipe(this.recipeId);
      } else {
        if ("message" in result.data) {
          pushToLoginPage(result.data.message);
        } else {
          console.log(result);
        }
      }
    },
    async changeAmount(changeList) {
      // レシピの材料の情報を変更. データはchangeListをそのまま使う.
      const headers = authorizedHeader();
      const result = await axios
        .put(server_url + `/recipes/${this.recipeId}/ingredients`, changeList, {
          headers,
        })
        .then((response) => response)
        .catch((err) => err.response);
      if (result.status === 200) {
        // 成功したならデータベース情報を取得して更新する.
        this.getIngrListOfRecipe(this.recipeId);
      } else {
        if ("message" in result.data) {
          pushToLoginPage(result.data.message);
        } else {
          console.log(result);
        }
      }
    },
    saveIngrEdit() {
      // add, remove, changeを一括して行い変更を保存する.
      const addList = [];
      const changeList = [];
      const deleteList = [];
      for (const editData of this.recIngrDataListEdit) {
        if (!this.recIngrDataList.some((elem) => elem.id === editData.id)) {
          // もともとなかったが今はあるならaddリストに追加
          addList.push({ ingr_id: editData.id, amount: editData.amount });
        } else {
          // 最初も今もあるなら変更があるかを検出し、あるならchangeリストに追加
          const originalData = this.recIngrDataList.find(
            (elem) => elem.id === editData.id
          );
          if (originalData.amount !== editData.amount) {
            changeList.push({
              ingr_id: editData.id,
              new_data: editData.amount,
            });
          }
        }
      }
      for (const originalData of this.recIngrDataList) {
        // もともとあるのに今はないものをdeleteリストに追加
        if (
          !this.recIngrDataListEdit.some((elem) => elem.id === originalData.id)
        ) {
          deleteList.push(originalData.id);
        }
      }
      if (addList.length) this.addIngrToRecipe(addList);
      if (changeList.length) this.changeAmount(changeList);
      if (deleteList.length) this.removeIngrFromRecipe(deleteList);
      this.recIngrDataListEdit = [];
      this.ingrEditting = false;
    },
    discardIngrEdit() {
      this.ingrEditting = false;
      this.recIngrDataListEdit = [];
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
.recipe__ingr-container {
  border: 1px solid #aaa;
  width: 40rem;
  margin: 2rem auto;
}
.editting {
  border: 2px solid #aaa;
}
.ingr-list-container {
  border: 1px dotted #aaa;
}
.ingr-list {
  display: flex;
  flex-wrap: wrap;
}
.edit-all-ingr-container {
  border: 1px dotted #aaa;
}
.edit-all-ingr-list {
  display: flex;
  flex-wrap: wrap;
}
.edit-ingr-elem {
  display: flex;
  border: 1px solid #888;
  margin: 0.1rem 0.3rem;
}
.edit-add-button {
  border: 1px solid #aaa;
  cursor: pointer;
}
.recipe__ingr {
  display: flex;
  border: 1px solid #ccc;
  margin: 0.2rem 0.4rem;
}
.recipe__ingr-delete-button {
  border: 1px solid #aaa;
  cursor: pointer;
}
</style>

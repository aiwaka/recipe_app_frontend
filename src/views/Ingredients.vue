<template>
  <div id="ingredients">
    <div class="ingredients__add-box">
      <p>値段を指定しない場合は-1を入力してください</p>
      <input placeholder="ingredient name" v-model="newIngrName" />
      <input
        placeholder="price"
        type="number"
        min="-1"
        v-model="newIngrPrice"
      />
      <button v-on:click.prevent="addNewIngr">作成</button>
    </div>
    <div class="ingredient__search-box">
      <input placeholder="search query" v-model="searchQuery" />
      <button v-on:click.prevent="searchIngr">検索</button>
    </div>
    <div v-if="ingrDataList.length" class="ingr__box-container">
      <ingredient-block
        v-for="ingr in ingrDataList"
        :key="ingr.id"
        :ingrId="ingr.id"
        :ingrName="ingr.name"
        :ingrPrice="ingr.price"
        v-on:update-ingr-list="getIngrList"
        class="ingr__each-box"
      />
    </div>
    <div v-else class="ingr__box-container">No data.</div>
  </div>
</template>

<script>
import axios from "axios";
import {
  server_url,
  authorizedHeader,
  // pushToLoginPage,
  standardAccessToAPI,
} from "../mixins/utils";
import IngredientBlock from "../components/IngredientBlock.vue";
export default {
  components: { IngredientBlock },
  name: "Ingredients",
  data() {
    return {
      newIngrName: "",
      newIngrPrice: -1,
      ingrDataList: [],
      searchQuery: "",
    };
  },
  created() {
    this.getIngrList();
  },
  methods: {
    async getIngrList() {
      const headers = authorizedHeader();
      await standardAccessToAPI(
        axios.get(server_url + "/ingredients", { headers }),
        (result) => {
          this.ingrDataList = result.data.dataList;
        }
      );
    },
    async addNewIngr() {
      const name = this.newIngrName;
      if (name === "") {
        alert("名前は必須です。");
        return;
      } else if (name.length > 25) {
        alert("材料名は25文字以内にする必要があります。");
        return;
      }
      let price = this.newIngrPrice;
      if (price < 0) {
        price = -1;
      }
      console.log("add ingr");
      const headers = authorizedHeader();
      await standardAccessToAPI(
        axios.post(
          server_url + "/ingredients",
          { ingr_name: name, price },
          { headers }
        ),
        () => {
          this.getIngrList();
        }
      );
      //   const result = await axios
      //     .post(
      //       server_url + "/ingredients",
      //       {
      //         ingr_name: name,
      //         price,
      //       },
      //       { headers }
      //     )
      //     .then((response) => response)
      //     .catch((err) => err.response);
      //   if (result.status === 200) {
      //     // 成功したならデータベース情報を取得して更新する.
      //     this.getIngrList();
      //   } else {
      //     if ("message" in result.data) {
      //       pushToLoginPage(result.data.message);
      //     } else {
      //       console.log(result);
      //     }
      //   }
      this.newIngrName = "";
      this.newIngrPrice = -1;
    },
    searchRecipe() {
      //todo
    },
    editIngr(ingrId) {
      console.log(ingrId);
    },
    deleteIngr(ingrId) {
      console.log(ingrId);
    },
  },
};
</script>

<style>
.ingr__box-container {
  display: flex;
  flex-wrap: wrap;
  width: 30rem;
  margin: 1.8rem auto;
}
</style>

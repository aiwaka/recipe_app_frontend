<template>
  <div class="ingr-block">
    <div v-if="!editting">
      <p>{{ ingrName }}</p>
      <p v-if="showPrice">{{ ingrPrice }}円</p>
      <button v-on:click="changeData">編集</button>
      <button v-on:click="deleteBlock">削除</button>
    </div>
    <div v-else>
      <input placeholder="new name" v-model="newName" />
      <input type="number" min="-1" v-model="newPrice" />
      <button v-on:click="saveData">保存</button>
      <button v-on:click="cancelEdit">キャンセル</button>
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
export default {
  name: "IngredientBlock",
  data() {
    return {
      editting: false,
      newName: "",
      newPrice: 0,
    };
  },
  props: {
    ingrName: {
      type: String,
      required: true,
    },
    ingrId: {
      type: Number,
      required: true,
    },
    ingrPrice: {
      type: [Number, undefined],
      requried: false,
    },
  },
  computed: {
    showPrice() {
      return Boolean(this.ingrPrice || this.ingrPrice === 0);
    },
  },
  methods: {
    changeData() {
      this.newName = this.ingrName;
      this.newPrice = this.showPrice ? this.ingrPrice : -1;
      this.editting = true;
    },
    async deleteBlock() {
      if (confirm("このレシピを消去しますか？もとに戻せません。")) {
        const headers = authorizedHeader();
        await standardAccessToAPI(
          axios.delete(server_url + `/ingredients/${this.ingrId}`, { headers }),
          () => {
            this.$emit("update-ingr-list");
          }
        );
      }
    },
    async saveData() {
      if (this.ingrName === "") {
        alert("名前は必須です。");
        return;
      }
      if (this.ingrName.length > 25) {
        alert("材料名は25文字以内にする必要があります。");
        return;
      }
      this.newPrice = Number(this.newPrice);
      if (this.newPrice < 0) {
        this.newPrice = -1;
      }
      const modMap = [];
      if (this.ingrName !== this.newName) {
        modMap.push({ entry: "name", new_data: this.newName });
      }
      if (this.ingrPrice !== this.newPrice) {
        modMap.push({ entry: "price", new_data: this.newPrice });
      }
      console.log(modMap);
      if (modMap.length) {
        const headers = authorizedHeader();
        await standardAccessToAPI(
          axios.put(server_url + `/ingredients/${this.ingrId}`, modMap, {
            headers,
          }),
          () => {
            this.$emit("update-ingr-list");
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

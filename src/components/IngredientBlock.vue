<template>
  <div class="ingr-block">
    <template v-if="!editting">
      <div class="ingr__info-container">
        <p>{{ ingrName }}</p>
        <p v-if="showPrice">{{ ingrPrice }}円</p>
      </div>
      <div class="ingr__button-container">
        <button v-on:click="changeData">-</button>
        <button v-on:click="deleteBlock">x</button>
      </div>
    </template>
    <template v-else>
      <div class="ingr__info-container">
        <input placeholder="new name" v-model="newName" />
        <input type="number" min="-1" v-model="newPrice" />
      </div>
      <div class="ingr__button-container">
        <button v-on:click="saveData">保存</button>
        <button v-on:click="cancelEdit">キャンセル</button>
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

<style>
.ingr-block {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: rgba(255, 255, 255, 0);
  border: 1px solid #aaa;
  min-height: 3rem;
  padding: 0.2rem 0.8rem;
  margin: auto auto;
}
.ingr__info-container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}
.ingr__info-container > input {
  display: block;
  width: 3rem;
}
.ingr__button-container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin: auto 0.2rem;
}
.ingr__button-container > button {
  border-radius: 3rem;
}
.ingr__button-container > button:hover {
  background-color: #666;
  color: aliceblue;
}
.ingr__info-container > p {
  max-width: 5rem;
  margin: 0;
}
</style>

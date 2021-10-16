<template>
  <!-- レシピに紐づく材料やグループを管理する場所. -->
  <div class="ingr-editor">
    <recipe-ingr-list-block
      :editting="editting"
      :recipeId="recipeId"
      ref="ingrListBlock"
    />
    <recipe-ingr-group-block
      :recipeId="recipeId"
      :editting="editting"
      ref="ingrGroupBlock"
    />
    <!-- <div class="ingr-editor__group-container" :disabled="editting === 1">
      <div>グループリスト</div>
      <div v-if="groupList.length" class="ingr-editor__groups">
        <recipe-ingr-group-block
          v-for="group in groupList"
          :key="group.id"
          :editting="editting"
          :recipeId="recipeId"
          :groupId="group.id"
          :groupName="group.group_name"
          v-on:update-group="getGroupList"
          v-on:delete-group="deleteGroup(group.id)"
          class="group"
        />
      </div>
    </div> -->
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
// import axios from "axios";
// import {
//   server_url,
//   authorizedHeader,
//   standardAccessToAPI,
// } from "../mixins/utils";
import RecipeIngrGroupBlock from "./RecipeIngrGroupBlock.vue";
import RecipeIngrListBlock from "./RecipeIngrListBlock.vue";
export default {
  name: "RecipeIngrEditor",
  components: { RecipeIngrGroupBlock, RecipeIngrListBlock },
  created() {
    // this.getGroupList();
  },
  data() {
    return {
      editting: 0, // 0：編集していない, 1：リスト編集, 2：グループ編集
      // groupList: [],
      // groupListEdit: [], // 編集中のグループリスト
    };
  },
  props: {
    recipeId: {
      type: Number,
      required: true,
    },
  },
  methods: {
    // async getGroupList() {
    //   const headers = authorizedHeader();
    //   await standardAccessToAPI(
    //     axios.get(server_url + `/recipes/${this.recipeId}/groups`, { headers }),
    //     (result) => {
    //       this.groupList = result.data.groupList;
    //     }
    //   );
    // },
    // async deleteGroup(groupId) {
    //   const headers = authorizedHeader();
    //   await standardAccessToAPI(
    //     axios.delete(server_url + `/groups/${groupId}`, { headers }),
    //     () => {
    //       this.getGroupList();
    //     }
    //   );
    // },
    editIngrList() {
      // this.ingrListEdit = JSON.parse(JSON.stringify(this.ingrList));
      this.editting = 1;
    },
    editGroupList() {
      // this.ingrGroupEdit = JSON.parse(JSON.stringify(this.groupList));
      this.editting = 2;
    },
    saveIngrEdit() {
      this.$refs.ingrListBlock.saveIngrEdit();
      this.editting = 0;
    },
    discardIngrEdit() {
      this.editting = 0;
      // this.ingrListEdit = [];
    },
    saveGroupEdit() {
      this.$refs.ingrGroupBlock.saveGroupEdit();
      this.editting = 0;
    },
    discardGroupEdit() {
      this.editting = 0;
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

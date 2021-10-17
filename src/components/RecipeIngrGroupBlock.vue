<template>
  <!-- レシピコンテンツページでの材料グループリスト全体のブロック -->
  <div class="ingr-editor__group-container" :disabled="editting === 1">
    <div>グループリスト</div>
    <div v-if="editting === 2" class="ingr-editor__group-container--add-box">
      <input placeholder="group title" v-model="newGroupName" />
      <button v-on:click.prevent="addGroup">作成</button>
    </div>
    <div v-if="groupList.length" class="ingr-editor__groups">
      <recipe-ingr-group-item
        v-for="group in editting !== 2 ? groupList : groupListEdit"
        :key="group.id"
        :editting="editting"
        :recipeId="recipeId"
        :group="group"
        v-on:edit-move-ingr="moveIngrBetweenGroups"
        v-on:edit-update-group="updateGroup"
        v-on:edit-delete-group="deleteGroup(group.id)"
        class="group"
      />
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
import RecipeIngrGroupItem from "./RecipeIngrGroupItem.vue";
export default {
  name: "IngrEditor",
  components: { RecipeIngrGroupItem },
  created() {
    this.getGroupList();
  },
  watch: {
    editting: function (newVal) {
      if (newVal === 2) {
        this.editGroupList();
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
      newGroupName: "",
      groupList: [],
      groupListEdit: [], // 編集中のグループリスト
    };
  },
  methods: {
    async getGroupList() {
      const headers = authorizedHeader();
      await standardAccessToAPI(
        axios.get(server_url + `/recipes/${this.recipeId}/groups`, { headers }),
        (result) => {
          this.groupList = result.data.groupList;
        }
      );
    },
    async addGroup() {
      const headers = authorizedHeader();
      await standardAccessToAPI(
        axios.post(
          server_url + `/recipes/${this.recipeId}/groups`,
          [{ group_name: this.newGroupName }],
          { headers }
        ),
        () => {
          this.getGroupList();
        }
      );
    },
    moveIngrBetweenGroups({ fromGroupId, toGroupId, ingrId }) {
      // 編集中のみ呼び出される
      if (toGroupId !== -1) {
        const toGroup = this.groupListEdit.find(
          (group) => group.id === toGroupId
        );
        const ingr = this.allIngrList.find((ingr) => ingr.id === ingrId);
        toGroup.ingrList.push(ingr);
      }
      if (fromGroupId !== -1) {
        const fromGroup = this.groupListEdit.find(
          (group) => group.id === fromGroupId
        );
        fromGroup.ingrList = fromGroup.ingrList.filter(
          (ingr) => ingr.id !== ingrId
        );
      }
    },
    updateGroup({ groupId, entry, newData }) {
      const group = this.groupListEdit.find((elem) => elem.id === groupId);
      if (entry === "name") {
        group.group_name = newData;
      }
    },
    async deleteGroup(groupId) {
      // 編集中しか呼ばれないはずなのでeditからグループを消すだけ
      this.groupListEdit = this.groupListEdit.filter(
        (elem) => elem.id !== groupId
      );
      //   const headers = authorizedHeader();
      //   await standardAccessToAPI(
      //     axios.delete(
      //       server_url + `/recipes/${this.recipeId}/groups/${groupId}`,
      //       { headers }
      //     ),
      //     () => {
      //       this.getGroupList();
      //     }
      //   );
    },
    editGroupList() {
      this.groupListEdit = JSON.parse(JSON.stringify(this.groupList));
    },
  },
};
</script>

<style>
.ingr-editor__group-container--add-box {
  border: 1px solid #ddd;
}
</style>

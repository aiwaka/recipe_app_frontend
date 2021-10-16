<template>
  <div class="ingr-editor__group-container" :disabled="editting === 1">
    <div>グループリスト</div>
    <div v-if="groupList.length" class="ingr-editor__groups">
      <recipe-ingr-group-item
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
  },
  data() {
    return {
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
    async deleteGroup(groupId) {
      const headers = authorizedHeader();
      await standardAccessToAPI(
        axios.delete(server_url + `/groups/${groupId}`, { headers }),
        () => {
          this.getGroupList();
        }
      );
    },
    editGroupList() {
      this.ingrGroupEdit = JSON.parse(JSON.stringify(this.groupList));
    },
  },
};
</script>

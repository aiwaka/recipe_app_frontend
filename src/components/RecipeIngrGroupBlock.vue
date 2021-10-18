<template>
  <!-- レシピコンテンツページでの材料グループリスト全体のブロック -->
  <div class="ingr-editor__group-container" :disabled="editting === 1">
    <div>グループリスト</div>
    <div v-if="editting === 2" class="ingr-editor__group-container--add-box">
      <input placeholder="group title" v-model="newGroupName" />
      <button v-on:click.prevent="addGroupEdit">作成</button>
    </div>
    <div v-if="showGroups" class="ingr-editor__groups">
      <recipe-ingr-group-item
        v-for="group in editting !== 2 ? groupList : groupListEdit"
        :key="group.id"
        :editting="editting"
        :recipeId="recipeId"
        :group="group"
        v-on:edit-move-ingr="moveIngrBetweenGroups"
        v-on:edit-update-group="updateGroupEdit"
        v-on:edit-delete-group="deleteGroupEdit(group.id)"
        class="group"
      />
    </div>
    <div v-else>グループがありません。</div>
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
  computed: {
    showGroups() {
      // "グループがありませんと表示しないかどうか"
      return Boolean(
        this.editting !== 2 ? this.groupList.length : this.groupListEdit.length
      );
    },
  },
  data() {
    return {
      newGroupId: -2, // 新規にグループを作成する際は負のidを指定すればデータベースで競合することがない.
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
    addGroupEdit() {
      if (this.newGroupName === "") {
        alert("名前は必須です。");
        return;
      } else if (
        this.groupListEdit.some(
          (group) => group.group_name === this.newGroupName
        )
      ) {
        alert("既存のものと同じ名前のグループは作れません。");
        return;
      }
      const newGroup = {
        group_name: this.newGroupName,
        id: this.newGroupId--,
        ingrList: [],
      };
      this.groupListEdit.push(newGroup);
      this.newGroupName = "";
    },
    moveIngrBetweenGroups({ fromGroupId, toGroupId, ingrId }) {
      // 編集中のみ呼び出される
      if (toGroupId !== -1) {
        // 追加処理（-1は材料リストを表す）
        const toGroup = this.groupListEdit.find(
          (group) => group.id === toGroupId
        );
        const ingr = this.allIngrList.find((ingr) => ingr.id === ingrId);
        toGroup.ingrList.push(ingr);
      }
      if (fromGroupId !== -1) {
        // 削除処理
        const fromGroup = this.groupListEdit.find(
          (group) => group.id === fromGroupId
        );
        fromGroup.ingrList = fromGroup.ingrList.filter(
          (ingr) => ingr.id !== ingrId
        );
      }
    },
    updateGroupEdit({ groupId, entry, newData }) {
      const group = this.groupListEdit.find((elem) => elem.id === groupId);
      if (entry === "name") {
        group.group_name = newData;
      }
    },
    async deleteGroupEdit(groupId) {
      // 編集中しか呼ばれないはずなのでeditからグループを消すだけ
      this.groupListEdit = this.groupListEdit.filter(
        (elem) => elem.id !== groupId
      );
    },
    editGroupList() {
      this.groupListEdit = JSON.parse(JSON.stringify(this.groupList));
    },
    async saveGroupEdit() {
      const addList = [];
      const changeList = [];
      const deleteList = [];
      for (const editData of this.groupListEdit) {
        if (!this.groupList.some((elem) => elem.id === editData.id)) {
          // もともとなかったが今はあるならaddリストに追加
          addList.push(editData);
        } else {
          // 最初も今もあるなら変更があるかを検出し、あるならchangeリストに追加
          const originalData = this.groupList.find(
            (elem) => elem.id === editData.id
          );
          if (originalData.group_name !== editData.group_name) {
            changeList.push(editData);
          } else {
            const originalIngrIdList = originalData.ingrList.map(
              (ingr) => ingr.id
            );
            const editIngrIdList = editData.ingrList.map((ingr) => ingr.id);
            if (
              JSON.stringify(originalIngrIdList) !==
              JSON.stringify(editIngrIdList)
            ) {
              changeList.push(editData);
            }
          }
        }
      }
      for (const originalData of this.groupList) {
        // もともとあるのに今はないものをdeleteリストに追加
        if (!this.groupListEdit.some((elem) => elem.id === originalData.id)) {
          deleteList.push(originalData.id);
        }
      }
      const putList = [...addList, ...changeList];
      if (putList) await this.putGroup(putList);
      if (deleteList.length) await this.deleteGroup(deleteList);
      this.groupListEdit.splice(0);
      this.getGroupList();
    },
    async putGroup(putList) {
      // addとchangeは同時に行える
      console.log(putList);
      const headers = authorizedHeader();
      await standardAccessToAPI(
        axios.put(server_url + `/recipes/${this.recipeId}/groups`, putList, {
          headers,
        }),
        () => {
          // this.getGroupList();
        }
      );
    },
    async deleteGroup(deleteList) {
      console.log("delete");
      console.log(deleteList);
      const headers = authorizedHeader();
      await standardAccessToAPI(
        axios.delete(server_url + `/recipes/${this.recipeId}/groups`, {
          headers,
          data: deleteList,
        }),
        () => {
          // this.getGroupList();
        }
      );
    },
  },
};
</script>

<style>
.ingr-editor__groups {
  display: flex;
  flex-wrap: wrap;
}
.ingr-editor__group-container--add-box {
  border: 1px solid #ddd;
}
</style>

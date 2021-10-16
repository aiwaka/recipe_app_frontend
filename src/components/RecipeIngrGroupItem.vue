<template>
  <!-- レシピコンテンツページでの材料グループリスト全体のブロック -->
  <div
    class="ingr-group-block"
    :class="{ dragover: isDragOver }"
    v-on:dragover.prevent="onDrag('over')"
    v-on:dragleave="onDrag('leave')"
    v-on:drop.stop="dropItem($event, groupId)"
  >
    <div class="group-block__toolbar">
      <div class="group-name" v-if="!changingName">
        {{ groupName }}
      </div>
      <div class="group-name" v-else>
        <input v-model="newGroupName" />
        <button v-on:click.prevent="saveGroupName">決定</button>
      </div>
      <pull-down-menu
        v-if="!allDisabled"
        :menuDisabled="allDisabled"
        ref="menu"
        v-on:menu-closed="changingName = false"
      >
        <pull-down-menu-list v-on:list-clicked="removeGroup">
          このグループを削除する
        </pull-down-menu-list>
        <pull-down-menu-list v-on:list-clicked="changeName">
          このグループの名前を変更する
        </pull-down-menu-list>
      </pull-down-menu>
    </div>
    <div class="item-container">
      <recipe-ingr-item
        v-for="ingr of ingrList"
        :key="ingr.id"
        :editting="editting"
        :ingrData="ingr"
        :groupId="groupId"
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
import PullDownMenu from "./PullDownMenu.vue";
import PullDownMenuList from "./PullDownMenuList.vue";
import RecipeIngrItem from "./RecipeIngrItem.vue";
export default {
  components: { PullDownMenu, PullDownMenuList, RecipeIngrItem },
  props: {
    editting: { type: Number }, // 編集中フラグ
    recipeId: { type: Number },
    groupId: { type: Number },
    groupName: { type: String },
  },
  data() {
    return {
      isDragOver: false,
      changingName: false,
      newGroupName: "",
      ingrList: [],
    };
  },
  created() {
    this.getIngrInGroup();
  },
  computed: {
    allDisabled() {
      return this.editting !== 2;
    },
  },
  methods: {
    onDrag(eventType) {
      // "over"が渡されたときはtrue, それ以外のときはfalseになるようにする.
      this.isDragOver = eventType === "over";
    },
    dropItem(event, toGroupId) {
      // ここでアイテムの位置を更新する処理を書く.
      this.isDragOver = false;
      // recipeIngrBlock内で設定したdataTransferオブジェクトを取得
      const data = JSON.parse(event.dataTransfer.getData("text/plain"));
      const { ingrId, fromGroupId } = data;
      // 送り先idが0か否かで場合分け
      if (toGroupId === 0) {
        if (fromGroupId !== 0) {
          this.$emit("remove-ingr", { fromGroupId, ingrId });
        }
      } else {
        this.$emit("add-ingr", { toGroupId, ingrId });
      }
    },
    closeMenu() {
      this.$refs.menu.close();
    },
    removeGroup() {
      this.closeMenu();
      if (confirm(`'${this.groupName}'を削除してもよろしいですか？`)) {
        this.$emit("delete-group");
      }
    },
    changeName() {
      this.newGroupName = this.groupName;
      this.changingName = true;
    },
    async saveGroupName() {
      if (this.groupName !== this.newGroupName) {
        const modMap = [{ entry: "name", new_data: this.newGroupName }];
        const headers = authorizedHeader();
        await standardAccessToAPI(
          axios.put(server_url + `/groups/${this.groupId}`, modMap, {
            headers,
          }),
          () => {
            this.$emit("update-group");
          }
        );
      }
      this.changingName = false;
      this.closeMenu();
    },
    async getIngrInGroup() {
      const headers = authorizedHeader();
      await standardAccessToAPI(
        axios.get(
          server_url + `/recipes/${this.recipeId}/groups/${this.groupId}`,
          { headers }
        ),
        (result) => {
          this.ingrList = result.data.ingrList;
        }
      );
    },
  },
};
</script>

<style>
.ingr-group-block[aria-disabled] {
  background-color: #aaa;
}
.ingr-group-block {
  border: 1px solid #ddd;
  margin: 0.9rem;
  height: auto;
  min-width: 10rem;
  min-height: 5rem;
  position: relative;
  border-top: 5px solid #555;
}
.ingr-group-block.editting {
  background-color: #eee;
}
.ingr-group-block.dragover {
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.33);
}
.group-block__toolbar {
  display: flex;
  justify-content: space-around;
}
.item-container {
  z-index: 50;
  display: flex;
  flex-wrap: wrap;
}
.group-name {
  margin: 0.2rem auto;
  padding: 0 0.3rem;
}
</style>

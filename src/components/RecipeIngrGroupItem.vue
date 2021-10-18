<template>
  <!-- レシピの材料グループ要素 -->
  <div
    class="ingr-group-block"
    :class="{ dragover: isDragOver }"
    v-on:dragover.prevent="onDrag('over')"
    v-on:dragleave="onDrag('leave')"
    v-on:drop.stop="dropItem($event)"
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
        <pull-down-menu-list v-on:list-clicked="deleteGroup">
          グループを削除
        </pull-down-menu-list>
        <pull-down-menu-list v-on:list-clicked="changeName">
          グループ名を変更
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
import PullDownMenu from "./PullDownMenu.vue";
import PullDownMenuList from "./PullDownMenuList.vue";
import RecipeIngrItem from "./RecipeIngrItem.vue";
export default {
  components: { PullDownMenu, PullDownMenuList, RecipeIngrItem },
  props: {
    editting: { type: Number }, // 編集中フラグ
    recipeId: { type: Number },
    group: { type: Object },
  },
  data() {
    return {
      isDragOver: false,
      changingName: false,
      newGroupName: "",
    };
  },
  created() {},
  computed: {
    allDisabled() {
      return this.editting !== 2;
    },
    groupId() {
      return this.group.id;
    },
    groupName() {
      return this.group.group_name;
    },
    ingrList() {
      return this.group.ingrList;
    },
  },
  methods: {
    onDrag(eventType) {
      // "over"が渡されたときはtrue, それ以外のときはfalseになるようにする.
      this.isDragOver = eventType === "over";
    },
    dropItem(event) {
      // ここでアイテムの位置を更新
      const toGroupId = this.groupId;
      this.isDragOver = false;
      // recipeIngrItem内で設定したdataTransferオブジェクトを取得
      const data = JSON.parse(event.dataTransfer.getData("text/plain"));
      const { ingrId, fromGroupId } = data;
      // このコンポーネントにdropされたはず
      if (fromGroupId !== toGroupId) {
        this.$emit("edit-move-ingr", { fromGroupId, toGroupId, ingrId });
      }
    },
    closeMenu() {
      this.$refs.menu.close();
    },
    deleteGroup() {
      this.closeMenu();
      this.$emit("edit-delete-group");
    },
    changeName() {
      this.newGroupName = this.groupName;
      this.changingName = true;
    },
    async saveGroupName() {
      if (this.groupName !== this.newGroupName) {
        this.$emit("edit-update-group", {
          groupId: this.groupId,
          entry: "name",
          newData: this.newGroupName,
        });
      }
      this.changingName = false;
      this.newGroupName = "";
      this.closeMenu();
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

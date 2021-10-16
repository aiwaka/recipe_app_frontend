<template>
  <div
    class="recipe-ingr-block"
    :draggable="editting === 2"
    v-on:dragstart="dragItem($event, ingrData.id, groupId)"
  >
    <div>{{ ingrData.name }}：{{ ingrData.amount }}</div>
  </div>
</template>

<script>
export default {
  name: "RecipeIngrBlock",
  props: {
    editting: { type: Number },
    ingrData: { type: Object },
    groupId: { type: Number },
  },
  computed: {},
  methods: {
    dragItem(event, ingrId, groupId) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.dropEffect = "move";
      event.dataTransfer.setData(
        "text/plain",
        JSON.stringify({ ingrId, fromGroupId: groupId })
      );
    },
  },
};
</script>

<style>
.recipe-ingr-block {
  border: 1px solid #ddd;
  width: 6rem;
  font-size: 0.8rem;
  margin: 0.3rem 0.5rem;
  padding: 0.1rem 0.6rem;
}
.recipe-ingr-block[draggable*="true"] {
  border: 3px ridge #aaa;
  background-color: #eee;
}
</style>

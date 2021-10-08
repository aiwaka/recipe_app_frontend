<template>
  <!--textを受け取り表示する. changeボタンを押すと編集でき, saveを押すとtext-changedをemitし変更後のデータを返す. オプションでinputTypeを指定するとテキストのバリデーションを設定できる.-->
  <div class="block-with-changer">
    <h3 class="title" v-if="title">{{ title }}</h3>
    <div class="text-space" v-if="show && !foldFlag" v-on:click="textClick">
      {{ text }}
    </div>
    <div class="text-space" v-if="show && foldFlag" v-on:click="textClick">
      {{ viewText }}
    </div>
    <div class="whole-text-container">
      <div class="whole-text" v-if="showWholeText">
        <p>{{ text }}</p>
      </div>
    </div>
    <div v-if="show" class="button-container">
      <button v-on:click.prevent="change">変更</button>
      <button v-on:click.prevent="copyToClipBoard(text)">コピー</button>
      <button v-on:click.prevent="deleteItem">削除</button>
    </div>
    <input
      class="text-input"
      :type="inputType"
      v-if="!show"
      v-model="newText"
    />
    <button v-if="!show" v-on:click.prevent="save">保存</button>
  </div>
</template>

<script>
export default {
  name: "BlockWithChanger",
  data: () => {
    return {
      show: true, // trueのときは変更不可. falseのときはテキストボックス
      showWholeText: false,
      oldText: "",
      newText: "",
    };
  },
  props: {
    title: {
      type: String,
      default: "",
    },
    text: {
      default: "",
    },
    inputType: {
      type: String,
      default: "text",
    },
    updateFunc: {
      type: Function,
      required: true,
    },
    deleteFunc: {
      type: Function,
      required: true,
    },
  },
  computed: {
    foldFlag() {
      return this.text.length > 17;
    },
    viewText() {
      if (this.foldFlag) {
        return this.text.slice(0, 17) + "...";
      } else {
        return "folded";
      }
    },
  },
  methods: {
    change() {
      this.oldText = this.text;
      this.newText = this.text;
      this.show = false;
    },
    cancel() {
      this.show = true;
    },
    save() {
      if (this.newText.length > 300) {
        alert("文字数が多すぎます。300文字以内に収める必要があります。");
        this.show = true;
        return;
      }
      if (this.oldText === this.newText) {
        this.show = true;
        return;
      }
      const modMap = [{ entry: "modified_text", new_data: this.newText }];
      this.updateFunc(modMap);
      this.show = true;
    },
    deleteItem() {
      if (confirm(`'${this.title}'を消去しますか？`)) {
        this.deleteFunc();
      }
    },
    textClick() {
      this.showWholeText = !this.showWholeText;
    },
    copyToClipBoard(text) {
      navigator.clipboard.writeText(text).catch((e) => {
        console.error(e);
      });
    },
  },
};
</script>

<style scoped>
.label {
  font-weight: bold;
}
.block-with-changer {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  height: 11rem;
}
.button-container {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
}
.text-space {
  width: 10rem;
  word-wrap: break-word;
  margin: auto;
}
.text-input {
  width: 10rem;
  margin: auto;
}
button {
  margin: 0.4rem 0.3rem;
  font-size: 0.9rem;
}
.whole-text-container {
  position: relative;
}
.whole-text {
  position: absolute;
  top: 1rem;
  left: -8rem;

  padding: 0.6rem 1rem;
  width: 16rem;
  word-wrap: break-word;
  color: inherit;
  background: #babb9d;
}
.whole-text:before {
  content: "";
  position: absolute;
  top: -3rem;
  left: 50%;
  margin-left: -15px;
  border: 15px solid transparent;
  border-bottom: 15px solid #babb9d;
}
.whole-text p {
  margin: 0;
  padding: 0;
}
</style>

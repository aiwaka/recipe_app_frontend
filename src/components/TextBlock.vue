<template>
  <!--textを受け取り表示する. changeボタンを押すと編集でき, saveを押すとtext-changedをemitし変更後のデータを返す. オプションでinputTypeを指定するとテキストのバリデーションを設定できる.-->
  <div class="block-with-changer">
    <template v-if="show">
      <h3 class="title">{{ title }}</h3>
      <div class="text-space" v-if="!foldFlag" v-on:click="textClick">
        <p v-if="!foldFlag">{{ text }}</p>
        <p v-else>{{ viewText }}</p>
      </div>
      <div class="whole-text-container">
        <div class="whole-text" v-if="showWholeText">
          <p>{{ text }}</p>
        </div>
      </div>
      <div class="button-container">
        <button v-on:click.prevent="change">変更</button>
        <button v-on:click.prevent="copyToClipBoard(text)">コピー</button>
        <button v-on:click.prevent="deleteItem">削除</button>
      </div>
    </template>
    <template v-else>
      <h3><input class="title-input" type="text" v-model="newTitle" /></h3>
      <input class="text-input" :type="inputType" v-model="newText" />
      <div class="button-container">
        <button v-on:click.prevent="save">保存</button>
        <button v-on:click.prevent="cancel">キャンセル</button>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: "BlockWithChanger",
  data: () => {
    return {
      show: true, // trueのときは変更不可. falseのときはテキストボックス
      showWholeText: false,
      oldTitle: "",
      newTitle: "",
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
      // 決めておいた文字数を超えたら省略する.
      return this.text.length > 200;
    },
    viewText() {
      if (this.foldFlag) {
        return this.text.slice(0, 200) + "...";
      } else {
        return "folded";
      }
    },
  },
  methods: {
    change() {
      this.oldTitle = this.title;
      this.newTitle = this.title;
      this.oldText = this.text;
      this.newText = this.text;
      this.show = false;
    },
    cancel() {
      this.show = true;
    },
    save() {
      if (this.newText.length > 300) {
        alert("本文の文字数が多すぎます。300文字以内に収める必要があります。");
        return;
      }
      if (this.newTitle.length > 50) {
        alert(
          "タイトルの文字数が多すぎます。50文字以内に収める必要があります。"
        );
        return;
      }
      const modMap = [];
      if (this.oldTitle !== this.newTitle) {
        modMap.push({ entry: "title", new_data: this.newTitle });
      }
      if (this.oldText !== this.newText) {
        modMap.push({ entry: "modified_text", new_data: this.newText });
      }
      if (!modMap.length) {
        this.show = true;
        return;
      }
      this.updateFunc(modMap);
      this.show = true;
    },
    deleteItem() {
      if (confirm(`'${this.title}'を消去しますか？`)) {
        this.deleteFunc();
      }
    },
    textClick() {
      if (this.foldFlag) {
        this.showWholeText = !this.showWholeText;
      }
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

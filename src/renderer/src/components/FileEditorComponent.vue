<template>
  <div>
    <InkMde v-model="markdown" :options="inkOptions" style="background-color: #18181b" />
  </div>
</template>

<script>
import InkMde from 'ink-mde/vue'
import { reactive } from 'vue'

export default {
  name: 'FileEditorComponent',
  components: {
    InkMde
  },

  props: {
    text: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const markdown = props.text

    const inkOptions = reactive({
      interface: {
        appearance: 'dark',
        toolbar: true
      },
      toolbar: {
        bold: true,
        code: false,
        codeBlock: true,
        heading: true,
        image: false,
        italic: false,
        link: false,
        list: true,
        orderedList: false,
        quote: true,
        taskList: true,
        upload: true
      }
    })
    return {
      markdown,
      inkOptions
    }
  }
}
</script>

<style lang="css" scoped></style>

<!-- interface Options {
    doc?: string;
    files?: Partial<Options.Files>;
    hooks?: Partial<Options.Hooks>;
    interface?: Partial<Options.Interface>;
    katex?: boolean;
    keybindings?: {
        shiftTab?: boolean;
        tab?: boolean;
    };
    placeholder?: string;
    plugins?: Options.RecursivePlugin[];
    readability?: boolean;
    search?: boolean;
    selections?: Editor.Selection[];
    toolbar?: Partial<Options.Toolbar>;
    trapTab?: boolean;
    vim?: boolean;
} -->

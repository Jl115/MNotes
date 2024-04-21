<template>
  <p v-if="folderName" class="sidebar-title">{{ folderName }}</p>
  <Tree
    ref="sidebar"
    class="sidebar"
    style="width: 100%"
    :value="treeValue"
    selection-mode="single"
    @node-select="onNodeSelect"
    @node-expand="onNodeExpand"
  >
    <template #node="{ node }">
      <div class="file-entry">{{ node.label }}</div>
    </template>
  </Tree>
</template>
<script>
//* VUE
import { ref, computed, onMounted } from 'vue'

//* COMPOSABLES

//* GRAPHQL

//* VUELIDATE

//* CUSTOM

//* COMPONENTS

//* CONTROLLERS

export default {
  name: 'SideBarComponent',
  props: {
    folderTitle: {
      type: String,
      default: ''
    },
    treeData: {
      type: Array,
      default: () => []
    }
  },
  emits: ['isEditing', 'getFileData', 'fileData'],

  setup(props, { emit }) {
    const selectedFolder = ref('')
    const folderName = computed(() => props.folderTitle)
    const treeValue = computed(() => props.treeData)
    //* EMITS

    //* QUERYS

    //* COMPUTED

    //* METHODS
    const onNodeSelect = async (node) => {
      let tempCheck = node.key
      let regPattern = new RegExp('\\.\\w+$')
      if (regPattern.test(tempCheck)) {
        await getFileData(tempCheck)
      } else {
        console.log('\x1b[33m%s\x1b[0m', 'Folder --------------------', node)
      }

      selectedFolder.value = node.label
      console.log('%cSelected node:', 'color: blue;', node)
    }

    const onNodeExpand = async (node) => {
      if (!node.children || node.children.length === 0) {
        window.electronAPI.send('load-directory-children', node.data) // Assuming 'node.data' holds the directory path
      }
    }
    const getFileData = async (path) => {
      // eslint-disable-next-line no-async-promise-executor
      new Promise((resolve) => {
        console.log('\x1b[33m%s\x1b[0m', 'getIngFileData --------------------', path)
        window.electronAPI.send('read-file', path)
        return resolve
      })
    }
    //* MOUNTED
    onMounted(() => {
      window.electronAPI.receive('file-contents', (content) => {
        console.log('\x1b[33m%s\x1b[0m', 'file-read --------------------', content)
        console.log('\x1b[33m%s\x1b[0m', 'data --------------------', content.content)
        emit('fileData', content.content)
        emit('isEditing', true)
      })
    })
    //* CREATED

    //* RETURN
    return {
      //* VARIABLES
      selectedFolder,
      folderName,
      treeValue,
      //* COMPUTED
      //* METHODS
      onNodeSelect,
      onNodeExpand,
      getFileData
    }
  }
}
</script>
<style lang="scss" scoped>
.sidebar {
  overflow: hidden;
  height: 100vh;
  width: auto;
  min-width: 115px;
  display: flex;
  flex-direction: column;
  align-items: center;
  .sidebar-title {
    width: 100%;
    background-color: #18181b;
    text-align: center;
  }
}
</style>

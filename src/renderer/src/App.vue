<template>
  <div class="app">
    <div ref="sidebar" class="sidebar">
      <SideBarComponent
        :tree-data="treeData"
        :folder-title="folderTitle"
        @is-editing="toggleEditing"
        @file-data="sendText"
      />
    </div>
    <div class="separator" @mousedown="startResize">
      <div
        style="
          height: 50px;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
        "
      >
        <p class="dots">.</p>
        <p class="dots">.</p>
        <p class="dots">.</p>
      </div>
    </div>
    <div class="content">
      <!-- Other content here -->
      <button v-if="!isEditing" @click="openDirectoryFolder">Open Directory</button>
      <FileEditorComponent v-else style="height: 100%" :text="markdown"></FileEditorComponent>
    </div>
  </div>
</template>
<script>
import { ref, onMounted } from 'vue'
import SideBarComponent from './components/SideBarComponent.vue'
import FileEditorComponent from './components/FileEditorComponent.vue'

export default {
  components: {
    SideBarComponent,
    FileEditorComponent
  },
  setup() {
    const sidebar = ref(null)
    let startX, startWidth
    const folderTitle = ref('')
    const isEditing = ref(false)
    const markdown = ref('')

    const startResize = (event) => {
      // Prevent default dragging of selected content
      event.preventDefault()
      startX = event.clientX
      startWidth = sidebar.value.offsetWidth
      document.addEventListener('mousemove', resize)
      document.addEventListener('mouseup', stopResize)
    }

    const resize = (event) => {
      const currentX = event.clientX
      const widthDiff = startX - currentX
      const width = startWidth - widthDiff // Subtract the difference for left side resizing
      sidebar.value.style.width = `${width}px`
    }

    const stopResize = () => {
      document.removeEventListener('mousemove', resize)
      document.removeEventListener('mouseup', stopResize)
    }

    // Tree data setup
    const visible = ref(true)
    const treeData = ref([])

    const openDirectoryFolder = () => {
      window.electronAPI.send('open-directory-dialog')
    }

    onMounted(() => {
      window.electronAPI.send('load-directory-children', localStorage.getItem('folderName')) // Load the root directory
      window.electronAPI.receive('directory-contents', (newFiles) => {
        console.log('\x1b[33m%s\x1b[0m', 'hi --------------------')
        console.log('\x1b[33m%s\x1b[0m', 'newFiles --------------------', newFiles)
        treeData.value = [newFiles] // Assuming the data is already formatted correctly
        localStorage.setItem('folderName', newFiles.path)
        folderTitle.value = newFiles.path.split('/').pop()
      })

      window.electronAPI.receive('directory-read-error', (error) => {
        console.error('Failed to read directory:', error)
      })

      window.electronAPI.receive('loaded-directory-children', (path, children) => {
        const node = findNodeByPath(treeData.value, path)
        if (node) {
          node.children = [...children] // Ensure reactivity
        }
      })
    })

    function findNodeByPath(nodes, path) {
      for (let node of nodes) {
        if (node.data === path) {
          return node
        }
        if (node.children) {
          const found = findNodeByPath(node.children, path)
          if (found) return found
        }
      }
      return null
    }
    const toggleEditing = () => {
      isEditing.value = !isEditing.value
    }
    const sendText = (text) => {
      console.log('\x1b[33m%s\x1b[0m', 'text --------------------', text)
      markdown.value = text
    }

    return {
      visible,
      treeData,
      isEditing,
      markdown,
      folderTitle,
      openDirectoryFolder,
      sidebar,
      startResize,
      toggleEditing,
      sendText
    }
  }
}
</script>

<style lang="scss" scoped>
.app {
  display: flex; /* Changed to flexbox layout */
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.separator {
  cursor: ew-resize;
  background-color: #0a0a0a;
  width: 5px;
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  & .dots {
    padding: 0;
    margin: 0;
    height: 6px;
  }
}

.content {
  flex-grow: 1; /* Takes up the remaining space */
  overflow: auto;
  min-width: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.file-entry {
  margin: 5px 0;
  padding: 5px;
  background-color: aliceblue;
}
</style>

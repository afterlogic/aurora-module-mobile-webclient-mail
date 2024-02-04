<template>
  <component
    :is="currentComponent"

    v-model="isShowDialog"
    :dialog="isShowDialog"

    @closeDialog="closeDialog"
    @dialogAction="dialogAction"
  />
  <!-- <FileUploader /> -->
</template>

<script>
import { mapGetters, mapActions } from 'pinia'
import { useMailStore } from '../store/index-pinia'

import _ from 'lodash'

// import FileUploader from './dialogs/FileUploader'
// import CreateFolderDialog from './dialogs/CreateFolderDialog'
import DeleteMessageDialog from './dialogs/DeleteMessageDialog'

export default {
  name: 'DialogsList',

  components: {
    DeleteMessageDialog,
  //   FileUploader, 
  //   CreateFolderDialog,
  },

  data() {
    return {
      isShowDialog: false,
      currentComponent: null,
    }
  },

  computed: {
    ...mapGetters(useMailStore, ['dialogComponent']),
  },

  watch: {
    dialogComponent(value) {
      if (value && value?.component !== 'FileUploader') {
        if (value?.getComponent) {
          this.currentComponent = value.getComponent()
          this.isShowDialog = true
        } else if (value?.component) {
          this.currentComponent = value.component
          this.isShowDialog = true
        } else {
          this.isShowDialog = false
        }
      }
    },
    isShowDialog(v) {
      if (!v && this.dialogComponent?.component === 'CreateButtonsDialogs')
        this.changeDialogComponent(null)
    },
  },

  methods: {
    ...mapActions(useMailStore, [
      'changeDialogComponent'
    ]),
    dialogAction(action) {
      this.closeDialog()
      if (action.getComponent) {
        this.changeDialogComponent({ getComponent: action.getComponent})
      } else if (action.component) {
        this.changeDialogComponent({ component: action.component, name: action.name })
      } else if (action.method) {
        action.method(this)
      }
    },
    closeDialog(hasChanges) {
      if (typeof hasChanges === 'function' && hasChanges()) {
        this.$root.unsavedChangesDialog(() => this.isShowDialog = false)
      } else {
        this.isShowDialog = false
      }
    },
  },
}
</script>

<template>
  <q-item :style="indent" class="q-pb-lg" dense :active="selected" clickable v-ripple @click.prevent="selectFolder">
    <q-item-section avatar>
      <folder-icon />
    </q-item-section>
    <q-item-section>
      <q-item-label class="text-subtitle1 text-size" :class="selected ? 'text-bold' : ''">{{ folder.name }}</q-item-label>
    </q-item-section>
  </q-item>
  <folder-item v-for="subFolder in folder.subFolders" :key="subFolder.fullName"
               :folder="subFolder" :selected="currentFolderFullName === subFolder.fullName" :level="level + 1" />
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

import eventBus from 'src/event-bus'

import FolderIcon from '../icons/FolderIcon'

export default {
  name: 'FolderItem',

  components: {
    FolderIcon,
  },

  props: {
    folder: { type: Object, default: null },
    selected: { type: Boolean, default: false },
    level: { type: Number, default: 0 },
  },

  computed: {
    ...mapGetters('mailmobile', [
      'currentFolder',
    ]),

    currentFolderFullName () {
      return this.currentFolder && this.currentFolder.fullName || ''
    },

    indent() {
      return { transform: `translate(${this.level * 20}px)` }
    },
  },

  methods: {
    ...mapActions('mailmobile', [
      'changeCurrentFolder',
    ]),

    async selectFolder() {
      this.changeCurrentFolder(this.folder)
      eventBus.$emit('closeDrawer')
    },
  },
}
</script>
<style scoped>
.text-size {
  font-size: 14px;
}
</style>
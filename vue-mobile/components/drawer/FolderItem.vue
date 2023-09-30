<template>
  <q-item class="folder" dense :active="isFolderSelected" clickable v-ripple @click="selectFolder">
    <q-item-section class="folder-indent" :style="indent" side></q-item-section>
    <q-item-section side>
      <FolderIcon :folderType="folder.type" :color="isFolderSelected ? '#469CF8' : '#969494'" />
    </q-item-section>
    <q-item-section class="folder-name">
      {{ folder.name }}
    </q-item-section>
    <q-item-section side v-if="folder.unseenCount" clickable @click.stop="showUnseenMessages">
      <div class="folder-counter">{{ folder.unseenCount }}</div>
    </q-item-section>
  </q-item>
  <FolderItem v-for="subFolder in folder.subFolders" :key="subFolder.fullName" :folder="subFolder" :level="level + 1" />
</template>

<script>
import { mapGetters } from 'pinia'
import { useMailStore } from '../../store/index-pinia'

import eventBus from 'src/event-bus'

import FolderIcon from '../FolderIcon'

export default {
  name: 'FolderItem',

  components: {
    FolderIcon,
  },

  props: {
    folder: { type: Object, default: null },
    level: { type: Number, default: 0 },
  },

  computed: {
    ...mapGetters(useMailStore, ['currentAccountId', 'isUnifiedInbox', 'currentFoldersDelimiter', 'currentFolder']),

    isFolderSelected() {
      const currentFolderFullName = (this.currentFolder && this.currentFolder.fullName) || ''
      return !this.isUnifiedInbox && this.folder.fullName === currentFolderFullName
    },

    indent() {
      return { width: `${this.level * 16}px` }
    },
  },

  methods: {
    selectFolder() {
      this.$router.push({
        name: 'message-list',
        params: {
          accountId: this.currentAccountId,
          folderPath: this.folder.fullName.split(this.currentFoldersDelimiter),
        },
      })
      eventBus.$emit('closeDrawer')
    },

    showUnseenMessages() {
      this.$router.push({
        name: 'message-list-filter',
        params: {
          accountId: this.currentAccountId,
          folderPath: this.folder.fullName.split(this.currentFoldersDelimiter),
          filter: 'unseen',
        },
      })
      eventBus.$emit('closeDrawer')
    },
  },
}
</script>
<style lang="scss" scoped>
.folder {
  height: 44px;
  padding: 0 24px;

  &.q-item--active {
    color: #469cf8;

    .folder-counter {
      background-color: #469cf8;
    }
  }
  &-name {
    font-size: 14px;
  }
  &-counter {
    color: #fff;
    border-radius: 100px;
    background-color: #969494;
    height: 24px;
    min-width: 24px;
    padding: 0px 10px;
    display: flex;
    align-items: center;
  }

  &-indent {
    padding: 0px;
  }
}
</style>

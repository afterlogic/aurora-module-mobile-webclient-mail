<template>
  <q-item
    data-test-id="mail-unified-inbox"
    class="folder"
    dense
    :active="isUnifiedInbox"
    clickable
    v-ripple
    @click="selectUnifiedInbox"
  >
    <div class="folder-indent" :style="indent"></div>
    <div class="folder-icon">
      <FolderIcon :folderType="folderType" :color="selected ? '#469CF8' : '#969494'" />
    </div>
    <div class="folder-name">{{ $t('MAILWEBCLIENT.LABEL_FOLDER_ALL_INBOXES') }}</div>
    <div class="folder-meta" v-if="unifiedInboxUnseenCount" @click.stop="showUnseenMessages">
      <div data-test-id="mail-folder-unseen-count" class="folder-counter">{{ unifiedInboxUnseenCount }}</div>
    </div>
  </q-item>
</template>

<script>
import { mapState, mapGetters } from 'pinia'
import { useMailStore } from '../../store/index-pinia'

import eventBus from 'src/event-bus'

import { FOLDER_TYPES } from '../../enums'

import FolderIcon from '../FolderIcon'

export default {
  name: 'UnifiedInboxesItem',

  components: {
    FolderIcon,
  },

  props: {
    folder: { type: Object, default: null },
    selected: { type: Boolean, default: false },
    level: { type: Number, default: 0 },
  },

  data() {
    return {
      folderType: FOLDER_TYPES.ALL,
    }
  },

  computed: {
    ...mapState(useMailStore, ['currentAccountId', 'isUnifiedInbox']),
    ...mapGetters(useMailStore, ['unifiedInboxUnseenCount']),

    indent() {
      return { width: `${this.level * 16}px` }
    },
  },

  methods: {
    selectUnifiedInbox() {
      this.$router.push({ name: 'message-list-unified' })
      eventBus.$emit('closeDrawer')
    },

    showUnseenMessages() {
      this.$router.push({ name: 'message-list-unified-filter', params: { filter: 'unseen' } })
      eventBus.$emit('closeDrawer')
    },
  },
}
</script>
<style lang="scss" scoped>
.folder {
  height: 44px;
  display: grid;
  grid-template-columns: auto auto minmax(0, 1fr) auto;
  align-items: center;
  width: 100%;
  max-width: 100%;
  padding: 0 24px;
  box-sizing: border-box;
  min-width: 0;
  overflow: hidden;

  &.q-item--active {
    color: #469cf8;

    .folder-counter {
      background-color: #469cf8;
    }
  }
  &-name {
    font-size: 14px;
    min-width: 0;
    max-width: 100%;
    overflow: hidden;
    white-space: nowrap;
    mask-image: linear-gradient(to right, #000 0, #000 calc(100% - 12px), transparent 100%);
    mask-repeat: no-repeat;
    mask-size: 100% 100%;
    -webkit-mask-image: linear-gradient(to right, #000 0, #000 calc(100% - 12px), transparent 100%);
    -webkit-mask-repeat: no-repeat;
    -webkit-mask-size: 100% 100%;
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
    flex-shrink: 0;
  }

  &-indent {
    padding: 0px;
  }

  &-icon {
    padding: 0 16px 0 0;
  }

  &-meta {
    padding-left: 12px;
  }
}
</style>

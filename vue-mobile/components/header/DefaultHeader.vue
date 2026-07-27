<template>
  <q-toolbar class="app-header">
    <div class="col app-header__left">
      <AppHeaderButton
        data-test-id="mail-folder-menu"
        icon="menu"
        @click="openDrawer"
      />
    </div>

    <div class="col app-header__title">
      <span class="app-header__title-main" v-t="'MAILWEBCLIENT.HEADING_BROWSER_TAB'" />
      <span
        class="app-header__title-secondary"
        data-test-id="mail-folder-name"
      >
        {{ folderName }}
      </span>
    </div>

    <div class="col app-header__right">
      <AppHeaderButton
        data-test-id="mail-search"
        icon="search"
        @click="showSearchHeader"
      />
    </div>
  </q-toolbar>
</template>

<script>
import eventBus from 'src/event-bus'
import AppHeaderButton from 'src/components/common/AppHeaderButton'

export default {
  name: 'DefaultHeader',

  components: {
    AppHeaderButton,
  },

  emits: ['openSearch'],

  props: {
    folderName: {
      type: String,
      default: '',
    },
  },

  methods: {
    showSearchHeader() {
      this.$emit('openSearch')
    },

    openDrawer() {
      eventBus.$emit('openDrawer')
    },
  },
}
</script>

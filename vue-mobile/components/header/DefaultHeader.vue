<template>
  <q-toolbar class="app-header">
    <div class="col app-header__left">
      <q-btn icon="menu" @click="openDrawer" color="black" flat round dense />
    </div>

    <div class="col app-header__title">
      <span class="app-header__title-main" v-t="'MAILWEBCLIENT.HEADING_BROWSER_TAB'" />
      <span class="app-header__title-secondary">
        {{ folderName }}
      </span>
    </div>

    <div class="col app-header__right">
      <q-btn icon="search" @click="showSearchHeader" color="black" flat round dense />
    </div>
  </q-toolbar>
</template>

<script>
import eventBus from 'src/event-bus'

export default {
  name: 'DefaultHeader',

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

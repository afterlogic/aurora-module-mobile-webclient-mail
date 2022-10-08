<template>
  <q-toolbar class="app-header justify-between">
    <div class="col">
      <q-btn icon="menu" @click="$emit('openDrawer')" color="black" flat round dense />
    </div>

    <div class="col flex column">
      <span class="header-title text-black text-center">
        {{ $t('MAILWEBCLIENT.HEADING_BROWSER_TAB') }}
      </span>
      <span style="margin-top: 5px" class="text-center header-caption">
        {{ folderName }}
      </span>
    </div>

    <div class="col">
      <q-btn icon="search" @click="showSearchHeader" color="black" flat round dense />
    </div>
  </q-toolbar>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'MailHeader',

  computed: {
    ...mapGetters('mailmobile', ['currentFolder']),
    folderName() {
      return this.currentFolder?.name || ''
    },
  },

  methods: {
    ...mapActions('mailmobile', ['changeCurrentHeader']),
    showSearchHeader() {
      this.changeCurrentHeader('SearchHeader')
    },
  },
}
</script>

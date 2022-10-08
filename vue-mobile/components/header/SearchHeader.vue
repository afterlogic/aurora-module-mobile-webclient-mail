<template>
  <div>
    <q-toolbar class="app-header search-toolbar">
      <div class="col">
        <q-btn icon="close" @click="onCloseSearch" color="black" round flat dense />
      </div>
      <div class="col flex column text-center text-black search">
        <span class="header-title">
          {{ $t('CONTACTSMOBILEWEBCLIENT.LABEL_SEARCH') }}
        </span>
        <span class="header-caption" style="margin-top: 5px">
          {{ storageName }}
        </span>
      </div>
    </q-toolbar>
    <q-toolbar class="col flex row search-toolbar-input">
      <q-input
        v-model="text"
        :style="{ height: '48px' }"
        :input-style="{ height: '48px' }"
        :placeholder="$t('CONTACTSMOBILEWEBCLIENT.LABEL_SEARCH')"
        autofocus
        borderless
        outlined
        class="col-12 q-px-md search"
        debounce="400"
      />
    </q-toolbar>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'SearchHeader',

  data() {
    return {
      text: '',
    }
  },

  computed: {
    ...mapGetters('mailmobile', [
      'currentFolder',
      'searchText'
    ]),
    storageName() {
      return this.currentFolder.name || ''
    },
  },
  mounted() {
    this.text = this.searchText
  },

  watch: {
    text() {
      this.search()
    }
  },

  methods: {
    ...mapActions('contactsmobile', [
      'asyncGetContacts',
      'changeCurrentHeader',
      'changeSearchText'
    ]),
    async search() {
      this.changeSearchText(this.text)
      await this.asyncGetContacts()
    },
    async onCloseSearch() {
      this.changeSearchText('')
      this.changeCurrentHeader('')
      await this.asyncGetContacts()
    },
  },
}
</script>

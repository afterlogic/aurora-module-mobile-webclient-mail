<template>
  <div>
    <q-toolbar class="app-header search-toolbar">
      <div class="col app-header__left">
        <AppHeaderButton
          data-test-id="mail-search-close"
          icon="close"
          @click="closeSearch"
        />
      </div>
      <div class="col app-header__title">
        <span class="app-header__title-main" v-t="'COREMOBILEWEBCLIENT.LABEL_SEARCH'" />
        <span class="app-header__title-secondary">
          {{ folderName }}
        </span>
      </div>
      <div class="col app-header__right"></div>
    </q-toolbar>
    <q-toolbar class="search-toolbar__field">
      <q-input
        data-test-id="mail-search-input"
        v-model="searchText"
        :placeholder="$t('COREMOBILEWEBCLIENT.LABEL_SEARCH')"
        autofocus
        borderless
        outlined
        dense
        class="search-toolbar__input"
        debounce="400"
      />
    </q-toolbar>
    <q-toolbar>
      <AppHeaderButton
        data-test-id="mail-search-advanced"
        variant="text"
        color="blue"
        class="q-mx-auto"
        :label="$t('MAILWEBCLIENT.ACTION_OPEN_ADVANCED_SEARCH')"
        @click="openAdvancedSearch"
      />
      <AdvancedSearchDialog
        v-model="showAdvancedSearch"
        :defaultSearchText="searchText"
        @close="closeAdvancedSearch"
        @search="setSearchText"
      />
    </q-toolbar>
  </div>
</template>

<script>
import AdvancedSearchDialog from '../dialogs/AdvancedSearchDialog'
import AppHeaderButton from 'src/components/common/AppHeaderButton'

export default {
  name: 'SearchHeader',

  emits: ['updateSearchText', 'closeSearch'],

  components: {
    AdvancedSearchDialog,
    AppHeaderButton,
  },

  props: {
    folderName: {
      type: String,
      default: '',
    },
    defaultSearchText: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      searchText: this.defaultSearchText,
      showAdvancedSearch: false,
    }
  },

  watch: {
    searchText() {
      this.$emit('updateSearchText', this.searchText)
    },
  },

  methods: {
    closeSearch() {
      this.$emit('closeSearch')
    },

    openAdvancedSearch() {
      this.showAdvancedSearch = true
    },

    closeAdvancedSearch() {
      this.showAdvancedSearch = false
    },

    setSearchText(searchText) {
      if (typeof searchText === 'string' && searchText !== this.searchText) {
        if (searchText === '') {
          this.closeSearch()
        } else {
          this.searchText = searchText
        }
      }
      this.showAdvancedSearch = false
    },
  },
}
</script>

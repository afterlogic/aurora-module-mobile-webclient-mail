<template>
  <AppDialog v-bind="$attrs" :close="close" @show="applyDefaultSearchText">
    <template v-slot:content>
      <div class="dialog__title-text q-mx-lg q-mb-md">
        {{ $t('MAILWEBCLIENT.ACTION_OPEN_ADVANCED_SEARCH') }}
      </div>
      <div class="q-mx-lg">
        <q-input v-model="fromInput" autocomplete="nope" :placeholder="$t('MAILWEBCLIENT.LABEL_FROM')" autofocus />
        <q-input v-model="toInput" autocomplete="nope" :placeholder="$t('MAILWEBCLIENT.LABEL_TO')" />
        <q-input v-model="subjectInput" autocomplete="nope" :placeholder="$t('MAILWEBCLIENT.LABEL_SUBJECT')" />
        <q-input v-model="textInput" autocomplete="nope" :placeholder="$t('MAILWEBCLIENT.LABEL_TEXT')" />
        <div class="flex no-wrap justify-between">
          <SearchDate :label="$t('MAILWEBCLIENT.LABEL_SINCE')" :defaultDate="sinceDate" @setDate="setSinceDate" />
          <div style="width: 60px"></div>
          <SearchDate :label="$t('MAILWEBCLIENT.LABEL_TILL')" :defaultDate="tillDate" @setDate="setTillDate" />
        </div>
        <AppCheckbox leftLabel v-model="hasAttachments" :label="$t('MAILWEBCLIENT.LABEL_HAS_ATTACHMENTS')" />
        <q-select
          :clearable="false"
          v-model="searchIn"
          :options="searchInOptions"
          stack-label
          emit-value
          map-options
          :label="$t('MAILWEBCLIENT.LABEL_SEARCH_IN')"
          behavior="menu"
        >
        </q-select>
      </div>
    </template>
    <template v-slot:actions>
      <ButtonDialog class="q-ma-sm" :action="search" :label="$t('COREWEBCLIENT.ACTION_SEARCH')" />
    </template>
  </AppDialog>
</template>

<script>
import AppDialog from 'src/components/common/AppDialog'
import ButtonDialog from 'src/components/common/ButtonDialog'
import AppCheckbox from 'src/components/common/AppCheckbox'
import SearchDate from './SearchDate'

export default {
  name: 'AdvancedSearchDialog',

  components: {
    AppDialog,
    ButtonDialog,
    AppCheckbox,
    SearchDate,
  },

  props: {
    defaultSearchText: { type: String, default: '' },
  },

  data() {
    return {
      fromInput: '',
      toInput: '',
      subjectInput: '',
      textInput: '',
      sinceDate: '',
      tillDate: '',
      hasAttachments: false,
      searchIn: '',
    }
  },

  computed: {
    searchInOptions() {
      return [
        { value: '', label: this.$t('MAILWEBCLIENT.LABEL_SEARCH_CURRENT_FOLDER') },
        { value: 'folders:sub', label: this.$t('MAILWEBCLIENT.LABEL_SEARCH_CURRENT_FOLDER_AND_SUBFOLDERS') },
        { value: 'folders:all', label: this.$t('MAILWEBCLIENT.LABEL_SEARCH_ALL_FOLDERS') },
      ]
    },
  },

  methods: {
    close() {
      this.$emit('close')
    },

    search() {
      const getSearchPart = (name, value) => {
        if (value === '') {
          return ''
        }
        if (value.indexOf(' ') !== -1) {
          return `${name}:"${value}"`
        }
        return `${name}:${value}`
      }
      const hasDatePart = this.sinceDate !== '' || this.tillDate !== ''
      const searchParts = [
        getSearchPart('from', this.fromInput),
        getSearchPart('to', this.toInput),
        getSearchPart('subject', this.subjectInput),
        getSearchPart('text', this.textInput),
        hasDatePart ? `date:${this.sinceDate}/${this.tillDate}` : '',
        this.hasAttachments ? 'has:attachments' : '',
        this.searchIn,
      ].filter((searchPart) => searchPart)
      this.$emit('search', searchParts.join(' '))
    },

    setSinceDate(sinceDate) {
      this.sinceDate = sinceDate
    },

    setTillDate(tillDate) {
      this.tillDate = tillDate
    },

    applyDefaultSearchText() {
      this.fromInput = ''
      this.toInput = ''
      this.subjectInput = ''
      this.textInput = ''
      this.sinceDate = ''
      this.tillDate = ''
      this.hasAttachments = false
      this.searchIn = ''
      const regex = /(\w+):("[^\"]+"|[^\s]+)/gm
      let m
      while ((m = regex.exec(this.defaultSearchText)) !== null) {
        if (m.index === regex.lastIndex) {
          regex.lastIndex++
        }
        if (m.length === 3) {
          const [part, name, value] = m
          switch (name) {
            case 'from':
              this.fromInput = value.replace(/^"|"$/g, '')
              break
            case 'to':
              this.toInput = value.replace(/^"|"$/g, '')
              break
            case 'subject':
              this.subjectInput = value.replace(/^"|"$/g, '')
              break
            case 'text':
              this.textInput = value.replace(/^"|"$/g, '')
              break
            case 'date':
              const dateParts = value.split('/')
              if (dateParts.length === 2) {
                this.sinceDate = dateParts[0]
                this.tillDate = dateParts[1]
              }
              break
            case 'has':
              this.hasAttachments = part === 'has:attachments'
              break
            case 'folders':
              this.searchIn = part
              break
          }
        }
      }
    },
  },
}
</script>

<style scoped></style>

<template>
  <q-input v-model="date" mask="####.##.##" :label="label">
    <q-popup-proxy v-model="showDatePopup">
      <q-date v-model="dateInPopup" mask="YYYY.MM.DD" :options="dateOptions">
        <div class="row items-center justify-end">
          <q-btn
            v-close-popup
            :label="$t('COREWEBCLIENT.ACTION_REMOVE')"
            @click="removeDate"
            color="primary"
            flat
          ></q-btn>
          <q-btn v-close-popup :label="$t('COREWEBCLIENT.ACTION_CANCEL')" color="primary" flat></q-btn>
        </div>
      </q-date>
    </q-popup-proxy>
  </q-input>
</template>

<script>
import moment from 'moment'

export default {
  name: 'SearchDate',

  props: {
    label: {
      type: String,
      default: '',
    },
    defaultDate: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      date: this.defaultDate,
      dateInPopup: this.defaultDate,
      showDatePopup: false,
    }
  },

  watch: {
    defaultDate() {
      this.date = this.defaultDate
    },

    dateInPopup() {
      this.$emit('setDate', this.dateInPopup)
      this.showDatePopup = false
    },
  },

  methods: {
    removeDate() {
      this.dateInPopup = ''
    },

    dateOptions(date) {
      return date <= moment().format('YYYY/MM/DD')
    },
  },
}
</script>

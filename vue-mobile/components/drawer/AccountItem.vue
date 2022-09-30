<template>
  <q-item class="q-mb-md" dense :active="selected" clickable v-ripple @click.prevent="selectStorage">
    <q-item-section>
      <q-item-label>{{ accountEmail }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script>
import { mapActions } from 'vuex'

import eventBus from 'src/event-bus'

export default {
  name: 'AccountItem',

  props: {
    account: { type: Object, default: null },
    selected: { type: Boolean, default: false },
  },

  computed: {
    accountEmail () {
      if (this.account) {
        return this.account.email || this.account.id
      }
      return ''
    }
  },

  methods: {
    ...mapActions('mailmobile', [
      'changeCurrentAccount',
    ]),

    async selectStorage() {
      this.changeCurrentAccount(this.account)
      eventBus.$emit('closeDrawer')
    },
  },
}
</script>

<style lang="scss" scoped>
</style>

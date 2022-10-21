<template>
  <q-item class="q-mb-md" dense :active="selected" clickable v-ripple @click.prevent="selectStorage">
    <q-item-section>
      <q-item-label>{{ accountEmail }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script>
import eventBus from 'src/event-bus'

export default {
  name: 'AccountItem',

  props: {
    account: { type: Object, default: null },
    selected: { type: Boolean, default: false },
  },

  computed: {
    accountEmail() {
      if (this.account) {
        return this.account.email || this.account.id
      }
      return ''
    },
  },

  methods: {
    async selectStorage() {
      this.$router.push(`/mail/${this.account.id}/INBOX/`)
      eventBus.$emit('closeDrawer')
    },
  },
}
</script>

<style lang="scss" scoped></style>

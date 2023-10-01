<template>
  <q-toolbar class="app-header">
    <div class="col app-header__left">
      <q-btn @click="resetSelection" icon="close" color="black" flat round dense />
    </div>

    <div class="col app-header__title">
      {{ `Selected: ${items.length}` }}
    </div>
    
    <div class="col app-header__right">
      <ActionIcon
          class="q-mr-md"
          color="black"
          icon="DeleteIcon"
          @click="deleteItems"
      />
    </div>
  </q-toolbar>
</template>

<script>
import {mapActions, mapGetters} from 'pinia'
import { useMailStore } from '../../store/index-pinia'

import notification from 'src/utils/notification'
import ActionIcon from '../common/ActionIcon'

export default {
  name: 'SelectHeader',

  components: {
    ActionIcon,
  },

  props: {
    items: {
      type: Array,
      default: () => [],
    },
  },

  methods: {
    ...mapActions(useMailStore, [
      'resetSelectedItems',
      'changeDialogComponent',
    ]),
    resetSelection() {
      this.resetSelectedItems({ items: this.items })
    },
    deleteItems() {
      notification.showReport('Comming soon')
    },
  },
}
</script>

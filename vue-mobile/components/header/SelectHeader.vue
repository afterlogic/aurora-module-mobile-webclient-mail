<template>
  <q-toolbar class="app-header">
    <div class="col app-header__left">
      <q-btn @click="resetSelectedItems" icon="close" color="black" flat round dense />
    </div>

    <div class="col app-header__title">
      {{ `Selected: ${items.length}` }}
    </div>
    
    <div class="col app-header__right">
      <ActionIcon
        class="q-mr-md"
        color="black"
        icon="DeleteIcon"
        @click="onPerformAction(actions.delete)"
      />
    </div>
  </q-toolbar>
</template>

<script>
import {mapActions, mapGetters} from 'pinia'
import { useMailStore } from '../../store/index-pinia'

import { messageActions } from '../../utils/message-actions'

import ActionIcon from '../common/ActionIcon'

export default {
  name: 'SelectHeader',

  components: {
    ActionIcon,
  },

  props: {
    items: { type: Array, default: () => [], },
  },

  data() {
    return {
      actions: messageActions
    }
  },

  methods: {
    ...mapActions(useMailStore, [
      'resetSelectedItems',
      'changeDialogComponent',
    ]),
    async onPerformAction(action) {
      // console.log('onPerformAction')
      if (action.routeMethod) {
        this.$router.push(action.routeMethod(this.$route))
      }
      if (action.method) {
        console.log('this.$router', this.$route.path)
        const result = await action.method()
        console.log('action result', result)
      }
      if (action.component) {
        this.changeDialogComponent({ component: action.component })
      }
    },
  },
}
</script>

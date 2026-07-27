<template>
  <q-toolbar data-test-id="mail-select-header" class="app-header">
    <div class="col app-header__left">
      <AppHeaderButton
        data-test-id="mail-select-close"
        icon="close"
        @click="resetSelectedItems"
      />
    </div>

    <div class="col app-header__title" data-test-id="mail-select-count">
      {{ `Selected: ${items.length}` }}
    </div>
    
    <div class="col app-header__right">
      <ActionIcon
        data-test-id="mail-select-delete"
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
import AppHeaderButton from 'src/components/common/AppHeaderButton'

export default {
  name: 'SelectHeader',

  components: {
    ActionIcon,
    AppHeaderButton,
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

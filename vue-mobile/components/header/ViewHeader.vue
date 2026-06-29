<template>
  <q-toolbar class="app-header">
    <div class="col-auto app-header__left">
      <q-btn icon="chevron_left" @click="gotoPreviousPage" color="black" flat round dense />
    </div>

    <div class="col app-header__right view-header__actions">
      <ActionIcon
        color="black"
        :icon="actions.reply.icon"
        @click="onPerformAction(actions.reply)"
      />
      <ActionIcon
        color="black"
        :icon="actions.replyAll.icon"
        @click="onPerformAction(actions.replyAll)"
      />
      <ActionIcon
        color="black"
        :icon="actions.forward.icon"
        @click="onPerformAction(actions.forward)"
      />
      <ActionIcon
        color="black"
        :icon="actions.delete.icon"
        @click="onPerformAction(actions.delete)"
      />
    </div>
  </q-toolbar>
</template>

<script>
import { mapActions } from 'pinia'
import { useMailStore } from '../../store/index-pinia'

import ActionIcon from '../common/ActionIcon'

import { messageActions } from '../../utils/message-actions'

export default {
  name: 'ViewHeader',

  components: {
    ActionIcon,
  },

  data() {
    return {
      actions: messageActions,
    }
  },

  methods: {
    ...mapActions(useMailStore, [
      'changeDialogComponent',
    ]),

    gotoPreviousPage() {
      this.$router.back()
    },
    async onPerformAction(action) {
      if (action.routeMethod) {
        this.$router.push(action.routeMethod(this.$route))
      }
      if (action.method) {
        const result = await action.method()
      }
      if (action.component) {
        this.changeDialogComponent({ component: action.component })
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.view-header__actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 24px;
}
</style>

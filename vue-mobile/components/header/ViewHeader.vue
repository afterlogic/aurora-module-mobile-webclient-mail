<template>
  <q-toolbar class="app-header">
    <div class="col app-header__left">
      <q-btn icon="chevron_left" @click="gotoPreviousPage" color="black" flat round dense />
    </div>

    <div class="col app-header__title">
      <span class="app-header__title-main" v-t="'MAILWEBCLIENT.HEADING_BROWSER_TAB'" />
      <span class="app-header__title-secondary">
        {{ folderName }}
      </span>
    </div>

    <div class="col app-header__right">
      <div class="dropdown-more flex justify-center items-center">
        <q-btn-dropdown :menu-offset="[12, -41]" flat unelevated dense>
          <template v-slot:label>
            <MoreIcon class="q-mr-sm" />
          </template>          
          <q-list>
            <q-item clickable v-close-popup @click="onPerformAction(actions.reply)">
              <ActionIcon class="q-mr-md" :icon="actions.reply.icon" />
              <q-item-section>{{ actions.reply.displayName }}</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="onPerformAction(actions.replyAll)">
              <ActionIcon class="q-mr-md" :icon="actions.replyAll.icon" />
              <q-item-section>{{ actions.replyAll.displayName }}</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="onPerformAction(actions.forward)">
              <ActionIcon class="q-mr-md" :icon="actions.forward.icon" />
              <q-item-section>{{ actions.forward.displayName }}</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>
    </div>
  </q-toolbar>
</template>

<script>
import MoreIcon from 'src/components/common/icons/actions/MoreIcon'

import { messageActions } from '../../utils/message-actions'

export default {
  name: 'ViewHeader',

  components: {
    MoreIcon,
  },

  props: {
    folderName: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      actions: messageActions,
    }
  },

  methods: {
    gotoPreviousPage() {
      this.$router.back()
    },
    async onPerformAction(action) {
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

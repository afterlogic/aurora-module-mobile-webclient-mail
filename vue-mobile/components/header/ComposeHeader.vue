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
      <AppActionIconContainer @click="$emit('executeAction', 'sendMessage')">
        <SendActionIcon />
      </AppActionIconContainer>
      <div class="dropdown-more flex justify-center items-center">
        <q-btn-dropdown :menu-offset="[12, -41]" flat unelevated dense>
          <template v-slot:label>
            <AppActionIconContainer>
              <MoreIcon />
            </AppActionIconContainer>
          </template>
          <q-list>
            <AppMoreActionContainer
              :actionLabel="$t('MAILWEBCLIENT.ACTION_SAVE')"
              @click="$emit('executeAction', 'saveMessage')"
            >
              <SaveActionIcon />
            </AppMoreActionContainer>
          </q-list>
        </q-btn-dropdown>
      </div>
    </div>
  </q-toolbar>
</template>

<script>
import AppActionIconContainer from 'src/components/common/AppActionIconContainer'
import AppMoreActionContainer from 'src/components/common/AppMoreActionContainer'
import MoreIcon from 'src/components/common/icons/actions/MoreIcon'
import SendActionIcon from '../icons/message-compose/actions/SendIcon'
import SaveActionIcon from '../icons/message-compose/actions/SaveIcon'

export default {
  name: 'ComposeHeader',

  components: {
    AppActionIconContainer,
    AppMoreActionContainer,
    MoreIcon,
    SendActionIcon,
    SaveActionIcon,
  },

  props: {
    folderName: {
      type: String,
      default: '',
    },
  },

  methods: {
    gotoPreviousPage() {
      this.$router.back()
    },
  },
}
</script>

<style scoped></style>

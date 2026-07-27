<template>
  <q-toolbar class="app-header">
    <div class="col app-header__left">
      <AppHeaderButton
        data-test-id="mail-compose-back"
        icon="chevron_left"
        @click="gotoPreviousPage"
      />
    </div>

    <div class="col app-header__title">
      <span class="app-header__title-main" v-t="'MAILWEBCLIENT.HEADING_BROWSER_TAB'" />
      <span class="app-header__title-secondary">
        {{ folderName }}
      </span>
    </div>

    <div class="col app-header__right">
      <AppActionIconContainer
        data-test-id="mail-compose-send"
        @click="$emit('executeAction', 'sendMessage')"
        class="q-mr-md"
      >
        <SendActionIcon />
      </AppActionIconContainer>
      <div v-if="showSaveButton" class="dropdown-more flex justify-center items-center">
        <q-btn-dropdown
          data-test-id="mail-compose-more"
          :menu-offset="[12, -41]"
          flat
          unelevated
          dense
        >
          <template v-slot:label>
            <AppActionIconContainer>
              <MoreIcon />
            </AppActionIconContainer>
          </template>
          <q-list>
            <AppMoreActionContainer
              v-if="showSaveButton"
              data-test-id="mail-compose-save"
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
import AppHeaderButton from 'src/components/common/AppHeaderButton'
import MoreIcon from 'src/components/common/icons/actions/MoreIcon'
import SendActionIcon from '../icons/message-compose/actions/SendIcon'
import SaveActionIcon from '../icons/message-compose/actions/SaveIcon'

export default {
  name: 'ComposeHeader',

  components: {
    AppActionIconContainer,
    AppMoreActionContainer,
    AppHeaderButton,
    MoreIcon,
    SendActionIcon,
    SaveActionIcon,
  },

  emits: ['executeAction'],

  props: {
    folderName: {
      type: String,
      default: '',
    },
    showSaveButton: {
      type: Boolean,
      default: false,
    },
  },

  methods: {
    gotoPreviousPage() {
      this.$router.back()
    },
  },
}
</script>

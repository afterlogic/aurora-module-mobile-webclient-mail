<template>
  <q-toolbar class="app-header">
    <div class="col app-header__left">
      <q-btn icon="chevron_left" @click="gotoPreviousPage" color="black" flat round dense />
    </div>

    <div class="col app-header__title">
      <span class="app-header__title-main">
        {{ $t('MAILWEBCLIENT.HEADING_BROWSER_TAB') }}
      </span>
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
            <q-item clickable v-close-popup>
              <q-item-section> Coming soon... </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>
    </div>
  </q-toolbar>
</template>

<script>
import MoreIcon from '../icons/MoreIcon'

export default {
  name: 'ContactHeader',

  components: {
    MoreIcon,
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

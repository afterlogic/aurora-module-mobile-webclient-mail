<template>
  <main-layout>
    <template v-slot:drawer>
      <drawer-content />
    </template>
    <div>
      <div>Mail 1</div>
      <div>Mail 2</div>
      <div>Mail 3</div>
      <div>Mail 4</div>
      <div>Mail 5</div>
      <div>Mail 6</div>
      <div>Mail 7</div>
    </div>
  </main-layout>
</template>

<script>
import MainLayout from 'src/layouts/MainLayout'
import DrawerContent from '../components/DrawerContent'

export default {
  name: 'Mail',

  components: {
    MainLayout,
    DrawerContent,
  },
}
</script>

<style scoped></style>

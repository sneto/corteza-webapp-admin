<template>
  <b-list-group-item
    :to="to"
    active-class="text-primary is-active"
    class="p-2 border-0 text-nowrap bg-transparent"
  >
    <font-awesome-icon
      :icon="icon"
    />
    <span
      class="label"
      v-html="label"
    />
  </b-list-group-item>
</template>

<script>
export default {
  name: 'MainNavItem',
  props: {
    label: {
      type: String,
      required: true,
    },
    to: {
      type: Object,
      required: true,
    },
    icon: {
      type: Array,
      required: true,
    },
  },
}
</script>

<style scoped lang="scss">
.svg-inline--fa {
  width: 30px;
}

.is-active {
  background-color: $primary;
}

</style>

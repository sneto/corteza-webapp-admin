<template>
  <b-container
    class="py-3"
  >
    <c-content-header
      :title="$t('title')"
    >
      <b-button-group
        v-if="userID"
      >
        <b-button
          variant="link"
          :to="{ name: 'system.user.new' }"
        >
          {{ $t('new') }}
        </b-button>
      </b-button-group>
      <b-button-group
        v-if="userID"
      >
        <c-permissions-button
          :title="user.name || user.handle || user.email"
          :target="user.name || user.handle || user.email"
          :resource="'system:user:'+userID"
          button-variant="link"
        >
          {{ $t('permissions') }}
        </c-permissions-button>
      </b-button-group>
      <c-corredor-manual-buttons
        ui-page="user/editor"
        ui-slot="toolbar"
        resource-type="system:user"
        default-variant="link"
        class="mr-1"
        @click="dispatchCortezaSystemUserEvent($event, { user })"
      />
    </c-content-header>

    <c-user-editor-info
      :user="user"
      :processing="info.processing"
      :success="info.success"
      @submit="onInfoSubmit"
      @delete="onDelete"
      @status="onStatusChange"
    />

    <c-user-editor-password
      v-if="user && user.userID"
      class="mt-3"
      :processing="password.processing"
      :success="password.success"
      @submit="onPasswordSubmit"
    />

    <c-user-editor-roles
      v-if="user && user.userID"
      class="mt-3"
      :processing="roles.processing"
      :success="roles.success"
      :current-roles.sync="userRoles"
      @submit="onRoleSubmit"
    />
  </b-container>
</template>

<script>
import { system } from '@cortezaproject/corteza-js'
import editorHelpers from 'corteza-webapp-admin/src/mixins/editorHelpers'
import CUserEditorInfo from 'corteza-webapp-admin/src/components/User/CUserEditorInfo'
import CUserEditorPassword from 'corteza-webapp-admin/src/components/User/CUserEditorPassword'
import CUserEditorRoles from 'corteza-webapp-admin/src/components/User/CUserEditorRoles'

export default {
  components: {
    CUserEditorRoles,
    CUserEditorPassword,
    CUserEditorInfo,
  },

  i18nOptions: {
    namespaces: [ 'system.users' ],
    keyPrefix: 'editor',
  },

  mixins: [
    editorHelpers,
  ],

  props: {
    userID: {
      type: String,
      required: false,
      default: undefined,
    },
  },

  data () {
    return {
      user: {},
      userRoles: [],

      // Processing and success flags for each form
      info: {
        processing: false,
        success: false,
      },
      password: {
        processing: false,
        success: false,
      },
      roles: {
        processing: false,
        success: false,
      },
    }
  },

  watch: {
    userID: {
      immediate: true,
      handler () {
        if (this.userID) {
          this.fetchUser()
          this.fetchUserRoles()
        } else {
          this.user = {}
        }
      },
    },
  },

  methods: {
    makeEvent (res) {
      return system.UserEvent(res)
    },

    fetchUser () {
      this.incLoader()

      this.$SystemAPI.userRead({ userID: this.userID })
        .then(user => {
          this.user = new system.User(user)
        })
        .catch(this.stdReject)
        .finally(() => {
          this.decLoader()
        })
    },

    fetchUserRoles () {
      this.incLoader()

      this.userRoles = []
      const userID = this.userID

      this.$SystemAPI.roleList().then(({ set: roles = [] }) => {
        this.$SystemAPI.userMembershipList({ userID }).then((m = []) => {
          let userRoles = []
          roles.forEach(r => {
            let { roleID } = r
            if (roleID !== '1') {
              let current = false
              if (m.indexOf(roleID) > -1) {
                current = true
              }
              userRoles.push({ ...r, current: current, dirty: current })
            }
          })
          this.userRoles = userRoles
        }).catch(this.stdReject)
      }).catch(this.stdReject)
        .finally(() => {
          this.decLoader()
        })
    },

    /**
     * Handles user info submit event, calls user update or create API endpoint
     * and handles response & errors
     *
     * @param user {Object}
     */
    onInfoSubmit (user) {
      this.info.processing = true

      const payload = { ...user }

      if (payload.userID) {
        // On update, reset the user obj
        this.$SystemAPI.userUpdate(payload)
          .then(u => {
            this.animateSuccess('info')
            this.user = u
          })
          .catch(this.stdReject)
          .finally(() => {
            this.info.processing = false
          })
      } else {
        // On creation, redirect to edit page
        this.$SystemAPI.userCreate(payload)
          .then(({ userID }) => {
            this.animateSuccess('info')
            this.$router.push({ name: 'system.user.edit', params: { userID } })
          })
          .catch(this.stdReject)
          .finally(() => {
            this.info.processing = false
          })
      }
    },

    /**
     * Handles user delete event, calls user delete API endpoint
     * and handles response & errors
     */
    onDelete () {
      this.incLoader()

      if (this.user.deletedAt) {
        this.$SystemAPI.userUndelete({ userID: this.userID })
          .then(() => {
            this.fetchUser()
          })
          .catch(this.stdReject)
          .finally(() => {
            this.decLoader()
          })
      } else {
        this.$SystemAPI.userDelete({ userID: this.userID })
          .then(() => {
            this.fetchUser()
          })
          .catch(this.stdReject)
          .finally(() => {
            this.decLoader()
          })
      }
    },

    /**
     * Handles user password submit event, calls set password API endpoint
     * and handles response & errors
     *
     * @param password {String}
     */
    onPasswordSubmit (password) {
      this.password.processing = true

      this.$SystemAPI.userSetPassword({ userID: this.userID, password })
        .then(() => {
          this.animateSuccess('password')
        })
        .catch(this.stdReject)
        .finally(() => {
          this.password.processing = false
        })
    },

    /**
     * Handles user role submit event, calls membership add or remove API endpoint
     * and handles response & errors
     */
    onRoleSubmit () {
      this.roles.processing = true

      const userID = this.userID
      Promise.all(this.userRoles.map(async role => {
        let { roleID, current, dirty } = role
        if (dirty !== current) {
          if (dirty) {
            return this.$SystemAPI.userMembershipAdd({ roleID, userID })
          } else {
            return this.$SystemAPI.userMembershipRemove({ roleID, userID })
          }
        }
      }))
        .then(() => {
          this.animateSuccess('roles')
          this.fetchUserRoles()
        })
        .catch(this.stdReject)
        .finally(() => {
          this.roles.processing = false
        })
    },

    /**
     * Handles user status change event, calls suspend or unsuspend API endpoint
     * and handles response & errors
     */
    onStatusChange () {
      this.incLoader()

      const userID = this.userID

      if (this.user.suspendedAt) {
        this.$SystemAPI.userUnsuspend({ userID })
          .then(() => {
            this.fetchUser()
          })
          .catch(this.stdReject)
          .finally(() => {
            this.decLoader()
          })
      } else {
        this.$SystemAPI.userSuspend({ userID })
          .then(() => {
            this.fetchUser()
          })
          .catch(this.stdReject)
          .finally(() => {
            this.decLoader()
          })
      }
    },
  },
}
</script>

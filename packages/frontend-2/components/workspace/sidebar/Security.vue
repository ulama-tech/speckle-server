<template>
  <LayoutSidebarMenuGroup
    title="Security"
    collapsible
    icon="add"
    :icon-click="
      () => navigateTo(settingsWorkspaceRoutes.security.route(workspaceInfo.slug))
    "
    icon-text="Add domain"
    no-hover
  >
    <div class="text-body-2xs text-foreground-2 pb-4 mt-1">
      <div class="flex flex-col gap-4">
        Verified domains not set.
        <FormButton
          color="outline"
          size="sm"
          @click="
            navigateTo(settingsWorkspaceRoutes.security.route(workspaceInfo.slug))
          "
        >
          Improve security
        </FormButton>
      </div>
    </div>
  </LayoutSidebarMenuGroup>
</template>
<script setup lang="ts">
import { graphql } from '~~/lib/common/generated/gql'
import { settingsWorkspaceRoutes } from '~/lib/common/helpers/route'
import type { WorkspaceSidebarSecurity_WorkspaceFragment } from '~/lib/common/generated/gql/graphql'

graphql(`
  fragment WorkspaceSidebarSecurity_Workspace on Workspace {
    ...WorkspaceSecurity_Workspace
  }
`)

defineProps<{
  workspaceInfo: WorkspaceSidebarSecurity_WorkspaceFragment
}>()
</script>

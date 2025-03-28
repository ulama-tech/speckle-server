<template>
  <LayoutDialog v-model:open="showDialog" max-width="lg">
    <template #header>
      <div class="flex flex-col">
        <div class="flex items-center space-x-2 max-w-full w-full">
          <AutomateRunsTriggerStatusIcon
            :summary="summary"
            class="h-6 w-6 sm:h-10 sm:w-10"
          />
          <div class="flex min-w-0 flex-col gap-0.5">
            <h4 class="text-heading-sm" :class="[summary.titleColor]">
              {{ summary.title }}
            </h4>
            <div class="text-body-2xs text-foreground-2">
              {{ summary.longSummary }}
            </div>
          </div>
        </div>
      </div>
    </template>
    <div>
      <AutomateRunsTriggerStatusDialogRunsRows
        :runs="status.automationRuns"
        :project-id="projectId"
        :model-id="modelId"
        :version-id="versionId"
      />
    </div>
    <template #buttons>
      <div
        class="flex flex-col gap-2 items-start sm:gap-0 sm:flex-row sm:items-center sm:justify-between w-full pl-2"
      >
        <FormButton
          text
          size="sm"
          target="_blank"
          external
          to="https://speckle.systems/blog/automate-with-speckle/"
          class="order-2 sm:order-1"
        >
          Learn more about Automate
        </FormButton>
        <div
          class="flex w-full justify-between order-1 sm:order-2 sm:justify-normal sm:w-auto sm:space-x-1"
        >
          <FormButton color="outline" @click="showDialog = false">Close</FormButton>
          <FormButton :to="viewUrl">
            Open {{ versionId ? 'Version' : 'Model' }}
          </FormButton>
        </div>
      </div>
    </template>
  </LayoutDialog>
</template>
<script setup lang="ts">
import { SpeckleViewer } from '@speckle/shared'
import type { RunsStatusSummary } from '~/lib/automate/composables/runStatus'
import { graphql } from '~/lib/common/generated/gql'
import type { AutomateRunsTriggerStatusDialog_TriggeredAutomationsStatusFragment } from '~/lib/common/generated/gql/graphql'
import { modelRoute } from '~/lib/common/helpers/route'

graphql(`
  fragment AutomateRunsTriggerStatusDialog_TriggeredAutomationsStatus on TriggeredAutomationsStatus {
    id
    automationRuns {
      id
      ...AutomateRunsTriggerStatusDialogRunsRows_AutomateRun
    }
  }
`)

const props = defineProps<{
  status: AutomateRunsTriggerStatusDialog_TriggeredAutomationsStatusFragment
  summary: RunsStatusSummary
  projectId: string
  modelId: string
  versionId?: string
}>()

const showDialog = defineModel<boolean>('open', { required: true })

const viewUrl = computed(() => {
  const resourceIdStringBuilder = SpeckleViewer.ViewerRoute.resourceBuilder()
  resourceIdStringBuilder.addModel(props.modelId, props.versionId)
  return modelRoute(props.projectId, resourceIdStringBuilder.toString())
})
</script>

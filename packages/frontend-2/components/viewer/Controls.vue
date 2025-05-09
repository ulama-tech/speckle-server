<!-- eslint-disable vuejs-accessibility/no-static-element-interactions -->
<template>
  <div>
    <div
      class="absolute z-20 flex max-h-screen simple-scrollbar flex-col space-y-1 md:space-y-2 px-2"
      :class="!isEmbedEnabled ? 'pt-[3.6rem]' : isTransparent ? 'pt-2' : 'pt-2 pb-16'"
    >
      <!-- Models -->
      <ViewerControlsButtonToggle
        v-tippy="getShortcutDisplayText(shortcuts.ToggleModels)"
        :active="activePanel === 'models'"
        @click="toggleActivePanel('models')"
      >
        <CubeIcon class="h-4 w-4 md:h-5 md:w-5" />
      </ViewerControlsButtonToggle>

      <!-- Explorer -->
      <ViewerControlsButtonToggle
        v-tippy="getShortcutDisplayText(shortcuts.ToggleExplorer)"
        :active="activePanel === 'explorer'"
        @click="toggleActivePanel('explorer')"
      >
        <IconFileExplorer class="h-4 w-4 md:h-5 md:w-5" />
      </ViewerControlsButtonToggle>

      <!-- Comment threads -->
      <ViewerControlsButtonToggle
        v-tippy="getShortcutDisplayText(shortcuts.ToggleDiscussions)"
        :active="activePanel === 'discussions'"
        @click="toggleActivePanel('discussions')"
      >
        <ChatBubbleLeftRightIcon class="h-4 w-4 md:h-5 md:w-5" />
      </ViewerControlsButtonToggle>

      <!-- Automation runs -->
      <ViewerControlsButtonToggle
        v-if="allAutomationRuns.length !== 0"
        v-tippy="isSmallerOrEqualSm ? undefined : summary.longSummary"
        :active="activePanel === 'automate'"
        @click="toggleActivePanel('automate')"
      >
        <!-- <PlayCircleIcon class="h-5 w-5" /> -->
        <!-- {{allAutomationRuns.length}} -->
        <AutomateRunsTriggerStatusIcon
          :summary="summary"
          class="h-5 w-5 md:h-6 md:w-6"
        />
      </ViewerControlsButtonToggle>

      <!-- TODO: direct add comment -->
      <!-- <ViewerCommentsDirectAddComment v-show="activeControl === 'comments'" /> -->

      <!-- Measurements -->
      <ViewerControlsButtonToggle
        v-tippy="getShortcutDisplayText(shortcuts.ToggleMeasurements)"
        :active="activePanel === 'measurements'"
        @click="toggleMeasurements"
      >
        <IconMeasurements class="h-4 w-4 md:h-5 md:w-5" />
      </ViewerControlsButtonToggle>

      <div class="w-8 flex gap-2">
        <div class="md:hidden">
          <ViewerControlsButtonToggle
            :active="activePanel === 'mobileOverflow'"
            @click="toggleActivePanel('mobileOverflow')"
          >
            <ChevronDoubleRightIcon
              class="h-4 w-4 md:h-5 md:w-5 transition"
              :class="activePanel === 'mobileOverflow' ? 'rotate-180' : ''"
            />
          </ViewerControlsButtonToggle>
        </div>
        <div
          class="-mt-28 md:mt-0 bg-foundation md:bg-transparent gap-1 md:gap-2 flex flex-col rounded-md transition-all"
          :class="[
            activePanel === 'mobileOverflow' ? '' : '-translate-x-24 md:translate-x-0'
          ]"
        >
          <ViewerControlsButtonGroup>
            <!-- View Modes -->
            <ViewerViewModesMenu
              :open="viewModesOpen"
              @force-close-others="activeControl = 'none'"
              @update:open="
                (value) => toggleActiveControl(value ? 'viewModes' : 'none')
              "
            />
            <!-- Views -->
            <ViewerViewsMenu
              :open="viewsOpen"
              @force-close-others="activeControl = 'none'"
              @update:open="(value) => toggleActiveControl(value ? 'views' : 'none')"
            />
            <!-- Zoom extents -->
            <ViewerControlsButtonToggle
              v-tippy="getShortcutDisplayText(shortcuts.ZoomExtentsOrSelection)"
              flat
              @click="trackAndzoomExtentsOrSelection()"
            >
              <ArrowsPointingOutIcon class="h-4 w-4 md:h-5 md:w-5" />
            </ViewerControlsButtonToggle>

            <!-- Sun and lights -->
            <ViewerSunMenu
              :open="activeControl === 'sun'"
              @update:open="(value) => toggleActiveControl(value ? 'sun' : 'none')"
            />
          </ViewerControlsButtonGroup>
          <ViewerControlsButtonGroup>
            <!-- Projection type -->
            <!-- TODO (Question for fabs): How to persist state between page navigation? e.g., swap to iso mode, move out, move back, iso mode is still on in viewer but not in ui -->
            <ViewerControlsButtonToggle
              v-tippy="getShortcutDisplayText(shortcuts.ToggleProjection)"
              flat
              secondary
              :active="isOrthoProjection"
              @click="trackAndtoggleProjection()"
            >
              <IconPerspective v-if="isOrthoProjection" class="h-3.5 md:h-4 w-4" />
              <IconPerspectiveMore v-else class="h-3.5 md:h-4 w-4" />
            </ViewerControlsButtonToggle>

            <!-- Section Box -->
            <ViewerControlsButtonToggle
              v-tippy="getShortcutDisplayText(shortcuts.ToggleSectionBox)"
              flat
              secondary
              :active="isSectionBoxVisible"
              @click="toggleSectionBox()"
            >
              <ScissorsIcon class="h-4 w-4 md:h-5 md:w-5" />
            </ViewerControlsButtonToggle>

            <!-- Explosion -->
            <ViewerExplodeMenu
              :open="explodeOpen"
              @force-close-others="activeControl = 'none'"
              @update:open="(value) => toggleActiveControl(value ? 'explode' : 'none')"
            />
            <!-- Settings -->
            <ViewerSettingsMenu />
          </ViewerControlsButtonGroup>

          <!-- Gendo -->
          <ViewerControlsButtonToggle
            v-show="isGendoEnabled"
            v-tippy="'AI Render by Gendo'"
            :active="activePanel === 'gendo'"
            @click="toggleActivePanel('gendo')"
          >
            <IconGendo
              class="h-6 w-6 md:h-7 md:w-7 -ml-1 -mt-1"
              :class="activePanel === 'gendo' ? 'text-white' : 'text-foreground-2'"
            />
          </ViewerControlsButtonToggle>
        </div>
        <!-- Standard viewer controls -->
      </div>
    </div>

    <div
      v-if="activePanel !== 'none'"
      ref="resizeHandle"
      :class="[
        'absolute max-h-[calc(100dvh-4rem)] w-7 hidden sm:flex group overflow-hidden items-center rounded-r cursor-ew-resize z-30',
        isEmbedEnabled ? 'mt-[0.7rem]' : 'mt-[3.9rem]'
      ]"
      :style="`left:${resizeHandlePosition}px; height:${height ? height - 10 : 0}px`"
      @mousedown="startResizing"
    >
      <div
        class="relative z-30 w-1 mt-2 ml-1 h-full pt-[2rem] bg-transparent group-hover:bg-primary cursor-ew-resize transition rounded-r"
      />
      <div
        class="w-7 h-8 mr-1 bg-transparent group-hover:bg-primary rounded-r -translate-x-1 group-hover:translate-x-0 transition cursor-ew-resize flex items-center justify-center group-hover:shadow-xl"
      >
        <ArrowsRightLeftIcon
          class="h-3 w-3 transition opacity-0 group-hover:opacity-100 text-foundation -ml-[2px]"
        />
      </div>
    </div>
    <div
      ref="scrollableControlsContainer"
      :class="`simple-scrollbar absolute z-10 pl-12 pr-2 md:pr-0 md:pl-14 mb-4 max-h-[calc(100dvh-3.5rem)] overflow-y-auto py-[1px] ${
        activePanel !== 'none' ? 'opacity-100' : 'opacity-0'
      } ${isEmbedEnabled ? 'mt-1.5' : 'mt-[3.6rem]'}`"
      :style="`width: ${isMobile ? '100%' : `${width + 4}px`};`"
    >
      <div v-if="activePanel === 'measurements'">
        <KeepAlive>
          <div><ViewerMeasurementsOptions @close="toggleMeasurements" /></div>
        </KeepAlive>
      </div>
      <div v-show="activePanel === 'models'">
        <KeepAlive>
          <div>
            <ViewerResourcesList
              v-if="!enabled"
              class="pointer-events-auto"
              @loaded-more="scrollControlsToBottom"
              @close="activePanel = 'none'"
            />
            <ViewerCompareChangesPanel v-else @close="activePanel = 'none'" />
          </div>
        </KeepAlive>
      </div>

      <div v-show="resourceItems.length !== 0 && activePanel === 'explorer'">
        <KeepAlive>
          <ViewerExplorer class="pointer-events-auto" @close="activePanel = 'none'" />
        </KeepAlive>
      </div>

      <ViewerComments
        v-if="resourceItems.length !== 0 && activePanel === 'discussions'"
        class="pointer-events-auto"
        @close="activePanel = 'none'"
      />

      <div v-show="resourceItems.length !== 0 && activePanel === 'automate'">
        <AutomateViewerPanel
          :automation-runs="allAutomationRuns"
          :summary="summary"
          @close="activePanel = 'none'"
        />
      </div>
      <div
        v-if="resourceItems.length !== 0 && activePanel === 'gendo' && isGendoEnabled"
      >
        <ViewerGendoPanel @close="activePanel = 'none'" />
      </div>

      <!-- Empty state -->
      <div v-if="resourceItems.length === 0">
        <div class="flex items-center py-3 px-2">
          <div class="text-sm text-foreground-2">No models loaded.</div>
          <div>
            <FormButton
              size="sm"
              text
              :icon-left="PlusIcon"
              @click="openAddModel = true"
            >
              Add
            </FormButton>
            <ViewerResourcesAddModelDialog v-model:open="openAddModel" />
          </div>
        </div>
      </div>
    </div>
    <Portal v-if="isSectionBoxEnabled && isSectionBoxEdited" to="pocket-actions">
      <FormButton @click="resetSectionBox()">Reset section box</FormButton>
    </Portal>
  </div>
</template>
<script setup lang="ts">
import {
  CubeIcon,
  ChatBubbleLeftRightIcon,
  ArrowsPointingOutIcon,
  ScissorsIcon,
  PlusIcon,
  ChevronDoubleRightIcon,
  ArrowsRightLeftIcon
} from '@heroicons/vue/24/outline'
import { isNonNullable, type Nullable } from '@speckle/shared'
import {
  useCameraUtilities,
  useSectionBoxUtilities,
  useMeasurementUtilities,
  useViewerShortcuts
} from '~~/lib/viewer/composables/ui'
import {
  useInjectedViewerLoadedResources,
  useInjectedViewerInterfaceState
} from '~~/lib/viewer/composables/setup'
import { useMixpanel } from '~~/lib/core/composables/mp'
import { useIsSmallerOrEqualThanBreakpoint } from '~~/composables/browser'
import { useEmbed } from '~/lib/viewer/composables/setup/embed'
import {
  onKeyStroke,
  useEventListener,
  useResizeObserver,
  useBreakpoints,
  useWindowSize
} from '@vueuse/core'
import { useFunctionRunsStatusSummary } from '~/lib/automate/composables/runStatus'
import { TailwindBreakpoints } from '~~/lib/common/helpers/tailwind'

type ActivePanel =
  | 'none'
  | 'models'
  | 'explorer'
  | 'discussions'
  | 'automate'
  | 'measurements'
  | 'gendo'
  | 'mobileOverflow'

type ActiveControl =
  | 'none'
  | 'viewModes'
  | 'views'
  | 'sun'
  | 'projection'
  | 'sectionBox'
  | 'explode'
  | 'settings'

const isGendoEnabled = useIsGendoModuleEnabled()
const { width: windowWidth } = useWindowSize()

const width = ref(360)
const scrollableControlsContainer = ref(null as Nullable<HTMLDivElement>)

const height = ref(scrollableControlsContainer.value?.clientHeight) //computed(() => scrollableControlsContainer.value?.clientHeight)
const isResizing = ref(false)
const resizeHandle = ref(null)
let startWidth = 0
let startX = 0

const startResizing = (event: MouseEvent) => {
  event.preventDefault()
  isResizing.value = true
  startX = event.clientX
  startWidth = width.value
}

if (import.meta.client) {
  useResizeObserver(scrollableControlsContainer, (entries) => {
    // const entry = entries[0]
    const { height: newHeight } = entries[0].contentRect
    height.value = newHeight
  })
  useEventListener(resizeHandle, 'mousedown', startResizing)

  useEventListener(document, 'mousemove', (event) => {
    if (isResizing.value) {
      const diffX = event.clientX - startX
      width.value = Math.max(
        300,
        Math.min(startWidth + diffX, (parseInt('75vw') * window.innerWidth) / 100)
      )
    }
  })

  useEventListener(document, 'mouseup', () => {
    if (isResizing.value) {
      isResizing.value = false
    }
  })
}

const { resourceItems, modelsAndVersionIds } = useInjectedViewerLoadedResources()
const {
  resetSectionBox,
  isSectionBoxEnabled,
  isSectionBoxVisible,
  toggleSectionBox,
  isSectionBoxEdited
} = useSectionBoxUtilities()
const { getActiveMeasurement, removeMeasurement, enableMeasurements } =
  useMeasurementUtilities()
const { isTransparent, isEnabled: isEmbedEnabled } = useEmbed()
const {
  zoomExtentsOrSelection,
  toggleProjection,
  camera: { isOrthoProjection }
} = useCameraUtilities()
const { registerShortcuts, getShortcutDisplayText, shortcuts } = useViewerShortcuts()

const {
  diff: { enabled }
} = useInjectedViewerInterfaceState()

const breakpoints = useBreakpoints(TailwindBreakpoints)
const isMobile = breakpoints.smaller('sm')

const allAutomationRuns = computed(() => {
  const allAutomationStatuses = modelsAndVersionIds.value
    .map(({ model }) => model.loadedVersion.items[0].automationsStatus)
    .flat()
    .filter(isNonNullable)

  return allAutomationStatuses.map((status) => status.automationRuns).flat()
})

const allFunctionRuns = computed(() => {
  return allAutomationRuns.value.map((run) => run.functionRuns).flat()
})

const { summary } = useFunctionRunsStatusSummary({
  runs: allFunctionRuns
})

const openAddModel = ref(false)

const activeControl = ref<ActiveControl>('none')
const activePanel = ref<ActivePanel>('none')

const { isSmallerOrEqualSm } = useIsSmallerOrEqualThanBreakpoint()

const toggleActivePanel = (panel: ActivePanel) => {
  const isMeasurementsActive = activePanel.value === 'measurements'
  if (isMeasurementsActive && panel !== 'measurements') {
    enableMeasurements(false)
  }

  // Special handling for mobile overflow
  if (isSmallerOrEqualSm.value && panel === 'mobileOverflow') {
    activePanel.value =
      activePanel.value === 'mobileOverflow' ? 'none' : 'mobileOverflow'
  } else {
    activePanel.value = activePanel.value === panel ? 'none' : panel
  }
}

const toggleActiveControl = (control: ActiveControl) => {
  activeControl.value = activeControl.value === control ? 'none' : control
}

registerShortcuts({
  ToggleModels: () => toggleActivePanel('models'),
  ToggleExplorer: () => toggleActivePanel('explorer'),
  ToggleDiscussions: () => toggleActivePanel('discussions'),
  ToggleMeasurements: () => toggleMeasurements(),
  ToggleProjection: () => trackAndtoggleProjection(),
  ToggleSectionBox: () => toggleSectionBox(),
  ZoomExtentsOrSelection: () => trackAndzoomExtentsOrSelection()
})

const mp = useMixpanel()
watch(activeControl, (newVal) => {
  mp.track('Viewer Action', {
    type: 'action',
    name: 'controls-toggle',
    action: newVal
  })
})

const trackAndzoomExtentsOrSelection = () => {
  zoomExtentsOrSelection()
  mp.track('Viewer Action', { type: 'action', name: 'zoom', source: 'button' })
}

const trackAndtoggleProjection = () => {
  toggleProjection()
  mp.track('Viewer Action', {
    type: 'action',
    name: 'camera',
    camera: isOrthoProjection ? 'ortho' : 'perspective'
  })
}

const scrollControlsToBottom = () => {
  // TODO: Currently this will scroll to the very bottom, which doesn't make sense when there are multiple models loaded
  // if (scrollableControlsContainer.value)
  //   scrollToBottom(scrollableControlsContainer.value)
}

const toggleMeasurements = () => {
  const isMeasurementsActive = activePanel.value === 'measurements'
  enableMeasurements(!isMeasurementsActive)
  activePanel.value = isMeasurementsActive ? 'none' : 'measurements'
}

onKeyStroke('Escape', () => {
  const isActiveMeasurement = getActiveMeasurement()

  if (isActiveMeasurement) {
    removeMeasurement()
  } else {
    if (activePanel.value === 'measurements') {
      toggleMeasurements()
    }
    activePanel.value = 'none'
    activeControl.value = 'none'
  }
})

onMounted(() => {
  // Set initial panel state after component is mounted
  activePanel.value =
    isSmallerOrEqualSm.value || isEmbedEnabled.value ? 'none' : 'models'
})

watch(isSmallerOrEqualSm, (newVal) => {
  activePanel.value = newVal ? 'none' : 'models'
})

watch(isSectionBoxEnabled, (val) => {
  mp.track('Viewer Action', {
    type: 'action',
    name: 'section-box',
    status: val
  })
})

watch(isSectionBoxVisible, (val) => {
  mp.track('Viewer Action', {
    type: 'action',
    name: 'section-box-visibility',
    status: val
  })
})

const viewModesOpen = computed({
  get: () => activeControl.value === 'viewModes',
  set: (value) => {
    activeControl.value = value ? 'viewModes' : 'none'
  }
})

const viewsOpen = computed({
  get: () => activeControl.value === 'views',
  set: (value) => {
    activeControl.value = value ? 'views' : 'none'
  }
})

const explodeOpen = computed({
  get: () => activeControl.value === 'explode',
  set: (value) => {
    activeControl.value = value ? 'explode' : 'none'
  }
})

const resizeHandlePosition = computed(() => {
  return windowWidth.value >= TailwindBreakpoints.md
    ? width.value - 2
    : width.value - 10
})
</script>

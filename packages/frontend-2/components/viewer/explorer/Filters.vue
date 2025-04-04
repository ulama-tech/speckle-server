<template>
  <ViewerLayoutPanel class="mt-2" hide-close>
    <template #title>Filtering</template>
    <template #actions>
      <div class="flex justify-between items-center w-full">
        <FormButton
          text
          color="subtle"
          size="sm"
          :icon-right="showAllFilters ? ChevronUpIcon : ChevronDownIcon"
          class="capitalize"
          @click="showAllFilters = !showAllFilters"
        >
          <span class="max-w-20 md:max-w-36 truncate">
            {{ title.split('.').reverse()[0] || title || 'No title' }}
          </span>
        </FormButton>
        <div class="flex gap-x-1">
          <FormButton
            v-if="title !== 'Object Type'"
            size="sm"
            color="outline"
            @click="
              ;(showAllFilters = false),
                removePropertyFilter(),
                refreshColorsIfSetOrActiveFilterIsNumeric()
            "
          >
            Reset
          </FormButton>
          <FormButton
            v-tippy="'Toggle coloring'"
            size="sm"
            color="subtle"
            text
            @click="toggleColors()"
          >
            <IconColouringOutline v-if="!colors" class="w-4 h-4" />
            <IconColouring v-else class="w-4 h-4" />
          </FormButton>
        </div>
      </div>
    </template>
    <div
      :class="`relative flex flex-col gap-0.5 simple-scrollbar overflow-y-scroll overflow-x-hidden ${
        showAllFilters ? 'h-44 visible pb-2' : 'h-0 invisible'
      } transition-[height] border-b border-outline-2`"
    >
      <div class="sticky top-0 bg-foundation p-2 pb-1">
        <FormTextInput
          v-model="searchString"
          name="filter search"
          placeholder="Search for a property"
          size="sm"
          color="foundation"
          :show-clear="!!searchString"
          class="!text-body-2xs"
        />
      </div>
      <div>
        <div
          v-for="(filter, index) in relevantFiltersLimited"
          :key="index"
          v-tippy="filter.key"
          class="text-body-2xs"
        >
          <button
            class="flex w-full text-left hover:bg-primary-muted truncate rounded-md py-[3px] px-2 mx-2 text-[10px] text-foreground-3 gap-1 items-center"
            @click="
              ;(showAllFilters = false),
                setPropertyFilter(filter),
                refreshColorsIfSetOrActiveFilterIsNumeric()
            "
          >
            <span class="text-foreground text-body-3xs">
              {{ getPropertyName(filter.key) }}
            </span>
            <span class="truncate">{{ filter.key }}</span>
          </button>
        </div>
        <div v-if="itemCount < relevantFiltersSearched.length" class="px-4">
          <FormButton size="sm" text @click="itemCount += 30">
            View more ({{ relevantFiltersSearched.length - itemCount }})
          </FormButton>
        </div>
      </div>
    </div>
    <div v-if="activeFilter">
      <ViewerExplorerStringFilter
        v-if="stringActiveFilter"
        :filter="stringActiveFilter"
      />
      <ViewerExplorerNumericFilter
        v-if="numericActiveFilter"
        :filter="numericActiveFilter"
      />
    </div>
  </ViewerLayoutPanel>
</template>
<script setup lang="ts">
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/vue/24/solid'
import type { PropertyInfo } from '@speckle/viewer'
import { useFilterUtilities } from '~~/lib/viewer/composables/ui'
import { useMixpanel } from '~~/lib/core/composables/mp'
import {
  isNumericPropertyInfo,
  isStringPropertyInfo
} from '~/lib/viewer/helpers/sceneExplorer'

const {
  setPropertyFilter,
  removePropertyFilter,
  applyPropertyFilter,
  unApplyPropertyFilter,
  filters: { propertyFilter }
} = useFilterUtilities()

const revitPropertyRegex = /^parameters\./
// Note: we've split this regex check in two to not clash with navis properties. This makes generally makes dim very sad, as we're layering hacks.
// Navis object properties come under `properties`, same as revit ones - as such we can't assume they're the same. Here we're targeting revit's
// specific two subcategories of `properties`.
const revitPropertyRegexDui3000InstanceProps = /^properties\.Instance/ // note this is partially valid for civil3d, or dim should test against it
const revitPropertyRegexDui3000TypeProps = /^properties\.Type/ // note this is partially valid for civil3d, or dim should test against it

const showAllFilters = ref(false)

const props = defineProps<{
  filters: PropertyInfo[]
}>()

const isRevitProperty = (key: string): boolean => {
  return (
    revitPropertyRegex.test(key) ||
    revitPropertyRegexDui3000InstanceProps.test(key) ||
    revitPropertyRegexDui3000TypeProps.test(key)
  )
}

const relevantFilters = computed(() => {
  return props.filters.filter((f) => {
    if (
      f.key.endsWith('.units') ||
      f.key.endsWith('.speckle_type') ||
      f.key.includes('.parameters.') ||
      // f.key.includes('level.') ||
      f.key.includes('renderMaterial') ||
      f.key.includes('.domain') ||
      f.key.includes('plane.') ||
      f.key.includes('baseLine') ||
      f.key.includes('referenceLine') ||
      f.key.includes('end.') ||
      f.key.includes('start.') ||
      f.key.includes('endPoint.') ||
      f.key.includes('midPoint.') ||
      f.key.includes('startPoint.') ||
      f.key.includes('startPoint.') ||
      f.key.includes('.materialName') ||
      f.key.includes('.materialClass') ||
      f.key.includes('.materialCategory') ||
      f.key.includes('displayStyle') ||
      f.key.includes('displayValue') ||
      f.key.includes('displayMesh')
    ) {
      return false
    }
    // handle revit params: the actual one single value we're interested is in paramters.HOST_BLA BLA_.value, the rest are not needed
    if (isRevitProperty(f.key)) {
      if (f.key.endsWith('.value')) return true
      else return false
    }
    return true
  })
})

const speckleTypeFilter = computed(() =>
  relevantFilters.value.find((f) => f.key === 'speckle_type')
)
const activeFilter = computed(
  () => propertyFilter.filter.value || speckleTypeFilter.value
)

const mp = useMixpanel()
watch(activeFilter, (newVal) => {
  if (!newVal) return
  mp.track('Viewer Action', {
    type: 'action',
    name: 'filters',
    action: 'set-active-filter',
    value: newVal.key
  })
})

const stringActiveFilter = computed(() =>
  isStringPropertyInfo(activeFilter.value) ? activeFilter.value : undefined
)
const numericActiveFilter = computed(() =>
  isNumericPropertyInfo(activeFilter.value) ? activeFilter.value : undefined
)

const searchString = ref<string | undefined>(undefined)
const relevantFiltersSearched = computed(() => {
  if (!searchString.value) return relevantFilters.value
  const searchLower = searchString.value.toLowerCase()
  // eslint-disable-next-line vue/no-side-effects-in-computed-properties
  itemCount.value = 30 // nasty, but yolo - reset max limit on search change
  return relevantFilters.value.filter((f) => {
    const userFriendlyName = getPropertyName(f.key).toLowerCase()
    return (
      f.key.toLowerCase().includes(searchLower) ||
      userFriendlyName.includes(searchLower)
    )
  })
})

const itemCount = ref(30)
const relevantFiltersLimited = computed(() => {
  return relevantFiltersSearched.value
    .slice(0, itemCount.value)
    .sort((a, b) => a.key.length - b.key.length)
})

const title = computed(() => getPropertyName(activeFilter.value?.key ?? ''))

const colors = computed(() => !!propertyFilter.isApplied.value)

const toggleColors = () => {
  if (!colors.value) applyPropertyFilter()
  else unApplyPropertyFilter()
  mp.track('Viewer Action', {
    type: 'action',
    name: 'filters',
    action: 'toggle-colors',
    value: colors.value
  })
}

// Handles a rather complicated ux flow: user sets a numeric filter which only makes sense with colors on. we set the force colors flag in that scenario, so we can revert it if user selects a non-numeric filter afterwards.
let forcedColors = false
const refreshColorsIfSetOrActiveFilterIsNumeric = () => {
  if (!!numericActiveFilter.value && !colors.value) {
    forcedColors = true
    applyPropertyFilter()
    return
  }

  if (!colors.value) return

  if (forcedColors) {
    forcedColors = false
    unApplyPropertyFilter()
    return
  }

  // removePropertyFilter()
  applyPropertyFilter()
}

const getPropertyName = (key: string): string => {
  if (!key) return 'Loading'

  if (key === 'level.name') return 'Level Name'
  if (key === 'speckle_type') return 'Object Type'

  if (isRevitProperty(key) && key.endsWith('.value')) {
    const correspondingProperty = props.filters.find(
      (f) => f.key === key.replace('.value', '.name')
    )
    if (correspondingProperty && isStringPropertyInfo(correspondingProperty)) {
      return correspondingProperty.valueGroups[0]?.value || key.split('.').pop() || key
    }
  }

  // For all other properties, just return the last part of the path
  return key.split('.').pop() || key
}
</script>

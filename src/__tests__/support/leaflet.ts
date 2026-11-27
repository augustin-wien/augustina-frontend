import { defineComponent, h } from 'vue'

const stub = (name: string) =>
  defineComponent({
    name,
    inheritAttrs: false,
    setup:
      (_, { slots }) =>
      () =>
        h('div', { class: `stub-${name}` }, slots.default?.())
  })

/** Replaces the leaflet vue components, which need a real layout engine, by plain containers. */
export const leafletStubs = () => ({
  LMap: stub('LMap'),
  LTileLayer: stub('LTileLayer'),
  LMarker: stub('LMarker'),
  LPopup: stub('LPopup'),
  LIcon: stub('LIcon'),
  LControl: stub('LControl'),
  LMarkerClusterGroup: stub('LMarkerClusterGroup')
})

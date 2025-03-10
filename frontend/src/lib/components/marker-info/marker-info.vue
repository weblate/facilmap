<script setup lang="ts">
	import type { FindOnMapResult, ID } from "facilmap-types";
	import { moveMarker } from "../../utils/draw";
	import EditMarkerDialog from "../edit-marker-dialog.vue";
	import { getZoomDestinationForMarker } from "../../utils/zoom";
	import Icon from "../ui/icon.vue";
	import Coordinates from "../ui/coordinates.vue";
	import { formatField, normalizeMarkerName } from "facilmap-utils";
	import { computed, ref } from "vue";
	import { useToasts } from "../ui/toasts/toasts.vue";
	import { showConfirm } from "../ui/alert.vue";
	import UseAsDropdown from "../ui/use-as-dropdown.vue";
	import ZoomToObjectButton from "../ui/zoom-to-object-button.vue";
	import { injectContextRequired, requireClientContext, requireMapContext } from "../facil-map-context-provider/facil-map-context-provider.vue";
	import type { RouteDestination } from "../facil-map-context-provider/route-form-tab-context";

	const context = injectContextRequired();
	const client = requireClientContext(context);
	const mapContext = requireMapContext(context);
	const toasts = useToasts();

	const props = withDefaults(defineProps<{
		markerId: ID;
		showBackButton?: boolean;
	}>(), {
		showBackButton: false
	});

	const emit = defineEmits<{
		back: [];
	}>();

	const isDeleting = ref(false);
	const showEditDialog = ref(false);

	const marker = computed(() => client.value.markers[props.markerId]);

	const typeName = computed(() => client.value.types[marker.value.typeId].name);
	const showTypeName = computed(() => Object.values(client.value.types).filter((t) => t.type === 'marker').length > 1);

	function move(): void {
		moveMarker(props.markerId, context, toasts);
	}

	async function deleteMarker(): Promise<void> {
		toasts.hideToast(`fm${context.id}-marker-info-delete`);

		if (!await showConfirm({
			title: "Delete marker",
			message: `Do you really want to delete the marker “${normalizeMarkerName(marker.value.name)}”?`,
			variant: "danger",
			okLabel: "Delete"
		}))
			return;

		isDeleting.value = true;

		try {
			await client.value.deleteMarker({ id: props.markerId });
		} catch (err) {
			toasts.showErrorToast(`fm${context.id}-marker-info-delete`, "Error deleting marker", err);
		} finally {
			isDeleting.value = false;
		}
	}

	const zoomDestination = computed(() => getZoomDestinationForMarker(marker.value));

	const routeDestination = computed<RouteDestination>(() => {
		const markerSuggestion: FindOnMapResult = { ...marker.value, kind: "marker", similarity: 1 };
		return {
			query: normalizeMarkerName(marker.value.name),
			mapSuggestions: [markerSuggestion],
			selectedSuggestion: markerSuggestion
		};
	});
</script>

<template>
	<div class="fm-marker-info" v-if="marker">
		<h2 class="text-break">
			<a v-if="showBackButton" href="javascript:" @click="emit('back')"><Icon icon="arrow-left"></Icon></a>
			<span>
				{{normalizeMarkerName(marker.name)}}
				<template v-if="showTypeName">
					<span class="type-name">({{typeName}})</span>
				</template>
			</span>
		</h2>
		<dl class="fm-search-box-collapse-point fm-search-box-dl">
			<dt class="pos">Coordinates</dt>
			<dd class="pos"><Coordinates :point="marker" :ele="marker.ele"></Coordinates></dd>

			<template v-for="field in client.types[marker.typeId].fields" :key="field.name">
				<dt>{{field.name}}</dt>
				<dd v-html="formatField(field, marker.data[field.name], true)"></dd>
			</template>
		</dl>

		<div class="btn-toolbar">
			<ZoomToObjectButton
				v-if="zoomDestination"
				label="marker"
				size="sm"
				:destination="zoomDestination"
			></ZoomToObjectButton>

			<UseAsDropdown
				size="sm"
				:destination="routeDestination"
			></UseAsDropdown>

			<button
				v-if="!client.readonly"
				type="button"
				class="btn btn-secondary btn-sm"
				@click="showEditDialog = true"
				:disabled="isDeleting || mapContext.interaction"
			>Edit data</button>
			<button
				v-if="!client.readonly"
				type="button"
				class="btn btn-secondary btn-sm"
				@click="move()"
				:disabled="isDeleting || mapContext.interaction"
			>Move</button>
			<button
				v-if="!client.readonly"
				type="button"
				class="btn btn-secondary btn-sm"
				@click="deleteMarker()"
				:disabled="isDeleting || mapContext.interaction"
			>
				<div v-if="isDeleting" class="spinner-border spinner-border-sm"></div>
				Delete
			</button>
		</div>

		<EditMarkerDialog
			v-if="showEditDialog"
			:markerId="markerId"
			@hidden="showEditDialog = false"
		></EditMarkerDialog>
	</div>
</template>

<style lang="scss">
	.fm-marker-info {
		display: flex;
		flex-direction: column;
		min-height: 0;

		.fm-search-box-collapse-point {
			min-height: 1.5em;
		}

		.type-name {
			color: #888;
			font-size: 0.7em;
		}
	}
</style>
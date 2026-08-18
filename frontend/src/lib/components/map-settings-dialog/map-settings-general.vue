<script setup lang="ts">
	import { mapDataValidator, type CRU, type MapData } from "facilmap-types";
	import { getUniqueId, getZodValidator } from "../../utils/utils";
	import MapIdEdit from "./map-id-edit.vue";
	import ValidatedField from "../ui/validated-form/validated-field.vue";
	import { T, useI18n } from "../../utils/i18n";
	import { generateRandomMapId } from "facilmap-utils";

	const i18n = useI18n();

	const props = defineProps<{
		mapData: MapData<CRU.CREATE>;
	}>();

	const id = getUniqueId("fm-map-settings-general");

	function random(id: "admin" | "write" | "read") {
		return generateRandomMapId(id === "admin" ? 16 : id === "write" ? 14 : 12);
	}
</script>

<template>
	<!-- eslint-disable vue/no-mutating-props -->
	<MapIdEdit
		:mapData="props.mapData"
		idProp="adminId"
		v-model="props.mapData.adminId"
		:label="i18n.t('map-settings-dialog.admin-link-label')"
		:description="i18n.t('map-settings-dialog.admin-link-description')"
		:getRandom="() => random('admin')"
	></MapIdEdit>

	<MapIdEdit
		:mapData="props.mapData"
		idProp="writeId"
		v-model="props.mapData.writeId"
		:label="i18n.t('map-settings-dialog.write-link-label')"
		:description="i18n.t('map-settings-dialog.write-link-description')"
		:getRandom="() => random('write')"
	></MapIdEdit>

	<MapIdEdit
		:mapData="props.mapData"
		idProp="id"
		v-model="props.mapData.id"
		:label="i18n.t('map-settings-dialog.read-link-label')"
		:description="i18n.t('map-settings-dialog.read-link-description')"
		:getRandom="() => random('read')"
	></MapIdEdit>

	<ValidatedField
		class="row mb-3"
		:value="props.mapData.name"
		:validators="[getZodValidator(mapDataValidator.update.shape.name)]"
	>
		<template #default="slotProps">
			<label :for="`${id}-map-name-input`" class="col-sm-3 col-form-label">{{i18n.t("map-settings-dialog.map-name")}}</label>
			<div class="col-sm-9 position-relative">
				<input
					:id="`${id}-map-name-input`"
					class="form-control"
					type="text"
					v-model="props.mapData.name"
					:ref="slotProps.inputRef"
				/>
				<div class="invalid-tooltip">
					{{slotProps.validationError}}
				</div>
			</div>
		</template>
	</ValidatedField>

	<div class="row mb-3">
		<label :for="`${id}-search-engines-input`" class="col-sm-3 col-form-label">{{i18n.t("map-settings-dialog.search-engines")}}</label>
		<div class="col-sm-9">
			<div class="form-check fm-form-check-with-label">
				<input
					:id="`${id}-search-engines-input`"
					class="form-check-input"
					type="checkbox"
					v-model="props.mapData.searchEngines"
				/>
				<label :for="`${id}-search-engines-input`" class="form-check-label">
					{{i18n.t("map-settings-dialog.search-engines-label")}}
				</label>
			</div>
			<div class="form-text">
				{{i18n.t("map-settings-dialog.search-engines-description")}}
			</div>
		</div>
	</div>

	<div class="row mb-3">
		<label :for="`${id}-description-input`" class="col-sm-3 col-form-label">{{i18n.t("map-settings-dialog.map-description")}}</label>
		<div class="col-sm-9">
			<input
				:id="`${id}-description-input`"
				class="form-control"
				type="text"
				v-model="props.mapData.description"
			/>
			<div class="form-text">
				{{i18n.t("map-settings-dialog.map-description-description")}}
			</div>
		</div>
	</div>

	<div class="row mb-3">
		<label :for="`${id}-cluster-markers-input`" class="col-sm-3 col-form-label">{{i18n.t("map-settings-dialog.cluster-markers")}}</label>
		<div class="col-sm-9">
			<div class="form-check fm-form-check-with-label">
				<input
					:id="`${id}-cluster-markers-input`"
					class="form-check-input"
					type="checkbox"
					v-model="props.mapData.clusterMarkers"
				/>
				<label :for="`${id}-cluster-markers-input`" class="form-check-label">
					{{i18n.t("map-settings-dialog.cluster-markers-label")}}
				</label>
			</div>
			<div class="form-text">
				{{i18n.t("map-settings-dialog.cluster-markers-description")}}
			</div>
		</div>
	</div>

	<div class="row mb-3">
		<label :for="`${id}-legend1-input`" class="col-sm-3 col-form-label">{{i18n.t("map-settings-dialog.legend-text")}}</label>
		<div class="col-sm-9">
			<textarea
				:id="`${id}-legend1-input`"
				class="form-control"
				type="text"
				v-model="props.mapData.legend1"
			></textarea>
			<textarea
				:id="`${id}-legend2-input`"
				class="form-control mt-1"
				type="text"
				v-model="props.mapData.legend2"
			></textarea>
			<div class="form-text">
				<T k="map-settings-dialog.legend-text-description">
					<template #markdown>
						<a href="http://commonmark.org/help/" target="_blank">{{i18n.t("map-settings-dialog.legend-text-description-interpolation-markdown")}}</a>
					</template>
				</T>
			</div>
		</div>
	</div>
</template>
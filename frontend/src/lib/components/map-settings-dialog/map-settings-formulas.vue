<script setup lang="ts">
	import { type CRU, type MapData, type RouteFormula } from "facilmap-types";
	import ValidatedField from "../ui/validated-form/validated-field.vue";
	import { useI18n } from "../../utils/i18n";
	import { markdownInline, validateFilter } from "facilmap-utils";
	import { showConfirm } from "../ui/alert.vue";
	import { validateRequired } from "../../utils/utils";
	import Draggable from "vuedraggable";
import Icon from "../ui/icon.vue";

	const i18n = useI18n();

	const props = defineProps<{
		mapData: MapData<CRU.CREATE>;
	}>();

	function validateRouteFormulaName(name: string) {
		if (props.mapData.routeFormulas!.filter((routeFormula) => routeFormula.name == name).length > 1) {
			return i18n.t("map-settings-dialog.unique-route-formula-name-error");
		}
	}

	function createRouteFormula(): void {
		props.mapData.routeFormulas!.push({ name: "", formula: { type: "filtrex", code: "" } });
	}

	async function deleteRouteFormula(routeFormula: RouteFormula): Promise<void> {
		if ((routeFormula.name.trim() || routeFormula.formula.code.trim()) && !await showConfirm({
			title: i18n.t("map-settings-dialog.delete-route-formula-title"),
			message: i18n.t("map-settings-dialog.delete-route-formula-message", { name: routeFormula.name }),
			variant: "danger",
			okLabel: i18n.t("map-settings-dialog.delete-route-formula-button")
		})) {
			return;
		}

		const idx = props.mapData.routeFormulas!.indexOf(routeFormula);
		if (idx != -1) {
			props.mapData.routeFormulas!.splice(idx, 1);
		}
	}
</script>

<template>
	<!-- eslint-disable vue/no-mutating-props -->
	<h4>{{i18n.t("map-settings-dialog.route-formulas-heading")}}</h4>

	<p v-html="markdownInline(i18n.t('map-settings-dialog.route-formulas-introduction'), true)"></p>

	<div class="table-responsive">
		<table class="table table-hover table-striped">
			<thead>
				<tr>
					<th style="width: 35%; min-width: 150px">{{i18n.t("map-settings-dialog.route-formula-name")}}</th>
					<th style="width: 50%; min-width: 150px">{{i18n.t("map-settings-dialog.route-formula-formula")}}</th>
					<th>{{i18n.t("map-settings-dialog.route-formula-delete")}}</th>
					<th></th>
				</tr>
			</thead>
			<Draggable
				v-model="props.mapData.routeFormulas"
				tag="tbody"
				handle=".fm-drag-handle"
				:itemKey="(routeFormula: any) => props.mapData.routeFormulas!.indexOf(routeFormula)"
			>
				<template #item="{ element: routeFormula }">
					<tr>
						<ValidatedField
							tag="td"
							class="position-relative"
							:value="routeFormula.name"
							:validators="[validateRequired, validateRouteFormulaName]"
						>
							<template #default="slotProps">
								<input
									class="form-control"
									v-model="routeFormula.name"
									:ref="slotProps.inputRef"
								/>
								<div class="invalid-tooltip">
									{{slotProps.validationError}}
								</div>
							</template>
						</ValidatedField>
						<td>
							<ValidatedField
								:value="routeFormula.formula.code"
								:validators="[
									validateFilter
								]"
								:reportValid="!!routeFormula.formula.code"
								immediate
							>
								<template #default="slotProps">
									<textarea
										class="form-control"
										v-model="routeFormula.formula.code"
										:ref="slotProps.inputRef"
									></textarea>
									<div class="invalid-tooltip">
										{{slotProps.validationError}}
									</div>
								</template>
							</ValidatedField>
						</td>
						<td class="td-buttons">
							<button type="button" class="btn btn-secondary" @click="deleteRouteFormula(routeFormula)">{{i18n.t("map-settings-dialog.route-formula-delete")}}</button>
						</td>
						<td class="td-buttons">
							<button type="button" class="btn btn-secondary fm-drag-handle"><Icon icon="resize-vertical" :alt="i18n.t('map-settings-dialog.route-formula-reorder')"></Icon></button>
						</td>
					</tr>
				</template>
			</Draggable>
			<tfoot>
				<tr>
					<td colspan="4">
						<button type="button" class="btn btn-secondary" @click="createRouteFormula()"><Icon icon="plus" :alt="i18n.t('map-settings-dialog.route-formula-add')"></Icon></button>
					</td>
					<td class="move"></td>
				</tr>
			</tfoot>
		</table>
	</div>
</template>
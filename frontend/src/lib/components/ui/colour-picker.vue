<script lang="ts">
	import ColorMixin from "@ckpack/vue-color/src/mixin/color.js";
	import { Hue, Saturation } from "@ckpack/vue-color";
	import Picker from "./picker.vue";
	import { makeTextColour } from "facilmap-utils";
	import { arrowNavigation } from "../../utils/ui";
	import { type StyleValue, computed, nextTick, ref } from "vue";
	import type { Validator } from "./validated-form/validated-field.vue";

	function normalizeData(value: string) {
		return ColorMixin.data.apply({ modelValue: value }).val;
	}

	function isValidColour(colour: string) {
		return !!colour?.match(/^[0-9a-f]{6}$/i);
	}

	function validateColour(colour: string): string | undefined {
		if (!isValidColour(colour)) {
			return "Needs to be in 6-digit hex format, for example 0000ff.";
		}
	}

	const colours = [ "ffffff", "ffccc9", "ffce93", "fffc9e", "ffffc7", "9aff99", "96fffb", "cdffff", "cbcefb", "cfcfcf", "fd6864",
	"fe996b", "fffe65", "fcff2f", "67fd9a", "38fff8", "68fdff", "9698ed", "c0c0c0", "fe0000", "f8a102", "ffcc67", "f8ff00", "34ff34",
	"68cbd0", "34cdf9", "6665cd", "9b9b9b", "cb0000", "f56b00", "ffcb2f", "ffc702", "32cb00", "00d2cb", "3166ff", "6434fc", "656565",
	"9a0000", "ce6301", "cd9934", "999903", "009901", "329a9d", "3531ff", "6200c9", "343434", "680100", "963400", "986536", "646809",
	"036400", "34696d", "00009b", "303498", "000000", "330001", "643403", "663234", "343300", "013300", "003532", "010066", "340096" ];
</script>

<script setup lang="ts">
	const props = defineProps<{
		modelValue: string;
		validators?: Array<Validator<string>>;
	}>();

	const emit = defineEmits<{
		"update:modelValue": [colour: string];
	}>();

	const gridRef = ref<HTMLElement>();

	const value = computed({
		get: () => props.modelValue,
		set: (value) => {
			emit("update:modelValue", value!);
		}
	});

	const val = computed(() => normalizeData(value.value ?? ""));

	const previewStyle = computed((): StyleValue => {
		const bg = isValidColour(value.value) ? value.value : 'ffffff';
		return {
			backgroundColor: `#${bg}`,
			color: makeTextColour(`#${bg}`)
		};
	});

	function handleChange(val: any): void {
		value.value = normalizeData(val).hex.replace(/^#/, '').toLowerCase();
	}

	function handleKeyDown(event: KeyboardEvent): void {
		if (gridRef.value) {
			const newVal = arrowNavigation(colours, value.value, gridRef.value, event);
			if (newVal) {
				emit('update:modelValue', newVal);
				void nextTick(() => {
					(gridRef.value?.querySelector(".active a") as HTMLAnchorElement | undefined)?.focus();
				});
			}
		}
	}
</script>

<template>
	<Picker
		customClass="fm-colour-field"
		v-model="value"
		@keydown="handleKeyDown"
		:validators="[...props.validators ?? [], validateColour]"
		:previewStyle="previewStyle"
	>
		<template #preview>
			<span style="width: 1.4em"></span>
		</template>

		<template #default="{ isModal }">
			<div class="fm-colour-field-content">
				<input
					class="form-control"
					v-show="isModal"
					v-model="value"
					:style="previewStyle"
				/>
				<Saturation :value="val" @change="handleChange"></Saturation>
				<Hue :value="val" @change="handleChange"></Hue>
				<ul ref="gridRef">
					<li v-for="colour in colours" :key="colour" :class="{ active: value == colour }">
						<a
							href="javascript:"
							:style="{ backgroundColor: `#${colour}` }"
							@click="emit('update:modelValue', colour)"
							tabindex="-1"
						></a>
					</li>
				</ul>
			</div>
		</template>
	</Picker>
</template>

<style lang="scss">
	.fm-colour-field {
		.fm-colour-field-content {
			display: flex;
			flex-direction: column;
			align-items: center;

			> * + * {
				margin-top: 0.5rem;
			}

			.vc-saturation {
				position: relative;
				flex-basis: 100px;
				width: 100%;
			}

			.vc-hue {
				position: static;
				height: 15px;
				width: 100%;
				flex-shrink: 0;
			}

			ul {
				margin-left: 0;
				margin-bottom: 0;
				padding: 0;
				list-style-type: none;
				display: grid;
				grid-template-columns: repeat(9, 15px);
				grid-auto-rows: 15px;
				gap: 5px;

				li {
					display: flex;
				}

				a {
					flex-grow: 1;
					border-radius: 3px;
					box-shadow: inset 0 0 0 1px rgb(0 0 0 / 15%);
					border: none;
				}

				li.active a {
					box-shadow: inset 0 0 0 2px rgb(0 0 0 / 60%), 0 0 3px rgb(0 0 0 / 60%);
				}
			}
		}
	}
</style>
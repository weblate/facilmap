<script setup lang="ts">
	import { type Line, type Marker } from "facilmap-types";
	import { formatFieldName } from "facilmap-utils";
	import { getUniqueId } from "../../utils/utils";
	import FieldInput from "./field-input.vue";
	import { injectContextRequired, requireClientContext } from "../facil-map-context-provider/facil-map-context-provider.vue";
	import { useMaxBreakpoint } from "../../utils/bootstrap";

	const context = injectContextRequired();
	const client = requireClientContext(context);

	const props = defineProps<{
		object: Marker | Line;
	}>();

	const emit = defineEmits<{
		update: [fieldName: string, value: string | undefined];
	}>();

	const id = getUniqueId("edit-marker-dialog");

	const isXs = useMaxBreakpoint("xs");
</script>

<template>
	<template v-for="(field, idx) in client.types[props.object.typeId].fields" :key="field.name">
		<template v-if="field.type !== 'checkbox' || !isXs">
			<div class="row mb-3">
				<label :for="field.type === 'formula' ? undefined : `${id}-${idx}-input`" class="col-sm-3 col-form-label text-break">{{formatFieldName(field.name)}}</label>
				<div class="col-sm-9" :class="{ 'fm-form-check-with-label': field.type === 'checkbox' }">
					<FieldInput
						:id="`${id}-${idx}-input`"
						:type="client.types[props.object.typeId]"
						:object="props.object"
						:field="field"
						:modelValue="props.object.data[field.name]"
						@update:modelValue="emit('update', field.name, $event)"
					></FieldInput>
				</div>
			</div>
		</template>
		<template v-else>
			<FieldInput
				:id="`${id}-${idx}-input`"
				:field="field"
				@update:modelValue="emit('update', field.name, $event)"
				showCheckboxLabel
			></FieldInput>
		</template>
	</template>
</template>
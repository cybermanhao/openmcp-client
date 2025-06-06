<template>
	<el-collapse :expand-icon-position="'left'" v-model="tabStorage.activeNames">
		<el-collapse-item v-for="(client, index) in mcpClientAdapter.clients" :name="index" :class="[]">

			<!-- header -->
			<template #title>
				<h3 class="resource-template">
					<span>prompts/list</span>
					<span @click.stop="reloadPrompts(client, { first: false })" class="iconfont icon-restart"></span>
				</h3>

			</template>

			<!-- body -->

			<div class="prompt-template-container-scrollbar">
				<el-scrollbar height="500px">
					<div class="prompt-template-container">
						<div class="item"
							:class="{ 'active': props.tabId >= 0 && tabStorage.currentPromptName === template.name }"
							v-for="template of client.promptTemplates?.values()" :key="template.name"
							@click="handleClick(template)">
							<span>{{ template.name }}</span>
							<span>{{ template.description || '' }}</span>
						</div>
					</div>
				</el-scrollbar>
			</div>
		</el-collapse-item>
	</el-collapse>
</template>

<script setup lang="ts">
import type { PromptTemplate } from '@/hook/type';
import { onMounted, defineProps, defineEmits, reactive, ref, type Reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import type { PromptStorage } from './prompts';
import { tabs } from '../panel';
import { ElMessage } from 'element-plus';
import { McpClient, mcpClientAdapter } from '@/views/connect/core';

const { t } = useI18n();

const props = defineProps({
	tabId: {
		type: Number,
		required: true
	}
});

const emits = defineEmits(['prompt-selected']);

let tabStorage: PromptStorage;

if (props.tabId >= 0) {
	const tab = tabs.content[props.tabId];
	tabStorage = tab.storage as PromptStorage;
} else {
	tabStorage = reactive({
		activeNames: [0],
		currentPromptName: '',
		formData: {},
		lastPromptGetResponse: undefined
	});
}

async function reloadPrompts(client: Reactive<McpClient>, option: { first: boolean }) {
	await client.getPromptTemplates({ cache: false });

	if (!option.first) {
		ElMessage({
			message: t('finish-refresh'),
			type: 'success',
			duration: 3000,
			showClose: true,
		});
	}
}

function handleClick(prompt: PromptTemplate) {
	tabStorage.currentPromptName = prompt.name;
	tabStorage.lastPromptGetResponse = undefined;
	emits('prompt-selected', prompt);
}

onMounted(async () => {
	if (tabStorage.currentPromptName === undefined) {
		const masterNode = mcpClientAdapter.masterNode;
		const prompt = masterNode.promptTemplates?.values().next();
		tabStorage.currentPromptName = prompt?.value?.name || '';
	}
});


</script>

<style>
.prompt-template-container-scrollbar {
	background-color: var(--background);
	margin-bottom: 10px;
	border-radius: .5em;
}

.prompt-template-container {
	height: fit-content;
	display: flex;
	flex-direction: column;
	padding: 10px;
}

.prompt-template-function-container {
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.prompt-template-function-container button {
	width: 175px;
}

.prompt-template-container>.item {
	margin: 3px;
	padding: 5px 10px;
	border-radius: .3em;
	user-select: none;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: space-between;
	transition: var(--animation-3s);
}

.prompt-template-container>.item:hover {
	background-color: var(--main-light-color);
	transition: var(--animation-3s);
}

.prompt-template-container>.item.active {
	background-color: var(--main-light-color);
	transition: var(--animation-3s);
}

.prompt-template-container>.item>span:first-child {
	max-width: 200px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.prompt-template-container>.item>span:last-child {
	opacity: 0.6;
	font-size: 12.5px;
	max-width: 200px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
</style>
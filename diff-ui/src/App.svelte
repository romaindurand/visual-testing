<script>
	import DiffList from './components/DiffList.svelte'
	import { onMount } from "svelte"
	import Diff from './components/Diff.svelte';

	let diffs = []
	let diffIndex = 0
	$: currentDiff = diffs[diffIndex]

	onMount(() => {
		window.fetch('/api/diffs')
			.then(response => response.json())
			.then(data => {
				console.log(data)
				diffs = data
			})
			.catch(error => alert(error))
	})
</script>

<DiffList
	{diffs}
	{diffIndex}
	onItemClick={(index) => {
		diffIndex = index
	}}
/>
{#if currentDiff}
	<Diff diff={currentDiff} />
{/if}

<script>
	import DiffList from './components/DiffList.svelte'
	import { onMount } from "svelte"
	import Diff from './components/Diff.svelte';

	let diffs = []
	let diffIndex = 0
	$: currentDiff = diffs[diffIndex]

	onMount(() => {
		fetchDiffs()
	})
	
	function fetchDiffs() {
		window.fetch('/api/diffs')
			.then(response => response.json())
			.then(data => {
				diffs = data
				diffIndex = 0
        if (!diffs.length) {
          window.setTimeout(() => {
            window.alert('No diffs left ! This tab will now close.')
            window.close()
          }, 100)
        }
			})
	}

  function acceptDiff(name) {
    window.fetch(`/api/accept?name=${name}`)
      .then(response => response.json())
      .then(() => {
        fetchDiffs()
      })
  }

  function rejectDiff(name) {
    window.fetch(`/api/reject?name=${name}`)
      .then(response => response.json())
      .then(() => {
        fetchDiffs()
      })
  }
</script>

{#if diffs.length}
<DiffList
	{diffs}
	{diffIndex}
	onItemClick={(index) => {
		diffIndex = index
	}}
/>
{/if}
{#if currentDiff}
	<Diff
    diff={currentDiff}
    onAccept={() => {
      acceptDiff(currentDiff.name)
    }}
    onReject={() => {
      rejectDiff(currentDiff.name)
    }}
  />
{/if}

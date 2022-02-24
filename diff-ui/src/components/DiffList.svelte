<script>
  import DiffListItem from './DiffListItem.svelte'
  export let diffs = []
  export let diffIndex = 0
  export let onItemClick
  let open = true
</script>

<div class="panel">
  <button on:click={() => open = !open}>
    {open ? 'Hide' : 'Show'}
  </button>
  <ul class:open>
    {#each diffs as diff, index}
      <DiffListItem
        name={diff.name}
        onClick={() => onItemClick(index)}
        active={diffIndex === index}
      />
    {/each}
  </ul>
</div>

<style>
  ul {
    margin: 0;
    padding: 0;
    box-shadow: 0 0 5px black;
    padding: 20px;
    transform: translateX(-120%);
  }
  .panel {
    position: relative;
    z-index: 10;
    left: 0;
    top: 0;
    width: fit-content;
  }
  .open {
    transform: translateX(0);
  }
</style>
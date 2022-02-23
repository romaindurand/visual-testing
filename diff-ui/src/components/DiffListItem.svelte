<script>
  export let name
  export let active = false
  export let onClick
</script>

<li class:active on:click={onClick}>
  {name}
</li>

<style>
  li {
    list-style: none;
    cursor: pointer;
  }

  li:hover {
    opacity: 0.7;
  }

  .active {
    font-weight: bold;
  }
</style>
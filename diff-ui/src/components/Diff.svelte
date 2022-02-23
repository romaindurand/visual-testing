<script>
  export let diff = null
  let modes = ['diff', 'compare', 'compare-with-diff', 'swipe']
  let currentMode = modes[2]
  let swipeOpacity = 0.5
  $: console.log({diff})
  $: console.log({swipeOpacity})
</script>

{#if currentMode === 'compare-with-diff'}
<div class="compare-diff">
  <img src={`/images/reference/${diff.name}`} alt="reference">
  <img src={`/images/diff/${diff.name}`} alt="diff">
  <img src={`/images/temp/${diff.name}`} alt="temp">
</div>
{/if}

{#if currentMode === 'compare'}
<div class="compare">
  <img src={`/images/reference/${diff.name}`} alt="reference">
  <img src={`/images/temp/${diff.name}`} alt="temp">
</div>
{/if}

{#if currentMode === 'diff'}
<div class="diff">
  <img src={`/images/diff/${diff.name}`} alt="diff">
</div>
{/if}

{#if currentMode === 'swipe'}
<div class="swipe">
  <img src={`/images/reference/${diff.name}`} alt="reference">
  <img src={`/images/temp/${diff.name}`} alt="temp" style={`opacity: ${swipeOpacity}`}>
</div>
<div class="slider">
  <input
    type="range"
    min="0"
    max="1"
    step="0.01"
    bind:value={swipeOpacity}
  >
</div>
{/if}

<div class="modes-container">
  {#each modes as mode}
    <button
      class:active={mode === currentMode}
      on:click={() => {
        currentMode = mode
      }}
    >
      {mode}
    </button>
  {/each}
</div>



<style>
  .modes-container {
    position: absolute;
    top: 0;
    right: 0;

  }
  .active {
    background-color: red;
  }

  .compare-diff img {
    max-width: 33.333%;
  }

  .compare img {
    max-width: 50%;
  }

  .diff img {
    max-width: 100%;
  }

  .swipe {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    box-sizing: border-box;
    height: 100%;
    overflow: hidden;
  }

  .swipe img {
    position: absolute;
  }

  .slider {
    position: absolute;
    top: 40px;
    right: 10px;
  }

  .slider input {
    width: 300px;
    padding: 0;
  }

  .compare-diff, .compare, .diff {
    padding: 15px;
    display: flex;
    gap: 10px;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    box-sizing: border-box;
    height: 100%;
    overflow: hidden;
  }
</style>
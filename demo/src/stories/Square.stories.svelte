<script>
	import Square from './../components/Square.svelte';
  import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
</script>

<Meta
  title="Square"
  component={Square}
/>

<Template let:args>
  <Square {...args} />
</Template>

<Story name="default"/>
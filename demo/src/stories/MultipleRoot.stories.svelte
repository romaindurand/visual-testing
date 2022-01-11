<script>
	import MultipleRoot from './../components/MultipleRoot.svelte';
  import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
</script>

<!-- More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export -->
<!-- More on argTypes: https://storybook.js.org/docs/svelte/api/argtypes -->
<Meta
  title="MultipleRoot"
  component={MultipleRoot}
/>

<!-- More on component templates: https://storybook.js.org/docs/svelte/writing-stories/introduction#using-args -->
<Template let:args>
  <MultipleRoot {...args}/>
</Template>

<!-- More on args: https://storybook.js.org/docs/svelte/writing-stories/args -->
<Story name="default"/>
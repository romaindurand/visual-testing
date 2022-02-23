<script>
	import Large from './../components/Large.svelte';
  import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
</script>

<Meta
  title="folder/foo/Large"
  component={Large}
/>

<Template let:args>
  <Large {...args}/>
</Template>

<Story name="default"/>
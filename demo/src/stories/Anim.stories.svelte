<script>
	import Anim from './../components/Anim.svelte';
  import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
</script>

<Meta
  title="Delay/foo/bar/Anim"
  component={Anim}
/>

<Template let:args>
  <Anim {...args}/>
</Template>

<Story name="default"/>
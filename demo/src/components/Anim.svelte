<div class="anim"></div>

<style>
 .anim {
  height: 50px;
  width: 50px;
  background-color: blue;
  animation: 1s slidein;
  animation-fill-mode: forwards;
}

@keyframes slidein {
  0% { transform: translateX(0); }
  100%   { transform: translateX(100px); }
}
</style>
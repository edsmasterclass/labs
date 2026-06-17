export default function decorate(block) {
  const main = block.closest('main');

  return main;
}

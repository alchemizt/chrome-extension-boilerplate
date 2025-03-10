function extractPerformers() {
  let performers = [];
  document.querySelectorAll("table.wikitable td a").forEach(link => {
      performers.push(link.innerText.trim());
  });
  return performers;
}

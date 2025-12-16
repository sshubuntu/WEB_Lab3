(function(){
  const clockNode = document.getElementById('lab-clock');
  if (!clockNode) return;

  const formatter = new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'full',
    timeStyle: 'medium'
  });

  function tick(){
    clockNode.textContent = formatter.format(new Date());
  }

  tick();
  setInterval(tick, 12000);
})();


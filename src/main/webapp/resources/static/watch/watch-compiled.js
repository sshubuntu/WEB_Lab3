(function() {
  function ct(v) {
    return v * 360 / 60;
  }

  function ctm(v, s) {
    return v * 360 / 60 + 6 * ct(s) / 360;
  }

  function cth(v, m) {
    return v * 360 / 12 + 30 * ct(m) / 360;
  }

  function updateDateTime() {
    const dateTimeEl = document.getElementById('watch-datetime');
    if (dateTimeEl) {
      const d = new Date();
      const formatter = new Intl.DateTimeFormat('ru-RU', {
        dateStyle: 'full',
        timeStyle: 'medium'
      });
      dateTimeEl.textContent = formatter.format(d);
    }
  }

  function setTime() {
    const d = new Date();
    const h = d.getHours();
    const m = d.getMinutes();
    const s = d.getSeconds();

    const secEl = document.querySelector('.w-sec');
    const minEl = document.querySelector('.w-min');
    const hourEl = document.querySelector('.w-hour');

    if (secEl) {
      secEl.style.animation = 'none';
      secEl.style.transform = 'rotateZ(' + ct(s) + 'deg)';
      setTimeout(function() {
        secEl.style.animation = '';
      }, 10);
    }
    if (minEl) {
      minEl.style.transform = 'rotateZ(' + ctm(m, s) + 'deg)';
    }
    if (hourEl) {
      hourEl.style.transform = 'rotateZ(' + cth(h, m) + 'deg)';
    }
  }

  function generateGraduationMarks() {
    const grd = 240;
    const wMs = document.querySelector('.w-ms');
    if (!wMs) return;

    const radius = 30;
    for (let i = 1; i <= grd; i++) {
      const deg = (i * 360 / grd) - 90;
      const div = document.createElement('div');
      div.className = 'ms-' + i;
      div.style.position = 'absolute';
      div.style.top = '0';
      div.style.left = '0';
      div.style.width = '0';
      div.style.height = '0';
      
      const mark = document.createElement('div');
      mark.style.position = 'absolute';
      mark.style.bottom = '0';
      mark.style.width = '0.5vh';
      mark.style.minWidth = '0.0625rem';
      mark.style.background = 'rgba(255, 255, 255, 0.25)';
      mark.style.borderRadius = '99em';
      
      if (i % 20 === 0) {
        mark.style.height = (radius / 6.4) + 'vh';
        mark.style.background = '#ffffff';
        mark.style.maxWidth = '0.1875rem';
      } else if (i % 4 === 0) {
        mark.style.height = (radius / 8) + 'vh';
        mark.style.background = 'rgba(255, 255, 255, 0.4)';
        mark.style.maxWidth = '0.1875rem';
      } else {
        mark.style.height = (radius / 14) + 'vh';
        mark.style.maxWidth = '0.1875rem';
      }
      
      div.appendChild(mark);
      div.style.transform = 'rotateZ(' + deg + 'deg) translateY(' + (radius * 1.4) + 'vh)';
      wMs.appendChild(div);
    }
  }

  function generateNumbers() {
    const wNum = document.querySelector('.w-num');
    const wNumG = document.querySelector('.w-num-g');
    const nums = 12;
    const radius = 30;
    const part = 360 / nums;

    if (wNum) {
      for (let i = 1; i <= nums; i++) {
        const angle = (part * i - part * 3) * Math.PI / 180;
        const top = Math.sin(angle) * radius;
        const left = Math.cos(angle) * radius;
        const div = document.createElement('div');
        div.className = 'num';
        div.setAttribute('data-num', i);
        div.textContent = i;
        div.style.top = top + 'vh';
        div.style.left = left + 'vh';
        wNum.appendChild(div);
      }
    }

    if (wNumG) {
      for (let i = 1; i <= nums; i++) {
        const g = i * 60 / nums;
        const angle = (part * i - part * 3) * Math.PI / 180;
        const top = Math.sin(angle) * (radius + 17);
        const left = Math.cos(angle) * (radius + 17);
        const div = document.createElement('div');
        div.className = 'num-g';
        div.setAttribute('data-num', g);
        div.textContent = g;
        div.style.top = top + 'vh';
        div.style.left = left + 'vh';
        wNumG.appendChild(div);
      }
    }
  }

  function init() {
    generateNumbers();
    generateGraduationMarks();
    setTime();
    updateDateTime();
    
    setInterval(setTime, 1000);
    
    setInterval(updateDateTime, 12000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();


(function(){
  const plot = document.getElementById('plot');
  if (!plot) return;

  const ctx = plot.getContext('2d');
  const resultsBody = document.querySelector('#results-table tbody');
  const errorsBox = document.getElementById('canvas-errors');
  const radiusNode = document.getElementById('selected-radius');
  const initialResultsNode = document.getElementById('initial-results');
  const contextPath = (typeof window.context === 'string') ? window.context : '';

  let latestPoint = null;
  if (initialResultsNode) {
    try {
      const parsed = JSON.parse(initialResultsNode.textContent || '[]');
      if (parsed.length > 0) {
        latestPoint = parsed[0];
      }
    } catch(err) {
      console.warn('Unable to parse initial results payload', err);
    }
  }

  function setCanvasSize(){
    const dpr = window.devicePixelRatio || 1;
    plot.width = plot.offsetWidth * dpr;
    plot.height = plot.offsetHeight * dpr;
    ctx.resetTransform?.();
    ctx.scale(dpr, dpr);
  }

  function showErrors(messages){
    if (!errorsBox) return;
    errorsBox.innerHTML = '';
    if (!messages || messages.length === 0){
      errorsBox.style.display = 'none';
      return;
    }
    errorsBox.style.display = '';
    messages.forEach(text => {
      const div = document.createElement('div');
      div.className = 'err';
      div.textContent = text;
      errorsBox.appendChild(div);
    });
  }

  function currentRadius(){
    if (!radiusNode) return NaN;
    const val = Number(radiusNode.dataset.radius);
    if (!Number.isFinite(val) || val <= 0 || val < 1 || val > 3) {
      return NaN;
    }
    return val;
  }

  function drawAxes(){
    const W = plot.offsetWidth, H = plot.offsetHeight;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#0b1324';
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(203,213,225,.9)';
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(40, H/2);
    ctx.lineTo(W-20, H/2);
    ctx.moveTo(W/2, 20);
    ctx.lineTo(W/2, H-20);
    ctx.stroke();

    ctx.fillStyle = '#9fb3c8';
    ctx.font = '12px system-ui, sans-serif';
    function label(x, y, t) { ctx.fillText(t, x, y); }
    const l = ['-R','-R/2','R/2','R'];
    const offs = [W/2-200, W/2-100, W/2+100, W/2+200];
    offs.forEach((x, i) => {
      ctx.beginPath();
      ctx.moveTo(x, H/2-5);
      ctx.lineTo(x, H/2+5);
      ctx.stroke();
      label(x-6, H/2+18, l[i]);
    });
    [H/2-200, H/2-100, H/2+100, H/2+200].forEach((y, i) => {
      ctx.beginPath();
      ctx.moveTo(W/2-5, y);
      ctx.lineTo(W/2+5, y);
      ctx.stroke();
      label(W/2+8, y+4, ['R','R/2','-R/2','-R'][i]);
    });


    ctx.fillStyle = 'rgba(37,99,235,.45)';
    ctx.fillRect(W/2-100, H/2-200, 100, 200);

    ctx.beginPath();
    ctx.moveTo(W/2, H/2);
    ctx.lineTo(W/2, H/2-100);
    ctx.lineTo(W/2+100, H/2);

    ctx.arc(W/2, H/2, 100, Math.PI, Math.PI * 0.5, true);
    ctx.fill();
    if (latestPoint) {
      const { x, y, r} = latestPoint;
      const scale = 200 / r;
      const canvasX = W/2 + x * scale;
      const canvasY = H/2 - y * scale;
      if (canvasX >= 0 && canvasX <= W && canvasY >= 0 && canvasY <= H) {
        ctx.fillStyle = latestPoint.hit ? '#22c55e' : '#ef4444';
        ctx.beginPath();
        ctx.arc(canvasX, canvasY, 3, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  }

  function canvasToCoords(px, py, r){
    const width = plot.offsetWidth;
    const height = plot.offsetHeight;
    const scale = 200 / r;
    const x = (px - width / 2) / scale;
    const y = (height / 2 - py) / scale;
    return { x, y };
  }

  function toFixed(value, digits){
    return Number.parseFloat(value).toFixed(digits ?? 4);
  }

  function roundXToAllowed(x) {
    const allowedX = [-3, -2, -1, 0, 1, 2, 3, 4, 5];
    let closest = allowedX[0];
    let minDiff = Math.abs(x - allowedX[0]);
    
    for (let i = 1; i < allowedX.length; i++) {
      const diff = Math.abs(x - allowedX[i]);
      if (diff < minDiff) {
        minDiff = diff;
        closest = allowedX[i];
      }
    }
    
    return closest;
  }

  async function sendPoint(x, y, r){
    const url = `${contextPath}/controller?x=${encodeURIComponent(x)}&y=${encodeURIComponent(y)}&r=${encodeURIComponent(r)}`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' }});
    
    const text = await res.text();
    
    if (!res.ok){
      let errorText = '';
      if (text && text.trim()) {
        try {
          const payload = JSON.parse(text);
          errorText = payload.error || '';
        } catch (e) {
          errorText = text || '';
        }
      }
      throw new Error(errorText);
    }
    
    if (!text || !text.trim()) {
      throw new Error('Пустой ответ от сервера');
    }
    
    try {
      return JSON.parse(text);
    } catch (e) {
      throw new Error('Неверный формат ответа от сервера');
    }
  }

  function appendRow(item){
    if (!resultsBody) return;
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${item.creationTime ?? ''}</td>
      <td>${item.x}</td>
      <td>${item.y}</td>
      <td>${item.r}</td>
      <td><span class="badge ${item.hit ? '' : 'fail'}">${item.hit ? 'Да' : 'Нет'}</span></td>`;
    resultsBody.prepend(tr);
  }

  plot.addEventListener('click', async (event)=>{
    showErrors([]);
    const r = currentRadius();
    if (!Number.isFinite(r) || r <= 0 || r < 1 || r > 3){
      showErrors(['Сначала выберите радиус R на форме']);
      return;
    }

    const rect = plot.getBoundingClientRect();
    const px = event.clientX - rect.left;
    const py = event.clientY - rect.top;
    const { x, y } = canvasToCoords(px, py, r);

    const roundedX = roundXToAllowed(x);
    
    if (!Number.isFinite(y) || y < -3 || y > 5) {
      showErrors(['Y должен быть в диапазоне [-3; 5]']);
      return;
    }

    try {
      const payload = await sendPoint(roundedX, toFixed(y, 6), r);
      latestPoint = payload;
      drawAxes();
      appendRow(payload);
    } catch(err){
      const errorMsg = err.message || String(err);
      if (errorMsg && errorMsg.trim() &&
          (errorMsg.includes('Введите') || 
           errorMsg.includes('должен быть') || 
           errorMsg.includes('диапазон'))) {
        showErrors([errorMsg]);
      }
    }
  });

  window.addEventListener('resize', ()=>{
    setCanvasSize();
    drawAxes();
  });

  setCanvasSize();
  drawAxes();
})();

(function(){
  const yInput = document.querySelector('input[id*="yInput"]') || document.getElementById('pointForm:yInput') || document.getElementById('yInput');
  if (!yInput) return;

  yInput.addEventListener('input', function(e){
    let value = e.target.value;
    value = value.replace(/[^0-9.\-]/g, '');
    if (value.indexOf('-') > 0) {
      value = value.replace(/-/g, '');
    }
    if (value.startsWith('-')) {
      value = '-' + value.substring(1).replace(/-/g, '');
    }
    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('');
    }
    if (value.length > 15) {
      value = value.substring(0, 15);
    }
    e.target.value = value;
  });

  yInput.addEventListener('paste', function(e){
    e.preventDefault();
    const paste = (e.clipboardData || window.clipboardData).getData('text');
    let value = paste.replace(/[^0-9.\-]/g, '');
    if (value.indexOf('-') > 0) {
      value = value.replace(/-/g, '');
    }
    if (value.startsWith('-')) {
      value = '-' + value.substring(1).replace(/-/g, '');
    }
    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('');
    }
    if (value.length > 15) {
      value = value.substring(0, 15);
    }
    e.target.value = value;
  });
})();

(function() {
  function setupSelectionButtons() {
    const form = document.getElementById('pointForm');
    if (!form) {
      setTimeout(setupSelectionButtons, 100);
      return;
    }
    
    const xHiddenInput = form.querySelector('input[id*="xValue"]') || document.getElementById('pointForm:xValue');
    const rHiddenInput = form.querySelector('input[id*="rValue"]') || document.getElementById('pointForm:rValue');
    const radiusNode = document.getElementById('selected-radius');
    
    const xButtonsContainer = document.getElementById('x-buttons');
    if (xButtonsContainer && xHiddenInput) {
      const xButtons = xButtonsContainer.querySelectorAll('button[data-x-value]');
      xButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          
          const xValue = this.getAttribute('data-x-value');
          const isCurrentlySelected = this.classList.contains('primary');
          
          if (isCurrentlySelected) {
            this.classList.remove('primary');
            xHiddenInput.value = '';
          } else {
            xButtons.forEach(b => b.classList.remove('primary'));
            this.classList.add('primary');
            xHiddenInput.value = xValue;
          }
        });
      });
      
      if (xHiddenInput.value) {
        const selectedBtn = Array.from(xButtons).find(btn => 
          btn.getAttribute('data-x-value') === xHiddenInput.value
        );
        if (selectedBtn) {
          selectedBtn.classList.add('primary');
        }
      }
    }
    
    const rButtonsContainer = document.getElementById('r-buttons');
    if (rButtonsContainer && rHiddenInput) {
      const rButtons = rButtonsContainer.querySelectorAll('button[data-r-value]');
      rButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          
          const rValue = this.getAttribute('data-r-value');
          const isCurrentlySelected = this.classList.contains('primary');
          
          if (isCurrentlySelected) {
            this.classList.remove('primary');
            rHiddenInput.value = '';
            if (radiusNode) {
              radiusNode.setAttribute('data-radius', '');
            }
          } else {
            rButtons.forEach(b => b.classList.remove('primary'));
            this.classList.add('primary');
            rHiddenInput.value = rValue;
            
            if (radiusNode) {
              radiusNode.setAttribute('data-radius', rValue);
              window.dispatchEvent(new Event('resize'));
            }
          }
        });
      });
      
      if (rHiddenInput.value) {
        const selectedBtn = Array.from(rButtons).find(btn => 
          btn.getAttribute('data-r-value') === rHiddenInput.value
        );
        if (selectedBtn) {
          selectedBtn.classList.add('primary');
        }
        if (radiusNode) {
          radiusNode.setAttribute('data-radius', rHiddenInput.value);
        }
      }
    }
    
    const yInput = form.querySelector('input[id*="yInput"]') || document.getElementById('pointForm:yInput') || document.getElementById('yInput');
    if (yInput) {
      yInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.keyCode === 13) {
          e.preventDefault();
          e.stopPropagation();
          this.blur();
          return false;
        }
      });
    }
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupSelectionButtons);
  } else {
    setupSelectionButtons();
  }
})();


function checkHit(x, y, r) {
  const halfR = r / 2.0;

  const inRectangle = (x >= -halfR && x <= 0 && y >= 0 && y <= r);

  const inTriangle = (x >= 0 && y >= 0 && x <= halfR && y <= halfR && y <= halfR - x);
  

  const radius = r / 2.0;
  const distanceSquared = x * x + y * y;
  const inCircle = distanceSquared <= radius * radius;
  
  let inQuarterCircle = false;
  if (inCircle && x <= 0 && y <= 0) {
    const angle = Math.atan2(y, x);
    const angleDegrees = angle * 180 / Math.PI;
    inQuarterCircle = (angleDegrees >= -180 && angleDegrees <= -90);
  }
  
  return inRectangle || inTriangle || inQuarterCircle;
}

function validateCollect() {
  const form = document.getElementById('pointForm');
  if (!form) {
    return { x: NaN, y: NaN, r: NaN, messages: ['Форма не найдена'] };
  }
  
  const xHiddenInput = form.querySelector('input[id*="xValue"]') || document.getElementById('pointForm:xValue');
  const xRaw = xHiddenInput ? xHiddenInput.value : '';
  const xProvided = xRaw.trim() !== '';
  const x = xProvided ? Number(xRaw) : NaN;
  
  const yInput = form.querySelector('input[id*="yInput"]') || document.getElementById('pointForm:yInput') || document.getElementById('yInput');
  const yRaw = yInput ? yInput.value : '';
  const yVal = yRaw.replace(',', '.');
  const yProvided = yVal.trim() !== '';
  const y = yProvided ? Number(yVal) : NaN;
  
  const rHiddenInput = form.querySelector('input[id*="rValue"]') || document.getElementById('pointForm:rValue');
  const rRaw = rHiddenInput ? rHiddenInput.value : '';
  const rProvided = rRaw.trim() !== '';
  const r = rProvided ? Number(rRaw) : NaN;
  
  const messages = [];
  const missing = [];
  
  if (!Number.isFinite(x)) missing.push('X');
  if (!yProvided) missing.push('Y');
  if (!Number.isFinite(r)) missing.push('R');
  
  if (missing.length > 0) {
    messages.push('Введите ' + missing.join(', '));
  }
  
  if (yProvided && !Number.isFinite(y)) {
    messages.push('Y должен быть числом');
  }
  if (Number.isFinite(y) && (y < -3 || y > 5)) {
    messages.push('Y должен быть в диапазоне [-3; 5]');
  }
  
  if (Number.isFinite(x) && (x < -3 || x > 5)) {
    messages.push('X должен быть в диапазоне [-3; 5]');
  }
  
  if (Number.isFinite(r) && (r < 1 || r > 3)) {
    messages.push('R должен быть в диапазоне [1; 3]');
  }
  
  return { x, y, r, messages };
}

(function() {
  function showValidationErrors(messages) {
    const messagesBox = document.getElementById('messages');
    const errorsBox = document.querySelector('.errors');
    
    const displayMessages = function(container) {
      if (!container) return;
      container.innerHTML = '';
      if (messages.length === 0) {
        container.style.display = 'none';
        return;
      }
      container.style.display = '';
      messages.forEach(msg => {
        const div = document.createElement('div');
        div.className = 'err';
        div.textContent = msg;
        container.appendChild(div);
      });
    };
    
    displayMessages(messagesBox);
    displayMessages(errorsBox);
  }
  
  function setupValidation() {
    const form = document.getElementById('pointForm');
    if (!form) {
      setTimeout(setupValidation, 100);
      return;
    }
    
    const submitButton = form.querySelector('button.btn.primary, input[type="submit"][value*="Отправить"], button[value*="Отправить"]');
    if (!submitButton) {
      setTimeout(setupValidation, 100);
      return;
    }
    
    submitButton.addEventListener('click', function(e) {
      const validation = validateCollect();
      
      if (validation.messages.length > 0) {
        e.preventDefault();
        e.stopPropagation();
        showValidationErrors(validation.messages);
        return false;
      }
      
      showValidationErrors([]);
      
      if (Number.isFinite(validation.x) && Number.isFinite(validation.y) && Number.isFinite(validation.r)) {
        const hit = checkHit(validation.x, validation.y, validation.r);
        console.log('Frontend hit check:', hit, 'for point (', validation.x, ',', validation.y, ') with R =', validation.r);
      }
      return true;
    });
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupValidation);
  } else {
    setupValidation();
  }
})();


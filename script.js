const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

// Navigation
const menuToggle = $('#menuToggle');
const mainNav = $('#mainNav');
menuToggle?.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});
$$('#mainNav a').forEach(link => link.addEventListener('click', () => {
  mainNav?.classList.remove('open');
  menuToggle?.setAttribute('aria-expanded', 'false');
}));
$('#year').textContent = new Date().getFullYear();

// Accessible toast notifications
const toast = $('#toast');
let toastTimer;
function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

// Contribution amount and payment hand-off UI.
// No payment is marked successful here: connect a hosted provider checkout first.

$$('.amount-options button').forEach(button => button.addEventListener('click', () => {
  $$('.amount-options button').forEach(item => item.classList.remove('selected'));
  button.classList.add('selected');

  selectedAmount = Number(button.dataset.amount);

  // Preview candlestick animation
  const candles = $$('#candles i');
  const chartCurrent = $('#chartCurrent');
  const candleLevel = $('#candleLevel');

  const baseHeights = [28, 40, 34, 51, 46, 62, 57, 76, 68, 86];

  candles.forEach((candle, index) => {
    const newHeight = Math.min(
      baseHeights[index] + selectedAmount * 0.25,
      95
    );

    candle.style.height = newHeight + '%';
  });

  if (chartCurrent) {
    chartCurrent.style.top =
      Math.max(5, 18 - selectedAmount * 0.12) + '%';
  }

  if (candleLevel) {
    candleLevel.textContent = 'PREVIEW · LEVEL 04';
  }
}));

function openPayment() {
  $('#paymentAmount').textContent = `$${selectedAmount.toFixed(2)}`;
  paymentModal.classList.add('open');
  paymentModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  $('#closeModal').focus();
}
function closePayment() {
  paymentModal.classList.remove('open');
  paymentModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  $('#donateButton').focus();
}
$('#donateButton').addEventListener('click', openPayment);
$('#closeModal').addEventListener('click', closePayment);
$('#backToSite').addEventListener('click', closePayment);
paymentModal.addEventListener('click', event => {
  if (event.target === paymentModal) closePayment();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && paymentModal.classList.contains('open')) closePayment();
});
$$('.payment-method').forEach(method => method.addEventListener('click', () => {
  const methodName = method.dataset.method === 'apple' ? 'Apple Pay' : 'Card checkout';
  $('#paymentNotice').textContent = `${methodName} is selected. The site owner must connect and verify a payment provider before checkout can open. No payment has been submitted.`;
  showToast(`${methodName} selected`);
}));

// Discovery categories. These are clearly structured sample listings until a market-data API is connected.
const tabData = {
  'Trending': [['🐸','Froggo','$FRGO · Community pick','$2.4M','+18.6%'],['🟠','Orbit Cat','$OCAT · New conversation','$840K','+12.2%'],['🐧','Byte Penguin','$BYTE · Community pick','$610K','−3.4%']],
  'New launches': [['🦊','Pixel Fox','$PFOX · Recently listed','$320K','+8.1%'],['🌙','Moon Toast','$TOAST · New community','$190K','+4.7%'],['🐙','Octo Byte','$OCTO · Recently listed','$150K','−1.2%']],
  'Graduated': [['🪐','Orbit Cat','$OCAT · Milestone reached','$3.1M','+22.4%'],['🐸','Froggo','$FRGO · Community pick','$2.4M','+18.6%'],['🦄','Neon Unicorn','$NEON · Milestone reached','$1.8M','+6.9%']],
  'Top gainers': [['🦊','Pixel Fox','$PFOX · Market movement','$320K','+28.1%'],['🐧','Byte Penguin','$BYTE · Market movement','$610K','+14.2%'],['🪐','Orbit Cat','$OCAT · Market movement','$840K','+12.2%']]
};
$$('.market-tabs button').forEach(button => button.addEventListener('click', () => {
  $$('.market-tabs button').forEach(item => item.classList.remove('active'));
  button.classList.add('active');
  const rows = tabData[button.dataset.tab] || tabData.Trending;
  $('#coinList').innerHTML = rows.map(row => `
    <div class="coin-row">
      <div class="coin-avatar avatar-purple">${row[0]}</div>
      <div class="coin-name"><b>${row[1]}</b><small>${row[2]}</small></div>
      <div class="coin-stat"><b>${row[3]}</b><small>Market cap</small></div>
      <span class="coin-change ${row[4].startsWith('+') ? 'up' : 'down'}">${row[4]}</span>
    </div>`).join('');
}));

// Community interactions: like, reply and repost controls are local UI interactions.
$$('.post').forEach(post => {
  const actions = $('.post-actions', post);
  if (!actions) return;
  const like = actions.children[0];
  if (like) {
    like.setAttribute('role', 'button');
    like.setAttribute('tabindex', '0');
    like.setAttribute('aria-label', 'Like this post');
    const toggleLike = () => {
      const liked = like.classList.toggle('is-liked');
      const match = like.textContent.match(/\d+/);
      const count = match ? Number(match[0]) : 0;
      like.textContent = `${liked ? '♥' : '♡'} ${Math.max(0, count + (liked ? 1 : -1))}`;
    };
    like.addEventListener('click', toggleLike);
    like.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); toggleLike(); }
    });
  }
});
const composeButton = $('.compose-bar button');
composeButton?.addEventListener('click', () => {
  const existing = $('#postComposer');
  if (existing) { existing.remove(); return; }
  const composer = document.createElement('div');
  composer.id = 'postComposer';
  composer.className = 'post-composer';
  composer.innerHTML = '<label for="communityPost">Write a community post</label><textarea id="communityPost" rows="3" maxlength="500" placeholder="Share a thoughtful market observation…"></textarea><button type="button" class="button button-primary" id="publishPost">Publish post</button>';
  $('.social-panel').append(composer);
  $('#publishPost').addEventListener('click', () => {
    const field = $('#communityPost');
    const content = field.value.trim();
    if (!content) { field.focus(); showToast('Write a post before publishing'); return; }
    const post = document.createElement('div');
    post.className = 'post';
    const avatar = document.createElement('div'); avatar.className = 'post-avatar'; avatar.textContent = 'Y';
    const body = document.createElement('div'); body.className = 'post-body';
    const author = document.createElement('div'); author.className = 'post-author';
    author.innerHTML = '<b>Your post</b><span>Just now</span>';
    const paragraph = document.createElement('p'); paragraph.textContent = content;
    body.append(author, paragraph);
    post.append(avatar, body);
    $('.compose-bar').before(post);
    composer.remove();
    showToast('Post added to this page');
  });
  $('#communityPost').focus();
});

// Vertical mobile story navigation and swipe support.
let currentVideo = 0;
const slides = $$('.video-slide');
function nextVideo() {
  if (!slides.length) return;
  const current = slides[currentVideo];
  current.classList.remove('active');
  current.classList.add('leaving');
  currentVideo = (currentVideo + 1) % slides.length;
  const next = slides[currentVideo];
  next.classList.remove('leaving');
  next.classList.add('active');
  setTimeout(() => current.classList.remove('leaving'), 600);
  $$('.phone-bottom span').forEach((dot, index) => dot.classList.toggle('active-dot', index === currentVideo));
}
$('#nextVideo')?.addEventListener('click', nextVideo);
let touchStartY = null;
$('#phoneFeed')?.addEventListener('touchstart', event => { touchStartY = event.changedTouches[0].screenY; }, { passive: true });
$('#phoneFeed')?.addEventListener('touchend', event => {
  if (touchStartY !== null && touchStartY - event.changedTouches[0].screenY > 35) nextVideo();
  touchStartY = null;
}, { passive: true });

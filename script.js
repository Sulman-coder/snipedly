const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

let selectedAmount = 10;
const paymentModal = $('#paymentModal');

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

// $$('.payment-method').forEach(method => method.addEventListener('click', () => {
//   const methodName = method.dataset.method === 'apple' ? 'Apple Pay' : 'Card checkout';
//   $('#paymentNotice').textContent = `${methodName} is selected. The site owner must connect and verify a payment provider before checkout can open. No payment has been submitted.`;
//   showToast(`${methodName} selected`);
// }));



// =====================================
// SNIPEDLY - STRIPE CHECKOUT CONNECTION
// =====================================

const STRIPE_CHECKOUT_URL =
  'https://kljubprmeoykfsgbzrsh.supabase.co/functions/v1/create-checkout-session';

$$('.payment-method').forEach(method => {
  method.addEventListener('click', async () => {
    const methodName =
      method.dataset.method === 'apple' ? 'Apple Pay' : 'Card checkout';

    const buttons = $$('.payment-method');

    buttons.forEach(button => {
      button.disabled = true;
    });

    $('#paymentNotice').textContent =
      'Connecting securely to Stripe Checkout...';

    showToast('Preparing secure checkout...');

    try {
      const response = await fetch(STRIPE_CHECKOUT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_PUBLISHABLE_KEY
        },
        body: JSON.stringify({
          amount: selectedAmount,
          donor_name: null
        })
      });

      const result = await response.json();

      if (!response.ok || !result.url) {
        throw new Error(
          result.error || 'Unable to start checkout.'
        );
      }

      // Redirect to Stripe's hosted checkout page.
      window.location.assign(result.url);

    } catch (error) {
      console.error('Stripe checkout error:', error);

      $('#paymentNotice').textContent =
        'Checkout could not be started. Please try again later.';

      showToast(error.message || 'Checkout connection failed.');

      buttons.forEach(button => {
        button.disabled = false;
      });
    }
  });
});




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


/* SNIPEDLY - Rug Prevention card reveal animation */

document.addEventListener("DOMContentLoaded", () => {
  const rugCards = document.querySelectorAll("[data-rug-reveal]");

  if (!rugCards.length) return;

  // Keep cards visible if the browser does not support this feature
  if (!("IntersectionObserver" in window)) {
    rugCards.forEach(card => card.classList.add("is-visible"));
    return;
  }

  document.body.classList.add("rug-reveal-enabled");

  const rugObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15
    }
  );

  rugCards.forEach(card => {
    rugObserver.observe(card);
  });
});


// =====================================
// SNIPEDLY - SUPABASE CONNECTION
// Read-only verified donation statistics
// =====================================

const SUPABASE_URL = 'https://kljubprmeoykfsgbzrsh.supabase.co';

// Paste your Supabase PUBLISHABLE key here.
// Never use the secret or service_role key in frontend code.
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_77yJGRifYspkJtfg2Z8PeQ_W6SSTtVO';

const snipedlySupabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

async function loadDonationStats() {
  try {
    const { data, error } = await snipedlySupabase.rpc(
      'get_donation_stats'
    );

    if (error) throw error;

    const stats = Array.isArray(data) ? data[0] : data;

    if (!stats) return;

    const totalAmount = Number(stats.total_amount || 0);
    const totalDonations = Number(stats.total_donations || 0);

    const raisedAmount = document.getElementById('raisedAmount');
    const supportCount = document.getElementById('supportCount');

    if (raisedAmount) {
      raisedAmount.textContent =
        `$${totalAmount.toFixed(2)} USD raised`;
    }

    if (supportCount) {
      supportCount.textContent =
        `${totalDonations} verified contributions`;
    }

    // Animate the existing decorative community chart.
    const candles = document.querySelectorAll('#candles i');
    const chartCurrent = document.getElementById('chartCurrent');
    const candleLevel = document.getElementById('candleLevel');

    const baseHeights = [28, 40, 34, 51, 46, 62, 57, 76, 68, 86];

    const growth = totalAmount > 0
      ? Math.min(Math.log10(totalAmount + 1) * 5, 18)
      : 0;

    candles.forEach((candle, index) => {
      const height = Math.min(baseHeights[index] + growth, 98);
      candle.style.height = `${height}%`;
    });

    if (chartCurrent) {
      chartCurrent.style.top = `${Math.max(5, 18 - growth * 0.35)}%`;
    }

    if (candleLevel) {
      candleLevel.textContent = totalAmount > 0
        ? 'COMMUNITY MOMENTUM'
        : 'AWAITING SUPPORT';
    }

  } catch (error) {
    console.error('SNIPEDLY donation stats error:', error);
    // Keep the existing chart and page display if the connection fails.
  }
}

loadDonationStats();



// =====================================
// SNIPEDLY AUTHENTICATION
// Signup / Login / Logout / Resend Email
// =====================================

(function () {
  const auth = snipedlySupabase.auth;

  // Create authentication interface
  const authBox = document.createElement('div');

  authBox.innerHTML = `
    <style>
      #snipAuthButton {
        position: fixed;
        right: 22px;
        bottom: 22px;
        z-index: 9998;
        background: #00e5c0;
        color: #071312;
        border: 0;
        padding: 13px 22px;
        border-radius: 30px;
        font-weight: 700;
        cursor: pointer;
      }

      #snipAuthPanel {
        display: none;
        position: fixed;
        right: 22px;
        bottom: 85px;
        width: min(340px, calc(100vw - 44px));
        padding: 22px;
        background: #101c20;
        color: white;
        border: 1px solid #00bfa5;
        border-radius: 16px;
        z-index: 9999;
        box-shadow: 0 10px 40px #0008;
      }

      #snipAuthPanel input {
        width: 100%;
        box-sizing: border-box;
        padding: 12px;
        margin: 7px 0;
        border-radius: 8px;
        border: 1px solid #345057;
        background: #17272c;
        color: white;
      }

      #snipAuthPanel button {
        padding: 11px;
        margin-top: 9px;
        border: 0;
        border-radius: 8px;
        cursor: pointer;
        font-weight: bold;
      }

      #snipAuthPanel .auth-main {
        width: 100%;
        background: #00e5c0;
        color: #071312;
      }

      #snipAuthPanel .auth-switch {
        background: transparent;
        color: #00e5c0;
      }

      #snipAuthMessage {
        font-size: 13px;
        line-height: 1.5;
        color: #b7e9df;
      }
    </style>

    <button id="snipAuthButton">Sign In / Join</button>

    <div id="snipAuthPanel">
      <h3 id="snipAuthTitle">Join SNIPEDLY</h3>

      <form id="snipAuthForm">
        <input id="snipUsername"
          placeholder="Choose username"
          minlength="3" maxlength="20"
          autocomplete="username" required>

        <input id="snipEmail"
          type="email"
          placeholder="Email address"
          autocomplete="email" required>

        <input id="snipPassword"
          type="password"
          placeholder="Password (minimum 8 characters)"
          minlength="8"
          autocomplete="new-password" required>

        <button class="auth-main" type="submit"
          id="snipAuthSubmit">Create Account</button>
      </form>

      <button class="auth-switch" id="snipAuthSwitch" type="button">
        Already registered? Login
      </button>

      <button class="auth-switch" id="snipResendEmail"
        type="button" style="display:none">
        Resend Confirmation Email
      </button>

      <button class="auth-switch" id="snipAuthLogout"
        type="button" style="display:none">
        Logout
      </button>

      <p id="snipAuthMessage" aria-live="polite"></p>
    </div>
  `;

  document.body.appendChild(authBox);

  const $auth = id => document.getElementById(id);

  let loginMode = false;

  $auth('snipAuthButton').onclick = () => {
    const panel = $auth('snipAuthPanel');

    panel.style.display =
      panel.style.display === 'block' ? 'none' : 'block';
  };

  function updateMode() {
    $auth('snipAuthTitle').textContent =
      loginMode ? 'Welcome Back' : 'Join SNIPEDLY';

    $auth('snipUsername').style.display =
      loginMode ? 'none' : 'block';

    $auth('snipUsername').required = !loginMode;

    $auth('snipPassword').autocomplete =
      loginMode ? 'current-password' : 'new-password';

    $auth('snipAuthSubmit').textContent =
      loginMode ? 'Login' : 'Create Account';

    $auth('snipAuthSwitch').textContent =
      loginMode
        ? 'New here? Create account'
        : 'Already registered? Login';

    $auth('snipResendEmail').style.display = 'none';
    $auth('snipAuthMessage').textContent = '';
  }

  $auth('snipAuthSwitch').onclick = () => {
    loginMode = !loginMode;
    updateMode();
  };

  // Signup and Login
  $auth('snipAuthForm').onsubmit = async (event) => {
    event.preventDefault();

    const email = $auth('snipEmail').value.trim();
    const password = $auth('snipPassword').value;
    const username = $auth('snipUsername').value
      .trim().toLowerCase();

    const message = $auth('snipAuthMessage');
    const submit = $auth('snipAuthSubmit');

    submit.disabled = true;
    message.textContent = 'Please wait...';

    $auth('snipResendEmail').style.display = 'none';

    try {
      if (loginMode) {
        const { error } = await auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;

        message.textContent = 'Login successful!';
      } else {
        if (!/^[a-z0-9_]{3,20}$/.test(username)) {
          throw new Error(
            'Username must be 3-20 characters: letters, numbers or underscore.'
          );
        }

        const { data, error } = await auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username
            }
          }
        });

        if (error) throw error;

        message.textContent = data.session
          ? 'Account created successfully!'
          : 'Account created! Please confirm your email before logging in.';

        $auth('snipResendEmail').style.display =
          data.session ? 'none' : 'inline-block';
      }
    } catch (error) {
      message.textContent = error.message;
      console.error('SNIPEDLY auth error:', error);
    } finally {
      submit.disabled = false;
    }
  };

  // Resend Confirmation Email
  $auth('snipResendEmail').onclick = async () => {
    const email = $auth('snipEmail').value.trim();
    const message = $auth('snipAuthMessage');
    const resendButton = $auth('snipResendEmail');

    if (!email) {
      message.textContent = 'Please enter your email address first.';
      return;
    }

    resendButton.disabled = true;
    message.textContent = 'Sending confirmation email...';

    try {
      const { error } = await auth.resend({
        type: 'signup',
        email: email
      });

      if (error) throw error;

      message.textContent =
        'A fresh confirmation email has been sent. Please check your inbox.';
    } catch (error) {
      message.textContent = error.message;
      console.error('SNIPEDLY resend email error:', error);
    } finally {
      resendButton.disabled = false;
    }
  };

  // Logout
  $auth('snipAuthLogout').onclick = async () => {
    const { error } = await auth.signOut();

    if (error) {
      $auth('snipAuthMessage').textContent = error.message;
    }
  };

  // Authentication state
  auth.onAuthStateChange((event, session) => {
    const button = $auth('snipAuthButton');
    const logout = $auth('snipAuthLogout');

    if (session?.user) {
      button.textContent = 'My Account';
      logout.style.display = 'inline-block';
      $auth('snipAuthMessage').textContent =
        'You are signed in to SNIPEDLY.';
      $auth('snipResendEmail').style.display = 'none';
    } else {
      button.textContent = 'Sign In / Join';
      logout.style.display = 'none';
    }
  });

  updateMode();
})();

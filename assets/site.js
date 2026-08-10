/* ============================================================
   STORM GUARD ROOFING & BUILDING — shared site script
   Every feature is guarded so this one file is safe on all pages.
   ============================================================ */
(function () {
  "use strict";

  /* Single source of truth for the WhatsApp number (intl format) */
  var WA_NUMBER = "447950814881";

  /* ---- Lead logger -> Google Sheet (Apps Script) ----------------------
     Logs every contact action: quote form, click-to-call, WhatsApp and
     email clicks. Deliberately NOT consent-gated — it sets no cookies and
     stores no identifiers, so it isn't analytics, and a declined banner
     must never cost a real enquiry. (The GA4 block below IS analytics.) */
  var LEAD_URL = "https://script.google.com/macros/s/AKfycbwotsxHho845Pb-Y7bzQD-r3CpAgI6B3dxSIkESKcMNZfJCe8Cx09fMJwzuSSbA8Nckuw/exec";

  /* NEVER navigator.sendBeacon here: it silently drops the /exec
     cross-origin 302 while returning true, so leads vanish with no error
     anywhere. fetch + keepalive + no-cors + text/plain is the only
     combination that works (text/plain avoids a CORS preflight that
     Apps Script won't answer). */
  function sendLead(d) {
    try {
      d.page = location.pathname || "/";
      fetch(LEAD_URL, {
        method: "POST", mode: "no-cors", keepalive: true,
        headers: { "Content-Type": "text/plain;charset=UTF-8" },
        body: JSON.stringify(d)
      });
    } catch (err) {}
  }

  /* Where on the page the click happened -> the Sheet's Source column. */
  function leadSource(el) {
    if (!el || !el.closest) return "page";
    if (el.classList && el.classList.contains("wa-float")) return "whatsapp widget";
    if (el.closest("#mobileMenu")) return "mobile menu";
    if (el.closest(".nav-dd") || el.closest("#nav")) return "nav";
    if (el.closest(".hero")) return "hero";
    if (el.closest(".phero")) return "page hero";
    if (el.closest(".quote-card")) return "quote box";
    if (el.closest(".contact-info")) return "contact card";
    if (el.closest(".faq-a")) return "FAQ answer";
    if (el.closest("form")) return "contact form";
    if (el.closest(".final")) return "bottom CTA";
    if (el.closest("footer")) return "footer";
    return "page";
  }

  /* Capture phase, so the row is away before the tel:/wa.me/mailto:
     navigation tears the page down; keepalive lets it survive unload. */
  document.addEventListener("click", function (e) {
    var t = e.target;
    var a = (t && t.closest) ? t.closest("a[href]") : null;
    if (!a) return;
    var h = a.getAttribute("href") || "";
    if (h.indexOf("tel:") === 0) {
      sendLead({ type: "Call click", phone: h.replace("tel:", ""), source: leadSource(a) });
    } else if (/wa\.me\/|api\.whatsapp\.com|whatsapp:/.test(h)) {
      sendLead({ type: "WhatsApp click", source: leadSource(a) });
    } else if (h.indexOf("mailto:") === 0) {
      sendLead({ type: "Email click", source: leadSource(a) });
    }
  }, true);

  /* ---- GA4 conversion events (click-to-call, WhatsApp, quote form) ---- */
  function sgTrack(name, params) {
    if (typeof window.gtag === "function") { window.gtag("event", name, params || {}); }
  }
  document.addEventListener("click", function (e) {
    var t = e.target;
    var a = (t && t.closest) ? t.closest("a[href]") : null;
    if (!a) return;
    var href = a.getAttribute("href") || "";
    if (href.indexOf("tel:") === 0) {
      sgTrack("click_to_call", {
        phone_number: href.replace("tel:", ""),
        link_text: (a.textContent || "").replace(/\s+/g, " ").trim().slice(0, 60)
      });
    } else if (/wa\.me\/|api\.whatsapp\.com|whatsapp:/.test(href)) {
      sgTrack("whatsapp_click", {
        source: a.classList.contains("wa-float") ? "floating_widget" : "cta_link"
      });
    }
  });

  /* ---- Year stamp ---- */
  var yr = document.getElementById("yr");
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---- Nav scroll shadow ---- */
  var nav = document.getElementById("nav");
  if (nav) {
    window.addEventListener("scroll", function () {
      nav.classList.toggle("scrolled", window.scrollY > 10);
    });
  }

  /* ---- Mobile menu ---- */
  var burger = document.getElementById("burger");
  var mobileMenu = document.getElementById("mobileMenu");
  if (burger && mobileMenu) {
    burger.addEventListener("click", function () {
      mobileMenu.classList.toggle("open");
    });
    mobileMenu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        mobileMenu.classList.remove("open");
      });
    });
  }

  /* ---- Mobile menu: collapsible Services accordion ---- */
  var mmToggle = document.querySelector(".mm-toggle");
  var mmGroup = document.getElementById("mmServices");
  if (mmToggle && mmGroup) {
    mmToggle.addEventListener("click", function () {
      var isOpen = mmGroup.classList.toggle("open");
      mmToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  /* ---- Hero video: nudge play if autoplay is blocked (e.g. iOS Low Power Mode) ---- */
  var heroVid = document.querySelector(".hero-video");
  if (heroVid) {
    var playHero = function () { return heroVid.play(); };
    var heroPromise = playHero();
    if (heroPromise && heroPromise.catch) {
      heroPromise.catch(function () {
        var evs = ["touchstart", "pointerdown", "scroll", "click"];
        var kick = function () {
          playHero().catch(function () {});
          evs.forEach(function (ev) { window.removeEventListener(ev, kick); });
        };
        evs.forEach(function (ev) { window.addEventListener(ev, kick, { passive: true }); });
      });
    }
  }

  /* ---- Hero slider (home) ---- */
  var slides = document.querySelectorAll(".hero-slide");
  var dotsWrap = document.getElementById("heroDots");
  if (slides.length && dotsWrap) {
    var heroIdx = 0, heroTimer;
    slides.forEach(function (_, i) {
      var b = document.createElement("button");
      b.setAttribute("aria-label", "Slide " + (i + 1));
      b.addEventListener("click", function () { setHero(i); resetHeroTimer(); });
      dotsWrap.appendChild(b);
    });
    var dots = dotsWrap.querySelectorAll("button");
    var setHero = function (i) {
      slides[heroIdx].classList.remove("active");
      dots[heroIdx].classList.remove("active");
      heroIdx = i;
      slides[heroIdx].classList.add("active");
      dots[heroIdx].classList.add("active");
    };
    var resetHeroTimer = function () {
      clearInterval(heroTimer);
      heroTimer = setInterval(function () { setHero((heroIdx + 1) % slides.length); }, 6000);
    };
    setHero(0); resetHeroTimer();
  }

  /* ---- Before / After sliders ---- */
  document.querySelectorAll(".ba-slider").forEach(function (sl) {
    var after = sl.querySelector(".ba-after");
    var handle = sl.querySelector(".ba-handle");
    if (!after || !handle) return;
    var setPos = function (clientX) {
      var r = sl.getBoundingClientRect();
      var pct = ((clientX - r.left) / r.width) * 100;
      pct = Math.max(4, Math.min(96, pct));
      after.style.clipPath = "inset(0 0 0 " + pct + "%)";
      handle.style.left = pct + "%";
    };
    var dragging = false;
    var start = function (e) { dragging = true; setPos(e.touches ? e.touches[0].clientX : e.clientX); };
    var move = function (e) { if (!dragging) return; setPos(e.touches ? e.touches[0].clientX : e.clientX); };
    var end = function () { dragging = false; };
    sl.addEventListener("mousedown", start);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", end);
    sl.addEventListener("touchstart", start, { passive: true });
    sl.addEventListener("touchmove", move, { passive: true });
    sl.addEventListener("touchend", end);
  });

  /* ---- Transformation videos: autoplay on view ---- */
  var baVideos = document.querySelectorAll(".ba-video");
  if (baVideos.length && "IntersectionObserver" in window) {
    var vidObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var v = en.target;
        if (en.isIntersecting) { v.play().catch(function () {}); }
        else { v.pause(); }
      });
    }, { threshold: 0.25 });
    baVideos.forEach(function (v) {
      v.muted = true;
      vidObserver.observe(v);
      var kick = function () {
        v.play().catch(function () {});
        window.removeEventListener("touchstart", kick);
        window.removeEventListener("scroll", kick);
      };
      window.addEventListener("touchstart", kick, { once: true, passive: true });
      window.addEventListener("scroll", kick, { once: true, passive: true });
    });
  }

  /* ---- Lazy background images (defer below-the-fold photos) ---- */
  var lazyBgs = document.querySelectorAll("[data-bg]");
  if (lazyBgs.length) {
    var loadBg = function (el) {
      el.style.backgroundImage = "url('" + el.getAttribute("data-bg") + "')";
      el.removeAttribute("data-bg");
    };
    if ("IntersectionObserver" in window) {
      var bgObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { loadBg(en.target); bgObserver.unobserve(en.target); }
        });
      }, { rootMargin: "300px" });
      lazyBgs.forEach(function (el) { bgObserver.observe(el); });
    } else {
      lazyBgs.forEach(loadBg);
    }
  }

  /* ---- Quote form -> WhatsApp ---- */
  var quoteForm = document.getElementById("quoteForm");
  if (quoteForm) {
    quoteForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var val = function (id) { var el = document.getElementById(id); return el ? el.value.trim() : ""; };
      var name = val("fName");
      var phone = val("fPhone");
      var postcode = val("fPostcode");
      var service = (document.getElementById("fService") || {}).value || "";
      var msg = val("fMsg");
      var text = "Hi Storm Guard, I'd like a free quote.\nEnquiry from your website (stormguardroofingdundee.co.uk).\n\nName: " + name + "\nPhone: " + phone;
      if (postcode) text += "\nPostcode: " + postcode;
      if (service) text += "\nService: " + service;
      if (msg) text += "\n\nDetails: " + msg;
      sgTrack("quote_form_submit", { service: service || "unspecified" });
      /* Postcode has no column of its own — fold it into Details so it
         still reaches the Sheet and the alert email. */
      sendLead({
        type: "Quote form", name: name, phone: phone, service: service,
        details: (postcode ? "Postcode: " + postcode + (msg ? "\n" : "") : "") + msg,
        source: "contact form"
      });
      window.open("https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(text), "_blank");
    });
  }
})();

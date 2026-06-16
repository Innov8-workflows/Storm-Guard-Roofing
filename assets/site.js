/* ============================================================
   STORM GUARD ROOFING & BUILDING — shared site script
   Every feature is guarded so this one file is safe on all pages.
   ============================================================ */
(function () {
  "use strict";

  /* Single source of truth for the WhatsApp number (intl format) */
  var WA_NUMBER = "447950814881";

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
      var text = "Hi Storm Guard, I'd like a free quote.\n\nName: " + name + "\nPhone: " + phone;
      if (postcode) text += "\nPostcode: " + postcode;
      if (service) text += "\nService: " + service;
      if (msg) text += "\n\nDetails: " + msg;
      window.open("https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(text), "_blank");
    });
  }
})();

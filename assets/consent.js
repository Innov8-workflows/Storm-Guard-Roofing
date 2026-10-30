(function () {
  "use strict";
  var GA4_ID = "G-3BQ2TE5PS5";
  var KEY = "sg-consent";
  var banner = null;
  var loaded = false;

  function getChoice() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function setChoice(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  function loadGa() {
    if (loaded) return;
    loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", GA4_ID);
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA4_ID;
    document.head.appendChild(s);
  }

  function clearGaCookies() {
    var host = location.hostname.replace(/^www\./, "");
    var domains = ["", location.hostname, "." + host];
    document.cookie.split(";").forEach(function (c) {
      var name = c.split("=")[0].trim();
      if (!/^_ga/.test(name)) return;
      domains.forEach(function (d) {
        document.cookie = name + "=; Max-Age=0; path=/" + (d ? "; domain=" + d : "");
      });
    });
  }

  function hideBanner() {
    if (banner) banner.hidden = true;
    document.documentElement.classList.remove("sg-cc-open");
  }

  function choose(v) {
    setChoice(v);
    hideBanner();
    if (v === "granted") { loadGa(); return; }
    window["ga-disable-" + GA4_ID] = true;
    clearGaCookies();
    if (loaded) location.reload();
  }

  function showBanner() {
    if (!banner) {
      var css = document.createElement("style");
      css.textContent =
        "#sg-cc{position:fixed;left:16px;right:16px;bottom:16px;z-index:200;max-width:720px;margin:0 auto;" +
        "background:#0E1530;color:#fff;border-radius:10px;padding:16px 20px;display:flex;align-items:center;" +
        "gap:16px;flex-wrap:wrap;box-shadow:0 12px 40px rgba(0,0,0,.35);font:500 15px/1.45 Inter,system-ui,sans-serif}" +
        "#sg-cc[hidden]{display:none}" +
        "#sg-cc p{margin:0;flex:1 1 240px;min-width:0}" +
        "#sg-cc a{color:#fff;text-decoration:underline;text-underline-offset:3px}" +
        "#sg-cc .sg-cc-btns{display:flex;gap:10px;flex-shrink:0}" +
        "#sg-cc button{font:600 15px/1 Inter,system-ui,sans-serif;min-width:110px;min-height:44px;padding:12px 20px;" +
        "border-radius:10px;border:2px solid #fff;background:#fff;color:#0E1530;cursor:pointer}" +
        "#sg-cc button:focus-visible{outline:3px solid #CE2B2B;outline-offset:2px}" +
        ".sg-cc-open .wa-float{bottom:var(--sg-cc-h,150px)!important}" +
        "@media(max-width:540px){#sg-cc{left:10px;right:10px;bottom:10px;padding:14px 16px;font-size:14px}" +
        "#sg-cc .sg-cc-btns{width:100%}#sg-cc button{flex:1;min-width:0}}";
      document.head.appendChild(css);
      banner = document.createElement("div");
      banner.id = "sg-cc";
      banner.setAttribute("role", "region");
      banner.setAttribute("aria-label", "Cookie choice");
      banner.innerHTML =
        "<p>We'd like to use Google Analytics cookies to see how people find and use this site. " +
        "They are only set if you accept. <a href=\"/privacy-policy.html#cookies\">Privacy and cookies</a></p>" +
        "<div class=\"sg-cc-btns\">" +
        "<button type=\"button\" data-choice=\"denied\">Decline</button>" +
        "<button type=\"button\" data-choice=\"granted\">Accept</button>" +
        "</div>";
      banner.addEventListener("click", function (e) {
        var b = e.target.closest("[data-choice]");
        if (b) choose(b.getAttribute("data-choice"));
      });
      document.body.appendChild(banner);
    }
    banner.hidden = false;
    document.documentElement.classList.add("sg-cc-open");
    document.documentElement.style.setProperty("--sg-cc-h", (banner.offsetHeight + 28) + "px");
  }

  if (getChoice() === "granted") loadGa();
  else if (getChoice() === "denied") clearGaCookies();

  function init() {
    var isReview = /\/review(\.html)?$/.test(location.pathname);
    if (!getChoice() && !isReview) showBanner();
    document.addEventListener("click", function (e) {
      var t = e.target.closest("[data-cookie-settings]");
      if (!t) return;
      e.preventDefault();
      showBanner();
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();

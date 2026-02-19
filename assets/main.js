// -----------------------------
// Partials (header/footer)
// -----------------------------
async function includePartials() {
  const targets = document.querySelectorAll("[data-include]");
  await Promise.all(
    Array.from(targets).map(async (el) => {
      const path = el.getAttribute("data-include");
      const res = await fetch(path, { cache: "no-cache" });

      if (!res.ok) {
        el.innerHTML = `<p style="color:#b91c1c">Failed to load: ${path}</p>`;
        return;
      }
      el.innerHTML = await res.text();
    })
  );
}

// -----------------------------
// Common UI helpers
// -----------------------------
function setLinkDisabled(a, reason) {
  a.dataset.href = a.getAttribute("href") || a.dataset.href || "";
  a.removeAttribute("href");
  a.setAttribute("aria-disabled", "true");
  a.setAttribute("tabindex", "-1");
  if (reason) a.setAttribute("title", reason);
}

function setLinkEnabled(a, href) {
  const finalHref = href ?? a.dataset.href ?? a.getAttribute("href");
  if (finalHref) a.setAttribute("href", finalHref);
  a.removeAttribute("aria-disabled");
  a.removeAttribute("tabindex");
  a.removeAttribute("title");
}

// -----------------------------
// Footer
// -----------------------------
function setupFooterYear() {
  const y = document.querySelector("[data-year]");
  if (y) y.textContent = String(new Date().getFullYear());
}

// -----------------------------
// Active nav highlight
// -----------------------------
function setupActiveNav() {
  const links = document.querySelectorAll("#site-menu a");
  const current = location.pathname.split("/").pop() || "index.html";

  links.forEach((a) => {
    const href = a.getAttribute("href");
    if (href === current) a.setAttribute("aria-current", "page");
    if ((current === "" || current === "index.html") && href === "index.html") {
      a.setAttribute("aria-current", "page");
    }
  });
}

// -----------------------------
// Hamburger menu + overlay
// -----------------------------
function setupHamburgerMenu() {
  const btn = document.querySelector(".hamburger");
  const menu = document.querySelector("#site-menu");
  const overlay = document.querySelector("[data-menu-overlay]");
  if (!btn || !menu || !overlay) return;

  const isDesktop = () => window.matchMedia("(min-width: 900px)").matches;

  const openMenu = () => {
    if (isDesktop()) return;
    btn.setAttribute("aria-expanded", "true");
    btn.setAttribute("aria-label", "メニューを閉じる");
    menu.dataset.open = "true";
    overlay.hidden = false;
    document.body.classList.add("no-scroll");
  };

  const closeMenu = () => {
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-label", "メニューを開く");
    menu.dataset.open = "false";
    overlay.hidden = true;
    document.body.classList.remove("no-scroll");
  };

  btn.addEventListener("click", () => {
    const open = btn.getAttribute("aria-expanded") === "true";
    open ? closeMenu() : openMenu();
  });

  overlay.addEventListener("click", closeMenu);

  menu.addEventListener("click", (e) => {
    const t = e.target;
    if (t instanceof HTMLAnchorElement) closeMenu();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  window.addEventListener("resize", () => {
    if (isDesktop()) closeMenu();
  });
}

// -----------------------------
// Language toggle (header pill)
// - enabled only on About/CV pairs
// -----------------------------
function setupLangToggle() {
  const wrap = document.querySelector("[data-lang-toggle]");
  if (!wrap) return;

  const btnJa = wrap.querySelector('[data-lang="ja"]');
  const btnEn = wrap.querySelector('[data-lang="en"]');
  if (!btnJa || !btnEn) return;

  const current = location.pathname.split("/").pop() || "index.html";

  const pairs = {
    "index.html": { ja: "index.html", en: "about-en.html" },
    "about-en.html": { ja: "index.html", en: "about-en.html" },
    "cv.html": { ja: "cv.html", en: "cv-en.html" },
    "cv-en.html": { ja: "cv.html", en: "cv-en.html" },
  };

  const isEn = current.endsWith("-en.html");
  const activeLang = isEn ? "en" : "ja";

  // active visual state
  btnJa.toggleAttribute("aria-current", activeLang === "ja");
  btnEn.toggleAttribute("aria-current", activeLang === "en");

  if (pairs[current]) {
    setLinkEnabled(btnJa, pairs[current].ja);
    setLinkEnabled(btnEn, pairs[current].en);
  } else {
    const msg = "This toggle is available only on About / CV pages.";
    setLinkDisabled(btnJa, msg);
    setLinkDisabled(btnEn, msg);
  }
}

// -----------------------------
// Menu gating:
// - On EN pages, JP-only menu items are disabled
//   (prevents jumping into Japanese pages unexpectedly)
// -----------------------------
function setupMenuLanguageGating() {
  const current = location.pathname.split("/").pop() || "index.html";
  const isEn = current.endsWith("-en.html");

  const jpLinks = document.querySelectorAll('#site-menu a[data-jp-only]');
  const enLinks = document.querySelectorAll('#site-menu a[data-en]');

  if (isEn) {
    jpLinks.forEach((a) =>
      setLinkDisabled(a, "JP pages are disabled on English pages.")
    );
    enLinks.forEach((a) => setLinkEnabled(a));
  } else {
    // JP pages: allow everything (EN pages exist only for About/CV)
    jpLinks.forEach((a) => setLinkEnabled(a));
    enLinks.forEach((a) => setLinkEnabled(a));
  }
}

// -----------------------------
// Boot
// -----------------------------
(async function main() {
  await includePartials(); // header/footer are inserted here

  setupFooterYear();
  setupHamburgerMenu();
  setupActiveNav();
  setupLangToggle();
  setupMenuLanguageGating();
})();

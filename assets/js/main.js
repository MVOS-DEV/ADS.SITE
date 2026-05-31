/* ==========================================================================
   ADS.SITE - assets/js/main.js
   Funções:
   - Transição suave entre páginas (fade)
   - Menu mobile (abre/fecha)
   - Scroll-reveal (anima elementos ao aparecer)
   - Lightbox na galeria (abrir/fechar com mouse/teclado)
   ========================================================================== */

(() => {
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // ------------------------------
  // 1) Menu mobile
  // ------------------------------
  const topbar = qs("[data-topbar]");
  const toggle = qs("[data-nav-toggle]");
  if (topbar && toggle) {
    toggle.addEventListener("click", () => {
      const isOpen = topbar.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    // Fecha o menu ao clicar em um link (melhor UX no celular)
    qsa("a[data-nav-link]", topbar).forEach((a) => {
      a.addEventListener("click", () => {
        topbar.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // ------------------------------
  // 2) Transição entre páginas (fade-out ao navegar)
  // - Mantém links normais (não bloqueia ctrl+click, etc.)
  // ------------------------------
  const isSameOrigin = (url) => {
    try {
      const u = new URL(url, window.location.href);
      return u.origin === window.location.origin;
    } catch {
      return false;
    }
  };

  const shouldHandle = (a, e) => {
    if (!a || !a.href) return false;
    if (!isSameOrigin(a.href)) return false;
    if (a.target && a.target !== "_self") return false;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;
    if (a.hasAttribute("download")) return false;
    return true;
  };

  document.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!shouldHandle(a, e)) return;

    const href = a.getAttribute("href") || "";
    if (href.startsWith("#")) return; // âncoras internas

    e.preventDefault();
    document.documentElement.classList.add("is-leaving");
    window.setTimeout(() => {
      window.location.href = a.href;
    }, 220);
  });

  // ------------------------------
  // 3) Scroll-reveal
  // - Coloque a classe .reveal em qualquer bloco que queira animar
  // ------------------------------
  const revealEls = qsa(".reveal");
  if (revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  // ------------------------------
  // 4) Lightbox (Galeria)
  // - Elementos com [data-shot] abrem a imagem em modal
  // ------------------------------
  const lightbox = qs("[data-lightbox]");
  const lightboxImg = qs("[data-lightbox-img]");
  const lightboxTitle = qs("[data-lightbox-title]");
  const closeBtn = qs("[data-lightbox-close]");

  const openLightbox = ({ src, alt }) => {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightboxImg.alt = alt || "Imagem ampliada";
    if (lightboxTitle) lightboxTitle.textContent = alt || "Imagem";
    lightbox.classList.add("is-open");
    document.body.style.overflow = "hidden";
    (closeBtn || lightbox).focus?.();
  };

  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.classList.remove("is-open");
    document.body.style.overflow = "";
    if (lightboxImg) {
      lightboxImg.src = "";
      lightboxImg.alt = "";
    }
  };

  if (lightbox) {
    qsa("[data-shot]").forEach((shot) => {
      shot.addEventListener("click", () => {
        const img = qs("img", shot);
        if (!img) return;
        openLightbox({ src: img.src, alt: img.alt });
      });
      shot.addEventListener("keydown", (e) => {
        if (e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        shot.click();
      });
    });

    closeBtn?.addEventListener("click", closeLightbox);

    // Clique fora do painel fecha
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    // Tecla ESC fecha
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeLightbox();
    });
  }
})();


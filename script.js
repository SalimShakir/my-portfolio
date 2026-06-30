// your code goes here
document.addEventListener("DOMContentLoaded", () => {

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const enhancedInteractions = !prefersReducedMotion && hasFinePointer;

  /* ------------------------------------------------------------
     1. SCROLL-REVEAL  (.reveal-item / .reveal-up)
     ------------------------------------------------------------ */
  const revealEls = document.querySelectorAll(".reveal-item, .reveal-up");
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  revealEls.forEach((el) => revealObserver.observe(el));

  /* ------------------------------------------------------------
     2. SKILL BARS — fill to data-width once visible
     ------------------------------------------------------------ */
  const skillBars = document.querySelectorAll(".skill-bar-fill");
  const barObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const target = entry.target;
          const width = target.getAttribute("data-width") || "0%";
          // Small delay so the bar grows right as the card finishes revealing
          requestAnimationFrame(() => {
            target.style.width = width;
          });
          barObserver.unobserve(target);
        }
      });
    },
    { threshold: 0.4 }
  );
  skillBars.forEach((bar) => barObserver.observe(bar));

  /* ------------------------------------------------------------
     3. NAV — scrolled state + scroll progress bar (rAF-throttled)
     ------------------------------------------------------------ */
  const navbar = document.getElementById("navbar");
  const scrollProgress = document.getElementById("scrollProgress");
  const backToTop = document.getElementById("backToTop");

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const scrollY = window.scrollY || window.pageYOffset;

      navbar.classList.toggle("nav--scrolled", scrollY > 10);
      backToTop.classList.toggle("is-visible", scrollY > 500);

      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
      scrollProgress.style.width = pct + "%";

      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  });

  /* ------------------------------------------------------------
     4. MOBILE NAV TOGGLE
     ------------------------------------------------------------ */
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");

  function closeMobileNav() {
    navLinks.classList.remove("is-open");
    navToggle.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  }

  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("is-open");
    navToggle.classList.toggle("is-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMobileNav);
  });

  /* ------------------------------------------------------------
     5. ACTIVE-SECTION NAV HIGHLIGHT + SLIDING PILL
     ------------------------------------------------------------ */
  const navPill = document.getElementById("navPill");
  const navAnchors = Array.from(navLinks.querySelectorAll("a[data-section]"));
  const sections = navAnchors
    .map((a) => document.getElementById(a.dataset.section))
    .filter(Boolean);

  function movePillTo(linkEl) {
    if (!linkEl) {
      navPill.style.opacity = "0";
      return;
    }
    const containerRect = navLinks.getBoundingClientRect();
    const rect = linkEl.parentElement.getBoundingClientRect();
    navPill.style.left = (rect.left - containerRect.left) + "px";
    navPill.style.width = rect.width + "px";
    navPill.classList.add("is-active");
  }

  let currentActiveLink = null;

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navAnchors.forEach((a) => a.classList.remove("nav--active"));
          const activeLink = navAnchors.find((a) => a.dataset.section === id);
          if (activeLink) {
            activeLink.classList.add("nav--active");
            currentActiveLink = activeLink;
            movePillTo(activeLink);
          }
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
  );
  sections.forEach((s) => sectionObserver.observe(s));

  // Hover preview of the pill on desktop; snaps back to active link on leave
  navAnchors.forEach((a) => {
    a.addEventListener("mouseenter", () => movePillTo(a));
  });
  navLinks.addEventListener("mouseleave", () => movePillTo(currentActiveLink));
  window.addEventListener("resize", () => movePillTo(currentActiveLink));

  
  
  /* ------------------------------------------------------------
     7. MAGNETIC BUTTONS  (.magnetic)
     ------------------------------------------------------------ */
  if (enhancedInteractions) {
    document.querySelectorAll(".magnetic").forEach((el) => {
      const strength = 0.28;
      const maxOffset = 10;

      el.addEventListener("mousemove", (e) => {
        const rect = el.getBoundingClientRect();
        const relX = e.clientX - rect.left - rect.width / 2;
        const relY = e.clientY - rect.top - rect.height / 2;
        const mx = Math.max(-maxOffset, Math.min(maxOffset, relX * strength));
        const my = Math.max(-maxOffset, Math.min(maxOffset, relY * strength));
        el.style.setProperty("--mx", mx.toFixed(2) + "px");
        el.style.setProperty("--my", my.toFixed(2) + "px");
      });

      el.addEventListener("mouseleave", () => {
        el.style.setProperty("--mx", "0px");
        el.style.setProperty("--my", "0px");
      });
    });
  }

  /* ------------------------------------------------------------
     8. TILT CARDS  (.tilt-card)
     ------------------------------------------------------------ */
  if (enhancedInteractions) {
    document.querySelectorAll(".tilt-card").forEach((card) => {
      const maxTilt = 6; // degrees

      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;  // 0 -> 1
        const py = (e.clientY - rect.top) / rect.height;  // 0 -> 1
        const ry = (px - 0.5) * maxTilt * 2;
        const rx = (0.5 - py) * maxTilt * 2;
        card.style.setProperty("--rx", rx.toFixed(2) + "deg");
        card.style.setProperty("--ry", ry.toFixed(2) + "deg");
      });

      card.addEventListener("mouseleave", () => {
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
      });
    });
  }

  /* ------------------------------------------------------------
     9. HERO ORB PARALLAX
     ------------------------------------------------------------ */
  if (enhancedInteractions) {
    const hero = document.getElementById("hero");
    const orb1 = document.querySelector(".hero-orb--1");
    const orb2 = document.querySelector(".hero-orb--2");

    hero.addEventListener("mousemove", (e) => {
      const rect = hero.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;

      if (orb1) {
        orb1.style.setProperty("--px", (px * -30).toFixed(1) + "px");
        orb1.style.setProperty("--py", (py * -30).toFixed(1) + "px");
      }
      if (orb2) {
        orb2.style.setProperty("--px", (px * 22).toFixed(1) + "px");
        orb2.style.setProperty("--py", (py * 22).toFixed(1) + "px");
      }
    });

    hero.addEventListener("mouseleave", () => {
      [orb1, orb2].forEach((orb) => {
        if (!orb) return;
        orb.style.setProperty("--px", "0px");
        orb.style.setProperty("--py", "0px");
      }); 
    });
  }

});

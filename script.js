// Shared project data for homepage previews and the portfolio page.
const projects = [
  {
    id: "quicksand-gym",
    name: "Quicksand Gym",
    category: "لوحات خارجية",
    imageCount: 13,
    image: "images/Quicksand gym/Quicksand gym 1-thumb.webp",
    imageWidth: 800,
    imageHeight: 1000,
    featured: true,
    detailUrl: "project-detail.html?id=quicksand-gym"
  },
  {
    id: "seven",
    name: "Seven",
    category: "واجهات",
    imageCount: 5,
    image: "images/Seven/Seven 1-thumb.webp",
    imageWidth: 800,
    imageHeight: 1000,
    featured: true,
    detailUrl: "project-detail.html?id=seven"
  },
  {
    id: "logo-branding",
    name: "Logo / Branding",
    category: "هوية بصرية",
    imageCount: 2,
    image: "images/LOGO/Uram PP-thumb.webp",
    imageWidth: 800,
    imageHeight: 800,
    featured: true,
    detailUrl: "project-detail.html?id=logo-branding"
  }
];

const createProjectCard = (project, options = {}) => {
  const cardClass = options.cardClass || "project-card";
  const buttonText = options.buttonText || "عرض المشروع ←";
  const imageWidth = options.imageWidth || project.imageWidth || 800;
  const imageHeight = options.imageHeight || project.imageHeight || 800;
  const card = document.createElement("article");

  card.className = cardClass;
  card.dataset.category = project.category;
  card.innerHTML = `
    <a href="${project.detailUrl}" aria-label="عرض مشروع ${project.name}">
      <span class="${cardClass}__media">
        <img
          src="${project.image}"
          alt="${project.name}"
          loading="lazy"
          decoding="async"
          width="${imageWidth}"
          height="${imageHeight}"
        />
      </span>
      <span class="${cardClass}__content">
        <span class="${cardClass}__meta">
          <span>${project.category}</span>
          <span>صور ${project.imageCount}</span>
        </span>
        <strong>${project.name}</strong>
        <span class="${cardClass}__button">${buttonText}</span>
      </span>
    </a>
  `;

  return card;
};

// Mobile navigation toggle for small screens.
const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("is-open");

    menuToggle.classList.toggle("is-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  // Close the mobile menu after choosing a navigation link.
  mainNav.addEventListener("click", (event) => {
    if (event.target.matches("a")) {
      mainNav.classList.remove("is-open");
      menuToggle.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
    }
  });
}

// Header compact state.
(() => {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const updateHeader = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 16);
  };

  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();
})();

// Smooth navbar scrolling and active-section state for same-page anchors.
(() => {
  const navLinks = Array.from(document.querySelectorAll('.main-nav a[href^="#"]'));
  const logoLink = document.querySelector('.site-header .brand-logo[href^="#"]');
  const sectionIds = ["home", "services", "about", "contact"];
  const sections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);

  if (!navLinks.length || !sections.length) return;

  const setActiveSection = (sectionId) => {
    navLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${sectionId}`;
      link.classList.toggle("is-active", isActive);

      if (isActive) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  const scrollToSection = (sectionId) => {
    const target = document.getElementById(sectionId);
    if (!target) return;

    target.scrollIntoView({ behavior: "smooth" });
    setActiveSection(sectionId);
  };

  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const sectionId = link.hash.slice(1);
      if (!sectionId || !document.getElementById(sectionId)) return;

      event.preventDefault();
      scrollToSection(sectionId);
    });
  });

  if (logoLink) {
    logoLink.addEventListener("click", (event) => {
      event.preventDefault();
      scrollToSection("home");
    });
  }

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        const activeEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (activeEntry) {
          setActiveSection(activeEntry.target.id);
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    sections.forEach((section) => observer.observe(section));
  } else {
    const updateActiveOnScroll = () => {
      const currentSection = sections.reduce((current, section) => {
        const distance = Math.abs(section.getBoundingClientRect().top - 90);
        return distance < current.distance ? { id: section.id, distance } : current;
      }, { id: sections[0].id, distance: Number.POSITIVE_INFINITY });

      setActiveSection(currentSection.id);
    };

    window.addEventListener("scroll", updateActiveOnScroll, { passive: true });
    updateActiveOnScroll();
  }
})();

// Render selected works on the homepage.
(() => {
  const selectedWorks = document.querySelector("[data-selected-works]");
  if (!selectedWorks) return;

  const fragment = document.createDocumentFragment();
  projects
    .filter((project) => project.featured)
    .slice(0, 3)
    .forEach((project) => {
      fragment.append(createProjectCard(project, {
        cardClass: "selected-work-card",
        buttonText: "عرض المشروع ←"
      }));
    });

  selectedWorks.append(fragment);
})();

// Render and filter the dedicated portfolio page.
(() => {
  const grid = document.querySelector("[data-projects-grid]");
  const filterBar = document.querySelector(".filter-bar");
  const filterButtons = Array.from(document.querySelectorAll("[data-filter]"));

  if (!grid || !filterButtons.length) return;

  const fragment = document.createDocumentFragment();
  projects.forEach((project) => {
    fragment.append(createProjectCard(project));
  });
  grid.append(fragment);

  const cards = Array.from(grid.querySelectorAll(".project-card"));

  const setFilter = (filter) => {
    filterButtons.forEach((button) => {
      const isActive = button.dataset.filter === filter;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    cards.forEach((card) => {
      const isVisible = filter === "الكل" || card.dataset.category === filter;

      if (card.hideTimer) {
        window.clearTimeout(card.hideTimer);
      }

      if (isVisible) {
        card.hidden = false;
        card.setAttribute("aria-hidden", "false");
        requestAnimationFrame(() => {
          card.classList.remove("is-hiding");
        });
      } else {
        card.classList.add("is-hiding");
        card.setAttribute("aria-hidden", "true");
        card.hideTimer = window.setTimeout(() => {
          card.hidden = true;
        }, 260);
      }
    });
  };

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => setFilter(button.dataset.filter));
  });

  if (filterBar) {
    const updateFilterShadow = () => {
      filterBar.classList.toggle("is-stuck", window.scrollY > 120);
    };

    window.addEventListener("scroll", updateFilterShadow, { passive: true });
    updateFilterShadow();
  }

  setFilter("الكل");
})();

// Scroll-triggered staggered reveal for service cards.
(() => {
  const cards = document.querySelectorAll(".service-card");
  if (!cards.length) return;

  // Assign stagger index to each card for CSS transition-delay.
  cards.forEach((card, i) => {
    card.style.setProperty("--card-index", i);
  });

  // Respect prefers-reduced-motion: show cards immediately.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    cards.forEach((card) => card.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );

  cards.forEach((card) => observer.observe(card));
})();

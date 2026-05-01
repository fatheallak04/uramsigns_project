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

// Smooth navbar scrolling and active-section state.
(() => {
  const navLinks = Array.from(document.querySelectorAll('.main-nav a[href^="#"]'));
  const logoLink = document.querySelector('.site-header .brand-logo[href^="#"]');
  const sectionIds = ["home", "services", "portfolio", "about", "contact"];
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

// Folder-based portfolio gallery.
(() => {
  const projects = [
    {
      id: "quicksand",
      title: "Quicksand Gym",
      category: "لوحات خارجية وحروف بارزة",
      description: "تنفيذ واجهة بصرية متكاملة بتفاصيل ثلاثية الأبعاد وحضور واضح.",
      images: [
        "images/Quicksand gym/Quicksand gym 1.png",
        "images/Quicksand gym/Quicksand gym 2.png",
        "images/Quicksand gym/Quicksand gym 3.png",
        "images/Quicksand gym/Quicksand gym 4.png",
        "images/Quicksand gym/Quicksand gym 5.png",
        "images/Quicksand gym/Quicksand gym 6.png",
        "images/Quicksand gym/Quicksand gym 7.png",
        "images/Quicksand gym/Quicksand gym 8.png",
        "images/Quicksand gym/Quicksand gym 9.png",
        "images/Quicksand gym/Quicksand gym 9_1.png",
        "images/Quicksand gym/Quicksand gym 10.png",
        "images/Quicksand gym/Quicksand gym 11.png",
        "images/Quicksand gym/Quicksand gym CTA.png"
      ]
    },
    {
      id: "seven",
      title: "Seven",
      category: "لوحات وهوية واجهات",
      description: "تطبيق هوية بصرية على واجهة تجارية بأسلوب واضح واحترافي.",
      images: [
        "images/Seven/Seven 1.png",
        "images/Seven/Seven 2.png",
        "images/Seven/Seven 3.png",
        "images/Seven/Seven 4.png",
        "images/Seven/Seven CTA.png"
      ]
    },
    {
      id: "logo",
      title: "Logo / Branding",
      category: "هوية بصرية",
      description: "تصميم وتطبيق عناصر الهوية البصرية بأسلوب متناسق.",
      images: [
        "images/LOGO/Uram PP.png",
        "images/LOGO/Uram PP 2.png"
      ]
    }
  ];

  const featuredImage = document.querySelector(".featured-project-image");
  const overlay = document.querySelector(".featured-project-overlay");
  const featuredCategory = document.querySelector(".featured-project-category");
  const featuredTitle = document.querySelector(".featured-project-title");
  const featuredDescription = document.querySelector(".featured-project-description");
  const featuredInfo = document.querySelector(".featured-project-info");
  const imageCounter = document.querySelector("[data-project-counter]");
  const previousImageButton = document.querySelector("[data-project-prev]");
  const nextImageButton = document.querySelector("[data-project-next]");
  const projectList = document.querySelector("[data-project-list]");
  const thumbnailList = document.querySelector("[data-project-thumbnails]");
  const stripPreviousButton = document.querySelector("[data-strip-prev]");
  const stripNextButton = document.querySelector("[data-strip-next]");

  if (!featuredImage || !overlay || !featuredCategory || !featuredTitle || !featuredDescription || !featuredInfo || !imageCounter || !previousImageButton || !nextImageButton || !projectList || !thumbnailList || !stripPreviousButton || !stripNextButton) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let isSwitching = false;
  let activeProjectIndex = 0;
  let activeImageIndex = 0;
  const formatCounter = (imageIndex, totalImages) => `${String(imageIndex + 1).padStart(2, "0")} / ${String(totalImages).padStart(2, "0")}`;
  const getActiveProject = () => projects[activeProjectIndex];

  const getImageLabel = (project, imageIndex) => `${project.title} - صورة ${imageIndex + 1}`;

  const setFeaturedImage = (project, imageIndex) => {
    activeImageIndex = imageIndex;
    featuredImage.src = project.images[imageIndex];
    featuredImage.alt = getImageLabel(project, imageIndex);
    featuredCategory.textContent = project.category;
    featuredTitle.textContent = project.title;
    featuredDescription.textContent = project.description;
    imageCounter.textContent = formatCounter(imageIndex, project.images.length);
  };

  const updateActiveThumbnail = () => {
    thumbnailList.querySelectorAll(".project-thumb").forEach((thumb, index) => {
      thumb.classList.toggle("is-active", index === activeImageIndex);
      thumb.setAttribute("aria-pressed", String(index === activeImageIndex));
      if (index === activeImageIndex) {
        thumb.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", inline: "nearest", block: "nearest" });
      }
    });
  };

  const switchFeaturedImage = (project, imageIndex) => {
    if (isSwitching || imageIndex === activeImageIndex) return;
    isSwitching = true;

    if (reducedMotion) {
      setFeaturedImage(project, imageIndex);
      updateActiveThumbnail();
      isSwitching = false;
      return;
    }

    featuredImage.classList.add("is-switching");
    overlay.classList.add("is-switching");
    featuredInfo.classList.add("is-switching");

    setTimeout(() => {
      setFeaturedImage(project, imageIndex);
      updateActiveThumbnail();

      requestAnimationFrame(() => {
        featuredImage.classList.remove("is-switching");
        overlay.classList.remove("is-switching");
        featuredInfo.classList.remove("is-switching");
        setTimeout(() => { isSwitching = false; }, 500);
      });
    }, 360);
  };

  const stepImage = (direction) => {
    const project = getActiveProject();
    const nextIndex = (activeImageIndex + direction + project.images.length) % project.images.length;
    switchFeaturedImage(project, nextIndex);
  };

  const renderThumbnails = (project) => {
    thumbnailList.innerHTML = "";

    project.images.forEach((image, imageIndex) => {
      const button = document.createElement("button");
      button.className = "project-thumb";
      button.type = "button";
      button.setAttribute("aria-label", getImageLabel(project, imageIndex));
      button.setAttribute("aria-pressed", String(imageIndex === activeImageIndex));

      const img = document.createElement("img");
      img.src = image;
      img.alt = "";
      img.loading = imageIndex > 3 ? "lazy" : "eager";
      button.append(img);
      button.classList.toggle("is-active", imageIndex === activeImageIndex);

      button.addEventListener("click", () => {
        switchFeaturedImage(project, imageIndex);
      });

      thumbnailList.append(button);
    });
  };

  const updateActiveProject = () => {
    projectList.querySelectorAll(".project-folder").forEach((button, index) => {
      button.classList.toggle("is-active", index === activeProjectIndex);
      button.setAttribute("aria-pressed", String(index === activeProjectIndex));
    });
  };

  const renderProject = (projectIndex) => {
    if (isSwitching || projectIndex === activeProjectIndex) return;
    const project = projects[projectIndex];
    activeProjectIndex = projectIndex;
    activeImageIndex = 0;
    updateActiveProject();

    if (reducedMotion) {
      setFeaturedImage(project, 0);
      renderThumbnails(project);
      return;
    }

    isSwitching = true;
    featuredImage.classList.add("is-switching");
    overlay.classList.add("is-switching");
    featuredInfo.classList.add("is-switching");

    setTimeout(() => {
      setFeaturedImage(project, 0);
      renderThumbnails(project);

      requestAnimationFrame(() => {
        featuredImage.classList.remove("is-switching");
        overlay.classList.remove("is-switching");
        featuredInfo.classList.remove("is-switching");
        setTimeout(() => { isSwitching = false; }, 500);
      });
    }, 360);
  };

  projects.forEach((project, projectIndex) => {
    const button = document.createElement("button");
    button.className = "project-folder";
    button.type = "button";
    button.setAttribute("aria-pressed", String(projectIndex === activeProjectIndex));

    const title = document.createElement("strong");
    const category = document.createElement("small");
    const count = document.createElement("span");

    title.textContent = project.title;
    category.textContent = project.category;
    count.textContent = `${project.images.length} صور`;
    button.append(title, category, count);
    button.classList.toggle("is-active", projectIndex === activeProjectIndex);

    button.addEventListener("click", () => {
      renderProject(projectIndex);
    });

    projectList.append(button);
  });

  setFeaturedImage(projects[0], 0);
  renderThumbnails(projects[0]);

  previousImageButton.addEventListener("click", () => stepImage(-1));
  nextImageButton.addEventListener("click", () => stepImage(1));

  stripPreviousButton.addEventListener("click", () => {
    thumbnailList.scrollBy({ left: -thumbnailList.clientWidth * 0.6, behavior: reducedMotion ? "auto" : "smooth" });
  });

  stripNextButton.addEventListener("click", () => {
    thumbnailList.scrollBy({ left: thumbnailList.clientWidth * 0.6, behavior: reducedMotion ? "auto" : "smooth" });
  });
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

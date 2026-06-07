// ========================================================================
// DOM ELEMENT SELECTION
// ========================================================================
const navbar = document.querySelector(".navbar");
const hamburger = document.getElementById("hamburger-toggle");
const navLinks = document.querySelector(".nav-links");

// ========================================================================
// NAVBAR SCROLL EFFECT (TRANSPARENT TO SOLID)
// ========================================================================
window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    navbar.classList.add("navbar-scrolled");
  } else {
    navbar.classList.remove("navbar-scrolled");
  }
});

// ========================================================================
// HAMBURGER MENU TOGGLE (RESPONSIVE MOBILE)
// ========================================================================
hamburger.addEventListener("click", () => {
  navLinks.classList.toggle("mobile-active");

  const bars = hamburger.querySelectorAll(".bar");
  hamburger.classList.toggle("active");

  if (hamburger.classList.contains("active")) {
    bars[0].style.transform = "rotate(-45deg) translate(-5px, 6px)";
    bars[1].style.opacity = "0";
    bars[2].style.transform = "rotate(45deg) translate(-5px, -6px)";
  } else {
    bars[0].style.transform = "none";
    bars[1].style.opacity = "1";
    bars[2].style.transform = "none";
  }
});

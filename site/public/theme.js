// Restore site appearance before painting, without loading the catalogue.
// The js class lets the style sheet reserve room for what a script fills in later.
document.documentElement.classList.add('js');
try {
  const mode = localStorage.getItem('ensigns-mode');
  if (mode === 'light' || mode === 'dark') document.documentElement.dataset.mode = mode;
  const family = localStorage.getItem('ensigns-family');
  const families = document.documentElement.dataset.siteFamilies.split(' ');
  if (families.includes(family)) document.documentElement.dataset.family = family;
} catch { /* The default family and system appearance still work. */ }

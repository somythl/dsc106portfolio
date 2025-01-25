console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// let navLinks = $$("nav a");

// let currentLink = navLinks.find(
//     (a) => a.host === location.host && a.pathname === location.pathname
//   );
  
//   if (currentLink) {
//     // or if (currentLink !== undefined)
//     currentLink.classList.add('current');
//   }


const ARE_WE_HOME = document.documentElement.classList.contains('home');

let pages = [
  { url: '', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  { url: 'contact/', title: 'Contact' },
  { url: 'resume/', title: 'Resume' },
  { url: 'https://github.com/somythl/', title: 'GitHub' },
];

let nav = document.createElement('nav');
nav.classList.add('topnav');
document.body.prepend(nav);

for (let p of pages) {
  let url = p.url;
  let title = p.title;

  // Adjust relative URLs if not on the home page
  if (!ARE_WE_HOME && !url.startsWith('http')) {
    url = '../' + url;
  }

  // Create the anchor element
  let a = document.createElement('a');
  a.href = url;
  a.textContent = title;

  // Highlight the current page
  a.classList.toggle(
    'current',
    a.host === location.host && a.pathname === location.pathname
  );

  // Open external links in a new tab
  a.target = a.host !== location.host ? '_blank' : '_self';

  // Add the link to the navigation
  nav.append(a);
}

document.body.insertAdjacentHTML(
    'afterbegin',
    `
    <label class="color-scheme">
      Theme:
      <select id="theme-switcher">
        <option value="auto">Automatic</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>
    `
  );

  const select = document.querySelector('#theme-switcher');

  const savedColorScheme = localStorage.getItem('colorScheme') || 'auto';

// Apply the saved color scheme
document.documentElement.style.setProperty('color-scheme', savedColorScheme);

// Update the dropdown to match the saved preference
select.value = savedColorScheme;

// Listen for changes to the dropdown
select.addEventListener('input', function (event) {
  const newColorScheme = event.target.value;

  console.log('Color scheme changed to', newColorScheme);

  // Update the color scheme on the root element
  document.documentElement.style.setProperty('color-scheme', newColorScheme);

  // Save the preference to localStorage
  localStorage.setItem('colorScheme', newColorScheme);
});
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
  { url: 'meta/', title: 'Meta' },
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




// this is for automating the projects cards


export async function fetchJSON(url) {
  try {
      // Fetch the JSON file from the given URL
      const response = await fetch(url);
      console.log("Fetch Response:", response);
      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }
    const data = await response.json();
    console.log("Fetched Data:", data);

    return data;
    


  } catch (error) {
      console.error('Error fetching or parsing JSON data:', error);
      return []
  }
}

export function renderProjects(projects, containerElement, headingLevel = 'h2') {
  // Ensure the container element is valid
  if (!containerElement) {
      console.error("Invalid container element provided.");
      return;
  }

  // Validate headingLevel to ensure it's an actual heading tag (h1-h6)
  const validHeadingLevels = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  if (!validHeadingLevels.includes(headingLevel)) {
      console.warn(`Invalid heading level '${headingLevel}', defaulting to 'h2'`);
      headingLevel = 'h2'; // Default to h2 if invalid
  }

  // Clear previous content before rendering new projects
  containerElement.innerHTML = '';

  // Iterate through each project and create an article dynamically
  projects.forEach(project => {
      // Create an <article> element
      const article = document.createElement('article');

      // Ensure all properties exist, providing default values if missing
      const title = project.title || "Untitled Project";
      const image = project.image || "https://vis-society.github.io/labs/2/images/empty.svg";
      const year = project.year || "Unknown Year"
      const description = project.description || "No description available.";

      // Create the heading dynamically
      const heading = document.createElement(headingLevel);
      heading.textContent = title;

      // Create an image element
      const img = document.createElement('img');
      img.src = image;
      img.alt = title;

      const metaContainer = document.createElement('div');
      metaContainer.classList.add("project-meta");

      // Create a paragraph for the description
      const paragraph = document.createElement('p');
      paragraph.textContent = description;
      
      const yearSpan = document.createElement('span');
      yearSpan.classList.add('project-year'); // ✅ Add the correct class
      yearSpan.textContent = "⏳ " + year;
      
      metaContainer.appendChild(yearSpan);
      metaContainer.appendChild(paragraph);
      

      // Append elements to the article
      article.appendChild(heading);
      article.appendChild(img);
      article.appendChild(metaContainer);

      containerElement.appendChild(article);
  });
}

export async function fetchGitHubData(username) {
  try {
      const response = await fetch(`https://api.github.com/users/${username}`);

      if (!response.ok) {
          throw new Error(`GitHub API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("✅ GitHub Data:", data); // Debugging: Check fetched data

      return data;
  } catch (error) {
      console.error("❌ Error fetching GitHub data:", error);
      return null; // Return null if fetching fails
  }
}
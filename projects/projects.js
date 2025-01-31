import { fetchJSON, renderProjects } from '../global.js'; // Ensure the correct path

document.addEventListener("DOMContentLoaded", async () => {
    try {
        // Fetch project data
        const projects = await fetchJSON('../lib/projects.json');

        // Log the fetched projects to debug
        console.log("Fetched projects:", projects);

        // Select the container where projects should be rendered
        const projectsContainer = document.querySelector('.projects');

        // Select the project count element
        const projectCountElement = document.getElementById('project-count');

        // Ensure the container exists before rendering
        if (!projectsContainer) {
            console.error("No container found with class 'projects'");
            return;
        }

        // Update the project count safely
        if (projectCountElement) {
            projectCountElement.textContent = projects.length;
        } else {
            console.warn("Project count element not found in DOM.");
        }

        // Check if projects exist and render them
        if (!projects || projects.length === 0) {
            projectsContainer.innerHTML = "<p>No projects available at the moment.</p>";
            return;
        }

        // Render the projects dynamically
        renderProjects(projects, projectsContainer, 'h2');

    } catch (error) {
        console.error("Error fetching and displaying projects:", error);
    }
});

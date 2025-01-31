import { fetchJSON, renderProjects, fetchGitHubData } from './global.js'; // Ensure correct path

document.addEventListener("DOMContentLoaded", async () => {
    try {
        // ✅ Fetch all project data
        const projects = await fetchJSON('./lib/projects.json');

        // ✅ Select only the first 3 projects
        const latestProjects = projects.slice(0, 3);

        // ✅ Select the container for displaying projects
        const projectsContainer = document.querySelector('.projects');

        // ✅ Ensure the container exists before rendering
        if (!projectsContainer) {
            console.error("❌ No container found with class 'projects'. Ensure <div class='projects'></div> exists in index.html.");
            return;
        }

        // ✅ Render only the first 3 projects
        renderProjects(latestProjects, projectsContainer, 'h2');

    } catch (error) {
        console.error("❌ Error fetching and displaying projects on home page:", error);
    }

    // ✅ Fetch and Display GitHub Stats
    try {
        const githubData = await fetchGitHubData('somythl'); // ✅ Use your GitHub username

        // ✅ Select the container for GitHub stats
        const profileStats = document.querySelector('.profile-stats');

        if (!profileStats) {
            console.error("❌ No container found with class 'profile-stats'. Ensure <div class='profile-stats'></div> exists in index.html.");
            return;
        }

        // ✅ Select the content container inside `.profile-stats`
        let githubStatsContent = document.querySelector('.github-stats-content');

        // ✅ If `.github-stats-content` doesn't exist, create it dynamically
        if (!githubStatsContent) {
            githubStatsContent = document.createElement('div');
            githubStatsContent.classList.add('github-stats-content');
            profileStats.appendChild(githubStatsContent);
        }
        
        if (githubData) {
            githubStatsContent.innerHTML = `
                <dl class="github-stats">
                    <dt>Public Repos:</dt><dd>${githubData.public_repos}</dd>
                    <dt>Public Gists:</dt><dd>${githubData.public_gists}</dd>
                    <dt>Followers:</dt><dd>${githubData.followers}</dd>
                    <dt>Following:</dt><dd>${githubData.following}</dd>
                </dl>
            `;
        } else {
            githubStatsContent.innerHTML = "<p>❌ Failed to load GitHub stats.</p>";
        }

    } catch (error) {
        console.error("❌ Error fetching GitHub data:", error);
    }
});
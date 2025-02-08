import { fetchJSON, renderProjects } from '../global.js'; // Ensure correct path
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

document.addEventListener("DOMContentLoaded", async () => {
    try {
        // ✅ Fetch project data
        let projects = await fetchJSON('../lib/projects.json');

        console.log("Fetched projects:", projects);

        // ✅ Select HTML elements
        const projectsContainer = document.querySelector('.projects');
        const projectCountElement = document.getElementById('project-count');
        const searchInput = document.querySelector('.searchBar');

        // ✅ Ensure projects container exists
        if (!projectsContainer) {
            console.error("No container found with class 'projects'");
            return;
        }

        // ✅ Update project count
        if (projectCountElement) {
            projectCountElement.textContent = projects.length;
        }

        // ✅ Render full project list initially
        renderProjects(projects, projectsContainer, 'h2');

        // ✅ Initialize state variables
        let selectedYear = null;
        let searchQuery = '';

        // 🎯 Function to Apply Both Filters (Year + Search)
        function applyFilters() {
            let filteredProjects = projects.filter(project => {
                let matchesYear = selectedYear ? project.year === selectedYear : true;
                let matchesSearch = searchQuery ? Object.values(project).join('\n').toLowerCase().includes(searchQuery) : true;
                return matchesYear && matchesSearch;
            });

            renderProjects(filteredProjects, projectsContainer, 'h2');
        }

        // 🎯 Function to Render the Pie Chart 🎯
        function renderPieChart(projectsGiven) {
            let rolledData = d3.rollups(
                projectsGiven,
                (v) => v.length,
                (d) => d.year
            );

            let data = rolledData.map(([year, count]) => ({
                value: count,
                label: year
            }));

            let svg = d3.select("#projects-plot");
            svg.selectAll("path").remove();

            let sliceGenerator = d3.pie().value(d => d.value);
            let arcData = sliceGenerator(data);

            let arcGenerator = d3.arc()
                .innerRadius(0)
                .outerRadius(50);

                let colorScale = d3.scaleOrdinal([
                    "#4F7CAC", // Deep Blue
                    "#C0E0DE", // Medium Blue
                    "#C79EC7", // Light Blue
                    "#3C474B", // Cyan
                    "#AAA8E6", // Sky Blue
                    "#AFB6B5", // Indigo
                    "#3B5591", // Dark Purple
                    "#7C3AED", // Vibrant Purple
                    "#A78BFA", // Soft Lavender
                    "#60A5FA"  // Cool Light Blue
                ]);
                d3.scaleOrdinal(d3.schemeCategory10);

            let legend = d3.select(".legend");
            legend.selectAll("li").remove();

            // ✅ Draw Pie Slices
            svg.selectAll("path").remove();
            arcData.forEach((arc, i) => {
                svg.append("path")
                    .attr("d", arcGenerator(arc))
                    .attr("fill", colorScale(i))
                    .attr("stroke", "none")
                    .attr("stroke-width", 0)
                    .attr("class", data[i].label === selectedYear ? "selected" : "")
                    .on("click", function () {
                        selectedYear = selectedYear === data[i].label ? null : data[i].label;

                        // ✅ Apply selection styles
                        svg.selectAll("path")
                            .attr("class", (_, idx) => data[idx].label === selectedYear ? "selected" : "")
                            .attr("fill", (_, idx) => data[idx].label === selectedYear ? "oklch(60% 45% 0)" : colorScale(idx));

                        legend.selectAll("li")
                            .attr("class", (_, idx) => data[idx].label === selectedYear ? "selected" : "")
                            .select(".swatch")
                            .style("background-color", (_, idx) => data[idx].label === selectedYear ? "oklch(60% 45% 0)" : colorScale(idx));

                        applyFilters(); // ✅ Apply both search and year filters
                    });
            });

            // ✅ Draw Legend Items
            data.forEach((entry, i) => {
                let legendItem = legend.append("li")
                    .attr("style", `--color: ${colorScale(i)}`)
                    .attr("class", entry.label === selectedYear ? "selected" : "")
                    .on("click", () => {
                        selectedYear = selectedYear === entry.label ? null : entry.label;

                        // ✅ Apply selection styles
                        svg.selectAll("path")
                            .attr("class", (_, idx) => data[idx].label === selectedYear ? "selected" : "");

                        legend.selectAll("li")
                            .attr("class", (_, idx) => data[idx].label === selectedYear ? "selected" : "")
                            .select(".swatch")
                            .style("background-color", (_, idx) => data[idx].label === selectedYear ? "oklch(60% 45% 0)" : colorScale(idx));

                        applyFilters(); // ✅ Apply both search and year filters
                    });

                // ✅ Prevent clicks on swatches from filtering
                legendItem.append("span")
                    .attr("class", "swatch")
                    .style("background-color", colorScale(i))
                    .on("click", (event) => event.stopPropagation()); // ✅ Prevent click event from bubbling

                legendItem.append("span").text(`${entry.label} `);
                legendItem.append("em").text(`(${entry.value})`);
            });
        }

        // ✅ Call `renderPieChart()` after fetching data
        renderPieChart(projects);

        // 🎯 SEARCH FUNCTIONALITY: Update Search Query and Apply Both Filters
        searchInput.addEventListener("input", (event) => {
            searchQuery = event.target.value.toLowerCase();
            applyFilters();
        });

    } catch (error) {
        console.error("Error fetching and displaying projects:", error);
    }
});

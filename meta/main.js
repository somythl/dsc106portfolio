let data = [];
let commits = [];
let xScale, yScale; // Declare globally
let brushSelection = null;

const width = 1000;
const height = 600;
const margin = { top: 10, right: 20, bottom: 30, left: 50 };

const usableArea = {
  top: margin.top,
  right: width - margin.right,
  bottom: height - margin.bottom,
  left: margin.left,
  width: width - margin.left - margin.right,
  height: height - margin.top - margin.bottom,
};

// Load Data
async function loadData() {
  data = await d3.csv('loc.csv', (row) => ({
    ...row,
    line: +row.line,
    depth: +row.depth,
    length: +row.length,
    date: new Date(`${row.date}T00:00${row.timezone}`),
    datetime: new Date(row.datetime),
    hourFrac: new Date(row.datetime).getHours() + new Date(row.datetime).getMinutes() / 60,
    file: row.file,
    author: row.author,
  }));

  console.log("Data Loaded:", data);
  
  processCommits();
  console.log("Commits Processed:", commits);

  displayStats();
  createScatterplot();
}

// Create Scatterplot
function createScatterplot() {
  if (!commits.length) {
    console.error("No commit data available!");
    return;
  }

  console.log("Creating Scatterplot...");

  // Define SVG and main group element
  const svg = d3
    .select('#chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');

  const g = svg.append('g');

  xScale = d3.scaleTime()
    .domain([
      d3.timeMonth.floor(d3.min(commits, (d) => d.datetime)),
      d3.timeMonth.ceil(d3.max(commits, (d) => d.datetime))
    ])
    .range([usableArea.left, usableArea.right])
    .nice();

  yScale = d3.scaleLinear()
    .domain([0, 24])
    .range([usableArea.bottom, usableArea.top]);

    



  brushSelector();
  
  // Sort commits so larger dots are rendered first
  const sortedCommits = [...commits].sort((a, b) => d3.descending(a.totalLines, b.totalLines));

  // Scale for dot sizes
  const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines) || [1, 10];
  const rScale = d3.scaleSqrt().domain([minLines, maxLines]).range([5, 30]);

  console.log("Min & Max Lines Edited:", minLines, maxLines);

  // Add Gridlines
  const gridlines = g.append('g')
    .attr('class', 'gridlines')
    .attr('transform', `translate(${usableArea.left}, 0)`);

  gridlines.call(
    d3.axisLeft(yScale)
      .tickFormat('')
      .tickSize(-usableArea.width)
  )
  .selectAll('line')
  .attr('stroke', (d) => {
    const hour = d % 24;
    return hour < 6 || hour >= 18 ? '#3182bd' : '#fd8d3c'; // Blue for night, orange for day
  })
  .attr('stroke-opacity', 0.75);

  // Draw dots
  const dots = g.append('g').attr('class', 'dots');

  dots
    .selectAll('circle')
    .data(sortedCommits)
    .join('circle')
    .attr('cx', (d) => xScale(d.datetime))
    .attr('cy', (d) => yScale(d.hourFrac))
    .attr('r', (d) => rScale(d.totalLines))
    .attr('fill', 'steelblue')
    .style('fill-opacity', 0.7)
    .on('mouseenter', function (event, d) {
      d3.select(event.currentTarget).style('fill-opacity', 1);
      updateTooltipContent(d, event);
    })
    .on('mousemove', (event, d) => updateTooltipContent(d, event))
    .on('mouseleave', function () {
      d3.select(event.currentTarget).style('fill-opacity', 0.7);
      updateTooltipContent({});
    });

  // Create and format axes
  const xAxis = d3.axisBottom(xScale)
    .tickFormat(d3.timeFormat('%b %d'));

  // Add X axis
  g.append('g')
    .attr('transform', `translate(0, ${usableArea.bottom})`)
    .call(xAxis)
    .selectAll('text')
    .style('text-anchor', 'end')
    .attr('transform', 'rotate(-30)');

    const yAxis = d3.axisLeft(yScale)
    .tickFormat((d) => {
        if (d === 0) return "12 AM";  // Midnight
        if (d === 12) return "12 PM"; // Noon
        if (d === 24) return "12 AM"; // Midnight of next day
        return d < 12 ? `${d} AM` : `${d - 12} PM`; // Convert 13-23 to PM
    });

// Add Y-axis to the visualization
g.append('g')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .call(yAxis);


  
}

// Update Tooltip
function updateTooltipContent(commit, event) {
  const tooltip = document.getElementById('commit-tooltip');
  const link = document.getElementById('commit-link');
  const date = document.getElementById('commit-date');
  const time = document.getElementById('commit-time');
  const author = document.getElementById('commit-author');
  const lines = document.getElementById('commit-lines');

  if (Object.keys(commit).length === 0) {
    tooltip.style.visibility = 'hidden';
    return;
  }

  tooltip.style.visibility = 'visible';

  // Update content
  link.href = commit.url;
  link.textContent = commit.id;
  date.textContent = commit.datetime?.toLocaleString('en', { dateStyle: 'full' });
  time.textContent = commit.datetime?.toLocaleString('en', { timeStyle: 'short' });
  author.textContent = commit.author;
  lines.textContent = commit.totalLines;

  // Position tooltip near mouse cursor
  const offset = 10;
  tooltip.style.left = `${event.pageX + offset}px`;
  tooltip.style.top = `${event.pageY + offset}px`;
}

function brushSelector() {
  const svg = d3.select('svg');

  const brush = d3.brush()
    .on('start brush end', brushed); // Listen for brush events

  svg.append('g')
    .attr('class', 'brush')
    .call(brush);

  svg.select('.brush').lower();
}

function brushed(event) {
  brushSelection = event.selection;
  updateSelection();
  updateSelectionCount();
  updateLanguageBreakdown();
}

function updateSelection() {
  d3.selectAll('circle').classed('selected', (d) => isCommitSelected(d));
}

function updateSelectionCount() {
  const selectedCommits = brushSelection
    ? commits.filter(isCommitSelected)
    : [];

  const container = document.getElementById('language-breakdown');

  if (!container) {
    console.error("Container #language-breakdown not found.");
    return;
  }

  // If no commits are selected, let CSS handle the "No commits selected" message
  if (selectedCommits.length === 0) {
    container.setAttribute("data-commit-count", "0"); // For styling
    return selectedCommits;
  }

  // Otherwise, show the number of selected commits inside the container
  container.setAttribute("data-commit-count", selectedCommits.length);
  return selectedCommits;
}


function isCommitSelected(commit) {
  if (!brushSelection) return false;

  const min = { x: brushSelection[0][0], y: brushSelection[0][1] };
  const max = { x: brushSelection[1][0], y: brushSelection[1][1] };

  const x = xScale(commit.datetime); // Use global xScale
  const y = yScale(commit.hourFrac); // Use global yScale

  return x >= min.x && x <= max.x && y >= min.y && y <= max.y;
}
function updateLanguageBreakdown() {
  const selectedCommits = brushSelection
      ? commits.filter(isCommitSelected)
      : [];

  const container = document.getElementById('language-breakdown');

  if (!container) {
      console.error("Container #language-breakdown not found.");
      return;
  }

  // Clear previous content
  container.innerHTML = '';

  // Add commit count at the top
  const commitCount = document.createElement("div");
  commitCount.classList.add("commit-count");
  commitCount.textContent = `${selectedCommits.length} commits selected`;
  container.appendChild(commitCount);

  // If no commits are selected, stop here
  if (selectedCommits.length === 0) {
      return;
  }

  // Extract relevant lines from the data
  const lines = selectedCommits.flatMap((commit) =>
      data.filter(d => d.commit === commit.id).map(d => d.type)
  );

  console.log("Lines extracted:", lines);

  // If no language data is available, show a message
  if (lines.length === 0) {
      const message = document.createElement("div");
      message.classList.add("language-box");
      message.textContent = "No language data available";
      container.appendChild(message);
      return;
  }

  // Count occurrences per language
  const breakdown = d3.rollup(
      lines,
      (v) => v.length,
      (d) => d // `d` is already the language type
  );

  for (const [language, count] of breakdown) {
      const proportion = count / lines.length;
      const formatted = d3.format('.1~%')(proportion);

      // Create a box for each language
      const item = document.createElement("div");
      item.classList.add("language-box");
      item.innerHTML = `<strong>${language}</strong><br>${count} lines (${formatted})`;
      container.appendChild(item);
  }
}


// Process Commits
function processCommits() {
  commits = d3.groups(data, (d) => d.commit)
    .map(([commit, lines]) => {
      let first = lines[0];
      let { author, date, time, timezone, datetime } = first;

      return {
        id: commit,
        url: `https://github.com/YOUR_REPO/commit/${commit}`,
        author,
        date,
        time,
        timezone,
        datetime,
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
        totalLines: lines.length || 1
      };
    });
}

// Display Statistics
function displayStats() {
  processCommits();

  const dl = d3.select('#stats').append('dl').attr('class', 'stats');

  dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
  dl.append('dd').text(data.length);

  dl.append('dt').text('Total commits');
  dl.append('dd').text(commits.length);

  dl.append('dt').text('Number of files');
  dl.append('dd').text(d3.group(data, (d) => d.file).size);

  dl.append('dt').text('Maximum depth');
  dl.append('dd').text(d3.max(data, (d) => d.depth));

  dl.append('dt').text('Most active time of day');
  dl.append('dd').text(d3.greatest(d3.rollups(data, v => v.length, d => new Date(d.datetime).toLocaleString('en', { dayPeriod: 'short' })), d => d[1])?.[0]);

  dl.append('dt').text('Most active day');
  dl.append('dd').text(d3.greatest(d3.rollups(data, v => v.length, d => new Date(d.datetime).toLocaleString('en', { weekday: 'long' })), d => d[1])?.[0]);

  // ✅ FIXED: Move max file length and average file length INSIDE displayStats()
  const maxFileLength = d3.max(data, (d) => d.line);
  dl.append('dt').text('Longest file (max lines)');
  dl.append('dd').text(maxFileLength);

  const fileLengths = d3.rollups(
    data,
    (v) => d3.max(v, (d) => d.line),
    (d) => d.file
  );
  const avgFileLength = d3.mean(fileLengths, (d) => d[1]);
  dl.append('dt').text('Average file length');
  dl.append('dd').text(Math.round(avgFileLength));
}


document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  
  // Ensure "0 commits selected" appears immediately
  const container = document.getElementById('language-breakdown');

  if (container) {
    container.innerHTML = ''; // Clear existing content

    // Add commit count at the top
    const commitCount = document.createElement("div");
    commitCount.classList.add("commit-count");
    commitCount.textContent = "0 commits selected";
    container.appendChild(commitCount);
  }
});

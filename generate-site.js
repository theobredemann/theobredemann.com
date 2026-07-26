#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load Ghost export
const ghostData = JSON.parse(fs.readFileSync('/Users/theobredemann/Downloads/bited-life.ghost.2026-03-08-21-08-38.json', 'utf8'));
const data = ghostData.db[0].data;

// Extract site settings
const getSetting = (key) => {
  const setting = data.settings.find(s => s.key === key);
  return setting ? setting.value : null;
};

const siteTitle = getSetting('title') || 'Bited Life';
const siteDescription = getSetting('description') || '';

// Create output directories
const outputDir = process.cwd();
const postsDir = path.join(outputDir, 'posts');
const assetsDir = path.join(outputDir, 'assets');

fs.mkdirSync(postsDir, { recursive: true });
fs.mkdirSync(assetsDir, { recursive: true });

// HTML template
const template = (title, content, description = '') => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${description}">
    <title>${title} | ${siteTitle}</title>
    <link rel="stylesheet" href="/styles.css">
    <link rel="canonical" href="https://theobredemann.com/${title.toLowerCase().replace(/\s+/g, '-')}.html">
</head>
<body>
    <header>
        <h1><a href="/">${siteTitle}</a></h1>
        <p>${siteDescription}</p>
        <nav>
            <a href="/">Home</a>
            <a href="/about.html">About</a>
        </nav>
    </header>
    <main>
        ${content}
    </main>
    <footer>
        <p>&copy; ${new Date().getFullYear()} ${siteTitle}. All rights reserved.</p>
    </footer>
</body>
</html>
`;

// Process posts
const posts = data.posts || [];
const postsList = [];

posts.forEach(post => {
  const slug = post.slug || post.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const filename = path.join(postsDir, `${slug}.html`);
  
  // Extract author info
  const author = data.users.find(u => u.id === post.author_id);
  const authorName = author ? author.name : 'Unknown';
  
  // Format date
  const date = new Date(post.published_at || post.created_at);
  const formattedDate = date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  // Create post content
  const postContent = `
    <article>
        <h1>${post.title}</h1>
        <div class="meta">
            <span>By ${authorName}</span>
            <span>on ${formattedDate}</span>
        </div>
        <div class="content">
            ${post.html || post.plaintext || '<p>No content available</p>'}
        </div>
        ${post.tags && post.tags.length > 0 ? `
        <div class="tags">
            Tags: ${post.tags.map(tagId => {
                const tag = data.tags.find(t => t.id === tagId);
                return tag ? `<a href="/tag/${tag.slug}.html">${tag.name}</a>` : '';
            }).join(', ')}
        </div>
        ` : ''}
    </article>
    <a href="/">← Back to Home</a>
  `;
  
  // Write post file
  fs.writeFileSync(filename, template(post.title, postContent, post.meta_description || ''));
  
  // Add to posts list for homepage
  postsList.push({
    title: post.title,
    slug: slug,
    date: formattedDate,
    author: authorName,
    excerpt: post.meta_description || post.plaintext?.substring(0, 200) + '...' || ''
  });
});

// Generate homepage
const homepagePosts = postsList.map(post => `
    <article class="post-summary">
        <h2><a href="/posts/${post.slug}.html">${post.title}</a></h2>
        <div class="meta">
            <span>By ${post.author}</span>
            <span>on ${post.date}</span>
        </div>
        <p>${post.excerpt}</p>
        <a href="/posts/${post.slug}.html" class="read-more">Read more →</a>
    </article>
`).join('\n');

const homepageContent = `
    <section class="hero">
        <h1>${siteTitle}</h1>
        <p>${siteDescription}</p>
    </section>
    <section class="posts">
        <h2>Recent Posts</h2>
        ${homepagePosts}
    </section>
`;

fs.writeFileSync(path.join(outputDir, 'index.html'), template('Home', homepageContent, siteDescription));

// Generate about page (placeholder)
const aboutContent = `
    <article>
        <h1>About</h1>
        <p>This is the about page for ${siteTitle}.</p>
        <p>Content will be added here.</p>
    </article>
`;
fs.writeFileSync(path.join(outputDir, 'about.html'), template('About', aboutContent));

// Generate CSS
const cssContent = `
body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    line-height: 1.6;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    color: #333;
    background-color: #fff;
}

header {
    border-bottom: 1px solid #eee;
    padding-bottom: 20px;
    margin-bottom: 30px;
}

header h1 {
    margin: 0 0 10px 0;
}

header p {
    color: #666;
    margin: 0 0 20px 0;
}

nav {
    margin: 20px 0;
}

nav a {
    margin-right: 15px;
    color: #2c5282;
    text-decoration: none;
}

nav a:hover {
    text-decoration: underline;
}

article {
    margin-bottom: 40px;
}

article h1 {
    margin-bottom: 10px;
}

.meta {
    color: #666;
    font-size: 0.9em;
    margin-bottom: 20px;
}

.meta span {
    margin-right: 15px;
}

.content {
    margin: 20px 0;
}

.content img {
    max-width: 100%;
    height: auto;
}

.post-summary {
    padding-bottom: 20px;
    border-bottom: 1px solid #eee;
}

.post-summary h2 {
    margin-bottom: 5px;
}

.post-summary h2 a {
    color: #2c5282;
    text-decoration: none;
}

.post-summary h2 a:hover {
    text-decoration: underline;
}

.read-more {
    color: #2c5282;
    text-decoration: none;
    font-weight: 500;
}

.read-more:hover {
    text-decoration: underline;
}

footer {
    margin-top: 40px;
    padding-top: 20px;
    border-top: 1px solid #eee;
    color: #666;
    font-size: 0.9em;
}

tags {
    margin-top: 20px;
}

tags a {
    color: #2c5282;
    text-decoration: none;
    margin-right: 10px;
}

@media (max-width: 600px) {
    body {
        padding: 10px;
    }
}
`;

fs.writeFileSync(path.join(outputDir, 'styles.css'), cssContent);

// Generate .nojekyll file
fs.writeFileSync(path.join(outputDir, '.nojekyll'), '');

// Generate CNAME file for custom domain
fs.writeFileSync(path.join(outputDir, 'CNAME'), 'theobredemann.com');

console.log('✅ Static site generated successfully!');
console.log(`📁 Output directory: ${outputDir}`);
console.log(`📝 Generated ${posts.length} posts`);
console.log(`📄 Created index.html, about.html, styles.css`);
console.log(`🔗 Custom domain configured: theobredemann.com`);

# Drudge-Style YouTube Video Aggregator: Step-by-Step Guide

---

## Phase 1: Setup & Foundation (Days 1-3)

### Step 1: Register Your Domain Name
- Go to a domain registrar like [Namecheap](https://namecheap.com) or [GoDaddy](https://godaddy.com)
- Search for your desired domain name (e.g., viralvideoreport.com)
- Purchase the domain (typically $10-15/year)
- Complete domain registration with your contact information

### Step 2: Set Up Development Environment
- Install Visual Studio Code (VSCode) from [code.visualstudio.com](https://code.visualstudio.com)
- Install Node.js from [nodejs.org](https://nodejs.org)
- Install Git from [git-scm.com](https://git-scm.com)
- Open VSCode and install recommended extensions for web development

### Step 3: Connect Your Domain to Netlify
- Sign up for a free Netlify account at [Netlify](https://netlify.com)
- Go to Netlify dashboard → "Domains"
- Click "Add or register domain"
- Enter your domain (tubeheadlines.com)
- In Netlify, get the DNS settings (nameservers or DNS records)
- Log into your Namecheap account
- Update your domain's DNS settings to point to Netlify
- Add any required DNS records provided by Netlify
- Wait for DNS propagation (can take 24-48 hours)

---

## Phase 2: Creating Your Website Structure (Days 4-7)

### Step 4: Create Your Basic HTML Template
- Create a new directory for your project
- Initialize a new React project using Vite or Create React App
- Set up the basic project structure
- Create your homepage component
- Add the necessary HTML/CSS structure (see guide for code)
- Test locally using `npm run dev`
- **Tip:** Headlines are clickable links using React Router or regular `<a>` tags

### Step 5: Set Up Your Database Collections
- In your database management system, create a collection called `videos` with fields:
  - youtubeID (Text)
  - youtubeURL (Text)
  - customHeadline (Text)
  - category (Text)
  - position (Text)
  - positionRank (Number)
  - isActive (Boolean)
- Create a collection called `categories` with fields:
  - name (Text)
  - displayOrder (Number)
  - column (Text)
- Add sample data to categories:
  - NEWS & CURRENT (left)
  - ENTERTAINMENT (center)
  - AMAZING & UNEXPECTED (right)

---

## Phase 3: Creating Your Admin Dashboard (Days 8-12)

### Step 6: Create the Admin Interface
- Create a new page called "Admin" (set to require login)
- Add a form with:
  - YouTube URL (text input)
  - Custom Headline (text input)
  - Category (dropdown, from categories collection)
  - Position (dropdown: featured, left, center, right)
  - "Add Link" button
- Add video management section with:
  - Table of current videos
  - Edit/Delete buttons
  - "Publish Changes" button

### Step 7: Create the "Add Link" Function
- Create `addLink` to add a new video to the database (see guide for code)
- Connect this function to your "Add Link" button

---

## Phase 4: Connecting Your Database to Your Homepage (Days 13-16)

### Step 9: Update Your Homepage to Display Data from Database
- Modify your homepage to use dynamic data:
  - Featured video section
  - Three column layout for categories
  - Use React components

### Step 10: Create the Page Data Function
- Create `getHomePageData` to fetch featured and column videos (see guide for code)
- Connect this function to your homepage

---

## Phase 5: Launch & Promote

### Step 11: Full Launch
- Review site on all devices
- Test all links and workflows
- Launch your site!

### Step 12: Initial Promotion
- Create social media accounts
- Reach out to featured creators
- Submit to web directories
- Consider small ad campaign

---

## Resources
- [React Documentation](https://reactjs.org/docs)
- [W3Schools HTML/CSS](https://w3schools.com)
- [Firebase Documentation](https://firebase.google.com/docs)

---

**This guide provides a step-by-step process to build and launch a simple, manually curated YouTube link aggregator. Follow each phase for a smooth launch and operation!**

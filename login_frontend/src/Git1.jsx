import React, { useState } from 'react';
import './Employee.css';
import "@fortawesome/fontawesome-free/css/all.min.css";
import './Git.css';
import HeaderSidebar_admin from './HeaderSidebar_admin.jsx';

const Git = () => {

  return (
    <div className="dashboard-container">
      <HeaderSidebar_admin />
      <main className="main-content">
        <h1 className="portal-title">🤖 Personalized Git Portal</h1>

        <p className="portal-description">
          Our <strong>Personalized Git Portal</strong> is a centralized platform designed to streamline
          version control, collaboration, and code management within our company.
        </p>
        <h2 className="portal-section-title">📌 Key Features</h2>
        <ul className="portal-feature-list">
          <li>✅ Secure & Centralized Repository Management</li>
          <li>✅ Branching & Merging</li>
          <li>✅ Code Review & Collaboration</li>
          <li>✅ CI/CD Integration</li>
          <li>✅ Issue & Task Tracking</li>
          <li>✅ Role-Based Access Control</li>
          <li>✅ Real-Time Analytics & Insights</li>
        </ul>
        <h2 className="portal-section-title">🔹 List of Git Commands</h2>
        <ul className="git-commands">
          <li><strong>git init</strong> - Initialize a new repository</li>
          <li><strong>git clone &lt;repo-url&gt;</strong> - Clone a repository</li>
          <li><strong>git status</strong> - Check the status of changes</li>
          <li><strong>git add &lt;file&gt;</strong> - Stage a specific file</li>
          <li><strong>git add .</strong> - Stage all files</li>
          <li><strong>git commit -m "message"</strong> - Commit changes</li>
          <li><strong>git branch</strong> - List branches</li>
          <li><strong>git checkout -b &lt;branch&gt;</strong> - Create & switch to a new branch</li>
          <li><strong>git merge &lt;branch&gt;</strong> - Merge a branch</li>
          <li><strong>git push origin &lt;branch&gt;</strong> - Push changes</li>
          <li><strong>git pull origin &lt;branch&gt;</strong> - Pull updates</li>
          <li><strong>git log</strong> - View commit history</li>
          <li><strong>git reset --hard</strong> - Reset to last commit</li>
          <li><strong>git stash</strong> - Stash changes</li>
          <li><strong>git stash pop</strong> - Apply stashed changes</li>
          <li><strong>git tag -a v1.0 -m "Version 1.0"</strong> - Create a tag</li>
          <li><strong>git rebase &lt;branch&gt;</strong> - Reapply commits on top of another branch</li>
          <li><strong>git cherry-pick &lt;commit&gt;</strong> - Apply changes from a specific commit</li>
          <li><strong>git revert &lt;commit&gt;</strong> - Revert a commit without modifying history</li>
          <li><strong>git remote -v</strong> - Show remote repositories</li>
          <li><strong>git fetch</strong> - Fetch changes from a remote repository</li>
          <li><strong>git diff</strong> - Show differences between commits</li>
          <li><strong>git blame &lt;file&gt;</strong> - Show who last modified each line of a file</li>
          <li><strong>git show &lt;commit&gt;</strong> - Show details of a specific commit</li>
          <li><strong>git bisect</strong> - Find a problematic commit using binary search</li>
          <li><strong>git reflog</strong> - Show a log of reference updates</li>
          <li><strong>git submodule add &lt;repo-url&gt;</strong> - Add a submodule</li>
          <li><strong>git config --global user.name "Name"</strong> - Set global username</li>
          <li><strong>git config --global user.email "email@example.com"</strong> - Set global email</li>
          <li><strong>git rm --cached &lt;file&gt;</strong> - Remove a file from tracking</li>
          <li><strong>git fsck</strong> - Check integrity of the repository</li>
        </ul>

        <h2 className="portal-section-title">Why Use Our Git Portal?</h2>
        <ul className="benefits-list">
          <li>🚀 <strong>Improves productivity</strong> by simplifying development workflows.</li>
          <li>🔒 <strong>Ensures security</strong> with controlled access and encrypted repositories.</li>
          <li>🤝 <strong>Enhances collaboration</strong> across distributed teams.</li>
          <li>⚡ <strong>Speeds up deployment</strong> with automation and CI/CD.</li>
        </ul>

        <div className="github-button-container">
          <a href="https://gitea.armtronix.net" target="_blank" rel="noopener noreferrer" className="github-button">
            GitHub <i className="fas fa-arrow-up" style={{ transform: "rotate(45deg)", color: "white" }}></i>
          </a>
        </div>
      </main>
    </div>

  );
};

export default Git;

# Student Course Management — GitHub Pages Edition

An HTML/CSS/JavaScript version of Student Course Management, designed to be published with GitHub Pages. It does not require Python, Flask, Render, or `requirements.txt`.

## Features
- Add, edit, delete, and search courses
- Automatically calculate course count, total units, and average units
- Auto-save in the current browser using `localStorage`
- Import CSV or JSON files (import replaces the current list)
- Download CSV or JSON backups
- Includes the eight starter courses from the project

## Publish on GitHub Pages
1. Create a GitHub repository, for example `student-course-management`.
2. Upload `index.html`, `style.css`, `script.js`, and `README.md` to the repository's root (top-level) folder.
3. Open the repository on GitHub and choose **Settings**.
4. Choose **Pages** in the sidebar.
5. Under **Build and deployment**, select **Deploy from a branch**.
6. Select branch **main** and folder **/(root)**, then click **Save**.
7. Wait for the Pages deployment to finish. Open the URL shown in the Pages settings; it usually looks like `https://YOUR-USERNAME.github.io/REPOSITORY-NAME/`.

## Important storage note
Courses are saved in the local browser on the device that is using the website. They are not automatically shared with other users or computers. Use Download CSV/JSON to back up courses and Import file to restore them on another device. This static edition has no shared server-side database.

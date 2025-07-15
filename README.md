# D&D STL Monster Downloader

A web application to browse and download 3D-printable STL files for monsters from the Dungeons & Dragons Monster Manual. Built with Next.js, this project provides a searchable, user-friendly interface to a curated collection of free STL files, making it easy for tabletop gamers and 3D printing enthusiasts to find and print their favorite monsters.

---

## Features

- 🧙‍♂️ Browse a list of D&D monsters
- 🔍 Search and filter monsters by name
- 🖼️ View monster images and details
- ⬇️ Links to download STL files

---

## Screenshots

<!-- If you have screenshots or a demo GIF, add them here. Example: -->
<!-- ![App Screenshot](public/screenshot.png) -->

---

## Getting Started

### Prerequisites
- Node.js (v18 or later recommended)
- npm, yarn, pnpm, or bun

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/yourusername/dnd-stl-downloader.git
cd dnd-stl-downloader/frontend
npm install # or yarn, pnpm, bun
```

### Running the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app.

---

## Usage

- Start the development server as above.
- Browse the monster list, search, and download STL files.
- To update the monster list, replace the `public/monsters.json` file with a new version (see Credits below).

---

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)

---

## Credits

### Monster STL Collection
- 3D models and images are from the Imgur gallery: [D&D Monster Manual STL Collection](https://imgur.com/gallery/1R9Rt8G) — a comprehensive collection of 3D-modeled monsters, optimized for 3D printing, with free STL links accompanying each image. All credit for the models and curation goes to the original Imgur user and contributors.

### Monster STL JSON Resource
- The JSON file containing monster details and STL links is sourced from this Imgur comment: [https://imgur.com/gallery/1R9Rt8G/comment/2431096859](https://imgur.com/gallery/1R9Rt8G/comment/2431096859)
- Download the JSON: [https://pastebin.com/Q6ritMxN](https://pastebin.com/Q6ritMxN)

If you are the creator or contributor and would like additional credit or removal, please open an issue or pull request.

NOTE: Shapeway links were filtered out of the data set due to them no longer being valid.

---

## License

Specify your license here. Example:

This project is licensed under the MIT License. See the [LICENSE](../LICENSE) file for details.

---

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for improvements, bug fixes, or new features.

---

## Contact

For questions, suggestions, or feedback, please open an issue on GitHub.
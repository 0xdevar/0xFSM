# 0xFSM - Visual FiveM Resource Creator

**0xFSM** is a web-based tool to visually create FiveM Lua scripts and resource manifests. Drag, drop, and generate your FiveM resource without writing complex Lua from scratch!

[TRY IT NOW!!](https://fsm.0xar.dev/)

![Screenshot](demo/image1.png)

## Key Features

*   **Visual Scripting:** Build game logic with a drag-and-drop node interface.
*   **Code Generation:** Automatically generates Lua code and `fxmanifest.lua`.
*   **Project Management:** Save and load your visual projects as JSON files.
*   **Rich Node Library:** Many pre-built nodes for common FiveM tasks.
*   **Simulation:** Basic execution simulation for file graphs.

## How to Use (Quick Guide)

1.  **Create Files/Functions/Events:** Use the sidebars to set up your script structure.
2.  **Add & Configure Nodes:** Select a graph, then use `Ctrl+K` to search and add nodes. Click the gear icon on a node to edit its properties.
3.  **Order Nodes:** Drag nodes in the list to set execution order.
4.  **Generate:** Click "Generate Code", configure your `fxmanifest.lua`, and download the ZIP.
5.  **Deploy:** Add the unzipped resource to your FiveM server.

## Installation (For Development)

To run this project locally:

1.  **Prerequisites:**
    *   Node.js (LTS version recommended: [https://nodejs.org/](https://nodejs.org/))
    *   npm (comes with Node.js) or yarn

2.  **Clone the Repository:**
    ```bash
    git clone https://github.com/0xdevar/0xFSM.git
    cd 0xFSM
    ```

3.  **Install Dependencies:**
    Using npm:
    ```bash
    npm install
    ```

4.  **Run the Development Server:**
    Using npm:
    ```bash
    npm run dev  # Or `npm start` if configured in package.json
    ```
    This will typically start the application on `http://localhost:3000` or a similar port. Open this URL in your web browser.

## Tech Stack

*   React, TypeScript
*   Mantine UI
*   @hello-pangea/dnd (Drag and Drop)
*   JSZip, file-saver

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## License

*This project is licensed under the [Apache License 2.0](LICENSE.txt).*

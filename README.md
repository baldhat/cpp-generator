# C++ Class & Interface Generator

A lightweight, powerful VS Code extension to scaffold C++ classes and interfaces instantly. Tailor-made for professional workflows with **C++17 single-line namespaces**, **custom include guards**, and **Git-aware headers**.

## Features

* **Smart Scaffolding:** Create `.hpp` and `.cpp` files with a single right-click.
* **Interface Support:** Dedicated template for abstract classes (header-only).
* **C++17 Ready:** Supports nested namespaces using the `namespace a::b` syntax.
* **Git Integration:** Automatically pulls `AUTHOR_NAME` and `AUTHOR_EMAIL` from your local git config.
* **Custom Templates:** Total control over the file structure via VS Code settings.
* **Advanced Include Guards:** Generates project-standard guards like `NAMESPACE_NAMESPACE_CLASS__NAME_hpp`.

## Installation

1. Open **VS Code**.
2. Press `Ctrl+P`, type `ext install your-publisher-name.cpp-generator`.
3. Or search for **C++ Class Generator** in the Extensions view.

## How to Use

1. **Right-click** on any folder in the Explorer sidebar.
2. Select **C++: Create Class from Template**.
3. Choose between **Standard Class** or **Interface**.
4. Enter the **Namespace** (e.g., `app::network`) and **Class Name** (e.g., `DataClient`).
5. The files are generated and the header opens automatically!

## Configuration

You can customize every part of the generated code in `Settings > Extensions > C++ Generator`.

### Available Template Variables
| Variable | Description | Example |
| :--- | :--- | :--- |
| `{{CLASS_NAME}}` | The name of the class | `DataClient` |
| `{{FILE_NAME}}` | Snake_case version of the class | `data_client` |
| `{{NAMESPACE}}` | The full namespace string | `app::network` |
| `{{INCLUDE_GUARD}}` | Formatted include guard | `APP_SUB__NETWORK_DATA__CLIENT_hpp` |
| `{{DATE}}` | Current system date | `2026-01-18` |
| `{{AUTHOR_NAME}}` | Name from `git config` | `John Doe` |
| `{{AUTHOR_EMAIL}}` | Email from `git config` | `john@example.com` |

### Customizing Date Format
Change the `cppGenerator.dateFormat` setting:
* `YYYY-MM-DD` (Default)
* `DD.MM.YYYY`
* `MM/DD/YYYY`

## License

This extension is licensed under the [MIT License](LICENSE).
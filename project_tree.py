from pathlib import Path

IGNORE_DIRS = {
    "node_modules",
    ".git",
    ".next",
    ".turbo",
    ".idea",
    ".vscode",
    "__pycache__",
    ".venv",
    "coverage",
    "dist",
    "build",
}

IGNORE_FILES = {
    ".DS_Store",
}

lines = []


def file_icon(path: Path) -> str:
    suffix = path.suffix.lower()

    if path.name == "docker-compose.yml":
        return "🐳"
    if path.name == "dockerfile":
        return "🐳"
    if path.name == "package.json":
        return "📦"
    if path.name == "package-lock.json":
        return "🔒"
    if path.name.endswith(".routes.js"):
        return "🛣️"
    if path.name.endswith(".controller.js"):
        return "🎮"
    if path.name.endswith(".service.js"):
        return "⚙️"
    if path.name.endswith(".processor.js"):
        return "🔄"
    if path.name.endswith(".client.js"):
        return "🔌"
    if path.name.endswith(".middleware.js"):
        return "🧱"
    if path.name.endswith(".test.js"):
        return "🧪"
    if path.name.endswith(".spec.js"):
        return "🧪"
    if suffix == ".prisma":
        return "🗄️"
    if suffix == ".js":
        return "📜"
    if suffix == ".ts":
        return "📘"
    if suffix == ".json":
        return "🧾"
    if suffix == ".md":
        return "📝"
    if suffix == ".env":
        return "🔐"

    return "📄"


def folder_icon(path: Path) -> str:
    name = path.name.lower()

    mapping = {
        "services": "🧩",
        "service": "⚙️",
        "controllers": "🎮",
        "routes": "🛣️",
        "middleware": "🧱",
        "config": "🔧",
        "queues": "📬",
        "processors": "🔄",
        "clients": "🔌",
        "utils": "🛠️",
        "prisma": "🗄️",
        "migrations": "🧬",
        "infra": "🏗️",
        "shared": "🤝",
        "src": "📂",
    }

    return mapping.get(name, "📁")


def visible_children(directory: Path):
    return sorted(
        [
            p for p in directory.iterdir()
            if p.name not in IGNORE_DIRS and p.name not in IGNORE_FILES
        ],
        key=lambda p: (p.is_file(), p.name.lower())
    )


def build_tree(directory: Path, level=0):
    children = visible_children(directory)

    for child in children:
        if child.is_dir():
            lines.append(f"\n{'#'*(level+2)} {folder_icon(child)} {child.name}/")
            build_tree(child, level + 1)
        else:
            lines.append(f"- {file_icon(child)} {child.name}")

if __name__ == "__main__":
    project_root = Path(__file__).parent.resolve()

    lines.append(f"🚀 {project_root.name}")
    build_tree(project_root)

    output = "\n".join(lines)
    output_file = project_root / "project_structure_icons.txt"

    with open(output_file, "w", encoding="utf-8") as f:
        f.write(output)

    print(output)
    print(f"\nSaved to: {output_file}")
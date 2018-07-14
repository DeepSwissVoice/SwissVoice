__author__ = "Simon (siku2)"
__version__ = "1.1.1"

import errno
import os.path
from pathlib import Path
from typing import Dict, List

import htmlmin
from jinja2 import Environment, FileSystemLoader

PAGES_DIR = "pages/"


def render_templates(env: Environment, names: List[str]) -> Dict[str, str]:
    output = {}
    for template_name in names:
        template_path = Path(template_name)
        template = env.get_template(template_name)
        rendered = template.render(page_name=template_path.stem)
        output_name = template_name[len(PAGES_DIR):]
        output[output_name] = rendered
    return output


def process_html(templates: Dict[str, str]) -> Dict[str, str]:
    templates = templates.copy()
    before_length = 0
    after_length = 0
    for key, html in templates.items():
        before_length += len(html)
        minified = htmlmin.minify(html, remove_comments=True)
        templates[key] = minified
        after_length += len(minified)
    print(f"Reduced size from {before_length} to {after_length} ({round(100 * after_length / before_length)}%)")
    return templates


def clear_dir(location: str):
    for file in Path(location).glob("*.html"):
        file.unlink()


def save_templates(location: str, templates: Dict[str, str]):
    for name, content in templates.items():
        filename = os.path.join(location, name)
        directory = os.path.dirname(filename)

        try:
            os.makedirs(directory)
        except OSError as e:
            if e.errno != errno.EEXIST:
                raise

        with open(filename, "w+", encoding="utf-8") as f:
            f.write(content)


def render(input_dir: str, output_dir: str):
    print("Loading...")
    env = Environment(loader=FileSystemLoader(input_dir))
    input_templates = env.list_templates(filter_func=lambda t: t.startswith(PAGES_DIR))
    print(f"Loaded {len(input_templates)} template(s)")
    print("Rendering...")
    output = render_templates(env, input_templates)
    print("Processing...")
    output = process_html(output)
    print("Removing old files...")
    clear_dir(output_dir)
    print("Saving...")
    save_templates(output_dir, output)
    print("Saved templates")


if __name__ == "__main__":
    from argparse import ArgumentParser

    parser = ArgumentParser()
    parser.add_argument("input_dir")
    parser.add_argument("output_dir")
    args = parser.parse_args()

    render(args.input_dir, args.output_dir)

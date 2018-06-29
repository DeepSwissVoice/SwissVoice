__author__ = "Simon (siku2)"
__version__ = "1.0.0"

import shutil
import subprocess
from pathlib import Path

PAGES_DIR = ""

NPM_LOCATION = shutil.which("npm")

SASS_DEFAULT_ARGS = ["-I", "{input_dir}", "-s", "compressed", "--no-source-map"]
SASS_CMD = [NPM_LOCATION, "run", "sass", "--"]

POSTCSS_DEFAULT_ARGS = ["-r", "-u", "autoprefixer"]
POSTCSS_CMD = [NPM_LOCATION, "run", "postcss", "--"]


def compile_sass(input_dir: str, output_dir: str):
    pages_dir = str(Path(input_dir) / PAGES_DIR)
    command = SASS_CMD + SASS_DEFAULT_ARGS + ["{pages_dir}:{output_dir}"]
    command = list(map(lambda s: s.format(pages_dir=pages_dir, input_dir=input_dir, output_dir=output_dir), command))
    subprocess.run(command, check=True)


def process_css(directory: str):
    command = POSTCSS_CMD + [directory] + POSTCSS_DEFAULT_ARGS
    subprocess.run(command, check=True)


def build(input_dir: str, output_dir: str):
    compile_sass(input_dir, output_dir)
    process_css(output_dir)


if __name__ == "__main__":
    from argparse import ArgumentParser

    parser = ArgumentParser()
    parser.add_argument("input_dir")
    parser.add_argument("output_dir")
    args = parser.parse_args()

    build(args.input_dir, args.output_dir)

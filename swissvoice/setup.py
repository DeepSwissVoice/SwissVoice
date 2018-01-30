"""Setup."""

from setuptools import setup

setup(
    name="SwissVoice",
    packages=["swissvoice"],
    include_package_data=True,
    install_requires=[
        "flask",
    ],
)

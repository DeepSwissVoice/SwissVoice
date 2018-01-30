@echo off
IF NOT EXIST config.cfg (
  copy NUL config.cfg
)
cd swissvoice
IF NOT EXIST venv (
  pip install virtualenv
  virtualenv venv
)
cmd /k "venv\Scripts\Activate && pip install -e . && pip install -U -r requirements.txt"

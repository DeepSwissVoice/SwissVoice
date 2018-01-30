@echo off
cd swissvoice
set FLASK_APP=swissvoice
set FLASK_DEBUG=true
set SWISSVOICE_SETTINGS=..\..\config.cfg
cmd /k "venv\Scripts\Activate && flask run"

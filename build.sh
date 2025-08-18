#!/bin/bash
set -e

# Force Python 3.12
echo "Installing Python 3.12..."
pyenv install 3.12.0
pyenv global 3.12.0

# Verify Python version
python --version

# Install dependencies
echo "Installing Python dependencies..."
pip install --no-cache-dir -r requirements.txt

echo "Build completed successfully!" 